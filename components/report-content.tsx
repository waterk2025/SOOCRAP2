"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Download, Calendar, TrendingUp, TrendingDown } from "lucide-react"

// 모니터링 정책 데이터 (analysis-content.tsx와 동일)
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

// 정책별 보고서 데이터
const getPolicyReportData = (policyId: number) => {
  switch (policyId) {
    case 1: // 수질 문제
      return {
        totalMentions: 1876,
        sentimentBreakdown: { positive: 72, neutral: 20, negative: 8 },
        topKeywords: [
          { keyword: "수질 개선", mentions: 345, change: "+25%" },
          { keyword: "정수 처리", mentions: 289, change: "+18%" },
          { keyword: "수돗물 품질", mentions: 234, change: "+12%" },
          { keyword: "물맛", mentions: 198, change: "+8%" },
        ],
        sourceBreakdown: [
          { source: "네이버 뉴스/블로그", mentions: 850, percentage: 45 },
          { source: "다음 카페/블로그", mentions: 563, percentage: 30 },
          { source: "소셜미디어", mentions: 338, percentage: 18 },
          { source: "온라인 커뮤니티", mentions: 125, percentage: 7 },
        ],
      }
    case 2: // 요금 관련
      return {
        totalMentions: 2134,
        sentimentBreakdown: { positive: 35, neutral: 40, negative: 25 },
        topKeywords: [
          { keyword: "수도요금", mentions: 456, change: "+15%" },
          { keyword: "요금 인상", mentions: 389, change: "+22%" },
          { keyword: "고지서", mentions: 298, change: "+8%" },
          { keyword: "납부", mentions: 234, change: "+5%" },
        ],
        sourceBreakdown: [
          { source: "네이버 뉴스/블로그", mentions: 1067, percentage: 50 },
          { source: "다음 카페/블로그", mentions: 640, percentage: 30 },
          { source: "소셜미디어", mentions: 320, percentage: 15 },
          { source: "온라인 커뮤니티", mentions: 107, percentage: 5 },
        ],
      }
    case 3: // 서비스 중단
      return {
        totalMentions: 1654,
        sentimentBreakdown: { positive: 45, neutral: 35, negative: 20 },
        topKeywords: [
          { keyword: "단수 공지", mentions: 398, change: "+18%" },
          { keyword: "공사 일정", mentions: 334, change: "+12%" },
          { keyword: "누수 신고", mentions: 287, change: "+25%" },
          { keyword: "복구 작업", mentions: 245, change: "+15%" },
        ],
        sourceBreakdown: [
          { source: "네이버 뉴스/블로그", mentions: 745, percentage: 45 },
          { source: "다음 카페/블로그", mentions: 497, percentage: 30 },
          { source: "소셜미디어", mentions: 331, percentage: 20 },
          { source: "온라인 커뮤니티", mentions: 81, percentage: 5 },
        ],
      }
    case 4: // 고객 서비스
      return {
        totalMentions: 1432,
        sentimentBreakdown: { positive: 58, neutral: 32, negative: 10 },
        topKeywords: [
          { keyword: "고객센터", mentions: 387, change: "+20%" },
          { keyword: "상담 서비스", mentions: 298, change: "+15%" },
          { keyword: "민원 처리", mentions: 234, change: "+8%" },
          { keyword: "응대 품질", mentions: 198, change: "+12%" },
        ],
        sourceBreakdown: [
          { source: "네이버 뉴스/블로그", mentions: 645, percentage: 45 },
          { source: "다음 카페/블로그", mentions: 430, percentage: 30 },
          { source: "소셜미디어", mentions: 287, percentage: 20 },
          { source: "온라인 커뮤니티", mentions: 70, percentage: 5 },
        ],
      }
    default:
      return {
        totalMentions: 2543,
        sentimentBreakdown: { positive: 65, neutral: 25, negative: 10 },
        topKeywords: [],
        sourceBreakdown: [],
      }
  }
}

// 정책별 경영진 요약
const getPolicyExecutiveSummary = (policyId: number, reportData: any) => {
  const policyName = monitoringPolicies.find((p) => p.id === policyId)?.name || ""

  switch (policyId) {
    case 1:
      return {
        summary: `선택된 보고 기간 동안 ${policyName}은 모든 모니터링 소스에서 ${reportData.totalMentions.toLocaleString()}건의 총 언급을 받았습니다. 전반적인 감성은 ${reportData.sentimentBreakdown.positive}%의 긍정적 언급으로 매우 긍정적이며, 이는 수질 개선 노력에 대한 시민들의 높은 만족도를 나타냅니다.`,
        highlights: [
          "수질 개선 사업이 긍정적 감성과 함께 가장 많이 논의되는 주제로 지속",
          "첨단 정수 처리 기술 도입에 대한 시민들의 높은 관심과 만족도",
          "정수장 현대화 프로젝트의 가시적 성과가 온라인에서 긍정적으로 평가",
          "수돗물 품질 향상에 대한 체감도가 실제 언급량 증가로 이어짐",
        ],
        recommendations: [
          "수질 개선 성과를 지속적으로 홍보하여 긍정적 이미지 강화",
          "정수 처리 기술의 과학적 근거와 안전성에 대한 투명한 정보 제공",
          "지역별 수질 차이에 대한 맞춤형 개선 계획 수립 및 소통",
          "수질 검사 결과의 정기적 공개를 통한 신뢰도 제고",
        ],
      }
    case 2:
      return {
        summary: `선택된 보고 기간 동안 ${policyName}은 ${reportData.totalMentions.toLocaleString()}건의 언급을 받았습니다. 감성 분포는 긍정 ${reportData.sentimentBreakdown.positive}%, 중립 ${reportData.sentimentBreakdown.neutral}%, 부정 ${reportData.sentimentBreakdown.negative}%로 혼재된 양상을 보이며, 요금 관련 소통 강화가 필요한 상황입니다.`,
        highlights: [
          "수도요금 인상에 대한 시민들의 관심과 우려가 지속적으로 증가",
          "온라인 결제 및 자동납부 서비스에 대한 긍정적 반응",
          "요금 체계의 투명성에 대한 요구가 증가하는 추세",
          "할인 혜택 및 복지 요금제에 대한 문의가 늘어남",
        ],
        recommendations: [
          "요금 인상 시 사전 설명과 시민 소통 채널 확대",
          "요금 산정 기준과 사용량별 요금 체계에 대한 명확한 안내",
          "디지털 결제 서비스 확대 및 편의성 개선 지속",
          "취약계층 대상 요금 지원 제도 홍보 강화",
        ],
      }
    case 3:
      return {
        summary: `선택된 보고 기간 동안 ${policyName}은 ${reportData.totalMentions.toLocaleString()}건의 언급을 받았습니다. 긍정적 언급이 ${reportData.sentimentBreakdown.positive}%로 상당한 비중을 차지하며, 이는 신속한 대응과 복구 작업에 대한 시민들의 인정을 반영합니다.`,
        highlights: [
          "응급 복구 작업의 신속성에 대한 긍정적 평가가 증가",
          "사전 단수 공지 시스템의 효과성이 인정받고 있음",
          "24시간 대응 체계에 대한 시민들의 신뢰도 상승",
          "대체 급수 서비스에 대한 만족도가 향상됨",
        ],
        recommendations: [
          "단수 공지 시스템의 다채널 확대 및 정확성 제고",
          "예방적 인프라 점검을 통한 서비스 중단 최소화",
          "응급 복구팀의 역량 강화 및 장비 현대화 지속",
          "시민 불편 최소화를 위한 임시 급수 서비스 확대",
        ],
      }
    case 4:
      return {
        summary: `선택된 보고 기간 동안 ${policyName}은 ${reportData.totalMentions.toLocaleString()}건의 언급을 받았습니다. ${reportData.sentimentBreakdown.positive}%의 긍정적 언급으로 고객 서비스 품질 향상 노력이 성과를 보이고 있습니다.`,
        highlights: [
          "상담원의 전문성과 친절도에 대한 긍정적 평가 증가",
          "다양한 상담 채널 운영에 대한 시민들의 만족도 상승",
          "민원 처리 속도 개선에 대한 인정",
          "온라인 고객센터 서비스 확대에 대한 호응",
        ],
        recommendations: [
          "상담원 교육 프로그램 지속 운영 및 품질 관리 강화",
          "AI 챗봇 도입을 통한 24시간 기본 상담 서비스 제공",
          "고객 만족도 조사 정기 실시 및 피드백 반영",
          "복잡한 민원에 대한 전문 상담팀 운영 확대",
        ],
      }
    default:
      return {
        summary: "",
        highlights: [],
        recommendations: [],
      }
  }
}

export default function ReportContent() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedPolicy, setSelectedPolicy] = useState<number>(1)

  const currentPolicy = monitoringPolicies.find((p) => p.id === selectedPolicy)
  const reportData = getPolicyReportData(selectedPolicy)
  const executiveSummary = getPolicyExecutiveSummary(selectedPolicy, reportData)

  const handleDownloadPDF = () => {
    alert("PDF 다운로드 기능이 여기에 구현됩니다")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">보고서</h1>
          <p className="text-gray-600">수크랩 - 한국수자원공사 온라인 평판 종합 보고서</p>
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
          <CardTitle>보고서 설정</CardTitle>
          <CardDescription>날짜 범위를 선택하고 {currentPolicy?.name} 보고서를 생성하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="start-date">시작 날짜</Label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="end-date">종료 날짜</Label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              PDF 보고서 다운로드
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 보고서 요약 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 언급 수</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalMentions.toLocaleString()}</div>
            <p className="text-xs text-gray-500">선택된 기간</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">긍정 감성</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{reportData.sentimentBreakdown.positive}%</div>
            <p className="text-xs text-gray-500">전체 언급 중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">부정 감성</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{reportData.sentimentBreakdown.negative}%</div>
            <p className="text-xs text-gray-500">주의 필요</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">중립 감성</CardTitle>
            <div className="h-4 w-4 bg-gray-400 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{reportData.sentimentBreakdown.neutral}%</div>
            <p className="text-xs text-gray-500">중립 언급</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>상위 키워드</CardTitle>
            <CardDescription>선택된 기간에서 가장 많이 언급된 키워드</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.topKeywords.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{item.keyword}</span>
                    <p className="text-sm text-gray-500">{item.mentions} 언급</p>
                  </div>
                  <Badge
                    variant={item.change.startsWith("+") ? "default" : "destructive"}
                    className="flex items-center gap-1"
                  >
                    {item.change.startsWith("+") ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {item.change}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>소스별 분석</CardTitle>
            <CardDescription>플랫폼별 언급 분포</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.sourceBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium">{item.source}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                    </div>
                    <span className="text-sm text-gray-600 w-16 text-right">
                      {item.mentions} ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>경영진 요약</CardTitle>
          <CardDescription>선택된 기간의 {currentPolicy?.name} 주요 인사이트</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">{executiveSummary.summary}</p>

            <h4 className="font-semibold text-gray-900 mb-2">주요 하이라이트:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
              {executiveSummary.highlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>

            <h4 className="font-semibold text-gray-900 mb-2">권장사항:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {executiveSummary.recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
