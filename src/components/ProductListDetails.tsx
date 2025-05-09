"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Plus, Minus, Edit, Trash2, Save, X } from "lucide-react";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";

interface Product {
  id: number;
  name?: string;
  itemName?: string;
  quantity: number;
  unit?: string;
  // Add any additional fields that might be in the API response
  [key: string]: any;
}

interface ProductListDetailsProps {
  shopId?: number;
  shopName?: string;
  productListId?: number;
  date?: string;
  companyId?: number;
}

const ProductListDetails = ({
  shopId = 1,
  shopName = "Sample Shop",
  productListId = 4,
  date = "2023-05-15",
  companyId = 1,
}: ProductListDetailsProps) => {
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: "Milk", quantity: 10 },
    { id: 2, name: "Bread", quantity: 20 },
    { id: 3, name: "Eggs", quantity: 30 },
    { id: 4, name: "Cheese", quantity: 5 },
    { id: 5, name: "Yogurt", quantity: 15 },
  ]);
  // Track the current productListId internally to handle updates from the backend
  const [currentProductListId, setCurrentProductListId] = useState<number>(productListId);
  const [deliveryStatus, setDeliveryStatus] = useState<
    "not_started" | "in_progress" | "completed"
  >("not_started");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<{
    name: string;
    quantity: number;
  }>({ name: "", quantity: 0 });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize currentProductListId with the prop value when it changes
  useEffect(() => {
    setCurrentProductListId(productListId);
  }, [productListId]);

  // Fetch product list details
  useEffect(() => {
    fetch(`http://localhost:8080/company/${companyId}/productListItems/${currentProductListId}/`)
      .then(response => response.json())
      .then(data => {
        // Extract products from payload
        const productsData = data?.payload || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
      })
      .catch(error => setError("Failed to load product list"));
  }, [companyId, currentProductListId, shopId]);

  const handleStartDelivery = () => {
    fetch(`http://localhost:8080/company/${companyId}/productList/${currentProductListId}/startDelivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deliveryStep: "INITIAL_REQUEST",
        description: "Initial product list request"
      })
    })
      .then(response => response.json())
      .then(data => {
        // Process response data if needed
        const responseData = data?.payload || {};
        // Check if the response contains a new product list ID
        if (responseData.productListDetailsId) {
          setCurrentProductListId(responseData.productListDetailsId);
        }
        setDeliveryStatus("in_progress");
        setSuccessMessage("Delivery started successfully");
        setTimeout(() => setSuccessMessage(null), 3000);
      })
      .catch(error => setError("Failed to start delivery"));
  };

  const handleCompleteDelivery = () => {
    fetch(`http://localhost:8080/company/${companyId}/productList/${currentProductListId}/completeDelivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deliveryStep: "OFF_LOADING",
        description: "Report missing or broken on delivery"
      })
    })
      .then(response => response.json())
      .then(data => {
        // Process response data if needed
        const responseData = data?.payload || {};
        // Check if the response contains a new product list ID
        if (responseData.productListDetailsId) {
          setCurrentProductListId(responseData.productListDetailsId);
        }
        setDeliveryStatus("completed");
        setSuccessMessage("Delivery completed successfully");
        setTimeout(() => setSuccessMessage(null), 3000);
      })
      .catch(error => setError("Failed to complete delivery"));
  };

  const handleEditQuantity = (product: Product) => {
    setEditingProduct(product);
    setNewQuantity(product.quantity);
  };

  const handleSaveQuantity = () => {
    if (editingProduct) {
      // Determine if we're adding or removing stock
      const isAddingStock = newQuantity > editingProduct.quantity;
      const deliveryStep = isAddingStock ? "ADD_STOCK" : "REMOVE_STOCK";
      const description = isAddingStock 
        ? `Increasing quantity for ${editingProduct.itemName || editingProduct.name || "item"}`
        : `Decreasing quantity for ${editingProduct.itemName || editingProduct.name || "item"}`;

      fetch(`http://localhost:8080/company/${companyId}/productListItems/${currentProductListId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          deliveryStep,
          description,
          payload: [
            {
              id: editingProduct.id,
              quantity: newQuantity
            }
          ]
        })
      })
        .then(response => response.json())
        .then(data => {
          // Extract the updated product list from the response
          const updatedProducts = data?.payload || [];
          if (Array.isArray(updatedProducts) && updatedProducts.length > 0) {
            setProducts(updatedProducts);

            // Check if the first product has a new productListDetailsId
            if (updatedProducts[0] && updatedProducts[0].productListDetailsId) {
              setCurrentProductListId(updatedProducts[0].productListDetailsId);
            }
          } else {
            // Fallback to manual update if response doesn't contain expected data
            setProducts(products.map(p => p.id === editingProduct.id ? { ...p, quantity: newQuantity } : p));
          }
          setEditingProduct(null);
          setSuccessMessage("Product quantity updated");
          setTimeout(() => setSuccessMessage(null), 3000);
        })
        .catch(error => setError("Failed to update product quantity"));
    }
  };

  const handleRemoveProduct = (productId: number) => {
    // Find the product to get its name for the description
    const product = products.find(p => p.id === productId);
    const productName = product ? (product.itemName || product.name || "item") : "item";

    fetch(`http://localhost:8080/company/${companyId}/productList/${currentProductListId}/productItems/${productId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deliveryStep: "REMOVE_STOCK",
        description: `Removing ${productName} from product list`
      })
    })
      .then(response => {
        if (response.ok) {
          // Try to parse the response to get the updated product list
          return response.json().then(data => {
            // Extract the updated product list from the response
            const updatedProducts = data?.payload || [];
            if (Array.isArray(updatedProducts)) {
              setProducts(updatedProducts);

              // Check if the first product has a new productListDetailsId
              if (updatedProducts.length > 0 && updatedProducts[0].productListDetailsId) {
                setCurrentProductListId(updatedProducts[0].productListDetailsId);
              }
            } else {
              // Fallback to manual update if response doesn't contain expected data
              setProducts(products.filter(p => p.id !== productId));
            }
            setSuccessMessage("Product removed successfully");
            setTimeout(() => setSuccessMessage(null), 3000);
          }).catch(() => {
            // If we can't parse the response, fall back to manual update
            setProducts(products.filter(p => p.id !== productId));
            setSuccessMessage("Product removed successfully");
            setTimeout(() => setSuccessMessage(null), 3000);
          });
        } else {
          // Try to parse the error response
          return response.json().then(data => {
            const errorMsg = data?.message || "Failed to remove product";
            setError(errorMsg);
          }).catch(() => {
            setError("Failed to remove product");
          });
        }
      })
      .catch(error => setError("Failed to remove product"));
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

    fetch(`http://localhost:8080/company/${companyId}/productList/${currentProductListId}/productItems`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newProduct,
        deliveryStep: "ADD_STOCK",
        description: `Adding new product: ${newProduct.name}`
      })
    })
      .then(response => response.json())
      .then(data => {
        // Extract the updated product list from the response
        const updatedProducts = data?.payload || [];
        if (Array.isArray(updatedProducts) && updatedProducts.length > 0) {
          // Update the entire product list with the response
          setProducts(updatedProducts);

          // Check if the first product has a new productListDetailsId
          if (updatedProducts[0] && updatedProducts[0].productListDetailsId) {
            setCurrentProductListId(updatedProducts[0].productListDetailsId);
          }

          setNewProduct({ name: "", quantity: 0 });
          setIsAddProductDialogOpen(false);
          setSuccessMessage("Product added successfully");
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          // Fallback: Extract single product from payload
          const productData = data?.payload || {};
          if (productData.id) {
            setProducts([...products, productData]);

            // Check if the product has a new productListDetailsId
            if (productData.productListDetailsId) {
              setCurrentProductListId(productData.productListDetailsId);
            }

            setNewProduct({ name: "", quantity: 0 });
            setIsAddProductDialogOpen(false);
            setSuccessMessage("Product added successfully");
            setTimeout(() => setSuccessMessage(null), 3000);
          } else {
            setError("Failed to add product: Invalid response data");
          }
        }
      })
      .catch(error => setError("Failed to add product"));
  };

  const getStatusBadge = () => {
    switch (deliveryStatus) {
      case "not_started":
        return <Badge variant="outline">Not Started</Badge>;
      case "in_progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      default:
        return null;
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
                Product List ID: {currentProductListId}
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

          {successMessage && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="w-[150px]">Quantity</TableHead>
                  {deliveryStatus === "in_progress" && (
                    <TableHead className="w-[150px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.itemName || product.name || product.productName || "Unknown Product"}</TableCell>
                    <TableCell>
                      {editingProduct?.id === product.id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={newQuantity}
                            onChange={(e) =>
                              setNewQuantity(Number(e.target.value))
                            }
                            className="w-20"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleSaveQuantity}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingProduct(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span>{product.quantity}{product.unit ? ` ${product.unit}` : ''}</span>
                      )}
                    </TableCell>
                    {deliveryStatus === "in_progress" && (
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditQuantity(product)}
                            disabled={editingProduct !== null}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveProduct(product.id)}
                            disabled={editingProduct !== null}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            {deliveryStatus === "in_progress" && (
              <Button
                variant="outline"
                onClick={() => setIsAddProductDialogOpen(true)}
                disabled={editingProduct !== null}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            {deliveryStatus === "not_started" && (
              <Button onClick={handleStartDelivery}>Start Onboarding</Button>
            )}
            {deliveryStatus === "in_progress" && (
              <Button
                onClick={handleCompleteDelivery}
                disabled={editingProduct !== null}
              >
                Complete Delivery
              </Button>
            )}
          </div>
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
