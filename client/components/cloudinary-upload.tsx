"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Loader2, AlertCircle, CheckCircle } from "lucide-react"

interface CloudinaryUploadProps {
  onUploadSuccess: (url: string) => void
  currentImage?: string
  className?: string
}

export function CloudinaryUpload({ onUploadSuccess, currentImage, className }: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB")
      return
    }

    setUploading(true)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", process.env.NEXT_PUBLIC_IMG_UPLOAD_PRESET!)
      formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      )

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()

      if (data.secure_url) {
        setSuccess("Image uploaded successfully!")
        onUploadSuccess(data.secure_url)
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000)
      } else {
        throw new Error("No URL returned from upload")
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError("Failed to upload image. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={className}>
      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {/* Current Image Preview */}
        {currentImage && (
          <div className="text-center">
            <img
              src={currentImage || "/placeholder.svg"}
              alt="Current profile"
              className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-green-200"
            />
            <p className="text-sm text-green-600 mt-2">Current profile picture</p>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex flex-col items-center space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button
              type="button"
              disabled={uploading}
              className="bg-green-600 hover:bg-green-700 cursor-pointer"
              asChild
            >
              <span>
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Image
                  </>
                )}
              </span>
            </Button>
          </label>
          <p className="text-xs text-green-600 text-center">
            Supported formats: JPG, PNG, GIF
            <br />
            Maximum size: 5MB
          </p>
        </div>
      </div>
    </div>
  )
}
