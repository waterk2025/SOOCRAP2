"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// 타입 정의
interface MonitoringPolicy {
  id: number
  name: string
  keywords: string[]
  description: string
  status?: string
  createdAt?: string
}

interface TrendData {
  date: string
  [key: string]: string | number
}

interface RelatedKeyword {
  keyword: string
  strength: number
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  count?: number
  avgConfidence?: number
  avgImportance?: number
  inTitleRatio?: number
  sentimentDistribution?: {
    positive: number
    negative: number
    neutral: number
  }
}

interface TimeData {
  hour: string
  mentions: number
}

interface Insight {
  type: 'positive' | 'warning' | 'danger' | 'info'
  title: string
  content: string
}

// API 호출 함수들
const fetchPolicies = async (): Promise<MonitoringPolicy[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analysis/policies`)
    const data = await response.json()
    return data.success ? data.policies : []
  } catch (error) {
    console.error('정책 목록 조회 실패:', error)
    return []
  }
}

const fetchKeywordTrends = async (policyId: number): Promise<TrendData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analysis/keyword-trends/${policyId}?months=6`)
    const data = await response.json()
    return data.success ? data.trendData : []
  } catch (error) {
    console.error('키워드 트렌드 조회 실패:', error)
    return []
  }
}

const fetchTimeAnalysis = async (): Promise<TimeData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analysis/time-analysis?days=180`)
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error('시간대별 분석 조회 실패:', error)
    return []
  }
}

const fetchRelatedKeywords = async (policyId: number): Promise<RelatedKeyword[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analysis/related-keywords/${policyId}?limit=20`)
    const data = await response.json()
    return data.success ? data.relatedKeywords : []
  } catch (error) {
    console.error('관련 키워드 조회 실패:', error)
    return []
  }
}

const fetchInsights = async (policyId: number): Promise<Insight[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analysis/insights/${policyId}?days=180`)
    const data = await response.json()
    return data.success ? data.insights : []
  } catch (error) {
    console.error('AI 인사이트 조회 실패:', error)
    return []
  }
}

export default function AnalysisContent() {
  const [selectedPolicy, setSelectedPolicy] = useState<number>(1)
  const [policies, setPolicies] = useState<MonitoringPolicy[]>([])
  const [keywordTrendData, setKeywordTrendData] = useState<TrendData[]>([])
  const [timeData, setTimeData] = useState<TimeData[]>([])
  const [relatedKeywords, setRelatedKeywords] = useState<RelatedKeyword[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  const currentPolicy = policies.find((p) => p.id === selectedPolicy)

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      try {
        const policiesData = await fetchPolicies()
        setPolicies(policiesData)
        
        if (policiesData.length > 0) {
          // policy id가 1인 정책을 우선 선택, 없으면 첫 번째 정책 선택
          const defaultPolicy = policiesData.find(p => p.id === 1) || policiesData[0]
          const defaultPolicyId = defaultPolicy.id
          setSelectedPolicy(defaultPolicyId)
          
          // 선택된 정책의 데이터 로드
          await loadPolicyData(defaultPolicyId)
        }
        
        // 시간대별 분석은 정책과 무관하므로 별도 로드
        const timeAnalysisData = await fetchTimeAnalysis()
        setTimeData(timeAnalysisData)
        
      } catch (error) {
        console.error('초기 데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // 정책별 데이터 로드
  const loadPolicyData = async (policyId: number) => {
    try {
      const [trendsData, keywordsData, insightsData] = await Promise.all([
        fetchKeywordTrends(policyId),
        fetchRelatedKeywords(policyId),
        fetchInsights(policyId)
      ])
      
      setKeywordTrendData(trendsData)
      setRelatedKeywords(keywordsData)
      setInsights(insightsData)
    } catch (error) {
      console.error('정책 데이터 로드 실패:', error)
    }
  }

  // 정책 변경 시 데이터 다시 로드
  useEffect(() => {
    if (selectedPolicy && selectedPolicy !== 0) {
      loadPolicyData(selectedPolicy)
    }
  }, [selectedPolicy])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">분석 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

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
              {policies.map((policy) => (
                <SelectItem key={policy.id} value={policy.id.toString()}>
                  <div className="flex flex-col">
                    <span className="font-medium">{policy.name}</span>
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
            {keywordTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={keywordTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  {Object.keys(keywordTrendData[0] || {})
                    .filter((key) => key !== "date" && key !== "total")
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
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">키워드 트렌드 데이터가 없습니다.</p>
              </div>
            )}
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
                      {item.sentiment === "positive" ? "긍정" : 
                       item.sentiment === "negative" ? "부정" : 
                       item.sentiment === "mixed" ? "혼재" : "중립"}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${item.strength}%` }} />
                      </div>
                      <span className="text-sm text-gray-600">{item.strength}%</span>
                    </div>
                    {item.count && (
                      <div className="flex gap-2 text-xs text-gray-500">
                        <span>언급: {item.count}회</span>
                        {item.inTitleRatio !== undefined && item.inTitleRatio > 0 && (
                          <span>제목: {item.inTitleRatio}%</span>
                        )}
                        {item.avgImportance !== undefined && item.avgImportance > 0 && (
                          <span>중요도: {item.avgImportance.toFixed(1)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>시간대별 활동</CardTitle>
            <CardDescription>K-water 관련 키워드가 가장 많이 언급되는 시간 (최근 6개월)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {timeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="mentions" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">시간대별 데이터가 없습니다.</p>
                </div>
              )}
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
            {insights.length > 0 ? (
              insights.map((insight, index) => (
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
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">AI 인사이트 데이터가 없습니다.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
