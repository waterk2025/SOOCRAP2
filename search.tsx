"use client"

import { useState } from "react"
import {
  SearchIcon,
  ChevronDown,
  ChevronRight,
  Calendar,
  X,
  FileText,
  MessageSquare,
  BarChart,
  Grid,
  List,
  ChevronLeft,
  Clock,
  Bookmark,
  ExternalLink,
  MessageCircle,
  Share2,
  Eye,
  Droplets,
  Menu,
  Bell,
  User,
  LogOut,
  Settings,
  LineChart,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// 샘플 데이터 - 검색 결과
const searchResults = [
  {
    id: 1,
    date: "2023-07-15",
    time: "09:23",
    source: "news",
    sourceName: "한국일보",
    title: "수도 공급 업체, 주요 파손에 대한 신속한 대응으로 칭찬받다",
    content:
      "지역 수도 공급 업체가 주요 파이프 파손에 대한 신속한 대응으로 지역 주민들로부터 칭찬을 받고 있습니다. 이번 사고는 어제 오후 발생했으며, 기술팀은 3시간 만에 문제를 해결했습니다.",
    sentiment: "positive",
    engagement: {
      views: 1245,
      shares: 87,
      comments: 32,
    },
    url: "https://example.com/news/1",
  },
  {
    id: 2,
    date: "2023-07-14",
    time: "14:45",
    source: "social",
    sourceName: "트위터",
    title: "@수크랩 이번 달 수도 요금이 왜 이렇게 높은가요?",
    content:
      "이번 달 수도 요금이 지난달보다 30% 높게 나왔습니다. 이유가 무엇인지 알 수 있을까요? @수크랩 #수도요금 #문의",
    sentiment: "negative",
    engagement: {
      views: 532,
      shares: 24,
      comments: 18,
    },
    url: "https://example.com/social/2",
  },
  {
    id: 3,
    date: "2023-07-14",
    time: "10:12",
    source: "blog",
    sourceName: "환경 블로그",
    title: "최신 수질 보고서, 지역 공급 개선 보여줘",
    content:
      "최근 발표된 수질 보고서에 따르면 지난 6개월 동안 지역 수돗물의 품질이 크게 향상되었습니다. 특히 염소 수준이 감소하고 전반적인 맛이 개선되었다는 평가를 받았습니다.",
    sentiment: "positive",
    engagement: {
      views: 876,
      shares: 45,
      comments: 12,
    },
    url: "https://example.com/blog/3",
  },
  {
    id: 4,
    date: "2023-07-13",
    time: "16:30",
    source: "social",
    sourceName: "페이스북",
    title: "도심 지역 단수. 업데이트 있나요 @수크랩?",
    content: "현재 중앙동 지역에 단수가 발생했습니다. 언제 복구될 예정인지 알 수 있을까요? @수크랩 #단수 #문의",
    sentiment: "neutral",
    engagement: {
      views: 1532,
      shares: 124,
      comments: 87,
    },
    url: "https://example.com/social/4",
  },
  {
    id: 5,
    date: "2023-07-12",
    time: "08:15",
    source: "news",
    sourceName: "경제신문",
    title: "수도 공급 업체, 인프라 업그레이드 프로젝트 발표",
    content:
      "지역 수도 공급 업체가 향후 5년간 진행될 대규모 인프라 업그레이드 프로젝트를 발표했습니다. 이 프로젝트는 노후 파이프 교체와 스마트 미터기 설치를 포함하며, 총 예산은 500억원입니다.",
    sentiment: "neutral",
    engagement: {
      views: 2145,
      shares: 156,
      comments: 43,
    },
    url: "https://example.com/news/5",
  },
  {
    id: 6,
    date: "2023-07-11",
    time: "13:20",
    source: "blog",
    sourceName: "시민 포럼",
    title: "의견: 물 절약 노력 개선 필요",
    content:
      "최근 가뭄으로 인해 물 부족 현상이 심화되고 있습니다. 수도 공급 업체는 더 적극적인 물 절약 캠페인을 시행하고, 시민들에게 절수 방법을 교육해야 합니다.",
    sentiment: "negative",
    engagement: {
      views: 987,
      shares: 76,
      comments: 54,
    },
    url: "https://example.com/blog/6",
  },
  {
    id: 7,
    date: "2023-07-10",
    time: "11:05",
    source: "forum",
    sourceName: "지역 커뮤니티",
    title: "수질 문제 제보합니다",
    content:
      "최근 우리 동네 수돗물에서 이상한 냄새가 납니다. 다른 분들도 같은 경험을 하셨나요? 수도 공급 업체에 문의했지만 아직 명확한 답변을 받지 못했습니다.",
    sentiment: "negative",
    engagement: {
      views: 1432,
      shares: 98,
      comments: 112,
    },
    url: "https://example.com/forum/7",
  },
  {
    id: 8,
    date: "2023-07-09",
    time: "15:40",
    source: "news",
    sourceName: "지역 뉴스",
    title: "수도 요금 인상 계획 발표",
    content:
      "지역 수도 공급 업체가 다음 분기부터 수도 요금을 평균 5% 인상한다고 발표했습니다. 이는 인프라 유지 비용 증가와 수질 개선 프로젝트 자금 조달을 위한 조치라고 합니다.",
    sentiment: "neutral",
    engagement: {
      views: 3245,
      shares: 287,
      comments: 176,
    },
    url: "https://example.com/news/8",
  },
]

// 검색 분석 데이터
const searchAnalyticsData = [
  { date: "07-09", count: 45 },
  { date: "07-10", count: 67 },
  { date: "07-11", count: 54 },
  { date: "07-12", count: 72 },
  { date: "07-13", count: 63 },
  { date: "07-14", count: 81 },
  { date: "07-15", count: 93 },
]

// 상위 키워드 데이터
const topKeywordsData = [
  { keyword: "수질", count: 87 },
  { keyword: "요금", count: 65 },
  { keyword: "단수", count: 43 },
  { keyword: "인프라", count: 38 },
  { keyword: "서비스", count: 29 },
]

// 감성 분포 데이터
const sentimentDistributionData = [
  { name: "긍정", value: 35 },
  { name: "중립", value: 40 },
  { name: "부정", value: 25 },
]

// 관련 검색어 데이터
const relatedSearchesData = ["수질 문제", "수도 요금 인상", "단수 일정", "수도 인프라 개선", "물 절약 방법"]

// 최근 검색어 데이터
const recentSearchesData = [
  { query: "수질 오염", date: "2023-07-14" },
  { query: "수도 요금", date: "2023-07-13" },
  { query: "단수 지역", date: "2023-07-12" },
  { query: "수도관 파손", date: "2023-07-10" },
]

export default function SearchPage() {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false)
  const [viewMode, setViewMode] = useState("list")
  const [sortOption, setSortOption] = useState("relevance")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [selectedSentiment, setSelectedSentiment] = useState("all")
  const [selectedLanguage, setSelectedLanguage] = useState("ko")
  const [booleanOperator, setBooleanOperator] = useState("AND")

  const handleSourceChange = (source: string) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter((s) => s !== source))
    } else {
      setSelectedSources([...selectedSources, source])
    }
  }

  const clearFilters = () => {
    setDateRange({ from: "", to: "" })
    setSelectedSources([])
    setSelectedSentiment("all")
    setSelectedLanguage("ko")
    setBooleanOperator("AND")
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "news":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "social":
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      case "blog":
        return <Calendar className="h-4 w-4 text-green-500" />
      case "forum":
        return <MessageCircle className="h-4 w-4 text-amber-500" />
      default:
        return <FileText className="h-4 w-4 text-slate-500" />
    }
  }

  const getSourceName = (source: string) => {
    switch (source) {
      case "news":
        return "뉴스"
      case "social":
        return "소셜"
      case "blog":
        return "블로그"
      case "forum":
        return "포럼"
      default:
        return source
    }
  }

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100">
            긍정
          </Badge>
        )
      case "neutral":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            중립
          </Badge>
        )
      case "negative":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700 hover:bg-red-100">
            부정
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
            미분류
          </Badge>
        )
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
                <Button variant="ghost" className="justify-start gap-2">
                  <LineChart className="h-5 w-5" />
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
                  className="justify-start gap-2 bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-50"
                >
                  <SearchIcon className="h-5 w-5" />
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
            <a href="#" className="font-medium text-slate-400 transition-colors hover:text-blue-400">
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
            <a href="#" className="font-medium text-white transition-colors hover:text-blue-400">
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

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Filters */}
        <aside className="hidden md:block w-64 border-r bg-white dark:bg-slate-900 p-4 overflow-auto">
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-4">검색 필터</h3>

            <Collapsible defaultOpen className="mb-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium py-2">
                <span>날짜 범위</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 pb-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="date-today" />
                  <Label htmlFor="date-today" className="text-sm">
                    오늘
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="date-yesterday" />
                  <Label htmlFor="date-yesterday" className="text-sm">
                    어제
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="date-week" defaultChecked />
                  <Label htmlFor="date-week" className="text-sm">
                    최근 7일
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="date-month" />
                  <Label htmlFor="date-month" className="text-sm">
                    최근 30일
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="date-custom" />
                  <Label htmlFor="date-custom" className="text-sm">
                    사용자 지정
                  </Label>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label htmlFor="date-from" className="text-xs">
                      시작일
                    </Label>
                    <Input id="date-from" type="date" className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label htmlFor="date-to" className="text-xs">
                      종료일
                    </Label>
                    <Input id="date-to" type="date" className="h-8 text-xs" />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible defaultOpen className="mb-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium py-2">
                <span>소스 카테고리</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="source-news" defaultChecked />
                    <Label htmlFor="source-news" className="text-sm">
                      뉴스
                    </Label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    152
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="source-social" defaultChecked />
                    <Label htmlFor="source-social" className="text-sm">
                      소셜 미디어
                    </Label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    87
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="source-blog" defaultChecked />
                    <Label htmlFor="source-blog" className="text-sm">
                      블로그
                    </Label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    64
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="source-forum" defaultChecked />
                    <Label htmlFor="source-forum" className="text-sm">
                      포럼
                    </Label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    43
                  </Badge>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible defaultOpen className="mb-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium py-2">
                <span>감성 분포</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="sentiment-positive" defaultChecked />
                    <Label htmlFor="sentiment-positive" className="text-sm">
                      긍정
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: "35%" }}></div>
                    </div>
                    <span className="text-xs">35%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="sentiment-neutral" defaultChecked />
                    <Label htmlFor="sentiment-neutral" className="text-sm">
                      중립
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: "40%" }}></div>
                    </div>
                    <span className="text-xs">40%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="sentiment-negative" defaultChecked />
                    <Label htmlFor="sentiment-negative" className="text-sm">
                      부정
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: "25%" }}></div>
                    </div>
                    <span className="text-xs">25%</span>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible className="mb-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium py-2">
                <span>상위 도메인</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="domain-1" />
                    <Label htmlFor="domain-1" className="text-sm">
                      naver.com
                    </Label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    43
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="domain-2" />
                    <Label htmlFor="domain-2" className="text-sm">
                      daum.net
                    </Label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    38
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="domain-3" />
                    <Label htmlFor="domain-3" className="text-sm">
                      twitter.com
                    </Label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    27
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="domain-4" />
                    <Label htmlFor="domain-4" className="text-sm">
                      facebook.com
                    </Label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    21
                  </Badge>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible className="mb-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium py-2">
                <span>작성자/발행자</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="author-1" />
                    <Label htmlFor="author-1" className="text-sm">
                      한국일보
                    </Label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    18
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="author-2" />
                    <Label htmlFor="author-2" className="text-sm">
                      경제신문
                    </Label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    15
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="author-3" />
                    <Label htmlFor="author-3" className="text-sm">
                      환경 블로그
                    </Label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    12
                  </Badge>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible className="mb-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium py-2">
                <span>콘텐츠 유형</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="content-article" defaultChecked />
                    <Label htmlFor="content-article" className="text-sm">
                      기사
                    </Label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    152
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="content-post" defaultChecked />
                    <Label htmlFor="content-post" className="text-sm">
                      게시물
                    </Label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    87
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="content-comment" defaultChecked />
                    <Label htmlFor="content-comment" className="text-sm">
                      댓글
                    </Label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    64
                  </Badge>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="mt-auto pt-4 space-y-2">
              <Button className="w-full">필터 적용</Button>
              <Button variant="outline" className="w-full" onClick={clearFilters}>
                모두 초기화
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Search Form */}
          <div className="bg-white dark:bg-slate-900 border-b p-4">
            <div className="max-w-5xl mx-auto">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="키워드, 문구 또는 출처 검색..."
                  className="pl-10 pr-20 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
                >
                  고급 검색
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </div>

              {isAdvancedSearchOpen && (
                <div className="mt-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="date-range-from">날짜 범위</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <Label htmlFor="date-range-from" className="text-xs">
                            시작일
                          </Label>
                          <Input
                            id="date-range-from"
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="date-range-to" className="text-xs">
                            종료일
                          </Label>
                          <Input
                            id="date-range-to"
                            type="date"
                            value={dateRange.to}
                            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>소스 유형</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="source-type-news"
                            checked={selectedSources.includes("news")}
                            onCheckedChange={() => handleSourceChange("news")}
                          />
                          <Label htmlFor="source-type-news" className="text-sm">
                            뉴스
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="source-type-social"
                            checked={selectedSources.includes("social")}
                            onCheckedChange={() => handleSourceChange("social")}
                          />
                          <Label htmlFor="source-type-social" className="text-sm">
                            소셜 미디어
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="source-type-blog"
                            checked={selectedSources.includes("blog")}
                            onCheckedChange={() => handleSourceChange("blog")}
                          />
                          <Label htmlFor="source-type-blog" className="text-sm">
                            블로그
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="source-type-forum"
                            checked={selectedSources.includes("forum")}
                            onCheckedChange={() => handleSourceChange("forum")}
                          />
                          <Label htmlFor="source-type-forum" className="text-sm">
                            포럼
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label>감성 필터</Label>
                      <RadioGroup
                        value={selectedSentiment}
                        onValueChange={setSelectedSentiment}
                        className="grid grid-cols-4 gap-2 mt-1"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="all" id="sentiment-all" />
                          <Label htmlFor="sentiment-all" className="text-sm">
                            전체
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="positive" id="sentiment-positive" />
                          <Label htmlFor="sentiment-positive" className="text-sm">
                            긍정
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="neutral" id="sentiment-neutral" />
                          <Label htmlFor="sentiment-neutral" className="text-sm">
                            중립
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="negative" id="sentiment-negative" />
                          <Label htmlFor="sentiment-negative" className="text-sm">
                            부정
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="language-selector">언어</Label>
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger id="language-selector" className="mt-1">
                          <SelectValue placeholder="언어 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ko">한국어</SelectItem>
                          <SelectItem value="en">영어</SelectItem>
                          <SelectItem value="ja">일본어</SelectItem>
                          <SelectItem value="zh">중국어</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>불리언 연산자</Label>
                      <div className="flex gap-2 mt-1">
                        <Button
                          variant={booleanOperator === "AND" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBooleanOperator("AND")}
                          className="flex-1"
                        >
                          AND
                        </Button>
                        <Button
                          variant={booleanOperator === "OR" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBooleanOperator("OR")}
                          className="flex-1"
                        >
                          OR
                        </Button>
                        <Button
                          variant={booleanOperator === "NOT" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBooleanOperator("NOT")}
                          className="flex-1"
                        >
                          NOT
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                    <Button variant="outline" onClick={() => setIsAdvancedSearchOpen(false)}>
                      취소
                    </Button>
                    <Button variant="outline" onClick={clearFilters}>
                      초기화
                    </Button>
                    <Button>검색</Button>
                    <Button variant="outline">
                      <Bookmark className="mr-1 h-4 w-4" />
                      검색 저장
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-auto p-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                <div>
                  <h2 className="text-xl font-semibold">검색 결과</h2>
                  <p className="text-sm text-muted-foreground">총 {searchResults.length}개의 결과가 검색되었습니다.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="정렬 기준" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">관련성</SelectItem>
                      <SelectItem value="date">날짜</SelectItem>
                      <SelectItem value="engagement">참여도</SelectItem>
                      <SelectItem value="influence">영향력</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex border rounded-md overflow-hidden">
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="icon"
                      className="rounded-none h-9 w-9"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                      <span className="sr-only">리스트 보기</span>
                    </Button>
                    <Button
                      variant={viewMode === "card" ? "default" : "ghost"}
                      size="icon"
                      className="rounded-none h-9 w-9"
                      onClick={() => setViewMode("card")}
                    >
                      <Grid className="h-4 w-4" />
                      <span className="sr-only">카드 보기</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* List View */}
              {viewMode === "list" && (
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <Card key={result.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <div className="flex items-center gap-1">
                                {getSourceIcon(result.source)}
                                <span>{result.sourceName}</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {result.date} {result.time}
                                </span>
                              </div>
                            </div>
                            <h3 className="text-lg font-semibold mb-2 line-clamp-2">{result.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{result.content}</p>
                            <div className="flex flex-wrap items-center gap-3">
                              {getSentimentBadge(result.sentiment)}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Eye className="h-3 w-3" />
                                <span>{result.engagement.views.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Share2 className="h-3 w-3" />
                                <span>{result.engagement.shares.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MessageCircle className="h-3 w-3" />
                                <span>{result.engagement.comments.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="shrink-0">
                            <Eye className="mr-1 h-4 w-4" />
                            상세 보기
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Card View */}
              {viewMode === "card" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((result) => (
                    <Card key={result.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getSourceIcon(result.source)}
                            <span className="text-sm font-medium">{result.sourceName}</span>
                          </div>
                          {getSentimentBadge(result.sentiment)}
                        </div>
                        <CardTitle className="text-base mt-2 line-clamp-2">{result.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {result.date} {result.time}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{result.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Eye className="h-3 w-3" />
                              <span>{result.engagement.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Share2 className="h-3 w-3" />
                              <span>{result.engagement.shares.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MessageCircle className="h-3 w-3" />
                              <span>{result.engagement.comments.toLocaleString()}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            상세
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  1-{searchResults.length}개 표시 (총 {searchResults.length}개)
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" disabled>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">이전 페이지</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    1
                  </Button>
                  <Button variant="outline" size="icon" disabled>
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">다음 페이지</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Analytics */}
        <aside className="hidden lg:block w-72 border-l bg-white dark:bg-slate-900 p-4 overflow-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">검색 분석</h3>
              <Card className="overflow-hidden">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-sm">시간에 따른 결과</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={searchAnalyticsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="count" stroke="#2563eb" fill="#93c5fd" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">상위 키워드</h4>
              <div className="space-y-2">
                {topKeywordsData.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{keyword.keyword}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(keyword.count / topKeywordsData[0].count) * 100} className="h-2 w-24" />
                      <span className="text-xs text-muted-foreground">{keyword.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">감성 분포</h4>
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">긍정</span>
                    <span className="text-xs text-muted-foreground">35%</span>
                  </div>
                  <Progress value={35} className="h-2 bg-slate-200" indicatorClassName="bg-green-500" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">중립</span>
                    <span className="text-xs text-muted-foreground">40%</span>
                  </div>
                  <Progress value={40} className="h-2 bg-slate-200" indicatorClassName="bg-amber-500" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">부정</span>
                    <span className="text-xs text-muted-foreground">25%</span>
                  </div>
                  <Progress value={25} className="h-2 bg-slate-200" indicatorClassName="bg-red-500" />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2">관련 검색어</h4>
              <div className="flex flex-wrap gap-2">
                {relatedSearchesData.map((term, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer">
                    {term}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">최근 검색어</h4>
              <div className="space-y-2">
                {recentSearchesData.map((search, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Button variant="link" className="p-0 h-auto text-sm">
                      {search.query}
                    </Button>
                    <span className="text-xs text-muted-foreground">{search.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
