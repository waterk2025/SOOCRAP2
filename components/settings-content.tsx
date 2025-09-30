"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Search } from "lucide-react"

interface MonitoringTarget {
  id: number
  name: string
  url: string
  type: string
  status: "active" | "inactive"
}

interface MonitoringPolicy {
  id: number
  name: string
  keywords: string[]
  operator: "AND" | "OR"
  status: "active" | "inactive"
}

export default function SettingsContent() {
  const [targets, setTargets] = useState<MonitoringTarget[]>([
    { id: 1, name: "네이버 뉴스 - K-water", url: "https://news.naver.com", type: "뉴스", status: "active" },
    { id: 2, name: "다음 카페 - 수자원", url: "https://cafe.daum.net", type: "커뮤니티", status: "inactive" },
    { id: 3, name: "트위터 - 한국수자원공사", url: "https://twitter.com", type: "소셜미디어", status: "inactive" },
    { id: 4, name: "페이스북 - 물 관련", url: "https://facebook.com", type: "소셜미디어", status: "inactive" },
  ])

  const [policies, setPolicies] = useState<MonitoringPolicy[]>([
    {
      id: 1,
      name: "K-water 브랜드 언급",
      keywords: ["K-water", "한국수자원공사", "수자원공사"],
      operator: "OR",
      status: "active",
    },
    { id: 2, name: "수질 관련", keywords: ["수질", "정수", "수돗물", "물맛"], operator: "OR", status: "active" },
    { id: 3, name: "요금 관련", keywords: ["수도요금", "요금인상", "요금체계"], operator: "OR", status: "active" },
    { id: 4, name: "서비스 중단", keywords: ["단수", "공사", "누수", "수리"], operator: "OR", status: "active" },
    { id: 5, name: "고객 서비스", keywords: ["고객센터", "상담", "민원", "불만"], operator: "AND", status: "inactive" },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false)
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false)
  const [editingTarget, setEditingTarget] = useState<MonitoringTarget | null>(null)
  const [editingPolicy, setEditingPolicy] = useState<MonitoringPolicy | null>(null)

  // Target form state
  const [targetForm, setTargetForm] = useState({
    name: "",
    url: "",
    type: "뉴스",
  })

  // Policy form state
  const [policyForm, setPolicyForm] = useState({
    name: "",
    keywords: "",
    operator: "OR" as "AND" | "OR",
  })

  const handleAddTarget = () => {
    const newTarget: MonitoringTarget = {
      id: Date.now(),
      name: targetForm.name,
      url: targetForm.url,
      type: targetForm.type,
      status: "active",
    }
    setTargets([...targets, newTarget])
    setTargetForm({ name: "", url: "", type: "뉴스" })
    setIsTargetDialogOpen(false)
  }

  const handleEditTarget = (target: MonitoringTarget) => {
    setEditingTarget(target)
    setTargetForm({
      name: target.name,
      url: target.url,
      type: target.type,
    })
    setIsTargetDialogOpen(true)
  }

  const handleUpdateTarget = () => {
    if (editingTarget) {
      setTargets(
        targets.map((t) =>
          t.id === editingTarget.id ? { ...t, name: targetForm.name, url: targetForm.url, type: targetForm.type } : t,
        ),
      )
      setEditingTarget(null)
      setTargetForm({ name: "", url: "", type: "뉴스" })
      setIsTargetDialogOpen(false)
    }
  }

  const handleDeleteTarget = (id: number) => {
    setTargets(targets.filter((t) => t.id !== id))
  }

  const handleAddPolicy = () => {
    const newPolicy: MonitoringPolicy = {
      id: Date.now(),
      name: policyForm.name,
      keywords: policyForm.keywords.split(",").map((k) => k.trim()),
      operator: policyForm.operator,
      status: "active",
    }
    setPolicies([...policies, newPolicy])
    setPolicyForm({ name: "", keywords: "", operator: "OR" })
    setIsPolicyDialogOpen(false)
  }

  const handleEditPolicy = (policy: MonitoringPolicy) => {
    setEditingPolicy(policy)
    setPolicyForm({
      name: policy.name,
      keywords: policy.keywords.join(", "),
      operator: policy.operator,
    })
    setIsPolicyDialogOpen(true)
  }

  const handleUpdatePolicy = () => {
    if (editingPolicy) {
      setPolicies(
        policies.map((p) =>
          p.id === editingPolicy.id
            ? {
                ...p,
                name: policyForm.name,
                keywords: policyForm.keywords.split(",").map((k) => k.trim()),
                operator: policyForm.operator,
              }
            : p,
        ),
      )
      setEditingPolicy(null)
      setPolicyForm({ name: "", keywords: "", operator: "OR" })
      setIsPolicyDialogOpen(false)
    }
  }

  const handleDeletePolicy = (id: number) => {
    setPolicies(policies.filter((p) => p.id !== id))
  }

  const filteredTargets = targets.filter(
    (target) =>
      target.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      target.url.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">설정</h1>
        <p className="text-gray-600">수크랩 - 한국수자원공사 모니터링 대상과 정책을 관리하세요</p>
      </div>

      <Tabs defaultValue="targets" className="w-full">
        <TabsList>
          <TabsTrigger value="targets">모니터링 대상</TabsTrigger>
          <TabsTrigger value="policies">모니터링 정책</TabsTrigger>
        </TabsList>

        <TabsContent value="targets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>모니터링 대상</CardTitle>
                  <CardDescription>K-water 관련 언급을 모니터링할 웹사이트와 소스를 관리하세요</CardDescription>
                </div>
                <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingTarget(null)
                        setTargetForm({ name: "", url: "", type: "뉴스" })
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      대상 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingTarget ? "모니터링 대상 편집" : "모니터링 대상 추가"}</DialogTitle>
                      <DialogDescription>K-water 언급을 모니터링할 새로운 소스를 설정하세요</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="target-name">이름</Label>
                        <Input
                          id="target-name"
                          value={targetForm.name}
                          onChange={(e) => setTargetForm({ ...targetForm, name: e.target.value })}
                          placeholder="예: 네이버 뉴스 - K-water"
                        />
                      </div>
                      <div>
                        <Label htmlFor="target-url">URL</Label>
                        <Input
                          id="target-url"
                          value={targetForm.url}
                          onChange={(e) => setTargetForm({ ...targetForm, url: e.target.value })}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="target-type">유형</Label>
                        <Select
                          value={targetForm.type}
                          onValueChange={(value) => setTargetForm({ ...targetForm, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="뉴스">뉴스</SelectItem>
                            <SelectItem value="블로그">블로그</SelectItem>
                            <SelectItem value="소셜미디어">소셜미디어</SelectItem>
                            <SelectItem value="커뮤니티">커뮤니티</SelectItem>
                            <SelectItem value="포럼">포럼</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsTargetDialogOpen(false)}>
                          취소
                        </Button>
                        <Button onClick={editingTarget ? handleUpdateTarget : handleAddTarget}>
                          {editingTarget ? "업데이트" : "추가"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="대상 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTargets.map((target) => (
                    <TableRow key={target.id}>
                      <TableCell className="font-medium">{target.name}</TableCell>
                      <TableCell>{target.url}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{target.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={target.status === "active" ? "default" : "secondary"}>
                          {target.status === "active" ? "활성" : "비활성"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditTarget(target)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteTarget(target.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>모니터링 정책</CardTitle>
                  <CardDescription>K-water 관련 키워드 모니터링 규칙과 정책을 관리하세요</CardDescription>
                </div>
                <Dialog open={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingPolicy(null)
                        setPolicyForm({ name: "", keywords: "", operator: "OR" })
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      정책 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingPolicy ? "모니터링 정책 편집" : "모니터링 정책 추가"}</DialogTitle>
                      <DialogDescription>K-water 모니터링을 위한 키워드 규칙을 설정하세요</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="policy-name">정책 이름</Label>
                        <Input
                          id="policy-name"
                          value={policyForm.name}
                          onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })}
                          placeholder="예: 수질 관련 모니터링"
                        />
                      </div>
                      <div>
                        <Label htmlFor="policy-keywords">키워드</Label>
                        <Input
                          id="policy-keywords"
                          value={policyForm.keywords}
                          onChange={(e) => setPolicyForm({ ...policyForm, keywords: e.target.value })}
                          placeholder="수질, 정수, 수돗물, 물맛"
                        />
                        <p className="text-sm text-gray-500 mt-1">키워드를 쉼표로 구분하세요</p>
                      </div>
                      <div>
                        <Label htmlFor="policy-operator">연산자</Label>
                        <Select
                          value={policyForm.operator}
                          onValueChange={(value: "AND" | "OR") => setPolicyForm({ ...policyForm, operator: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OR">OR (키워드 중 하나라도 일치)</SelectItem>
                            <SelectItem value="AND">AND (모든 키워드가 일치해야 함)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsPolicyDialogOpen(false)}>
                          취소
                        </Button>
                        <Button onClick={editingPolicy ? handleUpdatePolicy : handleAddPolicy}>
                          {editingPolicy ? "업데이트" : "추가"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="정책 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>정책 이름</TableHead>
                    <TableHead>키워드</TableHead>
                    <TableHead>연산자</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-medium">{policy.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {policy.keywords.slice(0, 3).map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {policy.keywords.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{policy.keywords.length - 3}개 더
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={policy.operator === "AND" ? "default" : "secondary"}>{policy.operator}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={policy.status === "active" ? "default" : "secondary"}>
                          {policy.status === "active" ? "활성" : "비활성"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditPolicy(policy)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeletePolicy(policy.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
