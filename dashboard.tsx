"use client"

import { useState } from "react"
import {
  BarChart,
  Bell,
  Calendar,
  Droplets,
  Eye,
  FileText,
  Grid,
  LineChartIcon,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  User,
  X,
  Check,
  Search,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// 데이터 부분 한국어로 변경

// sentimentData 변경
const sentimentData = [
  { name: "긍정", value: 65, color: "#10b981" },
  { name: "중립", value: 25, color: "#f59e0b" },
  { name: "부정", value: 10, color: "#ef4444" },
]

// keywordData 변경
const keywordData = [
  {
    name: "1월",
    수질: 400,
    "서비스 중단": 240,
    "요금 문제": 200,
    인프라: 180,
    "고객 서비스": 150,
  },
  {
    name: "2월",
    수질: 300,
    "서비스 중단": 139,
    "요금 문제": 220,
    인프라: 220,
    "고객 서비스": 210,
  },
  {
    name: "3월",
    수질: 500,
    "서비스 중단": 349,
    "요금 문제": 230,
    인프라: 250,
    "고객 서비스": 190,
  },
  {
    name: "4월",
    수질: 280,
    "서비스 중단": 249,
    "요금 문제": 210,
    인프라: 230,
    "고객 서비스": 220,
  },
  {
    name: "5월",
    수질: 590,
    "서비스 중단": 349,
    "요금 문제": 250,
    인프라: 210,
    "고객 서비스": 280,
  },
  {
    name: "6월",
    수질: 390,
    "서비스 중단": 299,
    "요금 문제": 230,
    인프라: 240,
    "고객 서비스": 250,
  },
  {
    name: "7월",
    수질: 490,
    "서비스 중단": 399,
    "요금 문제": 240,
    인프라: 280,
    "고객 서비스": 300,
  },
]

// sentimentTrendsData 변경
const sentimentTrendsData = [
  { name: "1월", 긍정: 400, 중립: 300, 부정: 200 },
  { name: "2월", 긍정: 500, 중립: 250, 부정: 150 },
  { name: "3월", 긍정: 600, 중립: 350, 부정: 180 },
  { name: "4월", 긍정: 550, 중립: 400, 부정: 250 },
  { name: "5월", 긍정: 700, 중립: 450, 부정: 300 },
  { name: "6월", 긍정: 650, 중립: 350, 부정: 200 },
  { name: "7월", 긍정: 800, 중립: 400, 부정: 150 },
]

// recentMentionsData 변경
const recentMentionsData = [
  {
    id: 1,
    datetime: "2023-07-15 09:23",
    source: "news",
    content: "지역 수도 공급 업체, 주요 파손에 대한 신속한 대응으로 칭찬받다.",
    sentiment: "positive",
    reviewed: false,
  },
  {
    id: 2,
    datetime: "2023-07-14 14:45",
    source: "social",
    content: "이번 달 수도 요금이 왜 이렇게 높은가요? @수크랩",
    sentiment: "negative",
    reviewed: true,
  },
  {
    id: 3,
    datetime: "2023-07-14 10:12",
    source: "blog",
    content: "수질 보고서, 지역 공급 개선 보여줘.",
    sentiment: "positive",
    reviewed: false,
  },
  {
    id: 4,
    datetime: "2023-07-13 16:30",
    source: "social",
    content: "도심 지역 단수. 업데이트 있나요 @수크랩?",
    sentiment: "neutral",
    reviewed: true,
  },
  {
    id: 5,
    datetime: "2023-07-12 08:15",
    source: "news",
    content: "수도 공급 업체, 인프라 업그레이드 프로젝트 발표.",
    sentiment: "neutral",
    reviewed: false,
  },
  {
    id: 6,
    datetime: "2023-07-11 13:20",
    source: "blog",
    content: "의견: 물 절약 노력 개선 필요.",
    sentiment: "negative",
    reviewed: false,
  },
]

// criticalAlertsData 변경
const criticalAlertsData = [
  {
    id: 1,
    title: "부정적 언론 보도",
    description: "여러 뉴스 매체에서 북부 지역의 수질 문제에 대해 보도하고 있습니다.",
    time: "2시간 전",
    severity: "high",
  },
  {
    id: 2,
    title: "소셜 미디어 트렌드",
    description: "트위터와 페이스북에서 '요금 오류'에 대한 언급이 증가하고 있습니다.",
    time: "5시간 전",
    severity: "medium",
  },
  {
    id: 3,
    title: "경쟁사 언급",
    description: "지역 경쟁사가 우리 서비스와 대조적으로 긍정적으로 언급되었습니다.",
    time: "1일 전",
    severity: "medium",
  },
]

// insightsData 변경
const insightsData = [
  {
    id: 1,
    title: "감성 개선",
    description:
      "전반적인 감성이 지난 달에 비해 15% 개선되었으며, 주로 새로운 고객 서비스 이니셔티브에 대한 긍정적인 반응에 기인합니다.",
    time: "오늘 생성됨",
  },
  {
    id: 2,
    title: "새로운 주제",
    description:
      "물 절약이 커뮤니티 토론에서 트렌드 주제가 되고 있습니다. 귀사의 절약 프로그램에 대한 사전 커뮤니케이션을 고려하세요.",
    time: "어제 생성됨",
  },
]

// trendingTopicsData 변경
const trendingTopicsData = [
  { name: "수질", value: 45 },
  { name: "요금", value: 35 },
  { name: "서비스 중단", value: 28 },
  { name: "인프라", value: 22 },
  { name: "고객 서비스", value: 18 },
  { name: "수자원 관리", value: 15 },
]

const mentionsData = [
  { value: 10 },
  { value: 30 },
  { value: 20 },
  { value: 40 },
  { value: 30 },
  { value: 50 },
  { value: 40 },
  { value: 60 },
  { value: 50 },
  { value: 70 },
  { value: 60 },
  { value: 80 },
]

// 컴포넌트 부분 한국어로 변경
export default function Dashboard() {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-slate-900 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">메뉴 토글</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 sm:max-w-none">
              <div className="flex items-center gap-2 pb-4">
                <Droplets className="h-6 w-6 text-blue-500" />
                <span className="text-lg font-semibold">수(水)크랩</span>
              </div>
              <nav className="grid gap-2 py-4">
                <Button variant="ghost" className="justify-start gap-2">
                  <Grid className="h-5 w-5" />
                  대시보드
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start gap-2"
                  onClick={() => {
                    setIsSidebarOpen(false)
                    router.push("/monitoring")
                  }}
                >
                  <LineChartIcon className="h-5 w-5" />
                  모니터링
                </Button>
                <Button variant="ghost" className="justify-start gap-2">
                  <BarChart className="h-5 w-5" />
                  분석
                </Button>
                <Button variant="ghost" className="justify-start gap-2">
                  <FileText className="h-5 w-5" />
                  보고서
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start gap-2"
                  onClick={() => {
                    setIsSidebarOpen(false)
                    router.push("/settings")
                  }}
                >
                  <Settings className="h-5 w-5" />
                  설정
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start gap-2"
                  onClick={() => {
                    setIsSidebarOpen(false)
                    router.push("/search")
                  }}
                >
                  <Search className="h-5 w-5" />
                  통합 검색
                </Button>
              </nav>
              <SheetClose className="absolute right-4 top-4">
                <X className="h-4 w-4" />
                <span className="sr-only">닫기</span>
              </SheetClose>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <Droplets className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-semibold text-white hidden md:inline-block">수(水)크랩</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#" className="font-medium text-white transition-colors hover:text-blue-400">
              대시보드
            </a>
            <a
              href="#"
              className="font-medium text-slate-400 transition-colors hover:text-blue-400"
              onClick={(e) => {
                e.preventDefault()
                router.push("/monitoring")
              }}
            >
              모니터링
            </a>
            <a
              href="#"
              className="font-medium text-slate-400 transition-colors hover:text-blue-400"
              onClick={(e) => {
                e.preventDefault()
                router.push("/analysis")
              }}
            >
              분석
            </a>
            <a
              href="#"
              className="font-medium text-slate-400 transition-colors hover:text-blue-400"
              onClick={(e) => {
                e.preventDefault()
                router.push("/reports")
              }}
            >
              보고서
            </a>
            <a
              href="#"
              className="font-medium text-slate-400 transition-colors hover:text-blue-400"
              onClick={(e) => {
                e.preventDefault()
                router.push("/settings")
              }}
            >
              설정
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white"
            onClick={() => router.push("/search")}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">통합 검색</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="sr-only">알림</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="sr-only">사용자 메뉴 토글</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>내 계정</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2">
                <User className="h-4 w-4" />
                프로필
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                설정
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Total Mentions Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">총 언급 수</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,543</div>
              <p className="text-xs text-muted-foreground">지난 달 대비 +12.5%</p>
              <div className="h-[80px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mentionsData}>
                    <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sentiment Analysis Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">감성 분석</CardTitle>
              <ChartContainer
                config={{
                  positive: {
                    label: "긍정",
                    color: "#10b981",
                  },
                  neutral: {
                    label: "중립",
                    color: "#f59e0b",
                  },
                  negative: {
                    label: "부정",
                    color: "#ef4444",
                  },
                }}
              >
                <ChartTooltip content={<ChartTooltipContent />} />
              </ChartContainer>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="h-[100px] w-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      dataKey="value"
                      label={false}
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="ml-4 grid gap-1">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 mr-2" />
                  <span className="text-sm">65% 긍정</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-amber-500 mr-2" />
                  <span className="text-sm">25% 중립</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-red-500 mr-2" />
                  <span className="text-sm">10% 부정</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics Card - 2칸 사용 */}
          <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">트렌딩 주제</CardTitle>
              <LineChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {trendingTopicsData.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{topic.name}</span>
                    <div className="flex items-center">
                      <div className="h-2 bg-blue-500 rounded-full mr-2" style={{ width: `${topic.value}px` }} />
                      <span className="text-xs text-muted-foreground">{topic.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Keyword Monitoring */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>키워드 모니터링</CardTitle>
              <CardDescription>시간에 따른 상위 5개 키워드의 언급 볼륨</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    수질: {
                      label: "수질",
                      color: "hsl(var(--chart-1))",
                    },
                    "서비스 중단": {
                      label: "서비스 중단",
                      color: "hsl(var(--chart-2))",
                    },
                    "요금 문제": {
                      label: "요금 문제",
                      color: "hsl(var(--chart-3))",
                    },
                    인프라: {
                      label: "인프라",
                      color: "hsl(var(--chart-4))",
                    },
                    "고객 서비스": {
                      label: "고객 서비스",
                      color: "hsl(var(--chart-5))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={keywordData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="수질" stroke="var(--color-수질)" />
                      <Line type="monotone" dataKey="서비스 중단" stroke="var(--color-서비스 중단)" />
                      <Line type="monotone" dataKey="요금 문제" stroke="var(--color-요금 문제)" />
                      <Line type="monotone" dataKey="인프라" stroke="var(--color-인프라)" />
                      <Line type="monotone" dataKey="고객 서비스" stroke="var(--color-고객 서비스)" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sentiment Trends */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>감성 트렌드</CardTitle>
              <CardDescription>시간에 따른 감성 분포</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    긍정: {
                      label: "긍정",
                      color: "#10b981",
                    },
                    중립: {
                      label: "중립",
                      color: "#f59e0b",
                    },
                    부정: {
                      label: "부정",
                      color: "#ef4444",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sentimentTrendsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="긍정"
                        stackId="1"
                        stroke="var(--color-긍정)"
                        fill="var(--color-긍정)"
                      />
                      <Area
                        type="monotone"
                        dataKey="중립"
                        stackId="1"
                        stroke="var(--color-중립)"
                        fill="var(--color-중립)"
                      />
                      <Area
                        type="monotone"
                        dataKey="부정"
                        stackId="1"
                        stroke="var(--color-부정)"
                        fill="var(--color-부정)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section - Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>최근 언급</CardTitle>
            <CardDescription>모든 모니터링 소스에서의 최신 언급</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜/시간</TableHead>
                  <TableHead>출처</TableHead>
                  <TableHead className="hidden md:table-cell">내용</TableHead>
                  <TableHead>감성</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMentionsData.map((mention) => (
                  <TableRow key={mention.id}>
                    <TableCell className="font-medium">{mention.datetime}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {mention.source === "news" && <FileText className="h-4 w-4 text-blue-500" />}
                        {mention.source === "social" && <MessageSquare className="h-4 w-4 text-purple-500" />}
                        {mention.source === "blog" && <Calendar className="h-4 w-4 text-green-500" />}
                        <span className="capitalize">
                          {mention.source === "news" ? "뉴스" : mention.source === "social" ? "소셜" : "블로그"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[300px] truncate">{mention.content}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          mention.sentiment === "positive"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : mention.sentiment === "neutral"
                              ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                              : "bg-red-100 text-red-700 hover:bg-red-100"
                        }
                      >
                        {mention.sentiment === "positive" ? "긍정" : mention.sentiment === "neutral" ? "중립" : "부정"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">상세 보기</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${mention.reviewed ? "text-green-500" : "text-slate-400"}`}
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">검토 완료로 표시</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-80 border-l bg-slate-50 dark:bg-slate-900 p-4 overflow-auto">
        <div className="space-y-6">
          {/* Critical Alerts Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">중요 알림</h3>
            <div className="grid grid-cols-1 gap-3">
              {criticalAlertsData.map((alert) => (
                <Card key={alert.id} className="border-l-4 border-l-red-500">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium">{alert.title}</CardTitle>
                      <Badge
                        variant="outline"
                        className={
                          alert.severity === "high"
                            ? "bg-red-100 text-red-700 hover:bg-red-100"
                            : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                        }
                      >
                        {alert.severity === "high" ? "높음" : "중간"}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">{alert.time}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm">{alert.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Insights Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">최근 인사이트</h3>
            <div className="grid grid-cols-1 gap-3">
              {insightsData.map((insight) => (
                <Card key={insight.id}>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
                    <CardDescription className="text-xs">{insight.time}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm">{insight.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
