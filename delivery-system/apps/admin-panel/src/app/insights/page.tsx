import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowUpRight,
  ArrowDownRight,
  Package,
  TrendingUp,
  Users,
  Building,
  AlertTriangle,
  Lock,
} from "lucide-react";

export default function InsightsPage() {
  // Mock data for the dashboard
  const adminData = {
    systemStats: {
      activeCompanies: 124,
      totalUsers: 1842,
      activeWorkflows: 56,
      systemUptime: 99.98,
    },
    companyIssues: [
      {
        id: 1,
        company: "Acme Logistics",
        issue: "API Integration Error",
        severity: "high",
        time: "2h ago",
      },
      {
        id: 2,
        company: "Global Shipping Co",
        issue: "Payment Processing Delay",
        severity: "medium",
        time: "5h ago",
      },
      {
        id: 3,
        company: "FastTrack Delivery",
        issue: "Workflow Timeout",
        severity: "low",
        time: "1d ago",
      },
    ],
    performance: [
      { metric: "System Response Time", value: 230, unit: "ms", change: -5.2 },
      { metric: "API Success Rate", value: 99.7, unit: "%", change: 0.3 },
      { metric: "Database Query Time", value: 45, unit: "ms", change: -12.5 },
    ],
  };

  const managerData = {
    metrics: {
      deliveries: { value: 1248, change: 12.5 },
      revenue: { value: 28750, change: 8.3 },
      customers: { value: 342, change: 5.7 },
      issues: { value: 8, change: -24.6 },
    },
    trends: [
      { period: "Mon", value: 65 },
      { period: "Tue", value: 72 },
      { period: "Wed", value: 68 },
      { period: "Thu", value: 78 },
      { period: "Fri", value: 85 },
      { period: "Sat", value: 82 },
      { period: "Sun", value: 91 },
    ],
    hotProducts: [
      { id: 1, name: "Express Delivery", usage: 78 },
      { id: 2, name: "International Shipping", usage: 65 },
      { id: 3, name: "Same-day Delivery", usage: 92 },
      { id: 4, name: "Warehouse Management", usage: 54 },
    ],
  };

  // Mock user role - in a real app, this would come from authentication
  const userRole = "admin"; // or 'manager'

  return (
    <div className="bg-background p-6 md:p-8 w-full min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Insights Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          {userRole === "admin"
            ? "System-wide metrics and performance analytics"
            : "Operational metrics and business performance"}
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {userRole === "admin" ? (
            <>
              {/* Admin View */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Companies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-muted-foreground mr-2" />
                      <div className="text-2xl font-bold">
                        {adminData.systemStats.activeCompanies}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-muted-foreground mr-2" />
                      <div className="text-2xl font-bold">
                        {adminData.systemStats.totalUsers}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Workflows
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-muted-foreground mr-2" />
                      <div className="text-2xl font-bold">
                        {adminData.systemStats.activeWorkflows}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      System Uptime
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="text-2xl font-bold">
                        {adminData.systemStats.systemUptime}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Issues</CardTitle>
                    <CardDescription>
                      Recent issues reported by companies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {adminData.companyIssues.map((issue) => (
                        <div
                          key={issue.id}
                          className="flex items-center justify-between border-b pb-3"
                        >
                          <div>
                            <div className="font-medium">{issue.company}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {issue.issue}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Badge
                              variant={
                                issue.severity === "high"
                                  ? "destructive"
                                  : issue.severity === "medium"
                                    ? "default"
                                    : "outline"
                              }
                            >
                              {issue.severity}
                            </Badge>
                            <span className="text-xs text-muted-foreground ml-2">
                              {issue.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Performance</CardTitle>
                    <CardDescription>
                      Key performance indicators
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {adminData.performance.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {item.metric}
                            </span>
                            <div className="flex items-center">
                              <span className="font-bold mr-2">
                                {item.value}
                                {item.unit}
                              </span>
                              <span
                                className={`text-xs flex items-center ${item.change > 0 ? "text-green-500" : "text-red-500"}`}
                              >
                                {item.change > 0 ? (
                                  <ArrowUpRight className="h-3 w-3 mr-1" />
                                ) : (
                                  <ArrowDownRight className="h-3 w-3 mr-1" />
                                )}
                                {Math.abs(item.change)}%
                              </span>
                            </div>
                          </div>
                          <Progress
                            value={
                              item.metric === "API Success Rate"
                                ? item.value
                                : 100 - item.value / 3
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <>
              {/* Manager View */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Deliveries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {managerData.metrics.deliveries.value}
                      </div>
                      <div
                        className={`text-xs flex items-center ${managerData.metrics.deliveries.change > 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {managerData.metrics.deliveries.change > 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(managerData.metrics.deliveries.change)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        ${managerData.metrics.revenue.value}
                      </div>
                      <div
                        className={`text-xs flex items-center ${managerData.metrics.revenue.change > 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {managerData.metrics.revenue.change > 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(managerData.metrics.revenue.change)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Customers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {managerData.metrics.customers.value}
                      </div>
                      <div
                        className={`text-xs flex items-center ${managerData.metrics.customers.change > 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {managerData.metrics.customers.change > 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(managerData.metrics.customers.change)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Open Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {managerData.metrics.issues.value}
                      </div>
                      <div
                        className={`text-xs flex items-center ${managerData.metrics.issues.change < 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {managerData.metrics.issues.change > 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(managerData.metrics.issues.change)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Trends</CardTitle>
                    <CardDescription>
                      Delivery performance over the past week
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end h-40 gap-2 pt-4">
                      {managerData.trends.map((day, i) => (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center"
                        >
                          <div
                            className="bg-primary/90 w-full rounded-sm"
                            style={{ height: `${day.value}%` }}
                          />
                          <span className="text-xs mt-2">{day.period}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Hot Products</CardTitle>
                    <CardDescription>
                      Most used products this month
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {managerData.hotProducts.map((product) => (
                        <div key={product.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {product.name}
                              </span>
                            </div>
                            <span className="text-sm">{product.usage}%</span>
                          </div>
                          <Progress value={product.usage} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Premium Preview Section - Blurred */}
          <Card className="border-dashed border-2 relative overflow-hidden">
            <div className="absolute inset-0 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="bg-background/80 p-4 rounded-lg flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <span className="font-medium">Premium Feature Preview</span>
              </div>
            </div>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Unlock deeper insights with our premium plan
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-40 rounded-md bg-muted"></div>
              <div className="h-40 rounded-md bg-muted"></div>
              <div className="h-40 rounded-md bg-muted"></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Metrics</CardTitle>
              <CardDescription>
                Comprehensive data analysis and reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Detailed metrics content will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Generated reports and scheduled exports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Reports content will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
