"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Leaf,
  Bell,
  Settings,
  LogOut,
  DollarSign,
  Plus,
  User,
  Eye,
  TrendingUp,
  ShoppingBag,
} from "lucide-react"
import Link from "next/link"

interface Plant {
  plantId: string
  plantName: string
  plantImage: string
  totalSold: number
}

interface Benefits {
  monthlyBenefit: number
  totalBenefit: number
}

export default function DashboardPage() {
  const [benefits, setBenefits] = useState<Benefits>({ monthlyBenefit: 0, totalBenefit: 0 })
  const [topPlants, setTopPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const handleLogout = () => {
    localStorage.clear()
    router.push("/login")
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      handleLogout()
      return
    }

    try {
      const user = JSON.parse(userData)

      // Basic user data validation
      if (!user.email) {
        handleLogout()
        return
      }

      setLoading(true)

      Promise.all([fetchBenefits(token), fetchTopPlants(token)])
        .catch(() => {
          // On error, log out user to force login
          handleLogout()
        })
        .finally(() => setLoading(false))
    } catch {
      handleLogout()
    }
  }, [router])

  const fetchBenefits = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_BACKEND_URL}/api/sales/benefit`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setBenefits({
          monthlyBenefit: Number(data.monthlyBenefit || 0),
          totalBenefit: Number(data.totalBenefit || 0),
        })
      } else if (response.status === 401) {
        handleLogout()
      }
    } catch (error) {
      console.error("Error fetching benefits:", error)
    }
  }

  const fetchTopPlants = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_BACKEND_URL}/api/plants`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data: Plant[] = await response.json()
        const sorted = data.sort((a, b) => b.totalSold - a.totalSold)
        setTopPlants(sorted.slice(0, 3))
      } else if (response.status === 401) {
        handleLogout()
      }
    } catch (error) {
      console.error("Error fetching top plants:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <Leaf className="h-12 w-12 text-green-600 animate-pulse mx-auto mb-4" />
          <p className="text-green-600">Loading your nursery...</p>
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
              <div className="flex items-center space-x-2">
                <Leaf className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-green-800">NurseryNest</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-green-600">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-green-600">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Welcome back! 🌱</h1>
          <p className="text-green-600">Manage your nursery business efficiently</p>
        </div>

        {/* Benefit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Last Month Benefit</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">৳{benefits.monthlyBenefit.toFixed(2)}</div>
              <p className="text-xs text-green-600">Previous month earnings</p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Total Benefit</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">৳{benefits.totalBenefit.toFixed(2)}</div>
              <p className="text-xs text-green-600">All time earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Quick Actions</CardTitle>
              <CardDescription className="text-green-600">Manage your nursery operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="w-full justify-start border-green-200 text-green-700 bg-transparent hover:bg-green-50"
                >
                  <User className="h-4 w-4 mr-2" /> View Profile
                </Button>
              </Link>

              <Link href="/plant-management">
                <Button
                  variant="outline"
                  className="w-full justify-start border-green-200 text-green-700 bg-transparent hover:bg-green-50"
                >
                  <Eye className="h-4 w-4 mr-2" /> See Plants
                </Button>
              </Link>

              <Link href="/plant-management/add">
                <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" /> Add Plants
                </Button>
              </Link>

              <Link href="/sales">
                <Button
                  variant="outline"
                  className="w-full justify-start border-green-200 text-green-700 bg-transparent hover:bg-green-50"
                >
                  <TrendingUp className="h-4 w-4 mr-2" /> See Benefits
                </Button>
              </Link>

              <Link href="/sale-form">
                <Button
                  variant="outline"
                  className="w-full justify-start border-green-200 text-green-700 bg-transparent hover:bg-green-50"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" /> Sale Plants
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Popular Trees */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Popular Trees</CardTitle>
              <CardDescription className="text-green-600">Top 3 most sold trees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topPlants.map((plant) => (
                <div key={plant.plantId} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <img src={plant.plantImage} alt={plant.plantName} className="w-12 h-12 object-cover rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-green-800">{plant.plantName}</p>
                    <p className="text-xs text-green-600">Sold: {plant.totalSold}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
