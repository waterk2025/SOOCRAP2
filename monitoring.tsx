"use client"

import { useState, useEffect } from "react"
import {
  Activity,
  AlertTriangle,
  BarChart,
  Bell,
  Calendar,
  Clock,
  Droplets,
  FileText,
  Grid,
  LineChartIcon,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Pause,
  Play,
  RefreshCw,
  Search,
  Settings,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

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
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 실시간 모니터링 데이터
const realTimeData = [
  {
    id: 1,
    timestamp: "14:23:45",
    source: "twitter",
    sourceName: "트위터",
    author: "@user123",
    content: "수크랩 서비스 정말 좋아졌네요! 수질이 많이 개선된 것 같아요.",
    sentiment: "positive",
    location: "서울",
    engagement: { likes: 12, shares: 3, comments: 5 },
    isNew: true,
  },
  {
    id: 2,
    timestamp: "14:22:18",
    source: "news",
    sourceName: "한국일보",
    author: "김기자",
    content: "지역 수도 공급업체, 스마트 미터기 도입으로 효율성 증대",
    sentiment: "neutral",
    location: "부산",
    engagement: { views: 1245, shares: 87, comments: 23 },
    isNew: true,
  },
  {
    id: 3,
    timestamp: "14:21:32",
    source: "facebook",
    sourceName: "페이스북",
    author: "이민수",
    content: "이번 달 수도요금이 왜 이렇게 높죠? 확인 부탁드립니다.",
    sentiment: "negative",
    location: "대구",
    engagement: { likes: 8, shares: 2, comments: 15 },
    isNew: false,
  },
  {
    id: 4,
    timestamp: "14:20:45",
    source: "blog",
    sourceName: "환경블로그",
    author: "환경지킴이",
    content: "수질 개선 프로젝트의 성과가 눈에 띄게 나타나고 있습니다.",
    sentiment: "positive",
    location: "인천",
    engagement: { views: 456, shares: 12, comments: 8 },
    isNew: false,
  },
]

// 소스별 활동 데이터
const sourceActivityData = [
  { name: "뉴스", active: 15, total: 20, status: "active", color: "#3b82f6" },
  { name: "소셜미디어", active: 28, total: 35, status: "active", color: "#8b5cf6" },
  { name: "블로그", active: 12, total: 18, status: "active", color: "#10b981" },
  { name: "포럼", active: 8, total: 12, status: "warning", color: "#f59e0b" },
  { name: "리뷰사이트", active: 5, total: 8, status: "error", color: "#ef4444" },
]

// 키워드 추적 데이터
const keywordTrackingData = [
  { keyword: "수질", mentions: 45, trend: "up", change: "+12%", sentiment: "positive" },
  { keyword: "요금", mentions: 32, trend: "down", change: "-8%", sentiment: "negative" },
  { keyword: "서비스", mentions: 28, trend: "up", change: "+15%", sentiment: "neutral" },
  { keyword: "인프라", mentions: 18, trend: "stable", change: "0%", sentiment: "positive" },
  { keyword: "고객센터", mentions: 12, trend: "up", change: "+5%", sentiment: "neutral" },
]

// 지역별 활동 데이터
const regionActivityData = [
  { region: "서울", mentions: 156, sentiment: 0.65, population: 9776000 },
  { region: "부산", mentions: 89, sentiment: 0.72, population: 3413000 },
  { region: "대구", mentions: 67, sentiment: 0.58, population: 2438000 },
  { region: "인천", mentions: 54, sentiment: 0.69, population: 2954000 },
  { region: "광주", mentions: 32, sentiment: 0.61, population: 1502000 },
  { region: "대전", mentions: 28, sentiment: 0.74, population: 1475000 },
]

// 시간대별 활동 데이터
const hourlyActivityData = [
  { hour: "00", mentions: 12, sentiment: 0.6 },
  { hour: "01", mentions: 8, sentiment: 0.5 },
  { hour: "02", mentions: 5, sentiment: 0.7 },
  { hour: "03", mentions: 3, sentiment: 0.8 },
  { hour: "04", mentions: 4, sentiment: 0.6 },
  { hour: "05", mentions: 8, sentiment: 0.65 },
  { hour: "06", mentions: 15, sentiment: 0.7 },
  { hour: "07", mentions: 28, sentiment: 0.68 },
  { hour: "08", mentions: 45, sentiment: 0.62 },
  { hour: "09", mentions: 67, sentiment: 0.58 },
  { hour: "10", mentions: 78, sentiment: 0.61 },
  { hour: "11", mentions: 85, sentiment: 0.64 },
  { hour: "12", mentions: 92, sentiment: 0.59 },
  { hour: "13", mentions: 88, sentiment: 0.63 },
  { hour: "14", mentions: 95, sentiment: 0.66 },
  { hour: "15", mentions: 82, sentiment: 0.69 },
  { hour: "16", mentions: 76, sentiment: 0.71 },
  { hour: "17", mentions: 89, sentiment: 0.65 },
  { hour: "18", mentions: 94, sentiment: 0.62 },
  { hour: "19", mentions: 87, sentiment: 0.67 },
  { hour: "20", mentions: 72, sentiment: 0.69 },
  { hour: "21", mentions: 58, sentiment: 0.72 },
  { hour: "22", mentions: 42, sentiment: 0.74 },
  { hour: "23", mentions: 28, sentiment: 0.68 },
]

// 경쟁사 비교 데이터
const competitorData = [
  { name: "수크랩", mentions: 245, sentiment: 0.65, share: 35 },
  { name: "경쟁사 A", mentions: 189, sentiment: 0.58, share: 27 },
  { name: "경쟁사 B", mentions: 156, sentiment: 0.62, share: 22 },
  { name: "경쟁사 C", mentions: 112, sentiment: 0.55, share: 16 },
]

// 알림 이벤트 데이터
const alertEvents = [
  {
    id: 1,
    time: "14:20",
    type: "spike",
    title: "언급량 급증",
    description: "'수질' 키워드 언급이 평소보다 300% 증가했습니다.",
    severity: "high",
    source: "소셜미디어",
  },
  {
    id: 2,
    time: "13:45",
    type: "sentiment",
    title: "부정 감성 증가",
    description: "부정적 언급이 지난 1시간 동안 25% 증가했습니다.",
    severity: "medium",
    source: "뉴스",
  },
  {
    id: 3,
    time: "13:12",
    type: "competitor",
    title: "경쟁사 언급",
    description: "경쟁사 A가 긍정적으로 언급되는 빈도가 증가했습니다.",
    severity: "low",
    source: "블로그",
  },
]

export default function MonitoringPage() {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState("1h")
  const [selectedSource, setSelectedSource] = useState("all")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // 자동 새로고침 시뮬레이션
  useEffect(() => {
    if (autoRefresh && isMonitoring) {
      const interval = setInterval(() => {
        setLastUpdate(new Date())
      }, 30000) // 30초마다 업데이트
      return () => clearInterval(interval)
    }
  }, [autoRefresh, isMonitoring])

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "twitter":
      case "facebook":
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      case "news":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "blog":
        return <Calendar className="h-4 w-4 text-green-500" />
      default:
        return <FileText className="h-4 w-4 text-slate-500" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600"
      case "negative":
        return "text-red-600"
      default:
        return "text-amber-600"
    }
  }

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">긍정</Badge>
      case "negative":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">부정</Badge>
      default:
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">중립</Badge>
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "spike":
        return <TrendingUp className="h-4 w-4" />
      case "sentiment":
        return <AlertTriangle className="h-4 w-4" />
      case "competitor":
        return <Users className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

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
                <Button
                  variant="ghost"
                  className="justify-start gap-2"
                  onClick={() => {
                    setIsSidebarOpen(false)
                    router.push("/")
                  }}
                >
                  <Grid className="h-5 w-5" />
                  대시보드
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start gap-2 bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-50"
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
            <a
              href="#"
              className="font-medium text-slate-400 transition-colors hover:text-blue-400"
              onClick={(e) => {
                e.preventDefault()
                router.push("/")
              }}
            >
              대시보드
            </a>
            <a href="#" className="font-medium text-white transition-colors hover:text-blue-400">
              모니터링
            </a>
            <a href="#" className="font-medium text-slate-400 transition-colors hover:text-blue-400">
              분석
            </a>
            <a href="#" className="font-medium text-slate-400 transition-colors hover:text-blue-400">
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
            <a
              href="#"
              className="font-medium text-slate-400 transition-colors hover:text-blue-400"
              onClick={(e) => {
                e.preventDefault()
                router.push("/search")
              }}
            >
              통합 검색
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
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

      {/* Control Panel */}
      <div className="border-b bg-white dark:bg-slate-900 p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={isMonitoring ? "default" : "outline"}
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
                className="flex items-center gap-2"
              >
                {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isMonitoring ? "모니터링 중지" : "모니터링 시작"}
              </Button>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isMonitoring ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-sm text-muted-foreground">
                  {isMonitoring ? "실시간 모니터링 활성" : "모니터링 비활성"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              <span className="text-sm text-muted-foreground">자동 새로고침</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">마지막 업데이트:</span>
            <span className="text-sm font-medium">{lastUpdate.toLocaleTimeString()}</span>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">새로고침</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <Tabs defaultValue="realtime" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="realtime">실시간</TabsTrigger>
            <TabsTrigger value="sources">소스별</TabsTrigger>
            <TabsTrigger value="keywords">키워드</TabsTrigger>
            <TabsTrigger value="geographic">지역별</TabsTrigger>
            <TabsTrigger value="alerts">알림</TabsTrigger>
          </TabsList>

          {/* 실시간 모니터링 탭 */}
          <TabsContent value="realtime" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">실시간 언급</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">지난 1시간</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">평균 감성</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">+0.65</div>
                  <p className="text-xs text-muted-foreground">긍정적 추세</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">활성 소스</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">68/93</div>
                  <p className="text-xs text-muted-foreground">모니터링 중</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">알림</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">3</div>
                  <p className="text-xs text-muted-foreground">주의 필요</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>실시간 언급 피드</CardTitle>
                  <CardDescription>최신 언급 내용을 실시간으로 확인하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {realTimeData.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 border rounded-lg ${item.isNew ? "bg-blue-50 border-blue-200" : ""}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 mb-2">
                            {getSourceIcon(item.source)}
                            <span className="text-sm font-medium">{item.sourceName}</span>
                            <span className="text-xs text-muted-foreground">@{item.author}</span>
                            <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                            {item.isNew && (
                              <Badge variant="secondary" className="text-xs">
                                NEW
                              </Badge>
                            )}
                          </div>
                          {getSentimentBadge(item.sentiment)}
                        </div>
                        <p className="text-sm mb-2">{item.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{item.location}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {item.engagement.likes && <span>👍 {item.engagement.likes}</span>}
                            {item.engagement.shares && <span>🔄 {item.engagement.shares}</span>}
                            {item.engagement.comments && <span>💬 {item.engagement.comments}</span>}
                            {item.engagement.views && <span>👁 {item.engagement.views}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>시간대별 활동</CardTitle>
                  <CardDescription>24시간 언급 패턴</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hourlyActivityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="mentions" stroke="#3b82f6" fill="#93c5fd" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 소스별 모니터링 탭 */}
          <TabsContent value="sources" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>소스별 활동 상태</CardTitle>
                  <CardDescription>각 모니터링 소스의 현재 상태</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sourceActivityData.map((source, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-3 w-3 rounded-full ${
                              source.status === "active"
                                ? "bg-green-500"
                                : source.status === "warning"
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }`}
                          />
                          <span className="font-medium">{source.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {source.active}/{source.total}
                            </div>
                            <div className="text-xs text-muted-foreground">활성/전체</div>
                          </div>
                          <Progress value={(source.active / source.total) * 100} className="w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>경쟁사 비교</CardTitle>
                  <CardDescription>경쟁사 대비 언급량 및 감성</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={competitorData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="mentions" fill="#3b82f6" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 키워드 추적 탭 */}
          <TabsContent value="keywords" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>키워드 추적 현황</CardTitle>
                <CardDescription>설정된 키워드들의 실시간 추적 결과</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {keywordTrackingData.map((keyword, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{keyword.keyword}</span>
                        <div className="flex items-center gap-1">
                          {keyword.trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
                          {keyword.trend === "down" && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
                          {keyword.trend === "stable" && <div className="h-4 w-4 bg-slate-400 rounded-full" />}
                          <span
                            className={`text-sm ${
                              keyword.trend === "up"
                                ? "text-green-500"
                                : keyword.trend === "down"
                                  ? "text-red-500"
                                  : "text-slate-500"
                            }`}
                          >
                            {keyword.change}
                          </span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold mb-1">{keyword.mentions}</div>
                      <div className="text-xs text-muted-foreground mb-2">지난 1시간 언급</div>
                      {getSentimentBadge(keyword.sentiment)}
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 지역별 모니터링 탭 */}
          <TabsContent value="geographic" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>지역별 언급 분포</CardTitle>
                  <CardDescription>주요 도시별 언급량 및 감성</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {regionActivityData.map((region, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{region.region}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">{region.mentions}건</div>
                            <div className="text-xs text-muted-foreground">언급</div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-sm font-medium ${getSentimentColor(
                                region.sentiment > 0.6 ? "positive" : region.sentiment > 0.4 ? "neutral" : "negative",
                              )}`}
                            >
                              {(region.sentiment * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-muted-foreground">긍정도</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>지역별 감성 분포</CardTitle>
                  <CardDescription>지역별 감성 점수 시각화</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={regionActivityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="region" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sentiment" fill="#10b981" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 알림 탭 */}
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>실시간 알림</CardTitle>
                <CardDescription>중요 이벤트 및 알림 내역</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alertEvents.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg ${
                        alert.severity === "high"
                          ? "border-red-200 bg-red-50"
                          : alert.severity === "medium"
                            ? "border-amber-200 bg-amber-50"
                            : "border-blue-200 bg-blue-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-full ${
                              alert.severity === "high"
                                ? "bg-red-100"
                                : alert.severity === "medium"
                                  ? "bg-amber-100"
                                  : "bg-blue-100"
                            }`}
                          >
                            {getAlertIcon(alert.type)}
                          </div>
                          <div>
                            <h4 className="font-medium">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground">{alert.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{alert.time}</span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{alert.source}</span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={
                            alert.severity === "high"
                              ? "destructive"
                              : alert.severity === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {alert.severity === "high" ? "높음" : alert.severity === "medium" ? "중간" : "낮음"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
