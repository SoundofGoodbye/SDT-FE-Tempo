"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Lock,
  Search,
  FileText,
  DollarSign,
  Package,
} from "lucide-react";

// Mock chart components
const LineChart = ({ data, className }: { data?: any; className?: string }) => (
  <div
    className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 ${className}`}
  >
    <div className="h-64 flex items-end justify-between gap-2">
      {[65, 72, 68, 78, 85, 82, 91, 88, 95, 92, 98, 105, 102, 108, 115].map(
        (height, i) => (
          <div
            key={i}
            className="bg-blue-500 rounded-sm flex-1 transition-all hover:bg-blue-600"
            style={{ height: `${height}%` }}
          />
        ),
      )}
    </div>
    <div className="mt-4 text-sm text-muted-foreground text-center">
      Revenue trend over last 30 days
    </div>
  </div>
);

const PieChart = ({ data, className }: { data?: any; className?: string }) => (
  <div
    className={`bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 ${className}`}
  >
    <div className="h-64 flex items-center justify-center">
      <div className="relative w-48 h-48">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500"></div>
        <div className="absolute inset-4 rounded-full bg-white"></div>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
          Click to slice
        </div>
      </div>
    </div>
    <div className="mt-4 text-sm text-muted-foreground text-center">
      Revenue by shop location
    </div>
  </div>
);

const HeatmapChart = ({ className }: { className?: string }) => (
  <div
    className={`bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 ${className}`}
  >
    <div className="space-y-2">
      <div className="text-sm font-medium mb-4">Revenue Heatmap</div>
      <div className="grid grid-cols-7 gap-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
          <div key={i} className="text-xs text-center font-medium p-1">
            {day}
          </div>
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className={`h-8 rounded-sm ${
              Math.random() > 0.7
                ? "bg-green-600"
                : Math.random() > 0.4
                  ? "bg-green-400"
                  : Math.random() > 0.2
                    ? "bg-green-200"
                    : "bg-gray-100"
            }`}
          />
        ))}
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        Darker = Higher Revenue
      </div>
    </div>
  </div>
);

const MultiLineChart = ({ className }: { className?: string }) => (
  <div
    className={`bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 ${className}`}
  >
    <div className="h-64 relative">
      <svg className="w-full h-full" viewBox="0 0 400 200">
        {/* Downtown line */}
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          points="0,150 50,140 100,130 150,120 200,110 250,100 300,90 350,80 400,70"
        />
        {/* Mall line */}
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          points="0,160 50,155 100,145 150,140 200,135 250,125 300,120 350,115 400,110"
        />
        {/* Airport line */}
        <polyline
          fill="none"
          stroke="#f59e0b"
          strokeWidth="3"
          points="0,170 50,165 100,160 150,155 200,150 250,145 300,140 350,135 400,130"
        />
        {/* Station line */}
        <polyline
          fill="none"
          stroke="#ef4444"
          strokeWidth="3"
          points="0,180 50,175 100,170 150,165 200,160 250,155 300,150 350,145 400,140"
        />
      </svg>
    </div>
    <div className="flex justify-center gap-6 mt-4 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span>Downtown</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span>Mall</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <span>Airport</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <span>Station</span>
      </div>
    </div>
  </div>
);

export default function AnalyticsPage() {
  // Mock data
  const shopData = [
    {
      shop: "Downtown",
      revenue: "$45,238",
      orders: 1247,
      accuracy: "98.2%",
      avgTime: "22 min",
      trend: 1,
    },
    {
      shop: "Mall",
      revenue: "$38,450",
      orders: 1023,
      accuracy: "95.4%",
      avgTime: "25 min",
      trend: 8,
    },
    {
      shop: "Airport",
      revenue: "$32,100",
      orders: 987,
      accuracy: "91.2%",
      avgTime: "28 min",
      trend: -3,
    },
    {
      shop: "Station",
      revenue: "$28,900",
      orders: 876,
      accuracy: "88.5%",
      avgTime: "31 min",
      trend: -5,
    },
  ];

  const exportReports = [
    {
      title: "Daily Report",
      description: "Complete daily operations summary",
      format: "PDF, Excel",
      fields: "Revenue, Orders, Performance",
      frequency: "Daily at 6 AM",
      icon: FileText,
    },
    {
      title: "Inventory Report",
      description: "Stock levels and product analytics",
      format: "CSV, JSON",
      fields: "Stock, Products, Alerts",
      frequency: "Weekly on Monday",
      icon: Package,
    },
    {
      title: "Finance Export",
      description: "Financial data for accounting",
      format: "Excel, QuickBooks",
      fields: "Revenue, Expenses, Profit",
      frequency: "Monthly on 1st",
      icon: DollarSign,
    },
  ];

  return (
    <div className="bg-background p-6 md:p-8 w-full min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive analytics and reporting for your logistics operations
        </p>
      </div>

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="comparison">Shop Comparison</TabsTrigger>
          <TabsTrigger value="export">Export Center</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Revenue Analytics</h2>
              <p className="text-muted-foreground">
                Track revenue performance over time
              </p>
            </div>
            <Select defaultValue="30d">
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Interactive Line Chart</CardTitle>
                <CardDescription>
                  Revenue trends over the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Shop</CardTitle>
                <CardDescription>Click segments for details</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Heatmap</CardTitle>
                <CardDescription>Daily revenue patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <HeatmapChart />
              </CardContent>
            </Card>
          </div>

          {/* Premium Preview Section */}
          <Card className="border-dashed border-2 relative overflow-hidden">
            <div className="absolute inset-0 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="bg-background/80 p-4 rounded-lg flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <span className="font-medium">Premium Feature Preview</span>
                <Button size="sm" className="ml-2">
                  Unlock Premium
                </Button>
              </div>
            </div>
            <CardHeader>
              <CardTitle>Predictive Insights</CardTitle>
              <CardDescription>
                AI-powered forecasting and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">
                    Next Week Forecast: $28,450 (+5%)
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Based on historical trends
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">
                    Recommended Actions: Stock Product A (+20% demand exp.)
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Inventory optimization suggestion
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <div>
                  <div className="font-medium">
                    Risk Alert: Downtown shop underperforming trend
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Performance monitoring alert
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                Shop Performance Comparison
              </h2>
              <p className="text-muted-foreground">
                Compare performance across all locations
              </p>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="revenue">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                  <SelectItem value="accuracy">Accuracy</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="30d">
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7d</SelectItem>
                  <SelectItem value="30d">30d</SelectItem>
                  <SelectItem value="90d">90d</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Comparative Analysis</CardTitle>
              <CardDescription>Multi-shop performance trends</CardDescription>
            </CardHeader>
            <CardContent>
              <MultiLineChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Matrix</CardTitle>
              <CardDescription>
                Detailed shop comparison metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shop</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Avg Time</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shopData.map((shop) => (
                    <TableRow key={shop.shop}>
                      <TableCell className="font-medium">{shop.shop}</TableCell>
                      <TableCell>{shop.revenue}</TableCell>
                      <TableCell>{shop.orders}</TableCell>
                      <TableCell>{shop.accuracy}</TableCell>
                      <TableCell>{shop.avgTime}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {shop.trend > 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                          )}
                          <span
                            className={
                              shop.trend > 0 ? "text-green-500" : "text-red-500"
                            }
                          >
                            {Math.abs(shop.trend)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gap Analysis</CardTitle>
                <CardDescription>
                  Performance gaps between locations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium mb-2">Biggest Gaps:</div>
                  <ul className="space-y-2 text-sm">
                    <li>• Station vs Downtown</li>
                    <li>• $16,350 revenue gap</li>
                    <li>• Airport accuracy -7%</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Improvement Opportunities</CardTitle>
                <CardDescription>Actionable recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <ul className="space-y-2 text-sm">
                    <li>• Airport: Train staff</li>
                    <li>• Station: Check stock</li>
                    <li>• Mall: Reduce wait</li>
                    <li>• All: Update workflow</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Export Reports</h2>
            <p className="text-muted-foreground mt-2">
              Download and schedule automated reports
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exportReports.map((report, index) => {
              const IconComponent = report.icon;
              return (
                <Card key={index} className="bg-white">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {report.title}
                        </CardTitle>
                        <CardDescription>{report.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Format:</span>{" "}
                        {report.format}
                      </div>
                      <div>
                        <span className="font-medium">Fields:</span>{" "}
                        {report.fields}
                      </div>
                      <div>
                        <span className="font-medium">Frequency:</span>{" "}
                        {report.frequency}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline">
                        Schedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
              <CardDescription>
                Recent downloads and scheduled exports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        Daily Report - Jan 8, 2024
                      </div>
                      <div className="text-sm text-muted-foreground">
                        PDF • 2.4 MB
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">Completed</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        Inventory Report - Jan 1, 2024
                      </div>
                      <div className="text-sm text-muted-foreground">
                        CSV • 1.8 MB
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">Completed</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        Finance Export - Dec 31, 2023
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Excel • 3.2 MB
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">Completed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
