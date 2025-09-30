"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, TrendingUp } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const sentimentData = [
  { name: "긍정", value: 65, color: "#10b981" },
  { name: "중립", value: 25, color: "#f59e0b" },
  { name: "부정", value: 10, color: "#ef4444" },
]

const trendData = [
  { date: "1월", positive: 400, neutral: 240, negative: 100 },
  { date: "2월", positive: 300, neutral: 139, negative: 80 },
  { date: "3월", positive: 500, neutral: 200, negative: 120 },
  { date: "4월", positive: 280, neutral: 180, negative: 90 },
  { date: "5월", positive: 590, neutral: 250, negative: 110 },
  { date: "6월", positive: 390, neutral: 200, negative: 85 },
  { date: "7월", positive: 450, neutral: 220, negative: 95 },
  { date: "8월", positive: 520, neutral: 260, negative: 75 },
  { date: "9월", positive: 480, neutral: 190, negative: 80 },
]

const trendingTopics = [
  { topic: "수질 개선", mentions: 245 },
  { topic: "수도 요금", mentions: 189 },
  { topic: "상수도 서비스", mentions: 156 },
  { topic: "단수 공지", mentions: 134 },
  { topic: "수자원 관리", mentions: 98 },
  { topic: "인프라 개선", mentions: 87 },
]

const recentMentions = [
  {
    id: 1,
    content: "K-water 덕분에 우리 지역 수질이 많이 좋아졌어요. 감사합니다!",
    sentiment: "positive",
    source: "네이버 카페",
    time: "2시간 전",
  },
  {
    id: 2,
    content: "이번 달 수도요금이 갑자기 올랐는데 이유를 알 수 있을까요?",
    sentiment: "negative",
    source: "다음 블로그",
    time: "4시간 전",
  },
  {
    id: 3,
    content: "단수 공지를 미리 알려주셔서 준비할 수 있었습니다",
    sentiment: "positive",
    source: "트위터",
    time: "6시간 전",
  },
  {
    id: 4,
    content: "한국수자원공사의 스마트 워터 시티 사업이 기대됩니다",
    sentiment: "positive",
    source: "페이스북",
    time: "8시간 전",
  },
]

export default function DashboardContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600">수크랩 - 한국수자원공사 온라인 평판 모니터링</p>
      </div>

      {/* Top Row - First 2 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Mentions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 언급 수</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,543</div>
            <p className="text-xs text-gray-500">지난 달 대비 +12.5%</p>
          </CardContent>
        </Card>

        {/* Sentiment Analysis */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">감성 분석</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} dataKey="value">
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center mt-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-gray-600">긍정 65%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-gray-600">중립 25%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-gray-600">부정 10%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trending Topics - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle>트렌딩 주제</CardTitle>
          <CardDescription>최근 인기 키워드 및 언급 수</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trendingTopics.map((topic, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <span className="text-sm font-medium truncate w-full">{topic.topic}</span>
                <span className="text-xs text-gray-500 mt-1">{topic.mentions}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Row - 2 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Trend */}
        <Card>
          <CardHeader>
            <CardTitle>감성 트렌드</CardTitle>
            <CardDescription>시간에 따른 월별 감성 분석</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="neutral" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Mentions */}
        <Card>
          <CardHeader>
            <CardTitle>최근 언급</CardTitle>
            <CardDescription>모든 모니터링 소스의 최신 언급</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMentions.map((mention) => (
                <div key={mention.id} className="border-l-4 border-l-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <p className="text-sm">{mention.content}</p>
                    <Badge
                      variant={
                        mention.sentiment === "positive"
                          ? "default"
                          : mention.sentiment === "negative"
                            ? "destructive"
                            : "secondary"
                      }
                      className="ml-2"
                    >
                      {mention.sentiment}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">{mention.source}</span>
                    <span className="text-xs text-gray-500">{mention.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
