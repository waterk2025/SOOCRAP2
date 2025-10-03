"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ExternalLink, Eye, RefreshCw } from "lucide-react"

// 백엔드 API에서 가져온 데이터 타입 정의
interface MentionData {
  id: number
  content: string
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence?: number // AI 분석 신뢰도
  aiAnalyzed?: boolean // AI 분석 여부
  source: string
  author: string
  timestamp: string
  url: string
  keywords: string[]
  title: string
  query: string // 개별 쿼리 정보
  uniqueId: string // 고유 ID (중복 제거용)
  policyId?: number // 모니터링 정책 ID
  policyName?: string // 모니터링 정책 이름
}

// 모니터링 키워드 목록 (백엔드와 동일)
const MONITORING_KEYWORDS = [
  'kwater', 'Kwater', 'K-water', 'KWATER',
  '한국수자원공사', '수자원공사',
  '물관리', '수력발전', '댐', '수상태양광', '디지털플랫폼'
];

export default function MonitoringContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sentimentFilter, setSentimentFilter] = useState("all")
  const [filteredMentions, setFilteredMentions] = useState<MentionData[]>([])
  const [mentionsData, setMentionsData] = useState<MentionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [collecting, setCollecting] = useState(false)

  // 백엔드 API에서 데이터 가져오기 (데이터베이스에서만)
  const fetchMentionsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🚀 데이터베이스에서 데이터 조회 시작...');
      
      // 데이터베이스에서 데이터 가져오기 (제한 없음)
      const response = await fetch('http://localhost:3001/api/monitoring/mentions?days=180')
      
      console.log('📡 API 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API 응답 오류 상세:', errorText);
        throw new Error(`API 호출 실패: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json()
      console.log('📊 API 응답 데이터:', data);
      
      if (data.success && data.data) {
        setMentionsData(data.data)
        setFilteredMentions(data.data)
        console.log('✅ 데이터베이스에서 뉴스 데이터 가져오기 성공:', data.data.length, '개')
        console.log('📊 감정 분포:', data.sentimentDistribution)
        
        // 감정 분석 데이터 상세 확인
        const aiAnalyzedCount = data.data.filter((item: any) => item.aiAnalyzed).length;
        const keywordBasedCount = data.data.filter((item: any) => !item.aiAnalyzed).length;
        console.log('🤖 감정 분석 통계:');
        console.log(`  - AI 분석: ${aiAnalyzedCount}개`);
        console.log(`  - 키워드 기반: ${keywordBasedCount}개`);
        
        // 첫 번째 뉴스 데이터 구조 확인
        if (data.data.length > 0) {
          const first = data.data[0];
          console.log('📰 첫 번째 뉴스 감정 분석 정보:');
          console.log('  - 제목:', first.title?.substring(0, 50) + '...');
          console.log('  - 감정:', first.sentiment);
          console.log('  - 신뢰도:', first.confidence);
          console.log('  - AI분석:', first.aiAnalyzed);
          console.log('  - 모델:', first.modelUsed);
          console.log('  - 전체 구조:', first);
        }
      } else {
        console.error('❌ API 응답 데이터 형식 오류:', data);
        throw new Error('데이터베이스에서 데이터를 가져올 수 없습니다.')
      }
    } catch (error) {
      console.error('❌ 백엔드 API 호출 실패:', error)
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.')
      
      // API 호출 실패 시 기본 데이터 사용
      const fallbackData: MentionData[] = [
  {
    id: 1,
          title: "K-water, 스마트 워터 시티 사업 혁신 속 비전 공개",
          content: "K-water에서 진행하는 스마트 워터 시티 사업이 정말 혁신적이네요. 우리나라 물 관리 기술이 세계 최고 수준인 것 같아요!",
    sentiment: "positive",
    source: "네이버 뉴스",
    author: "김수자",
    timestamp: "2024-01-15 14:30",
    url: "https://news.naver.com/example/123",
    keywords: ["스마트 워터 시티", "혁신", "물 관리"],
          query: "kwater",
          uniqueId: "fallback_1"
  },
  {
    id: 2,
          title: "한국수자원공사, 수도요금 인상 사유 명확히 설명",
          content: "이번 달 수도요금이 갑자기 올랐는데 한국수자원공사에서 명확한 설명을 해주셨으면 좋겠어요. 왜 인상되었는지 궁금합니다.",
    sentiment: "negative",
          source: "네이버 뉴스",
    author: "시민123",
    timestamp: "2024-01-15 13:45",
          url: "https://news.naver.com/example/456",
    keywords: ["수도요금", "인상", "설명"],
          query: "수자원공사",
          uniqueId: "fallback_2"
  },
  {
    id: 3,
          title: "K-water, 단수 공지 미리 알려드립니다",
          content: "우리 지역 단수 공지를 미리 알려주셔서 물을 미리 받아둘 수 있었습니다. K-water 고객센터 응대도 친절했어요.",
    sentiment: "positive",
          source: "네이버 뉴스",
    author: "@물사랑",
    timestamp: "2024-01-15 12:20",
          url: "https://news.naver.com/example/789",
    keywords: ["단수 공지", "고객센터", "친절"],
          query: "kwater",
          uniqueId: "fallback_3"
  },
  {
    id: 4,
          title: "한국수자원공사, 댐 관리 시스템 첨단화",
    content: "한국수자원공사의 댐 관리 시스템이 첨단화되고 있다는 뉴스를 봤습니다. 홍수 예방에 도움이 될 것 같네요.",
    sentiment: "neutral",
          source: "네이버 뉴스",
    author: "환경지킴이",
    timestamp: "2024-01-15 11:15",
    url: "https://facebook.com/example/abc",
    keywords: ["댐 관리", "첨단화", "홍수 예방"],
          query: "댐",
          uniqueId: "fallback_4"
  },
  {
    id: 5,
          title: "K-water, 수질 검사 결과 개선",
    content: "수질 검사 결과가 예전보다 많이 좋아졌다고 하는데, 정말 체감이 됩니다. 수돗물 맛도 훨씬 깔끔해졌어요.",
    sentiment: "positive",
          source: "네이버 뉴스",
    author: "건강한삶",
    timestamp: "2024-01-15 10:30",
    url: "https://blog.naver.com/example",
    keywords: ["수질 검사", "개선", "수돗물"],
          query: "물관리",
          uniqueId: "fallback_5"
  },
]

      setMentionsData(fallbackData)
      // 폴백 데이터 모두 표시
      setFilteredMentions(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  // 뉴스 수집 함수
  const collectNews = async () => {
    try {
      setCollecting(true)
      console.log('🚀 뉴스 수집 시작...');
      
      const response = await fetch('http://localhost:3001/api/monitoring/collect-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`뉴스 수집 실패: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ 뉴스 수집 완료:', result);
      
      // 수집 완료 후 데이터 새로고침
      await fetchMentionsData();
      
    } catch (error) {
      console.error('❌ 뉴스 수집 실패:', error);
      setError(error instanceof Error ? error.message : '뉴스 수집 중 오류가 발생했습니다.');
    } finally {
      setCollecting(false);
    }
  }



  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchMentionsData()
  }, [])

  const handleSearch = () => {
    let filtered = mentionsData

    // 모든 데이터 표시 (AI 분석된 것과 키워드 기반 모두)
    // filtered = filtered.filter((mention) => mention.aiAnalyzed) // 이 줄 제거

    if (searchTerm) {
      filtered = filtered.filter(
        (mention) =>
          mention.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mention.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mention.keywords.some((keyword) => keyword.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (sentimentFilter !== "all") {
      filtered = filtered.filter((mention) => mention.sentiment === sentimentFilter)
    }

    setFilteredMentions(filtered)
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "negative":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "긍정"
      case "negative":
        return "부정"
      default:
        return "중립"
    }
  }

  const getAISentimentBadge = (mention: MentionData) => {
    // 감정이 없거나 null인 경우 처리
    if (!mention.sentiment) {
      return (
        <Badge className="bg-gray-100 text-gray-600 border-gray-300">
          ❓ 분석 중
        </Badge>
      );
    }

    const baseColor = getSentimentColor(mention.sentiment);
    const sentimentText = getSentimentText(mention.sentiment);
    
    if (mention.aiAnalyzed) {
      const confidence = mention.confidence ? Math.round(mention.confidence * 100) : 50;
      return (
        <Badge className={`${baseColor} border-blue-500`}>
          🤖 {sentimentText} ({confidence}%)
        </Badge>
      );
    } else {
      // 키워드 기반 감정분석 결과 표시
      const confidence = mention.confidence ? Math.round(mention.confidence * 100) : 60;
      return (
        <Badge className={`${baseColor} border-gray-400`}>
          🔑 {sentimentText} ({confidence}%)
        </Badge>
      );
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">뉴스 데이터를 가져오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ 오류가 발생했습니다: {error}</p>
          <Button onClick={fetchMentionsData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">모니터링</h1>
        <p className="text-gray-600">수크랩 - 한국수자원공사 관련 실시간 언급 피드</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchMentionsData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
          <Button onClick={collectNews} variant="default" size="sm" disabled={collecting}>
            {collecting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                수집 중...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                뉴스 수집
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="키워드나 내용으로 검색... (예: 수질, 요금, 단수)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="감성으로 필터링" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 감성</SelectItem>
                <SelectItem value="positive">긍정</SelectItem>
                <SelectItem value="neutral">중립</SelectItem>
                <SelectItem value="negative">부정</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>필터 적용</Button>
          </div>
        </CardContent>
      </Card>

      {/* Mentions Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            실시간 언급 피드
          </CardTitle>
          <CardDescription>총 {filteredMentions.length}개 언급 표시 중</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMentions.map((mention) => (
              <div key={mention.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{mention.author}</span>
                    <span className="text-gray-500 text-sm">•</span>
                    <span className="text-gray-500 text-sm">{mention.source}</span>
                    <span className="text-gray-500 text-sm">•</span>
                    <span className="text-gray-500 text-sm">{mention.timestamp}</span>
                  </div>
                  {getAISentimentBadge(mention)}
                </div>

                {/* 제목 표출 */}
                <h3 className="font-bold text-lg text-gray-900 mb-2">{mention.title}</h3>
                
                {/* 내용 표출 */}
                <p className="text-gray-700 mb-3">{mention.content}</p>

                <div className="flex justify-between items-center">
                  <div className="flex gap-2 flex-wrap">
                    {/* 정책 이름 뱃지 */}
                    {mention.policyName && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                        📋 {mention.policyName}
                      </Badge>
                    )}
                    {/* 키워드 뱃지들 */}
                    {mention.keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={mention.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        원본 보기
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
