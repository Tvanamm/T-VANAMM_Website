
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Package, DollarSign, ShoppingCart, Eye, Target, Clock } from 'lucide-react';

interface AnalyticsDashboardProps {
  analytics: {
    websiteVisits: number;
    totalInventory: number;
    supplyOrders: number;
    activeFranchises: number;
    conversionRate: number;
    bounceRate: number;
    avgSessionDuration: number;
    formSubmissions: number;
    contactFormFills: number;
    newsletterSignups: number;
    franchiseInquiries: number;
  };
}

const OwnerAnalyticsDashboard = ({ analytics }: AnalyticsDashboardProps) => {
  const revenueData = [
    { month: 'Jan', revenue: 45000, orders: 120, profit: 15000 },
    { month: 'Feb', revenue: 52000, orders: 140, profit: 18000 },
    { month: 'Mar', revenue: 48000, orders: 130, profit: 16000 },
    { month: 'Apr', revenue: 61000, orders: 165, profit: 22000 },
    { month: 'May', revenue: 58000, orders: 155, profit: 20000 },
    { month: 'Jun', revenue: 67000, orders: 180, profit: 25000 }
  ];

  const franchisePerformance = [
    { name: 'Mumbai Central', revenue: 45000, orders: 120, rating: 4.8 },
    { name: 'Delhi NCR', revenue: 38000, orders: 98, rating: 4.6 },
    { name: 'Bangalore Tech', revenue: 42000, orders: 115, rating: 4.7 },
    { name: 'Chennai Marina', revenue: 35000, orders: 89, rating: 4.5 },
    { name: 'Pune Station', revenue: 40000, orders: 105, rating: 4.6 }
  ];

  const trafficSources = [
    { name: 'Direct', value: 40, color: '#10b981' },
    { name: 'Search', value: 30, color: '#3b82f6' },
    { name: 'Social', value: 20, color: '#f59e0b' },
    { name: 'Referral', value: 10, color: '#ef4444' }
  ];

  const weeklyVisits = [
    { day: 'Mon', visits: 1200, conversions: 45 },
    { day: 'Tue', visits: 1100, conversions: 38 },
    { day: 'Wed', visits: 1300, conversions: 52 },
    { day: 'Thu', visits: 1250, conversions: 48 },
    { day: 'Fri', visits: 1400, conversions: 55 },
    { day: 'Sat', visits: 1600, conversions: 68 },
    { day: 'Sun', visits: 1350, conversions: 58 }
  ];

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Revenue</p>
                <p className="text-2xl font-bold">₹3,31,000</p>
                <p className="text-sm text-blue-100">+12% from last month</p>
              </div>
              <DollarSign className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100">Website Visits</p>
                <p className="text-2xl font-bold">{analytics.websiteVisits.toLocaleString()}</p>
                <p className="text-sm text-emerald-100">+8% from last week</p>
              </div>
              <Eye className="h-12 w-12 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Conversion Rate</p>
                <p className="text-2xl font-bold">{analytics.conversionRate}%</p>
                <p className="text-sm text-purple-100">+2.1% improvement</p>
              </div>
              <Target className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Avg. Session</p>
                <p className="text-2xl font-bold">{Math.round(analytics.avgSessionDuration)}s</p>
                <p className="text-sm text-orange-100">+15s from last week</p>
              </div>
              <Clock className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Profit Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Profit Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' || name === 'profit' ? `₹${value.toLocaleString()}` : value, 
                  name
                ]} />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="profit" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trafficSources}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {trafficSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Visits & Conversions */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Visits & Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyVisits}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visits" fill="#10b981" />
                <Bar dataKey="conversions" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Franchise Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Franchises</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={franchisePerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Form Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Submissions</span>
                <span className="font-semibold">{analytics.formSubmissions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Contact Forms</span>
                <span className="font-semibold">{analytics.contactFormFills}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Franchise Inquiries</span>
                <span className="font-semibold">{analytics.franchiseInquiries}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Newsletter Signups</span>
                <span className="font-semibold">{analytics.newsletterSignups}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Business Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Franchises</span>
                <span className="font-semibold">{analytics.activeFranchises}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Inventory</span>
                <span className="font-semibold">{analytics.totalInventory}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Supply Orders</span>
                <span className="font-semibold">{analytics.supplyOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Bounce Rate</span>
                <span className="font-semibold">{analytics.bounceRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Growth Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue Growth</span>
                <span className="font-semibold text-green-600">+12%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">User Growth</span>
                <span className="font-semibold text-green-600">+8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Franchise Growth</span>
                <span className="font-semibold text-green-600">+15%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Engagement</span>
                <span className="font-semibold text-blue-600">Excellent</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerAnalyticsDashboard;
