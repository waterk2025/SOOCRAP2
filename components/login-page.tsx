"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // 웹메일 형식 검증
    if (!email.includes("@kwater.or.kr")) {
      alert("수자원공사 웹메일(@kwater.or.kr)을 입력해주세요.")
      setIsLoading(false)
      return
    }

    // Mock: 인증번호 발송
    setTimeout(() => {
      setIsCodeSent(true)
      setCountdown(300) // 5분 카운트다운
      setIsLoading(false)
      alert("인증번호가 웹메일로 발송되었습니다.")
    }, 1000)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Mock: 인증번호 검증 (실제로는 서버에서 검증)
    setTimeout(() => {
      if (verificationCode === "123456") {
        localStorage.setItem("isAuthenticated", "true")
        router.push("/dashboard")
      } else {
        alert("인증번호가 올바르지 않습니다.")
        setIsLoading(false)
      }
    }, 1000)
  }

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Droplets className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">다시 오신 것을 환영합니다</CardTitle>
          <CardDescription>계정에 로그인하여 계속하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isCodeSent ? handleVerifyCode : handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">수자원공사 웹메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="웹메일 ID@kwater.or.kr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isCodeSent}
                required
              />
            </div>

            {isCodeSent && (
              <div className="space-y-2">
                <Label htmlFor="code">인증번호</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="6자리 인증번호를 입력하세요"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  required
                />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    {countdown > 0
                      ? `${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, "0")} 후 만료`
                      : "인증번호가 만료되었습니다"}
                  </span>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => {
                      setIsCodeSent(false)
                      setVerificationCode("")
                      setCountdown(0)
                    }}
                  >
                    다시 발송
                  </Button>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (isCodeSent ? "인증 중..." : "발송 중...") : isCodeSent ? "로그인" : "인증번호 발송"}
            </Button>
          </form>

          <p className="text-sm text-gray-600 mt-4 text-center">
            {isCodeSent ? "웹메일로 발송된 6자리 인증번호를 입력해주세요" : "수자원공사 웹메일로 인증번호를 발송합니다"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
