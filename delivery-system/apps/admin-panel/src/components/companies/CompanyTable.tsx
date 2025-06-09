"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Building2,
  Users,
  Package,
  DollarSign,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";
import { Company } from "@/types/company";
import { cn } from "@/lib/utils";

interface CompanyTableProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
}

export default function CompanyTable({
  companies,
  onEdit,
  onDelete,
}: CompanyTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: Company["status"]) => {
    switch (status) {
      case "Active":
        return "default";
      case "Inactive":
        return "secondary";
      case "Suspended":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPlanColor = (plan: Company["plan"]) => {
    return plan === "Pro" ? "default" : "outline";
  };

  if (companies.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No companies found</h3>
          <p className="text-muted-foreground text-center">
            No companies match your current filters. Try adjusting your search
            or filter criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead className="text-center">Shops</TableHead>
                <TableHead className="text-center">Users</TableHead>
                <TableHead className="text-center">Products</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-center">Plan</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <React.Fragment key={company.id}>
                  <TableRow
                    className={cn(
                      "cursor-pointer hover:bg-muted/50 transition-colors",
                      expandedRows.has(company.id) && "bg-muted/30",
                    )}
                    onClick={() => toggleRow(company.id)}
                  >
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(company.id);
                        }}
                      >
                        {expandedRows.has(company.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {company.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {company.shopsCount}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {company.usersCount}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {company.productsCount}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatCurrency(company.revenue)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getPlanColor(company.plan)}>
                        {company.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getStatusColor(company.status)}>
                        {company.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(company);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(company.id);
                          }}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {expandedRows.has(company.id) && (
                    <TableRow>
                      <TableCell colSpan={9} className="p-0">
                        <div className="bg-muted/20 p-6 border-t">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                Contact Information
                              </h4>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <span>{company.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span>{company.phone}</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                  <span>{company.address}</span>
                                </div>
                                {company.website && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <a
                                      href={company.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {company.website}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                Business Details
                              </h4>
                              <div className="space-y-2">
                                {company.description && (
                                  <div className="text-sm">
                                    <span className="font-medium">
                                      Description:
                                    </span>
                                    <p className="mt-1 text-muted-foreground">
                                      {company.description}
                                    </p>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Plan:</span>
                                    <div className="mt-1">
                                      <Badge
                                        variant={getPlanColor(company.plan)}
                                      >
                                        {company.plan}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Status:</span>
                                    <div className="mt-1">
                                      <Badge
                                        variant={getStatusColor(company.status)}
                                      >
                                        {company.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                Timeline
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Created:</span>
                                  <span>{formatDate(company.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Updated:</span>
                                  <span>{formatDate(company.updatedAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
