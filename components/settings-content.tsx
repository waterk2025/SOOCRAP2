"use client"

import { useState, useEffect } from "react"
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
import { Plus, Edit, Trash2, Search, RefreshCw, AlertCircle } from "lucide-react"

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

  const [policies, setPolicies] = useState<MonitoringPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // 백엔드에서 정책 데이터 가져오기
  const fetchPolicies = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🚀 정책 데이터 조회 시작...')
      
      const response = await fetch('http://localhost:3001/api/policies')
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API 응답 오류:', errorText)
        throw new Error(`API 호출 실패: ${response.status} - ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('📊 정책 데이터:', data)
      
      if (data.success && data.data) {
        setPolicies(data.data)
        console.log('✅ 정책 데이터 가져오기 성공:', data.data.length, '개')
      } else {
        throw new Error('정책 데이터를 가져올 수 없습니다.')
      }
    } catch (error) {
      console.error('❌ 정책 데이터 조회 실패:', error)
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 정책 데이터 가져오기
  useEffect(() => {
    fetchPolicies()
  }, [])

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

  const handleAddPolicy = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: policyForm.name,
          keywords: policyForm.keywords.split(",").map((k) => k.trim()).filter(k => k),
          operator: policyForm.operator,
          status: "active"
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '정책 생성에 실패했습니다.')
      }

      const data = await response.json()
      console.log('✅ 정책 생성 성공:', data)

      // 정책 목록 새로고침
      await fetchPolicies()
      
      setPolicyForm({ name: "", keywords: "", operator: "OR" })
      setIsPolicyDialogOpen(false)
    } catch (error) {
      console.error('❌ 정책 생성 실패:', error)
      setError(error instanceof Error ? error.message : '정책 생성 중 오류가 발생했습니다.')
    }
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

  const handleUpdatePolicy = async () => {
    if (!editingPolicy) return

    try {
      const response = await fetch(`http://localhost:3001/api/policies/${editingPolicy.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: policyForm.name,
          keywords: policyForm.keywords.split(",").map((k) => k.trim()).filter(k => k),
          operator: policyForm.operator
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '정책 수정에 실패했습니다.')
      }

      const data = await response.json()
      console.log('✅ 정책 수정 성공:', data)

      // 정책 목록 새로고침
      await fetchPolicies()
      
      setEditingPolicy(null)
      setPolicyForm({ name: "", keywords: "", operator: "OR" })
      setIsPolicyDialogOpen(false)
    } catch (error) {
      console.error('❌ 정책 수정 실패:', error)
      setError(error instanceof Error ? error.message : '정책 수정 중 오류가 발생했습니다.')
    }
  }

  const handleDeletePolicy = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/policies/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '정책 삭제에 실패했습니다.')
      }

      const data = await response.json()
      console.log('✅ 정책 삭제 성공:', data)

      // 정책 목록 새로고침
      await fetchPolicies()
    } catch (error) {
      console.error('❌ 정책 삭제 실패:', error)
      setError(error instanceof Error ? error.message : '정책 삭제 중 오류가 발생했습니다.')
    }
  }

  // 정책 상태 토글
  const handleTogglePolicyStatus = async (policy: MonitoringPolicy) => {
    try {
      const response = await fetch(`http://localhost:3001/api/policies/${policy.id}/toggle`, {
        method: 'PATCH'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '정책 상태 변경에 실패했습니다.')
      }

      const data = await response.json()
      console.log('✅ 정책 상태 변경 성공:', data)

      // 정책 목록 새로고침
      await fetchPolicies()
    } catch (error) {
      console.error('❌ 정책 상태 변경 실패:', error)
      setError(error instanceof Error ? error.message : '정책 상태 변경 중 오류가 발생했습니다.')
    }
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

  // 에러 메시지 표시 및 자동 숨김
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">설정</h1>
          <p className="text-gray-600">수크랩 - 한국수자원공사 모니터링 대상과 정책을 관리하세요</p>
        </div>
        <Button onClick={fetchPolicies} variant="outline" size="sm" disabled={loading}>
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              로딩 중...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </>
          )}
        </Button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          <span>정책 데이터를 불러오는 중...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredPolicies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        등록된 모니터링 정책이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPolicies.map((policy) => (
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
                        <Badge 
                          variant={policy.status === "active" ? "default" : "secondary"}
                          className="cursor-pointer hover:opacity-80"
                          onClick={() => handleTogglePolicyStatus(policy)}
                        >
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
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
