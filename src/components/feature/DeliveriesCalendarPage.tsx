"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { apiClient, ApiResponse } from "@/lib/api/api-client";

type DeliveryDate = {
  date: string;
  count: number;
};

type DeliveriesCalendarPageProps = {
  companyId: number;
  shopId: number;
};

export default function DeliveriesCalendarPage({
  companyId,
  shopId,
}: DeliveriesCalendarPageProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState<string>(
    formatYearMonth(new Date()),
  );
  const [deliveryDates, setDeliveryDates] = useState<DeliveryDate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Format date to YYYY-MM
  function formatYearMonth(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  // Convert string dates to Date objects
  const highlightedDates = deliveryDates.map((item) => new Date(item.date));

  useEffect(() => {
    fetchDeliveryDates();
  }, [currentMonth, companyId, shopId]);

  async function fetchDeliveryDates() {
    setIsLoading(true);
    try {
      // Using apiClient to ensure auth token is attached
      const response = await apiClient.get<{ payload: DeliveryDate[] }>(
        `/company/${companyId}/deliveries/calendar?shopId=${shopId}&month=${currentMonth}`
      );
      setDeliveryDates(response.payload || []);
    } catch (error) {
      console.error("Error fetching delivery dates:", error);
      setDeliveryDates([]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleDateClick(date: Date) {
    const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
    router.push(`/shops/${shopId}/deliveries/${formattedDate}/versions`);
  }

  function goToPreviousMonth() {
    const date = new Date(currentMonth + "-01");
    date.setMonth(date.getMonth() - 1);
    setCurrentMonth(formatYearMonth(date));
  }

  function goToNextMonth() {
    const date = new Date(currentMonth + "-01");
    date.setMonth(date.getMonth() + 1);
    setCurrentMonth(formatYearMonth(date));
  }

  function goToCurrentMonth() {
    setCurrentMonth(formatYearMonth(new Date()));
  }

  function getDeliveryCount(date: Date): number {
    const formattedDate = date.toISOString().split("T")[0];
    const deliveryDate = deliveryDates.find((d) => d.date === formattedDate);
    return deliveryDate?.count || 0;
  }

  // Custom day renderer for the calendar
  function renderDay(day: Date) {
    const count = getDeliveryCount(day);
    const isHighlighted = highlightedDates.some(
      (d) => d.toISOString().split("T")[0] === day.toISOString().split("T")[0],
    );

    if (!isHighlighted) return undefined;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "relative h-8 w-8 p-0 font-normal",
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                "focus:bg-primary focus:text-primary-foreground",
              )}
              onClick={() => handleDateClick(day)}
            >
              {day.getDate()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {count} {count === 1 ? "snapshot" : "snapshots"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Delivery Calendar</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={goToPreviousMonth}>
            Previous
          </Button>
          <Button variant="outline" onClick={goToCurrentMonth}>
            Today
          </Button>
          <Button variant="outline" onClick={goToNextMonth}>
            Next
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : deliveryDates.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 text-center">
          <p className="text-lg font-medium">No deliveries found</p>
          <p className="text-muted-foreground">
            There are no delivery snapshots for this month
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-background">
          <div className="overflow-x-auto">
            <Calendar
              className="w-full sm:w-auto"
              mode="single"
              selected={undefined}
              onSelect={(date) => date && handleDateClick(date)}
              disabled={(date) =>
                !highlightedDates.some(
                  (d) =>
                    d.toISOString().split("T")[0] ===
                    date.toISOString().split("T")[0],
                )
              }
              modifiers={{
                highlighted: highlightedDates,
              }}
              modifiersStyles={{
                highlighted: {
                  fontWeight: "bold",
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                  borderRadius: "4px",
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
