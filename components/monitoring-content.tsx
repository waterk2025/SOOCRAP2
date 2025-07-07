"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ExternalLink, Eye } from "lucide-react"

const mentionsData = [
  {
    id: 1,
    content:
      "K-water에서 진행하는 스마트 워터 시티 사업이 정말 혁신적이네요. 우리나라 물 관리 기술이 세계 최고 수준인 것 같아요!",
    sentiment: "positive",
    source: "네이버 뉴스",
    author: "김수자",
    timestamp: "2024-01-15 14:30",
    url: "https://news.naver.com/example/123",
    keywords: ["스마트 워터 시티", "혁신", "물 관리"],
  },
  {
    id: 2,
    content:
      "이번 달 수도요금이 갑자기 올랐는데 한국수자원공사에서 명확한 설명을 해주셨으면 좋겠어요. 왜 인상되었는지 궁금합니다.",
    sentiment: "negative",
    source: "다음 카페",
    author: "시민123",
    timestamp: "2024-01-15 13:45",
    url: "https://cafe.daum.net/example/456",
    keywords: ["수도요금", "인상", "설명"],
  },
  {
    id: 3,
    content:
      "우리 지역 단수 공지를 미리 알려주셔서 물을 미리 받아둘 수 있었습니다. K-water 고객센터 응대도 친절했어요.",
    sentiment: "positive",
    source: "트위터",
    author: "@물사랑",
    timestamp: "2024-01-15 12:20",
    url: "https://twitter.com/example/789",
    keywords: ["단수 공지", "고객센터", "친절"],
  },
  {
    id: 4,
    content: "한국수자원공사의 댐 관리 시스템이 첨단화되고 있다는 뉴스를 봤습니다. 홍수 예방에 도움이 될 것 같네요.",
    sentiment: "neutral",
    source: "페이스북",
    author: "환경지킴이",
    timestamp: "2024-01-15 11:15",
    url: "https://facebook.com/example/abc",
    keywords: ["댐 관리", "첨단화", "홍수 예방"],
  },
  {
    id: 5,
    content: "수질 검사 결과가 예전보다 많이 좋아졌다고 하는데, 정말 체감이 됩니다. 수돗물 맛도 훨씬 깔끔해졌어요.",
    sentiment: "positive",
    source: "네이버 블로그",
    author: "건강한삶",
    timestamp: "2024-01-15 10:30",
    url: "https://blog.naver.com/example",
    keywords: ["수질 검사", "개선", "수돗물"],
  },
]

export default function MonitoringContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sentimentFilter, setSentimentFilter] = useState("all")
  const [filteredMentions, setFilteredMentions] = useState(mentionsData)

  const handleSearch = () => {
    let filtered = mentionsData

    if (searchTerm) {
      filtered = filtered.filter(
        (mention) =>
          mention.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mention.keywords.some((keyword) => keyword.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (sentimentFilter !== "all") {
      filtered = filtered.filter((mention) => mention.sentiment === sentimentFilter)
    }

    setFilteredMentions(filtered)
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "negative":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">모니터링</h1>
        <p className="text-gray-600">수크랩 - 한국수자원공사 관련 실시간 언급 피드</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="키워드나 내용으로 검색... (예: 수질, 요금, 단수)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="감성으로 필터링" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 감성</SelectItem>
                <SelectItem value="positive">긍정</SelectItem>
                <SelectItem value="neutral">중립</SelectItem>
                <SelectItem value="negative">부정</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>필터 적용</Button>
          </div>
        </CardContent>
      </Card>

      {/* Mentions Feed */}
      <Card>
        <CardHeader>
          <CardTitle>실시간 언급 피드</CardTitle>
          <CardDescription>{filteredMentions.length}개 언급 표시 중</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMentions.map((mention) => (
              <div key={mention.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{mention.author}</span>
                    <span className="text-gray-500 text-sm">•</span>
                    <span className="text-gray-500 text-sm">{mention.source}</span>
                    <span className="text-gray-500 text-sm">•</span>
                    <span className="text-gray-500 text-sm">{mention.timestamp}</span>
                  </div>
                  <Badge className={getSentimentColor(mention.sentiment)}>
                    {mention.sentiment === "positive" ? "긍정" : mention.sentiment === "negative" ? "부정" : "중립"}
                  </Badge>
                </div>

                <p className="text-gray-900 mb-3">{mention.content}</p>

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {mention.keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      미리보기
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={mention.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        원본 보기
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
