"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Icons } from "@/components/ui/icons";
import apiClient, { ApiResponse } from "@/lib/api-client";

interface DeliveryHistoryProps {
  companyId?: string;
}

interface HistoryRecord {
  date: string;
  shopId: string;
  versionCount: number;
  lastStepName: string;
}

export default function DeliveryHistory({
  companyId = "1",
}: DeliveryHistoryProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);


  // Fetch history data on mount
  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<ApiResponse<HistoryRecord[]>>(`company/${companyId}/productList/history`);

        setHistoryRecords(response.payload);
      } catch (error) {
        console.error("Failed to fetch history data:", error);
        setHistoryRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, [companyId]);

  // Format date to MMM D, YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-background w-full p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            Delivery History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : historyRecords.length === 0 ? (
            <p className="text-center py-8">No deliveries found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Shop ID</TableHead>
                    <TableHead>Versions</TableHead>
                    <TableHead>Last Step</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyRecords.map((record) => (
                    <TableRow key={record.date + record.shopId}>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>{record.shopId}</TableCell>
                      <TableCell>{record.versionCount}</TableCell>
                      <TableCell>{record.lastStepName}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => 
                              router.push(`/shops/${record.shopId}/deliveries/${record.date}/versions`)
                            }
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => 
                              router.push(`/shops/${record.shopId}/deliveries/${record.date}/compare`)
                            }
                          >
                            Compare
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
