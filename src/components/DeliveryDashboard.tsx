"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ChevronRight } from "lucide-react";
import ProductListDetails from "./ProductListDetails";
import apiClient, { ApiResponse } from "@/lib/api-client";

interface Shop {
  id: number;
  shopName: string;
  locationId: number;
  companyId: number;
}

interface DeliveryInfo {
  id: number;
  productListId: number;
  productListIdNumber: string;
  companyId: number;
  versionId: number;
  shopId: number;
  date: string;
  status?: "pending" | "in_progress" | "completed";
  productCount?: number;
}

interface DeliveryDashboardProps {
  companyId?: number;
  username?: string;
}

export function DeliveryDashboard({
  companyId = 1,
  username = "Delivery User",
}: DeliveryDashboardProps) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [deliveries, setDeliveries] = useState<Record<number, DeliveryInfo>>(
    {},
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [datesWithDeliveries, setDatesWithDeliveries] = useState<Date[]>([]);

  // Fetch shops for the company
  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get<ApiResponse<Shop[]>>(`company/${companyId}/shop`);
        // Extract shops from payload and ensure it's always an array
        const shopsData = data?.payload || [];
        setShops(Array.isArray(shopsData) ? shopsData : []);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch shops. Please try again later.");
        setLoading(false);
      }
    };

    fetchShops();
  }, [companyId]);

  // Fetch all deliveries for the month and mark dates with deliveries
  useEffect(() => {
    const fetchMonthDeliveries = async () => {
      try {
        setLoading(true);

        // Fetch deliveries for each shop for the selected date
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const deliveryData: Record<number, DeliveryInfo> = {};

        // Format the month for the API call (YYYY-MM format)
        const formattedMonth = format(selectedDate, "yyyy-MM");

        // Fetch delivery dates for the month from the API
        const calendarData = await apiClient.get<ApiResponse<string[]>>(
          `company/${companyId}/productList/calendar?&month=${formattedMonth}`
        );

        // Parse the date strings from the API response and convert to Date objects
        const deliveryDates = calendarData?.payload?.map(dateStr => new Date(dateStr)) || [];

        // Set the dates with deliveries
        setDatesWithDeliveries(deliveryDates);

        // Track if any requests succeeded
        let anyRequestSucceeded = false;

        // Fetch deliveries for the selected date (for the main view)
        for (const shop of shops) {
          try {
            const data = await apiClient.get<DeliveryInfo>(
              `company/${companyId}/productList/latest?shopId=${shop.id}&date=${formattedDate}`
            );

            if (data) {
              deliveryData[shop.id] = data;
              anyRequestSucceeded = true;
            }
          } catch (shopErr) {
            // Ignore 404 errors (no deliveries for that day) and continue
            console.log(`No deliveries found for shop ${shop.shopName} (ID: ${shop.id}) on ${formattedDate}`);
          }
        }

        setDeliveries(deliveryData);
        setLoading(false);

        // Clear the error if we reached here, regardless of whether there were any deliveries.
        // Do NOT treat "no deliveries" as an error!
        setError(null);
      } catch (err) {
        // This catch block will only be triggered for errors in the calendar API call
        // or other errors outside the shop loop
        setError("Failed to fetch deliveries. Please try again later.");
        setLoading(false);
      }
    };

    if (shops.length > 0) {
      fetchMonthDeliveries();
    }
  }, [companyId, selectedDate, shops]);

  const handleShopSelect = (shop: Shop) => {
    setSelectedShop(shop);
  };

  const handleBackToDashboard = () => {
    setSelectedShop(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (selectedShop) {
    return (
      <div className="bg-background w-full p-6">
        <Button
          variant="outline"
          onClick={handleBackToDashboard}
          className="mb-4"
        >
          ← Back to Dashboard
        </Button>
        <ProductListDetails
          companyId={companyId}
          shopId={selectedShop.id}
          shopName={selectedShop.shopName}
          productListId={deliveries[selectedShop.id]?.productListId || 0}
          date={format(selectedDate, "yyyy-MM-dd")}
        />
      </div>
    );
  }

  return (
    <div className="bg-background w-full p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Welcome, {username}!</h1>
          <p className="text-muted-foreground">
            Here are your deliveries for today. Select a shop to view details.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <h2 className="text-xl font-semibold">
            Deliveries for {format(selectedDate, "MMMM d, yyyy")}
          </h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Select Date
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="overflow-x-auto">
                <Calendar
                  className="w-full sm:w-auto"
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  modifiers={{ hasDelivery: datesWithDeliveries }}
                  modifiersClassNames={{
                    hasDelivery: "bg-green-100 text-green-800 font-bold"
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(shops) && 
              // Sort shops: those with deliveries first, then those without
              [...shops].sort((a, b) => {
                const hasDeliveryA = !!deliveries[a.id];
                const hasDeliveryB = !!deliveries[b.id];
                if (hasDeliveryA && !hasDeliveryB) return -1;
                if (!hasDeliveryA && hasDeliveryB) return 1;
                return 0;
              }).map((shop) => {
                const delivery = deliveries[shop.id];
                const hasDelivery = !!delivery;

                return (
                  <Card key={shop.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle>{shop.shopName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Location ID: {shop.locationId}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col space-y-4">
                        {hasDelivery ? (
                          <>
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                              <span className="text-sm">Products:</span>
                              <span className="font-medium">
                                {delivery.productCount}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                              <span className="text-sm">Status:</span>
                              {/*<span*/}
                              {/*  className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(delivery.status)}`}*/}
                              {/*>*/}
                              {/*  {delivery.status.replace("_", " ").toUpperCase()}*/}
                              {/*</span>*/}
                            </div>
                            <Button
                              onClick={() => handleShopSelect(shop)}
                              className="w-full mt-2 flex items-center justify-between"
                              variant="default"
                            >
                              View Details
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
