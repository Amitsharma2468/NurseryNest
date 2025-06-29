"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Leaf,
  Users,
  ShoppingCart,
  Bell,
  Settings,
  LogOut,
  TreePine,
  Flower,
  Sprout,
  Package,
  DollarSign,
  BarChart3,
  Plus,
} from "lucide-react"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    setUser(JSON.parse(userData))
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
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
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Admin Panel
              </Badge>
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
          <p className="text-green-600">Here's what's happening in your nursery today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Total Plants</CardTitle>
              <TreePine className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">1,234</div>
              <p className="text-xs text-green-600">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Active Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">89</div>
              <p className="text-xs text-green-600">+5% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">$12,345</div>
              <p className="text-xs text-green-600">+8% from last week</p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Customers</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">456</div>
              <p className="text-xs text-green-600">+15% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Quick Actions</CardTitle>
              <CardDescription className="text-green-600">Common tasks for your nursery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add New Plant
              </Button>
              <Button variant="outline" className="w-full justify-start border-green-200 text-green-700 bg-transparent">
                <Package className="h-4 w-4 mr-2" />
                Manage Inventory
              </Button>
              <Button variant="outline" className="w-full justify-start border-green-200 text-green-700 bg-transparent">
                <Users className="h-4 w-4 mr-2" />
                View Customers
              </Button>
              <Button variant="outline" className="w-full justify-start border-green-200 text-green-700 bg-transparent">
                <BarChart3 className="h-4 w-4 mr-2" />
                Sales Report
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Recent Activity</CardTitle>
              <CardDescription className="text-green-600">Latest updates in your nursery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Sprout className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">New order received</p>
                  <p className="text-xs text-green-600">5 minutes ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Inventory updated</p>
                  <p className="text-xs text-green-600">1 hour ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">New customer registered</p>
                  <p className="text-xs text-green-600">2 hours ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plant Care Reminders */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Care Reminders</CardTitle>
              <CardDescription className="text-green-600">Plants that need attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <Flower className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Roses</p>
                    <p className="text-xs text-green-600">Need watering</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                  Today
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <TreePine className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Pine Trees</p>
                    <p className="text-xs text-green-600">Fertilizer due</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Tomorrow
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Sales Overview</CardTitle>
              <CardDescription className="text-green-600">Monthly sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-green-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-green-400 mx-auto mb-2" />
                  <p className="text-green-600">Sales chart will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Popular Plants</CardTitle>
              <CardDescription className="text-green-600">Best selling plants this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Flower className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-green-800">Roses</span>
                  </div>
                  <span className="text-green-600">234 sold</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <TreePine className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-green-800">Succulents</span>
                  </div>
                  <span className="text-green-600">189 sold</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Sprout className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-green-800">Herbs</span>
                  </div>
                  <span className="text-green-600">156 sold</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
