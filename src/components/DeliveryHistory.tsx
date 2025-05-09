"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DeliveryHistoryProps {
  companyId?: string;
  shopId?: string;
}

interface ProductListVersion {
  id: string;
  version: number;
  createdAt: string;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED";
  shopName: string;
}

interface ProductItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface VersionDiff {
  added: ProductItem[];
  removed: ProductItem[];
  modified: {
    before: ProductItem;
    after: ProductItem;
  }[];
}

export default function DeliveryHistory({
  companyId = "1",
  shopId,
}: DeliveryHistoryProps) {
  const [selectedTab, setSelectedTab] = useState<"history" | "compare">(
    "history",
  );
  const [selectedVersion, setSelectedVersion] =
    useState<ProductListVersion | null>(null);
  const [versionItems, setVersionItems] = useState<ProductItem[]>([]);
  const [compareVersion1, setCompareVersion1] = useState<string>("");
  const [compareVersion2, setCompareVersion2] = useState<string>("");
  const [versionDiff, setVersionDiff] = useState<VersionDiff | null>(null);

  // Mock data for demonstration
  const mockDeliveryHistory: ProductListVersion[] = [
    {
      id: "1",
      version: 1,
      createdAt: "2023-05-15T09:30:00",
      status: "COMPLETED",
      shopName: "Grocery Store A",
    },
    {
      id: "2",
      version: 2,
      createdAt: "2023-05-16T10:15:00",
      status: "COMPLETED",
      shopName: "Grocery Store A",
    },
    {
      id: "3",
      version: 3,
      createdAt: "2023-05-17T08:45:00",
      status: "COMPLETED",
      shopName: "Grocery Store A",
    },
    {
      id: "4",
      version: 1,
      createdAt: "2023-05-15T11:20:00",
      status: "COMPLETED",
      shopName: "Bakery B",
    },
    {
      id: "5",
      version: 2,
      createdAt: "2023-05-17T14:10:00",
      status: "IN_PROGRESS",
      shopName: "Bakery B",
    },
  ];

  const mockProductItems: Record<string, ProductItem[]> = {
    "1": [
      { id: "101", name: "Milk", quantity: 10, unit: "liters" },
      { id: "102", name: "Bread", quantity: 20, unit: "loaves" },
      { id: "103", name: "Eggs", quantity: 30, unit: "dozen" },
    ],
    "2": [
      { id: "101", name: "Milk", quantity: 15, unit: "liters" },
      { id: "102", name: "Bread", quantity: 20, unit: "loaves" },
      { id: "104", name: "Cheese", quantity: 5, unit: "kg" },
    ],
    "3": [
      { id: "101", name: "Milk", quantity: 15, unit: "liters" },
      { id: "102", name: "Bread", quantity: 25, unit: "loaves" },
      { id: "104", name: "Cheese", quantity: 8, unit: "kg" },
      { id: "105", name: "Yogurt", quantity: 12, unit: "cups" },
    ],
    "4": [
      { id: "201", name: "Flour", quantity: 50, unit: "kg" },
      { id: "202", name: "Sugar", quantity: 25, unit: "kg" },
      { id: "203", name: "Butter", quantity: 10, unit: "kg" },
    ],
    "5": [
      { id: "201", name: "Flour", quantity: 60, unit: "kg" },
      { id: "202", name: "Sugar", quantity: 30, unit: "kg" },
      { id: "203", name: "Butter", quantity: 15, unit: "kg" },
      { id: "204", name: "Yeast", quantity: 2, unit: "kg" },
    ],
  };

  // Mock function to fetch version items
  const fetchVersionItems = (versionId: string) => {
    // In a real app, this would be an API call
    return mockProductItems[versionId] || [];
  };

  // Mock function to compare versions
  const compareVersions = (
    version1Id: string,
    version2Id: string,
  ): VersionDiff => {
    const items1 = mockProductItems[version1Id] || [];
    const items2 = mockProductItems[version2Id] || [];

    const added: ProductItem[] = [];
    const removed: ProductItem[] = [];
    const modified: { before: ProductItem; after: ProductItem }[] = [];

    // Find added and modified items
    items2.forEach((item2) => {
      const item1 = items1.find((i) => i.id === item2.id);
      if (!item1) {
        added.push(item2);
      } else if (item1.quantity !== item2.quantity) {
        modified.push({ before: item1, after: item2 });
      }
    });

    // Find removed items
    items1.forEach((item1) => {
      const exists = items2.some((i) => i.id === item1.id);
      if (!exists) {
        removed.push(item1);
      }
    });

    return { added, removed, modified };
  };

  const handleVersionSelect = (version: ProductListVersion) => {
    setSelectedVersion(version);
    const items = fetchVersionItems(version.id);
    setVersionItems(items);
  };

  const handleCompare = () => {
    if (compareVersion1 && compareVersion2) {
      const diff = compareVersions(compareVersion1, compareVersion2);
      setVersionDiff(diff);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "DRAFT":
        return <Badge className="bg-gray-500">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
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
          <Tabs
            value={selectedTab}
            onValueChange={(value) =>
              setSelectedTab(value as "history" | "compare")
            }
          >
            <TabsList className="mb-4">
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="compare">Compare Versions</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Past Deliveries</h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {mockDeliveryHistory.map((version) => (
                      <div
                        key={version.id}
                        className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${selectedVersion?.id === version.id ? "bg-accent" : "hover:bg-muted"}`}
                        onClick={() => handleVersionSelect(version)}
                      >
                        <div>
                          <div className="font-medium">{version.shopName}</div>
                          <div className="text-sm text-muted-foreground">
                            Version {version.version} •{" "}
                            {formatDate(version.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center">
                          {getStatusBadge(version.status)}
                          <ChevronRightIcon className="h-5 w-5 ml-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 border rounded-lg p-4">
                  {selectedVersion ? (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-medium">
                            {selectedVersion.shopName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Version {selectedVersion.version} •{" "}
                            {formatDate(selectedVersion.createdAt)}
                          </p>
                        </div>
                        {getStatusBadge(selectedVersion.status)}
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {versionItems.length > 0 ? (
                            versionItems.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.unit}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={3}
                                className="text-center py-4"
                              >
                                No products in this delivery
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <ChevronLeftIcon className="h-12 w-12 mb-2" />
                      <p>Select a delivery from the list to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="compare" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Version
                  </label>
                  <Select
                    value={compareVersion1}
                    onValueChange={setCompareVersion1}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDeliveryHistory.map((version) => (
                        <SelectItem key={version.id} value={version.id}>
                          {version.shopName} - Version {version.version} (
                          {formatDate(version.createdAt)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Second Version
                  </label>
                  <Select
                    value={compareVersion2}
                    onValueChange={setCompareVersion2}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDeliveryHistory.map((version) => (
                        <SelectItem key={version.id} value={version.id}>
                          {version.shopName} - Version {version.version} (
                          {formatDate(version.createdAt)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleCompare}
                  disabled={!compareVersion1 || !compareVersion2}
                >
                  Compare Versions
                </Button>
              </div>

              {versionDiff && (
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Added Products</h3>
                    <Separator className="mb-4" />
                    {versionDiff.added.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {versionDiff.added.map((item) => (
                            <TableRow
                              key={item.id}
                              className="bg-green-50 dark:bg-green-900/20"
                            >
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{item.unit}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground">
                        No products were added
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Removed Products
                    </h3>
                    <Separator className="mb-4" />
                    {versionDiff.removed.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {versionDiff.removed.map((item) => (
                            <TableRow
                              key={item.id}
                              className="bg-red-50 dark:bg-red-900/20"
                            >
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{item.unit}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground">
                        No products were removed
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Modified Products
                    </h3>
                    <Separator className="mb-4" />
                    {versionDiff.modified.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Before</TableHead>
                            <TableHead>After</TableHead>
                            <TableHead>Unit</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {versionDiff.modified.map((item) => (
                            <TableRow
                              key={item.before.id}
                              className="bg-yellow-50 dark:bg-yellow-900/20"
                            >
                              <TableCell>{item.before.name}</TableCell>
                              <TableCell>{item.before.quantity}</TableCell>
                              <TableCell>{item.after.quantity}</TableCell>
                              <TableCell>{item.before.unit}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground">
                        No products were modified
                      </p>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
