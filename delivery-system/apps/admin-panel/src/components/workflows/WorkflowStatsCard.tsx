"use client";

import { WorkflowStats } from "@/types/workflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStatsCardProps {
  stats: WorkflowStats | null;
  className?: string;
}

export default function WorkflowStatsCard({
  stats,
  className,
}: WorkflowStatsCardProps) {
  if (!stats) {
    return (
      <Card className={cn("bg-white", className)}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>No performance data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Performance Overview */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Avg Completion</span>
              </div>
              <div className="text-2xl font-bold">
                {stats.avgCompletionTime} min
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Success Rate</span>
              </div>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <Progress value={stats.successRate} className="mt-2" />
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Bottlenecks</span>
              </div>
              <div className="text-2xl font-bold">
                {stats.bottlenecks.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottleneck Detection */}
      {stats.bottlenecks.length > 0 && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Bottleneck Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.bottlenecks.map((bottleneck, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <div>
                      <div className="font-medium">{bottleneck.stepName}</div>
                      <div className="text-sm text-muted-foreground">
                        Average delay: {bottleneck.avgDelay} minutes
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-amber-300 text-amber-700"
                  >
                    High Priority
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* A/B Testing Preview (Blurred) */}
      <Card className="bg-white border-dashed border-2 relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="bg-background/80 p-4 rounded-lg flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <span className="font-medium">Premium Feature Preview</span>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            A/B Testing Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-medium mb-2">Workflow A (Current)</div>
              <div className="text-2xl font-bold">94.7%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="font-medium mb-2">Workflow B (Test)</div>
              <div className="text-2xl font-bold">96.2%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground">
              Performance Comparison Chart
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
