"use client";

import type {BadgeProps} from "../ui/badge";
import {Badge} from "../ui/badge";
import React, {useEffect, useState} from "react";
import {Button} from "../ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle,} from "../ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "../ui/table";
import {Input} from "../ui/input";
import {Textarea} from "../ui/textarea";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from "../ui/dialog";
import {Plus, Trash2} from "lucide-react";
import {Alert, AlertDescription} from "../ui/alert";
import {Spinner} from "../ui/spinner";
import { apiClient, ApiResponse } from "@/lib/api/api-client";
import {
  ProductListDetailsProps,
  ProductListItemModel,
  ProductListVersionModel,
  StepName,
  VersionModel
} from "@/types/delivery";

const ProductListDetails = ({
  shopId = 1,
  shopName = "Sample Shop",
  productListId = 0,
  date = "2023-05-15",
  companyId = 1,
}: ProductListDetailsProps) => {
  // We'll determine the productListDetailsId from the API
  const [items, setItems] = useState<ProductListItemModel[]>([]);
  const [detailsId, setDetailsId] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [overrides, setOverrides] = useState<Record<number, number>>({});
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for initial version
  const [initialItems, setInitialItems] = useState<ProductListItemModel[]>([]);
  const [initialVersionId, setInitialVersionId] = useState<number | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(false);

  // Add state for versions and currentStepName
  const [versions, setVersions] = useState<ProductListVersionModel[]>([]);
  const [currentStepName, setCurrentStepName] = useState<StepName>("INITIAL_REQUEST");

  // Define checkpoint steps in order
  const checkpointOrder: StepName[] = [
    "INITIAL_REQUEST","ON_BOARDING","OFF_LOADING","FINAL"
  ];

  function getStepButtonLabel(stepName: string, editing: boolean) {
    switch (stepName.toLowerCase()) {
      case "initial_request":
      case "requested":
        return editing ? "Complete Onboarding" : "Start Onboarding";
      case "on_boarding":
      case "onboarding":
        return editing ? "Complete Offloading" : "Start Offloading";
      case "off_loading":
      case "offloading":
        return editing ? "Finalize Delivery" : "Finish Delivery";
      case "final":
      case "delivered":
        return "";
      default:
        return editing ? "Complete Step" : "Proceed";
    }
  }

  // Get the current index in the checkpoint order
  const currentIndex = checkpointOrder.indexOf(currentStepName);

  // Keep existing state for backward compatibility
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<{
    name: string;
    quantity: number;
  }>({ name: "", quantity: 0 });

  // No longer needed as we'll determine detailsId from the API

  // Fetch all versions and identify the initial version and current version
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoadingInitial(true);
        setLoading(true);
        const response = await apiClient.get<ApiResponse<VersionModel[]>>(
          `company/${companyId}/productList?shopId=${shopId}&date=${date}`
        );

        if (response && response.payload && Array.isArray(response.payload)) {
          // Find the version with the earliest workflow step order (i.e., first step)
          const initialVersion = response.payload.reduce((prev, curr) => {
            if (!prev) return curr;
            return (curr.stepOrder ?? curr.workflowStepOrder ?? 99) < (prev.stepOrder ?? prev.workflowStepOrder ?? 99) ? curr : prev;
          }, null);

          // Find the latest version to use as the current version
          const latestVersion = response.payload[response.payload.length - 1];

          // Set the detailsId from the latest version
          if (latestVersion) {
            setDetailsId(latestVersion.productListDetailsId);

            // Find the version with matching productListDetailsId to set currentStepName
            const current = response.payload.find(v =>
              v.productListDetailsId === latestVersion.productListDetailsId
            ) || latestVersion;
            setCurrentStepName(current.deliveryStepName);
          }

          if (initialVersion) {
            setInitialVersionId(initialVersion.versionId);
            // Fetch the initial version details
            const initialItemsResponse = await apiClient.get<ApiResponse<ProductListItemModel[]>>(
              `company/${companyId}/productListItems/${initialVersion.productListDetailsId}`
            );
            if (initialItemsResponse && initialItemsResponse.payload) {
              setInitialItems(Array.isArray(initialItemsResponse.payload) ? initialItemsResponse.payload : []);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch versions:", error);
        setError("Failed to fetch versions");
      } finally {
        setLoadingInitial(false);
        setLoading(false);
      }
    };

    fetchVersions();
  }, [companyId, shopId, date]);

  // Fetch product list details only when detailsId is available
  useEffect(() => {
    if (detailsId === null) return;

    setLoading(true);
    apiClient.get<ApiResponse<ProductListItemModel[]>>(`company/${companyId}/productListItems/${detailsId}`)
      .then(data => {
        // Extract items from payload
        const itemsData = data?.payload || [];
        setItems(Array.isArray(itemsData) ? itemsData : []);
        // Clear overrides when loading new items
        setOverrides({});
        setLoading(false);

        // After loading items, fetch versions data
        return apiClient.get<ApiResponse<ProductListVersionModel[]>>(`company/${companyId}/productList?shopId=${shopId}&date=${date}`);
      })
      .then(data => {
        if (data && data.payload) {
          const versionsData = Array.isArray(data.payload) ? data.payload : [];
          setVersions(versionsData);

          // Derive currentStepName from the last element's deliveryStepName
          // or find the version whose productListDetailsId === detailsId
          if (versionsData.length > 0) {
            const currentVersion = versionsData.find(v => v.productListDetailsId === detailsId) || versionsData[versionsData.length - 1];
            setCurrentStepName(currentVersion.deliveryStepName);
          }
        }
      })
      .catch(error => {
        setError("Failed to load product list or versions");
        setLoading(false);
      });
  }, [companyId, detailsId]);

  const handleStartOnboarding = () => {
    setEditing(true);
  };

  // We no longer need the buildStepsArray function since we're rendering the steps directly

  const handleAdvanceStep = async () => {
    setLoading(true);
    setError(null);
    try {
      const body = {
        description,
        itemUpdates: Object.entries(overrides)
            .filter(([id, qty]) => typeof qty === 'number' && !isNaN(qty))
            .map(([id, qty]) => ({ id: +id, quantity: qty }))
      };
      const resp = await apiClient.post<ApiResponse<ProductListItemModel[]>>(
          `/company/${companyId}/productList/${detailsId}/onboard`,
          body
      );
      setItems(resp.payload || []);
      // Handle detailsId, version refresh, etc.
      setOverrides({});
      setDescription("");
      setEditing(false);
    } catch (e: any) {
      setError(e.message || "Failed to advance step");
    } finally {
      setLoading(false);
    }
  };


  // We no longer need these functions as we're using overrides state
  // and handleCompleteOnboarding for saving changes

  const handleRemoveProduct = (productId: number) => {
    // Find the product to get its name for the description
    const item = items.find(p => p.id === productId);
    const itemName = item ? (item.itemName || item.name || "item") : "item";

    apiClient.delete<ApiResponse<ProductListItemModel[]>>(`company/${companyId}/productList/${detailsId}/productItems/${productId}?deliveryStep=REMOVE_STOCK&description=Removing ${encodeURIComponent(itemName)} from product list`)
      .then(data => {
        // Extract the updated product list from the response
        const updatedItems = data?.payload || [];
        if (Array.isArray(updatedItems)) {
          setItems(updatedItems);

          // Check if the first item has a new productListDetailsId
          if (updatedItems.length > 0 && updatedItems[0].productListDetailsId) {
            setDetailsId(updatedItems[0].productListDetailsId);
          }
        } else {
          // Fallback to manual update if response doesn't contain expected data
          setItems(items.filter(p => p.id !== productId));
        }
      })
      .catch(error => {
        // Handle error
        const errorMsg = error?.message || "Failed to remove product";
        setError(errorMsg);
        console.error("Error removing product:", error);
      });
  };

  const handleAddProduct = () => {
    if (!newProduct.name) {
      setError("Product name is required");
      return;
    }

    if (newProduct.quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    apiClient.put<ApiResponse<ProductListItemModel[]>>(`company/${companyId}/productList/${detailsId}/productItems`, {
        ...newProduct,
        deliveryStep: "ADD_STOCK",
        description: `Adding new product: ${newProduct.name}`
      })
      .then(data => {
        // Extract the updated product list from the response
        const updatedItems = data?.payload || [];
        if (Array.isArray(updatedItems) && updatedItems.length > 0) {
          // Update the entire product list with the response
          setItems(updatedItems);

          // Check if the first item has a new productListDetailsId
          if (updatedItems[0] && updatedItems[0].productListDetailsId) {
            setDetailsId(updatedItems[0].productListDetailsId);
          }

          setNewProduct({ name: "", quantity: 0 });
          setIsAddProductDialogOpen(false);
        }
        // else {
        //   // Fallback: Extract single product from payload
        //   const itemData = data?.payload || {};
        //   if (itemData.id) {
        //     setItems([...items, itemData]);
        //
        //     // Check if the item has a new productListDetailsId
        //     if (itemData.productListDetailsId) {
        //       setDetailsId(itemData.productListDetailsId);
        //     }
        //
        //     setNewProduct({ name: "", quantity: 0 });
        //     setIsAddProductDialogOpen(false);
        //   } else {
        //     setError("Failed to add product: Invalid response data");
        //   }
        // }
      })
      .catch(error => setError("Failed to add product"));
  };

  const getStatusBadge = () => {
    if (editing) {
      return <Badge variant="secondary">Onboarding in Progress</Badge>;
    } else {
      return <Badge variant="outline">Ready for Onboarding</Badge>;
    }
  };

  return (
    <div className="bg-background p-6 rounded-lg shadow-sm">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">{shopName}</CardTitle>
              <p className="text-muted-foreground mt-1">
                Product List ID: {detailsId}
              </p>
              <p className="text-muted-foreground">Date: {date}</p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="flex justify-center my-8">
              <Spinner />
            </div>
          )}

          {loadingInitial && !loading && (
            <Alert className="mb-4">
              <AlertDescription>Loading initial version data...</AlertDescription>
            </Alert>
          )}

          {/* Render step tags */}
          <div className="w-full overflow-x-auto mb-6">
            <div className="flex flex-wrap gap-2 mb-2">
              {checkpointOrder.map((step, i) => {
                // Determine the variant based on the step's position
                let variant: BadgeProps["variant"] = "outline";

                if (i < currentIndex)       variant = "secondary";
                else if (i === currentIndex) variant = "default";

                return (
                    <Badge key={step} variant={variant}>
                      {step}
                    </Badge>
                );
              })}
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-medium">Product List Comparison</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-primary mr-2"></div>
                <span className="text-sm">Current Version</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-muted/50 mr-2"></div>
                <span className="text-sm">Initial Version (Removed Items)</span>
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="w-[150px]">Initial Quantity</TableHead>
                  <TableHead className="w-[150px]">Current Quantity</TableHead>
                  {editing && (
                    <TableHead className="w-[150px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* First, render items that are in the current version */}
                {items.map((item, index) => {
                  // Find matching item in initialItems
                  const initialItem = initialItems.find(
                    (i) => i.id === item.id ||
                           (i.itemName && item.itemName && i.itemName === item.itemName) ||
                           (i.name && item.name && i.name === item.name)
                  );

                  return (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.itemName || item.name || "Unknown Product"}</TableCell>
                      <TableCell>
                        {initialItem ? (
                          <span>{initialItem.quantity}{initialItem.unit ? ` ${initialItem.unit}` : ''}</span>
                        ) : (
                          <span>-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editing ? (
                          <Input
                            type="number"
                            value={overrides[item.id] ?? item.quantity}
                            onChange={(e) => setOverrides(prev => ({
                              ...prev,
                              [item.id]: parseFloat(e.target.value)
                            }))}
                            className="w-20"
                          />
                        ) : (
                          <span>{item.quantity}{item.unit ? ` ${item.unit}` : ''}</span>
                        )}
                      </TableCell>
                      {editing && (
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveProduct(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}

                {/* Then, render items that are only in the initial version */}
                {initialItems
                  .filter(initialItem =>
                    !items.some(item =>
                      item.id === initialItem.id ||
                      (item.itemName && initialItem.itemName && item.itemName === initialItem.itemName) ||
                      (item.name && initialItem.name && item.name === initialItem.name)
                    )
                  )
                  .map(initialItem => (
                    <TableRow key={`initial-${initialItem.id}`} className="bg-muted/20">
                      <TableCell>{initialItem.itemName || initialItem.name || "Unknown Product"}</TableCell>
                      <TableCell>
                        <span>{initialItem.quantity}{initialItem.unit ? ` ${initialItem.unit}` : ''}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">Removed</span>
                      </TableCell>
                      {editing && (
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {/* Add button to restore item if needed */}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {/* Adjust action button based on currentStepName */}
          {currentStepName === "FINAL" ? (
            <Badge variant="outline" className="self-end">Delivered</Badge>
          ) : !editing ? (
            <Button
              onClick={handleStartOnboarding}
              className="self-end"
            >
              {getStepButtonLabel(currentStepName, editing)}
            </Button>
          ) : (
            <>
              <Textarea
                placeholder="Notes for this onboarding step"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between w-full">
                {/* Only show Add Product button during ON_BOARDING and OFF_LOADING */}
                {(currentStepName === "ON_BOARDING" || currentStepName === "OFF_LOADING") && (
                  <Button
                    variant="outline"
                    onClick={() => setIsAddProductDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                  </Button>
                )}
                <Button
                  onClick={handleAdvanceStep}
                  disabled={loading}
                  className={currentStepName === "ON_BOARDING" || currentStepName === "OFF_LOADING" ? "" : "ml-auto"}
                >
                  {getStepButtonLabel(currentStepName, editing)}
                </Button>
              </div>
            </>
          )}
        </CardFooter>
      </Card>

      <Dialog
        open={isAddProductDialogOpen}
        onOpenChange={setIsAddProductDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Product Name
              </label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="quantity" className="text-right">
                Quantity
              </label>
              <Input
                id="quantity"
                type="number"
                value={newProduct.quantity}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    quantity: Number(e.target.value),
                  })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddProductDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddProduct}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductListDetails;
