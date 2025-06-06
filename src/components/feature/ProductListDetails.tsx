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
import { useDeliveryWorkflow } from "@/hooks/useDeliveryWorkflow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import {
  ProductListDetailsProps,
  ProductListItemModel,
  ProductItem
} from "@/types/delivery";
import {AutoComplete} from "@/components/ui/AutoComplete";

const ProductListDetails = ({
                              shopId = 1,
                              shopName = "Sample Shop",
                              productListId = 0,
                              date = "2023-05-15",
                              companyId = 1,
                            }: ProductListDetailsProps) => {
  const [items, setItems] = useState<ProductListItemModel[]>([]);
  const [detailsId, setDetailsId] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [overrides, setOverrides] = useState<Record<number, number>>({});
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for initial version items
  const [initialItems, setInitialItems] = useState<ProductListItemModel[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(false);

  const [productItemOptions, setProductItemOptions] = useState<{ id: number; name: string }[]>([]);
  const [productItemsLoaded, setProductItemsLoaded] = useState(false);

  // Add state to track units for items
  const [itemUnits, setItemUnits] = useState<Record<number, string>>({});

  const {
    workflowSteps,
    currentStep,
    nextStep,
    initialVersion,
    currentVersion,
    advanceStep,
    refetch,
    fetchProductItems,
    isFinalStep,
    productListDetailsNumber,
    loading: workflowLoading,
    error: workflowError
  } = useDeliveryWorkflow(companyId, shopId, date);

  // Keep existing state for backward compatibility
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<{
    id?: number;
    name: string;
    quantity: number;
    unit: string;
  }>({ name: "", quantity: 0, unit: "кг" }); // Default to "кг"

  const [addedItems, setAddedItems] = useState<{ id: number; quantity: number; unit: string }[]>([]);

  // Fetch initial version items
  useEffect(() => {
    if (!initialVersion?.productListDetailsId) return;

    setLoadingInitial(true);
    fetchProductItems(initialVersion.productListDetailsId)
        .then((productItems) => {
          // Convert ProductItem[] to ProductListItemModel[]
          const convertedItems: ProductListItemModel[] = productItems.map(item => ({
            id: parseInt(item.id),
            itemId: parseInt(item.id),
            itemName: item.productName,
            name: item.productName,
            quantity: item.qtyOrdered,
            unit: item.notes, // Using notes as unit for backward compatibility
            unitPrice: item.unitPrice,
            sellingPrice: item.sellingPrice,
            shopName: shopName,
            productListDetailsId: initialVersion.productListDetailsId
          }));
          setInitialItems(convertedItems);
        })
        .catch((e) => {
          console.error("Failed to fetch initial version items", e);
          setInitialItems([]);
        })
        .finally(() => {
          setLoadingInitial(false);
        });
  }, [initialVersion?.productListDetailsId, fetchProductItems, shopName]);

  // Fetch current version items
  useEffect(() => {
    if (!currentVersion?.productListDetailsId) return;

    setDetailsId(currentVersion.productListDetailsId);

    fetchProductItems(currentVersion.productListDetailsId)
        .then((productItems) => {
          // Convert ProductItem[] to ProductListItemModel[]
          const convertedItems: ProductListItemModel[] = productItems.map(item => ({
            id: parseInt(item.id),
            itemId: parseInt(item.id),
            itemName: item.productName,
            name: item.productName,
            quantity: item.qtyOrdered,
            unit: item.notes, // Using notes as unit for backward compatibility
            unitPrice: item.unitPrice,
            sellingPrice: item.sellingPrice,
            shopName: shopName,
            productListDetailsId: currentVersion.productListDetailsId
          }));
          setItems(convertedItems);

          // Initialize itemUnits with existing units
          const units: Record<number, string> = {};
          convertedItems.forEach(item => {
            if (item.unit) {
              units[item.id] = item.unit;
            }
          });
          setItemUnits(units);
        })
        .catch((e) => {
          console.error("Failed to fetch items for current version", e);
          setItems([]);
        });
  }, [currentVersion?.productListDetailsId, fetchProductItems, shopName]);

  const handleOpenAddDialog = () => {
    setIsAddProductDialogOpen(true);
    if (!productItemsLoaded) {
      apiClient.get<ApiResponse<{ id: number; itemName: string }[]>>(`/company/${companyId}/productItems`)
          .then(res => {
            const mappedOptions = (res.payload || []).map(p => ({ id: p.id, name: p.itemName }));
            setProductItemOptions(mappedOptions);
            setProductItemsLoaded(true);
          })
          .catch(e => console.error("Failed to load product items", e));
    }
  };

  const handleAdvance = async () => {
    setLoading(true);
    setError(null);
    try {
      const itemUpdates = [
        // Include all overrides (including quantity 0 for removals)
        ...Object.entries(overrides).map(([id, qty]) => ({
          id: +id,
          quantity: qty,
          unit: itemUnits[+id] || items.find(item => item.id === +id)?.unit || "кг"
        })),
        // Include newly added items (but filter out any that were also marked for removal)
        ...addedItems.filter(item => !overrides[item.id] || overrides[item.id] !== 0)
            .map(item => ({
              id: item.id,
              quantity: item.quantity,
              unit: item.unit
            }))
      ];

      await advanceStep(description, itemUpdates);

      // After successful advance, refresh the workflow data
      await refetch();

      // Clear local state
      setAddedItems([]);
      setEditing(false);
      setOverrides({});
      setDescription("");
      setItemUnits({});
    } catch (e: any) {
      setError(e.message || "Failed to advance step");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProduct = (productId: number) => {
    // Add to overrides with quantity 0 for removal
    setOverrides(prev => ({
      ...prev,
      [productId]: 0
    }));

    // Remove from visual display immediately
    setItems(prev => prev.filter(item => item.id !== productId));

    // Also remove from addedItems if it was a newly added item
    setAddedItems(prev => prev.filter(item => item.id !== productId));

    // Remove from itemUnits
    setItemUnits(prev => {
      const newUnits = { ...prev };
      delete newUnits[productId];
      return newUnits;
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

    if (!newProduct.id) {
      setError("Please select a valid product");
      return;
    }

    if (!newProduct.unit) {
      setError("Please select a unit");
      return;
    }

    setAddedItems(prev => [...prev, {
      id: newProduct.id!,
      quantity: newProduct.quantity,
      unit: newProduct.unit
    }]);

    setItems(prev => [
      ...prev,
      {
        id: newProduct.id!,
        name: newProduct.name,
        itemName: newProduct.name,
        quantity: newProduct.quantity,
        unit: newProduct.unit,
      } as ProductListItemModel,
    ]);

    // Store the unit for this item
    setItemUnits(prev => ({
      ...prev,
      [newProduct.id!]: newProduct.unit
    }));

    setNewProduct({ name: "", quantity: 0, unit: "кг" }); // Reset to default
    setIsAddProductDialogOpen(false);
  };

  const getStatusBadge = () => {
    if (editing) {
      return <Badge variant="secondary">Onboarding in Progress</Badge>;
    } else {
      return <Badge variant="outline">Ready for Onboarding</Badge>;
    }
  };

  // Calculate action labels using nextStep from hook
  const getNextActionLabel = () => {
    if (!nextStep) return '';

    let actionLabel = `Start ${nextStep.customName || nextStep.stepKey || ''}`;
    try {
      const meta = nextStep.metaJson ? JSON.parse(nextStep.metaJson) : {};
      actionLabel = meta.actionLabel || actionLabel;
    } catch {}

    return actionLabel;
  };

  const getCurrentActionLabel = () => {
    if (!currentStep) return '';

    let label = `Complete ${currentStep.customName || currentStep.stepKey || ''}`;
    try {
      const meta = currentStep.metaJson ? JSON.parse(currentStep.metaJson) : {};
      label = meta.actionLabel || label;
    } catch {}

    return label;
  };

  return (
      <div className="bg-background p-6 rounded-lg shadow-sm">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">{shopName}</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Product List ID: {productListDetailsNumber || detailsId}
                </p>
                <p className="text-muted-foreground">Date: {date}</p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge()}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {(error || workflowError) && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error || workflowError}</AlertDescription>
                </Alert>
            )}

            {(loading || workflowLoading) && (
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
                {workflowSteps.map((step) => {
                  const variant: BadgeProps["variant"] =
                      step.id === currentStep?.id ? "default" : "outline";
                  return (
                      <Badge key={step.id} variant={variant}>
                        {step.customName}
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
            {editing && (
                <div className="flex justify-end mt-4">
                  <Button onClick={handleOpenAddDialog} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4 mr-2" />
                    <span>Add Product</span>
                  </Button>
                </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {isFinalStep ? (
                <Badge variant="outline" className="self-end">Delivered</Badge>
            ) : !editing ? (
                <Button onClick={() => setEditing(true)} className="self-end">
                  {getNextActionLabel()}
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
                    <Button onClick={handleAdvance}>{getCurrentActionLabel()}</Button>
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
                <AutoComplete
                    options={productItemOptions}
                    placeholder="Type to search products..."
                    onSelect={(selected) =>
                        setNewProduct(prev => ({
                          ...prev,
                          name: selected.name,
                          id: selected.id
                        }))
                    }
                    maxResults={100}
                    minChars={1}
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
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="unit" className="text-right">
                  Unit
                </label>
                <Select
                    value={newProduct.unit}
                    onValueChange={(value) =>
                        setNewProduct({
                          ...newProduct,
                          unit: value,
                        })
                    }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="кг">кг</SelectItem>
                    <SelectItem value="бр">бр</SelectItem>
                  </SelectContent>
                </Select>
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