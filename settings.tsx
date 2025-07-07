"use client"

import { useState } from "react"
import {
  ChevronRight,
  Filter,
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  BarChart4,
  Info,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// 샘플 데이터 - 대상 관리
const targetData = [
  {
    id: 1,
    name: "네이버 뉴스",
    url: "https://news.naver.com",
    category: "뉴스",
    frequency: "실시간",
    status: true,
    lastCrawled: "2023-07-15 14:23:45",
    crawlStatus: "success",
    crawlCount: 1245,
    errorCount: 0,
  },
  {
    id: 2,
    name: "다음 블로그",
    url: "https://blog.daum.net",
    category: "블로그",
    frequency: "시간별",
    status: true,
    lastCrawled: "2023-07-15 13:05:22",
    crawlStatus: "success",
    crawlCount: 876,
    errorCount: 2,
  },
  {
    id: 3,
    name: "트위터",
    url: "https://twitter.com",
    category: "소셜",
    frequency: "실시간",
    status: true,
    lastCrawled: "2023-07-15 14:30:10",
    crawlStatus: "warning",
    crawlCount: 2134,
    errorCount: 15,
  },
  {
    id: 4,
    name: "네이트 판",
    url: "https://pann.nate.com",
    category: "포럼",
    frequency: "일별",
    status: false,
    lastCrawled: "2023-07-14 09:15:33",
    crawlStatus: "error",
    crawlCount: 432,
    errorCount: 28,
  },
  {
    id: 5,
    name: "인스타그램",
    url: "https://instagram.com",
    category: "소셜",
    frequency: "시간별",
    status: true,
    lastCrawled: "2023-07-15 12:45:18",
    crawlStatus: "success",
    crawlCount: 1567,
    errorCount: 5,
  },
]

// 샘플 데이터 - 정책 설정
const policyData = [
  {
    id: 1,
    name: "수질 문제 모니터링",
    keywords: ["수질", "오염", "정수", "수돗물", "물맛"],
    conditions: "AND",
    alertLevel: "높음",
    recipients: 5,
    status: true,
    schedule: {
      type: "daily",
      time: "09:00",
      days: [1, 2, 3, 4, 5], // 월-금
      lastRun: "2023-07-15 09:00:12",
      nextRun: "2023-07-16 09:00:00",
      runCount: 124,
      alertCount: 18,
    },
  },
  {
    id: 2,
    name: "요금 관련 모니터링",
    keywords: ["수도요금", "요금인상", "고지서", "과금", "납부"],
    conditions: "OR",
    alertLevel: "중간",
    recipients: 3,
    status: true,
    schedule: {
      type: "hourly",
      interval: 2, // 2시간마다
      lastRun: "2023-07-15 14:00:05",
      nextRun: "2023-07-15 16:00:00",
      runCount: 568,
      alertCount: 42,
    },
  },
  {
    id: 3,
    name: "서비스 중단 모니터링",
    keywords: ["단수", "공사", "누수", "수리", "복구"],
    conditions: "OR",
    alertLevel: "긴급",
    recipients: 8,
    status: true,
    schedule: {
      type: "realtime",
      interval: 5, // 5분마다
      lastRun: "2023-07-15 14:35:22",
      nextRun: "2023-07-15 14:40:00",
      runCount: 1245,
      alertCount: 87,
    },
  },
  {
    id: 4,
    name: "고객 서비스 모니터링",
    keywords: ["고객센터", "상담", "민원", "불만", "응대"],
    conditions: "AND",
    alertLevel: "낮음",
    recipients: 2,
    status: false,
    schedule: {
      type: "weekly",
      day: 1, // 월요일
      time: "10:00",
      lastRun: "2023-07-10 10:00:18",
      nextRun: "2023-07-17 10:00:00",
      runCount: 28,
      alertCount: 5,
    },
  },
]

const getCrawlStatusColor = (status: string) => {
  switch (status) {
    case "success":
      return "text-green-500"
    case "warning":
      return "text-amber-500"
    case "error":
      return "text-red-500"
    default:
      return "text-slate-400"
  }
}

const getCrawlStatusIcon = (status: string) => {
  switch (status) {
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-amber-500" />
    case "error":
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-slate-400" />
  }
}

export default function Settings() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("target")
  const [targetSheetOpen, setTargetSheetOpen] = useState(false)
  const [policySheetOpen, setPolicySheetOpen] = useState(false)
  const [editingTarget, setEditingTarget] = useState<any>(null)
  const [editingPolicy, setEditingPolicy] = useState<any>(null)
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState("")

  const handleAddKeyword = () => {
    if (newKeyword && !selectedKeywords.includes(newKeyword)) {
      setSelectedKeywords([...selectedKeywords, newKeyword])
      setNewKeyword("")
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setSelectedKeywords(selectedKeywords.filter((k) => k !== keyword))
  }

  const handleEditTarget = (target: any) => {
    setEditingTarget(target)
    setTargetSheetOpen(true)
  }

  const handleEditPolicy = (policy: any) => {
    setEditingPolicy(policy)
    setSelectedKeywords(policy.keywords)
    setPolicySheetOpen(true)
  }

  const handleAddTarget = () => {
    setEditingTarget(null)
    setTargetSheetOpen(true)
  }

  const handleAddPolicy = () => {
    setEditingPolicy(null)
    setSelectedKeywords([])
    setPolicySheetOpen(true)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "뉴스":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "블로그":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "소셜":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "포럼":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case "긴급":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "높음":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      case "중간":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100"
      case "낮음":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">뒤로 가기</span>
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">시스템 설정</h1>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="mx-1">대시보드</span>
            <ChevronRight className="h-4 w-4" />
            <span className="mx-1">설정</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">취소</Button>
          <Button>저장</Button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-4 md:p-6">
        <Tabs defaultValue="target" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="target">대상 관리</TabsTrigger>
            <TabsTrigger value="policy">정책 설정</TabsTrigger>
          </TabsList>

          {/* 대상 관리 탭 */}
          <TabsContent value="target" className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="대상 검색..." className="pl-8 md:w-[300px] w-full" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                      <span className="sr-only">필터</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>카테고리별 필터</DropdownMenuItem>
                    <DropdownMenuItem>상태별 필터</DropdownMenuItem>
                    <DropdownMenuItem>빈도별 필터</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button onClick={handleAddTarget} className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                대상 추가
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">이름</TableHead>
                      <TableHead className="hidden md:table-cell">URL</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead className="hidden md:table-cell">크롤링 빈도</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="hidden md:table-cell">마지막 크롤링</TableHead>
                      <TableHead>크롤링 상태</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {targetData.map((target) => (
                      <TableRow key={target.id}>
                        <TableCell className="font-medium">{target.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{target.url}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getCategoryColor(target.category)}>
                            {target.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{target.frequency}</TableCell>
                        <TableCell>
                          <Switch checked={target.status} />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span className="text-sm">{target.lastCrawled}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getCrawlStatusIcon(target.crawlStatus)}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 px-1">
                                  <span className={`text-xs ${getCrawlStatusColor(target.crawlStatus)}`}>
                                    {target.crawlStatus === "success"
                                      ? "정상"
                                      : target.crawlStatus === "warning"
                                        ? "주의"
                                        : "오류"}
                                  </span>
                                  <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <div className="p-2">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">크롤링 통계</span>
                                    <BarChart4 className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">총 크롤링 수:</span>
                                      <span>{target.crawlCount}회</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">오류 발생 수:</span>
                                      <span className={target.errorCount > 0 ? "text-red-500" : ""}>
                                        {target.errorCount}회
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">성공률:</span>
                                      <span>
                                        {target.crawlCount > 0
                                          ? (
                                              ((target.crawlCount - target.errorCount) / target.crawlCount) *
                                              100
                                            ).toFixed(1)
                                          : 0}
                                        %
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Info className="h-4 w-4" />
                                  <span>상세 로그 보기</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditTarget(target)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">편집</span>
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">삭제</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                총 {targetData.length}개 항목 중 1-{targetData.length}개 표시
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" disabled>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">이전 페이지</span>
                </Button>
                <Button variant="outline" size="icon" disabled>
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">다음 페이지</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* 정책 설정 탭 */}
          <TabsContent value="policy" className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="정책 검색..." className="pl-8 md:w-[300px] w-full" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                      <span className="sr-only">필터</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>알림 수준별 필터</DropdownMenuItem>
                    <DropdownMenuItem>상태별 필터</DropdownMenuItem>
                    <DropdownMenuItem>조건별 필터</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button onClick={handleAddPolicy} className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                정책 추가
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">정책 이름</TableHead>
                      <TableHead>키워드</TableHead>
                      <TableHead>조건</TableHead>
                      <TableHead>알림 수준</TableHead>
                      <TableHead className="hidden md:table-cell">실행 주기</TableHead>
                      <TableHead className="hidden md:table-cell">다음 실행</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policyData.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell className="font-medium">{policy.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {policy.keywords.slice(0, 2).map((keyword, index) => (
                              <Badge key={index} variant="secondary" className="mr-1">
                                {keyword}
                              </Badge>
                            ))}
                            {policy.keywords.length > 2 && (
                              <Badge variant="outline">+{policy.keywords.length - 2}개</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{policy.conditions}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getAlertLevelColor(policy.alertLevel)}>
                            {policy.alertLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span className="text-sm">
                              {policy.schedule.type === "realtime"
                                ? `${policy.schedule.interval}분마다`
                                : policy.schedule.type === "hourly"
                                  ? `${policy.schedule.interval}시간마다`
                                  : policy.schedule.type === "daily"
                                    ? "매일"
                                    : "매주"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm">{policy.schedule.nextRun}</span>
                        </TableCell>
                        <TableCell>
                          <Switch checked={policy.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <BarChart4 className="h-4 w-4" />
                                  <span className="sr-only">통계</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <div className="p-2">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">모니터링 통계</span>
                                  </div>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">마지막 실행:</span>
                                      <span>{policy.schedule.lastRun}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">총 실행 횟수:</span>
                                      <span>{policy.schedule.runCount}회</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">알림 발생 횟수:</span>
                                      <span className="text-amber-500">{policy.schedule.alertCount}회</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">알림 발생률:</span>
                                      <span>
                                        {policy.schedule.runCount > 0
                                          ? ((policy.schedule.alertCount / policy.schedule.runCount) * 100).toFixed(1)
                                          : 0}
                                        %
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="ghost" size="icon" onClick={() => handleEditPolicy(policy)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">편집</span>
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">삭제</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                총 {policyData.length}개 항목 중 1-{policyData.length}개 표시
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" disabled>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">이전 페이지</span>
                </Button>
                <Button variant="outline" size="icon" disabled>
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">다음 페이지</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* 대상 추가/편집 시트 */}
      <Sheet open={targetSheetOpen} onOpenChange={setTargetSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editingTarget ? "대상 편집" : "대상 추가"}</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="target-name">대상 이름</Label>
              <Input id="target-name" defaultValue={editingTarget?.name || ""} placeholder="모니터링 대상 이름" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target-url">URL</Label>
              <Input id="target-url" defaultValue={editingTarget?.url || ""} placeholder="https://example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target-category">카테고리</Label>
              <Select defaultValue={editingTarget?.category || "뉴스"}>
                <SelectTrigger id="target-category">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="뉴스">뉴스</SelectItem>
                  <SelectItem value="블로그">블로그</SelectItem>
                  <SelectItem value="소셜">소셜</SelectItem>
                  <SelectItem value="포럼">포럼</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target-frequency">크롤링 빈도</Label>
              <Select defaultValue={editingTarget?.frequency || "시간별"}>
                <SelectTrigger id="target-frequency">
                  <SelectValue placeholder="빈도 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="실시간">실시간</SelectItem>
                  <SelectItem value="시간별">시간별</SelectItem>
                  <SelectItem value="일별">일별</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>우선순위</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">낮음</span>
                <Slider defaultValue={[50]} max={100} step={1} className="flex-1" />
                <span className="text-sm text-muted-foreground">높음</span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target-selector">콘텐츠 선택자 힌트</Label>
              <Textarea
                id="target-selector"
                placeholder="크롤링 구성을 위한 CSS 선택자 또는 XPath"
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label>크롤링 상태 모니터링</Label>
              <div className="p-3 border rounded-md bg-slate-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    {editingTarget ? (
                      <div className="flex items-center gap-1">
                        {getCrawlStatusIcon(editingTarget.crawlStatus)}
                        <span className={getCrawlStatusColor(editingTarget.crawlStatus)}>
                          {editingTarget.crawlStatus === "success"
                            ? "정상"
                            : editingTarget.crawlStatus === "warning"
                              ? "주의 필요"
                              : "오류 발생"}
                        </span>
                      </div>
                    ) : (
                      "상태 정보 없음"
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {editingTarget ? `마지막 크롤링: ${editingTarget.lastCrawled}` : ""}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  {editingTarget && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">총 크롤링 수:</span>
                        <span>{editingTarget.crawlCount}회</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">오류 발생 수:</span>
                        <span className={editingTarget.errorCount > 0 ? "text-red-500" : ""}>
                          {editingTarget.errorCount}회
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">성공률:</span>
                        <span>
                          {editingTarget.crawlCount > 0
                            ? (
                                ((editingTarget.crawlCount - editingTarget.errorCount) / editingTarget.crawlCount) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <BarChart4 className="h-3 w-3 mr-1" />
                    상세 로그 보기
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="target-status" className="flex-1">
                활성화
              </Label>
              <Switch id="target-status" defaultChecked={editingTarget?.status || true} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <SheetClose asChild>
              <Button variant="outline">취소</Button>
            </SheetClose>
            <SheetClose asChild>
              <Button>{editingTarget ? "저장" : "추가"}</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>

      {/* 정책 추가/편집 시트 */}
      <Sheet open={policySheetOpen} onOpenChange={setPolicySheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editingPolicy ? "정책 편집" : "정책 추가"}</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="policy-name">정책 이름</Label>
              <Input id="policy-name" defaultValue={editingPolicy?.name || ""} placeholder="모니터링 정책 이름" />
            </div>
            <div className="grid gap-2">
              <Label>키워드 관리</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedKeywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {keyword}
                    <button onClick={() => handleRemoveKeyword(keyword)} className="ml-1 rounded-full hover:bg-muted">
                      <X className="h-3 w-3" />
                      <span className="sr-only">키워드 제거</span>
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="키워드 입력"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddKeyword()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddKeyword} size="sm">
                  추가
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>조건 연산자</Label>
              <div className="flex gap-2">
                <Button variant={editingPolicy?.conditions === "AND" ? "default" : "outline"} className="flex-1">
                  AND (모든 키워드 포함)
                </Button>
                <Button variant={editingPolicy?.conditions === "OR" ? "default" : "outline"} className="flex-1">
                  OR (아무 키워드 포함)
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="policy-alert">알림 수준</Label>
              <Select defaultValue={editingPolicy?.alertLevel || "중간"}>
                <SelectTrigger id="policy-alert">
                  <SelectValue placeholder="알림 수준 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="긴급">긴급</SelectItem>
                  <SelectItem value="높음">높음</SelectItem>
                  <SelectItem value="중간">중간</SelectItem>
                  <SelectItem value="낮음">낮음</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>알림 수신자</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="recipient-1" defaultChecked />
                  <Label htmlFor="recipient-1" className="text-sm font-normal">
                    김관리자 (admin@example.com)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="recipient-2" defaultChecked />
                  <Label htmlFor="recipient-2" className="text-sm font-normal">
                    이담당자 (manager@example.com)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="recipient-3" />
                  <Label htmlFor="recipient-3" className="text-sm font-normal">
                    박부장 (team@example.com)
                  </Label>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>스케줄 설정</Label>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="schedule-type">실행 주기</Label>
                  <Select defaultValue={editingPolicy?.schedule?.type || "daily"}>
                    <SelectTrigger id="schedule-type">
                      <SelectValue placeholder="실행 주기 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">실시간 (분 단위)</SelectItem>
                      <SelectItem value="hourly">시간별</SelectItem>
                      <SelectItem value="daily">일별</SelectItem>
                      <SelectItem value="weekly">주별</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="schedule-interval">실행 간격</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="schedule-interval"
                      type="number"
                      min="1"
                      max="60"
                      defaultValue={editingPolicy?.schedule?.interval || "5"}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">분 간격으로 실행</span>
                  </div>
                  <p className="text-xs text-muted-foreground">실시간 모니터링의 경우 적용됩니다.</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="schedule-time">실행 시간</Label>
                  <Input id="schedule-time" type="time" defaultValue={editingPolicy?.schedule?.time || "09:00"} />
                  <p className="text-xs text-muted-foreground">일별 및 주별 모니터링의 경우 적용됩니다.</p>
                </div>

                <div className="grid gap-2">
                  <Label>실행 요일</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {["월", "화", "수", "목", "금", "토", "일"].map((day, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <span className="text-sm">{day}</span>
                        <Checkbox
                          id={`day-${index}`}
                          defaultChecked={
                            editingPolicy?.schedule?.days ? editingPolicy.schedule.days.includes(index + 1) : index < 5
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">일별 모니터링의 경우 적용됩니다.</p>
                </div>

                {editingPolicy && (
                  <div className="p-3 border rounded-md bg-slate-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">모니터링 통계</span>
                      <span className="text-xs text-muted-foreground">
                        마지막 실행: {editingPolicy.schedule.lastRun}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">총 실행 횟수:</span>
                        <span>{editingPolicy.schedule.runCount}회</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">알림 발생 횟수:</span>
                        <span className="text-amber-500">{editingPolicy.schedule.alertCount}회</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">알림 발생률:</span>
                        <span>
                          {editingPolicy.schedule.runCount > 0
                            ? ((editingPolicy.schedule.alertCount / editingPolicy.schedule.runCount) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">다음 예정 실행:</span>
                        <span>{editingPolicy.schedule.nextRun}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="policy-status" className="flex-1">
                활성화
              </Label>
              <Switch id="policy-status" defaultChecked={editingPolicy?.status || true} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <SheetClose asChild>
              <Button variant="outline">취소</Button>
            </SheetClose>
            <SheetClose asChild>
              <Button>{editingPolicy ? "저장" : "추가"}</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
