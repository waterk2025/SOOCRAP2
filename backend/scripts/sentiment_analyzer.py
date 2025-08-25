#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
한국어 감정분석 서비스
Node.js에서 호출하여 사용하는 Python 스크립트
"""

import sys
import json
import logging
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import numpy as np
from typing import List, Dict, Any

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class KoreanSentimentAnalyzer:
    def __init__(self, model_name="beomi/KcELECTRA-base-v2022"):
        self.model_name = model_name
        logger.info(f"Loading Korean sentiment analysis model: {self.model_name}")
        
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(
                self.model_name,
                num_labels=3
            )
            
            # 모델별 라벨과 임계값 설정
            if "KR-FinBert-SC" in model_name:
                self.labels = ["negative", "neutral", "positive"]
                self.threshold = 0.1
            elif "KcELECTRA" in model_name:
                self.labels = ["Negative", "Neutral", "Positive"]
                self.threshold = 0.4
            elif "roberta" in model_name:
                self.labels = ["Negative", "Neutral", "Positive"]
                self.threshold = 0.6
            else:
                self.labels = ["Negative", "Neutral", "Positive"]
                self.threshold = 0.6
                
            logger.info(f"Model loaded successfully! Threshold: {self.threshold}")
            
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}")
            logger.info("Falling back to klue/bert-base")
            self.model_name = "klue/bert-base"
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(
                self.model_name,
                num_labels=3
            )
            self.labels = ["Negative", "Neutral", "Positive"]
            self.threshold = 0.6

    def analyze(self, text: str) -> Dict[str, Any]:
        """단일 텍스트 감정분석"""
        try:
            text = self._preprocess_text(text)
            logger.info(f"Analyzing text: {text[:100]}...")
            
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                max_length=512,
                padding=True
            )
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
                scores = predictions[0].numpy()
                
                result = self._classify_sentiment(scores)
                confidence = float(max(scores))
                
                logger.info(f"Sentiment: {result}, Confidence: {confidence:.3f}")
                
                return {
                    "sentiment": result,
                    "confidence": confidence,
                    "scores": {
                        "negative": float(scores[0]),
                        "neutral": float(scores[1]), 
                        "positive": float(scores[2])
                    },
                    "model": self.model_name
                }
                
        except Exception as e:
            logger.error(f"Error analyzing text: {e}")
            return {
                "sentiment": "neutral",
                "confidence": 0.0,
                "scores": {"negative": 0.0, "neutral": 1.0, "positive": 0.0},
                "model": self.model_name,
                "error": str(e)
            }

    def analyze_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """여러 텍스트의 감정을 일괄 분석"""
        results = []
        for text in texts:
            try:
                result = self.analyze(text)
                results.append(result)
            except Exception as e:
                logger.error(f"Error analyzing text '{text[:50]}...': {e}")
                results.append({
                    "sentiment": "neutral",
                    "confidence": 0.0,
                    "scores": {"negative": 0.0, "neutral": 1.0, "positive": 0.0},
                    "model": self.model_name,
                    "error": str(e)
                })
        return results

    def _preprocess_text(self, text: str) -> str:
        """텍스트 전처리"""
        if not text:
            return "중립적인 내용입니다."
        
        text = " ".join(text.split())
        text = text.replace("&amp;", "&")
        text = text.replace("&lt;", "<")
        text = text.replace("&gt;", ">")
        return text

    def _classify_sentiment(self, scores: np.ndarray) -> str:
        """감정 분류"""
        sorted_indices = np.argsort(scores)[::-1]
        max_score = scores[sorted_indices[0]]
        second_score = scores[sorted_indices[1]]
        score_diff = max_score - second_score
        
        if score_diff < self.threshold:
            return "neutral" if "neutral" in self.labels else "Neutral"
        else:
            return self.labels[sorted_indices[0]]

    def get_model_info(self) -> Dict[str, Any]:
        """모델 정보 반환"""
        return {
            "model_name": self.model_name,
            "labels": self.labels,
            "threshold": self.threshold
        }

def analyze_news_data(news_data: List[Dict[str, Any]], model_name: str = "klue/bert-base") -> Dict[str, Any]:
    """뉴스 데이터 감정분석"""
    analyzer = KoreanSentimentAnalyzer(model_name)
    
    # 제목과 내용을 합쳐서 분석
    texts = []
    for item in news_data:
        title = item.get('title', '')
        content = item.get('description', '')
        combined_text = f"{title} {content}".strip()
        texts.append(combined_text)
    
    # 감정분석 수행
    sentiment_results = analyzer.analyze_batch(texts)
    
    # 결과 통계
    sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}
    total_confidence = 0.0
    
    for result in sentiment_results:
        sentiment = result['sentiment'].lower()
        if sentiment in sentiment_counts:
            sentiment_counts[sentiment] += 1
        total_confidence += result['confidence']
    
    avg_confidence = total_confidence / len(sentiment_results) if sentiment_results else 0.0
    
    return {
        "model_info": analyzer.get_model_info(),
        "total_analyzed": len(news_data),
        "sentiment_distribution": sentiment_counts,
        "average_confidence": avg_confidence,
        "individual_results": sentiment_results
    }

def main():
    """메인 함수 - Node.js에서 호출됨"""
    try:
        # 명령행 인자 파싱
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No data provided"}))
            sys.exit(1)
        
        # JSON 데이터 파싱
        input_data = json.loads(sys.argv[1])
        news_data = input_data.get('news_data', [])
        model_name = input_data.get('model_name', 'klue/bert-base')
        
        if not news_data:
            print(json.dumps({"error": "No news data provided"}))
            sys.exit(1)
        
        # 감정분석 수행
        result = analyze_news_data(news_data, model_name)
        
        # 결과를 JSON으로 출력
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON: {str(e)}"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": f"Unexpected error: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    main() 