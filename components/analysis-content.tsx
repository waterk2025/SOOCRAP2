"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

// 모니터링 정책 데이터
const monitoringPolicies = [
  {
    id: 1,
    name: "수질 문제 모니터링",
    keywords: ["수질", "오염", "정수", "수돗물", "물맛"],
    description: "수질 관련 이슈 및 개선사항 모니터링",
  },
  {
    id: 2,
    name: "요금 관련 모니터링",
    keywords: ["수도요금", "요금인상", "고지서", "과금", "납부"],
    description: "수도요금 및 과금 관련 이슈 모니터링",
  },
  {
    id: 3,
    name: "서비스 중단 모니터링",
    keywords: ["단수", "공사", "누수", "수리", "복구"],
    description: "서비스 중단 및 복구 관련 모니터링",
  },
  {
    id: 4,
    name: "고객 서비스 모니터링",
    keywords: ["고객센터", "상담", "민원", "불만", "응대"],
    description: "고객 서비스 품질 관련 모니터링",
  },
]

// 시간대별 활동 데이터
const timeOfDayData = [
  { hour: "00:00", mentions: 30 },
  { hour: "03:00", mentions: 50 },
  { hour: "06:00", mentions: 80 },
  { hour: "09:00", mentions: 120 },
  { hour: "12:00", mentions: 150 },
  { hour: "15:00", mentions: 130 },
  { hour: "18:00", mentions: 90 },
  { hour: "21:00", mentions: 60 },
]

// 정책별 키워드 트렌드 데이터
const getPolicyKeywordData = (policyId: number) => {
  const baseData = [
    { date: "1월", value1: 120, value2: 80, value3: 60, value4: 40 },
    { date: "2월", value1: 150, value2: 90, value3: 70, value4: 50 },
    { date: "3월", value1: 180, value2: 110, value3: 85, value4: 65 },
    { date: "4월", value1: 160, value2: 95, value3: 75, value4: 55 },
    { date: "5월", value1: 200, value2: 120, value3: 90, value4: 70 },
    { date: "6월", value1: 220, value2: 140, value3: 100, value4: 80 },
  ]

  switch (policyId) {
    case 1: // 수질 문제
      return baseData.map((item) => ({
        ...item,
        "수질 개선": item.value1,
        "정수 처리": item.value2,
        "수돗물 품질": item.value3,
        "물맛 개선": item.value4,
      }))
    case 2: // 요금 관련
      return baseData.map((item) => ({
        ...item,
        수도요금: item.value1,
        "요금 인상": item.value2,
        고지서: item.value3,
        "납부 방법": item.value4,
      }))
    case 3: // 서비스 중단
      return baseData.map((item) => ({
        ...item,
        "단수 공지": item.value1,
        "공사 일정": item.value2,
        "누수 신고": item.value3,
        "복구 작업": item.value4,
      }))
    case 4: // 고객 서비스
      return baseData.map((item) => ({
        ...item,
        고객센터: item.value1,
        "상담 서비스": item.value2,
        "민원 처리": item.value3,
        "응대 품질": item.value4,
      }))
    default:
      return baseData
  }
}

// 정책별 관련 키워드 데이터
const getPolicyRelatedKeywords = (policyId: number) => {
  switch (policyId) {
    case 1:
      return [
        { keyword: "수질 개선", strength: 95, sentiment: "positive" },
        { keyword: "정수 처리", strength: 87, sentiment: "positive" },
        { keyword: "수돗물 품질", strength: 82, sentiment: "mixed" },
        { keyword: "물맛", strength: 76, sentiment: "positive" },
        { keyword: "염소 냄새", strength: 71, sentiment: "negative" },
        { keyword: "탁도", strength: 68, sentiment: "mixed" },
        { keyword: "수질 검사", strength: 64, sentiment: "positive" },
        { keyword: "정수장", strength: 59, sentiment: "positive" },
      ]
    case 2:
      return [
        { keyword: "수도요금", strength: 95, sentiment: "negative" },
        { keyword: "요금 인상", strength: 87, sentiment: "negative" },
        { keyword: "고지서", strength: 82, sentiment: "mixed" },
        { keyword: "납부", strength: 76, sentiment: "mixed" },
        { keyword: "과금", strength: 71, sentiment: "negative" },
        { keyword: "요금 체계", strength: 68, sentiment: "mixed" },
        { keyword: "할인 혜택", strength: 64, sentiment: "positive" },
        { keyword: "자동납부", strength: 59, sentiment: "positive" },
      ]
    case 3:
      return [
        { keyword: "단수 공지", strength: 95, sentiment: "mixed" },
        { keyword: "공사 일정", strength: 87, sentiment: "mixed" },
        { keyword: "누수 신고", strength: 82, sentiment: "negative" },
        { keyword: "복구 작업", strength: 76, sentiment: "positive" },
        { keyword: "응급 수리", strength: 71, sentiment: "positive" },
        { keyword: "급수차", strength: 68, sentiment: "positive" },
        { keyword: "배관 교체", strength: 64, sentiment: "mixed" },
        { keyword: "서비스 중단", strength: 59, sentiment: "negative" },
      ]
    case 4:
      return [
        { keyword: "고객센터", strength: 95, sentiment: "mixed" },
        { keyword: "상담 서비스", strength: 87, sentiment: "positive" },
        { keyword: "민원 처리", strength: 82, sentiment: "mixed" },
        { keyword: "응대 품질", strength: 76, sentiment: "positive" },
        { keyword: "대기시간", strength: 71, sentiment: "negative" },
        { keyword: "친절도", strength: 68, sentiment: "positive" },
        { keyword: "해결 속도", strength: 64, sentiment: "mixed" },
        { keyword: "만족도", strength: 59, sentiment: "positive" },
      ]
    default:
      return []
  }
}

// 정책별 AI 인사이트
const getPolicyInsights = (policyId: number) => {
  switch (policyId) {
    case 1:
      return [
        {
          type: "positive",
          title: "수질 개선 성과 인정",
          content:
            "수질 개선 관련 언급이 이번 달 35% 증가했으며, 89%가 긍정적 감성을 보입니다. 첨단 정수 처리 기술 도입이 시민들에게 좋은 반응을 얻고 있습니다.",
        },
        {
          type: "warning",
          title: "일부 지역 수질 문제",
          content:
            "특정 지역에서 물맛 관련 문의가 증가하고 있습니다. 해당 지역 정수장 점검 및 추가 조치가 필요해 보입니다.",
        },
      ]
    case 2:
      return [
        {
          type: "warning",
          title: "요금 인상 우려 증가",
          content:
            "수도요금 관련 언급이 혼재된 감성을 보입니다(52% 부정). 요금 인상에 대한 명확한 설명과 시민 소통 강화가 필요해 보입니다.",
        },
        {
          type: "positive",
          title: "자동납부 서비스 호응",
          content:
            "자동납부 및 온라인 결제 서비스에 대한 긍정적 반응이 증가하고 있습니다. 디지털 서비스 확대가 효과를 보고 있습니다.",
        },
      ]
    case 3:
      return [
        {
          type: "danger",
          title: "단수 공지 시스템 개선 필요",
          content:
            "단수 공지 관련 언급이 67% 부정적 감성을 보이며 증가 추세입니다. 사전 공지 시스템 개선과 대체 급수 서비스 확대가 필요합니다.",
        },
        {
          type: "positive",
          title: "신속한 복구 작업 평가",
          content:
            "응급 복구 작업에 대한 긍정적 평가가 증가하고 있습니다. 24시간 대응 체계가 효과적으로 운영되고 있습니다.",
        },
      ]
    case 4:
      return [
        {
          type: "positive",
          title: "상담 서비스 품질 향상",
          content:
            "고객센터 상담 서비스에 대한 만족도가 전월 대비 23% 향상되었습니다. 상담원 교육 프로그램의 효과가 나타나고 있습니다.",
        },
        {
          type: "warning",
          title: "대기시간 개선 필요",
          content:
            "고객센터 대기시간에 대한 불만이 지속되고 있습니다. 상담 인력 확충 또는 챗봇 서비스 도입을 검토해볼 필요가 있습니다.",
        },
      ]
    default:
      return []
  }
}

export default function AnalysisContent() {
  const [selectedPolicy, setSelectedPolicy] = useState<number>(1)

  const currentPolicy = monitoringPolicies.find((p) => p.id === selectedPolicy)
  const keywordTrendData = getPolicyKeywordData(selectedPolicy)
  const relatedKeywords = getPolicyRelatedKeywords(selectedPolicy)
  const policyInsights = getPolicyInsights(selectedPolicy)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">분석</h1>
          <p className="text-gray-600">수크랩 - 한국수자원공사 온라인 평판 데이터 심층 분석</p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">모니터링 정책 선택</label>
          <Select value={selectedPolicy.toString()} onValueChange={(value) => setSelectedPolicy(Number(value))}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="정책을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {monitoringPolicies.map((policy) => (
                <SelectItem key={policy.id} value={policy.id.toString()}>
                  <div className="flex flex-col">
                    <span className="font-medium">{policy.name}</span>
                    <span className="text-xs text-gray-500">{policy.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 선택된 정책 정보 표시 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">{currentPolicy?.name}</h3>
              <p className="text-sm text-blue-700 mt-1">{currentPolicy?.description}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {currentPolicy?.keywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="bg-blue-100 text-blue-800">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>키워드 언급 트렌드</CardTitle>
          <CardDescription>{currentPolicy?.name} 관련 주요 키워드의 트렌드 추적</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={keywordTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                {Object.keys(keywordTrendData[0] || {})
                  .filter((key) => key !== "date")
                  .map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={`hsl(${index * 60}, 70%, 50%)`}
                      strokeWidth={2}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>관련 키워드</CardTitle>
            <CardDescription>{currentPolicy?.name}와 함께 자주 언급되는 키워드</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relatedKeywords.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{item.keyword}</span>
                    <Badge
                      variant={
                        item.sentiment === "positive"
                          ? "default"
                          : item.sentiment === "negative"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {item.sentiment === "positive" ? "긍정" : item.sentiment === "negative" ? "부정" : "혼재"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${item.strength}%` }} />
                    </div>
                    <span className="text-sm text-gray-600">{item.strength}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>시간대별 활동</CardTitle>
            <CardDescription>K-water가 가장 많이 언급되는 시간</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeOfDayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="mentions" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI 인사이트 보고서</CardTitle>
          <CardDescription>{currentPolicy?.name} 관련 주요 트렌드와 변화 분석</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {policyInsights.map((insight, index) => (
              <div
                key={index}
                className={`border-l-4 pl-4 py-2 ${
                  insight.type === "positive"
                    ? "border-l-green-500"
                    : insight.type === "warning"
                      ? "border-l-amber-500"
                      : insight.type === "danger"
                        ? "border-l-red-500"
                        : "border-l-blue-500"
                }`}
              >
                <h4
                  className={`font-semibold ${
                    insight.type === "positive"
                      ? "text-green-800"
                      : insight.type === "warning"
                        ? "text-amber-800"
                        : insight.type === "danger"
                          ? "text-red-800"
                          : "text-blue-800"
                  }`}
                >
                  {insight.title}
                </h4>
                <p className="text-gray-700">{insight.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
