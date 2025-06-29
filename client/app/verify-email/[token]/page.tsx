"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Leaf, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function VerifyEmailPage({ params }: { params: { token: string } }) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_BACKEND_URL}/api/auth/verify-email/${params.token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        const data = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage("Email verified successfully! You can now log in to your account.")
        } else {
          setStatus("error")
          setMessage(data.message || "Email verification failed. The link may be expired or invalid.")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Network error. Please try again later.")
      }
    }

    if (params.token) {
      verifyEmail()
    }
  }, [params.token])

  const handleResendVerification = async () => {
    // You might want to collect email for resending
    router.push("/resend-verification")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">NurseryNest</span>
          </Link>
          <h1 className="text-3xl font-bold text-green-800">Email Verification</h1>
        </div>

        <Card className="border-green-200 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-green-800">
              {status === "loading" && "Verifying Email..."}
              {status === "success" && "Verification Successful!"}
              {status === "error" && "Verification Failed"}
            </CardTitle>
            <CardDescription className="text-center text-green-600">
              {status === "loading" && "Please wait while we verify your email address"}
              {status === "success" && "Your email has been successfully verified"}
              {status === "error" && "There was an issue verifying your email"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {status === "loading" && (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 text-green-600 animate-spin" />
                <p className="text-green-600">Verifying your email address...</p>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">{message}</AlertDescription>
                </Alert>
                <div className="space-y-3">
                  <Button onClick={() => router.push("/login")} className="w-full bg-green-600 hover:bg-green-700">
                    Continue to Login
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/")}
                    className="w-full border-green-200 text-green-700"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-600">{message}</AlertDescription>
                </Alert>
                <div className="space-y-3">
                  <Button onClick={handleResendVerification} className="w-full bg-green-600 hover:bg-green-700">
                    Resend Verification Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/login")}
                    className="w-full border-green-200 text-green-700"
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
