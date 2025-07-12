"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { CloudinaryUpload } from "@/components/cloudinary-upload"
import { Leaf, User, Mail, MapPin, Edit, Save, X, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react"

interface UserProfile {
  _id: string
  email: string
  name?: string
  profilePicture?: string
  address?: string
  isVerified: boolean
  createdAt: string
}

export default function ProfileSimplePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    profilePicture: "",
    address: "",
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchProfile()
  }, [router])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_BACKEND_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setFormData({
          name: userData.name || "",
          profilePicture: userData.profilePicture || "",
          address: userData.address || "",
        })
      } else {
        setError("Failed to fetch profile")
      }
    } catch {
      setError("Network error while fetching profile")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleImageUpload = (imageUrl: string) => {
    setFormData({
      ...formData,
      profilePicture: imageUrl,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_BACKEND_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        setEditing(false)
        setSuccess("Profile updated successfully!")
        setTimeout(() => setSuccess(""), 5000)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to update profile")
      }
    } catch {
      setError("Network error while updating profile")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      profilePicture: user?.profilePicture || "",
      address: user?.address || "",
    })
    setEditing(false)
    setError("")
    setSuccess("")
  }

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return email.charAt(0).toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <Leaf className="h-12 w-12 text-green-600 animate-pulse mx-auto mb-4" />
          <p className="text-green-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Failed to load profile</p>
          <Link href="/dashboard">
            <Button className="mt-4 bg-green-600 hover:bg-green-700">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-white border-b border-green-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-green-600" />
                <h1 className="text-2xl font-bold text-green-800">My Profile</h1>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {!editing ? (
                <Button onClick={() => setEditing(true)} className="bg-green-600 hover:bg-green-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleCancel} variant="outline" className="border-gray-300 bg-transparent">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        {/* Alerts */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        {/* Profile Card */}
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Profile Picture */}
              <div className="text-center">
                <Avatar className="h-24 w-24 border-4 border-green-200 mx-auto">
                  <AvatarImage src={editing ? formData.profilePicture : user.profilePicture} alt="Profile" />
                  <AvatarFallback className="bg-green-100 text-green-700 text-xl">
                    {getInitials(user.name || "", user.email)}
                  </AvatarFallback>
                </Avatar>

                {/* Show upload section when editing */}
                {editing && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-green-700 mb-2">Update Profile Picture</p>
                    <CloudinaryUpload onUploadSuccess={handleImageUpload} currentImage={formData.profilePicture} />
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center md:text-left">
                <CardTitle className="text-2xl text-green-800 mb-2">{user.name || "No name set"}</CardTitle>
                <CardDescription className="text-green-600 mb-4">
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                </CardDescription>
                <div className="flex items-center justify-center md:justify-start space-x-4">
                  <div
                    className={`px-3 py-1 rounded-full text-sm ${
                      user.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {user.isVerified ? "✓ Verified" : "⚠ Unverified"}
                  </div>
                  <span className="text-sm text-green-600">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <Separator className="bg-green-200" />

          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Profile Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">Profile Information</h3>

                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-green-700 font-medium">
                    Full Name
                  </Label>
                  {editing ? (
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="border-green-200 focus:border-green-500"
                    />
                  ) : (
                    <div className="p-3 bg-green-50 rounded-md border border-green-200">
                      <span className="text-green-800">{user.name || "Not provided"}</span>
                    </div>
                  )}
                </div>

                {/* Email Field (Read-only) */}
                <div className="space-y-2">
                  <Label className="text-green-700 font-medium">Email Address</Label>
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    <span className="text-gray-600">{user.email}</span>
                    <span className="text-xs text-gray-500 ml-2">(Cannot be changed)</span>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">Contact Information</h3>

                {/* Address Field */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-green-700 font-medium">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Address
                  </Label>
                  {editing ? (
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                      className="border-green-200 focus:border-green-500 min-h-[100px]"
                    />
                  ) : (
                    <div className="p-3 bg-green-50 rounded-md border border-green-200 min-h-[100px]">
                      <span className="text-green-800 whitespace-pre-wrap">
                        {user.address || "No address provided"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Account Stats */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-3">Account Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600">Account Status:</span>
                      <span className="text-green-800 font-medium">
                        {user.isVerified ? "Active" : "Pending Verification"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Member Since:</span>
                      <span className="text-green-800 font-medium">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Profile Completion:</span>
                      <span className="text-green-800 font-medium">
                        {Math.round(
                          (((user.name ? 1 : 0) + (user.address ? 1 : 0) + (user.profilePicture ? 1 : 0)) / 3) * 100,
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
