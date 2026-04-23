"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import TextAreaField from "@/components/form/TextAreaField";
import VendorPreviewCard from "@/components/purchase/VendorPreviewCard";
import AddVendorModal from "@/components/purchase/AddVendorModal";
import VendorSearch from "@/components/purchase/VendorSearch";
import { usePurchases } from "@/hooks/use-purchases";
import { useSuppliers } from "@/hooks/use-suppliers";
import { purchaseSchema, type PurchaseFormData } from "@/lib/validations/purchase";
import { formatCurrency, TAX_RATES } from "@/data/purchase-form.config";
import { Plus } from "lucide-react";

export default function EditPurchasePage() {
  const router = useRouter();
  const params = useParams();
  const purchaseId = params.id as string;

  const { fetchPurchaseById, updatePurchase } = usePurchases();
  const { suppliers, fetchSuppliers, fetchSupplierById } = useSuppliers();

  const [purchase, setPurchase] = useState<any>(null);
  const [formData, setFormData] = useState<Partial<PurchaseFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newItemErrors, setNewItemErrors] = useState<Record<string, string>>({});
  const [newItem, setNewItem] = useState<any>({
    quantity: 1,
    purchasePrice: 0,
    taxRate: 0,
    unit: "",
  });

  // Load purchase data
  useEffect(() => {
    const loadPurchase = async () => {
      try {
        const data = await fetchPurchaseById(purchaseId);
        if (data) {
          setPurchase(data);
          setFormData({
            supplierId: data.supplierId,
            items: data.items || [],
            notes: data.notes || "",
            status: data.status || "draft",
          });
          setSelectedVendor(data.supplierSnapshot);
        } else {
          setError("Purchase not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load purchase");
      } finally {
        setLoading(false);
      }
    };

    loadPurchase();
    fetchSuppliers(1, 100);
  }, [purchaseId]);

  const calculateItemTotal = (item: any) => {
    const qty = typeof item.quantity === "string" ? parseFloat(item.quantity) : item.quantity || 0;
    const price = typeof item.purchasePrice === "string" ? parseFloat(item.purchasePrice) : item.purchasePrice || 0;
    const taxRate = typeof item.taxRate === "string" ? parseFloat(item.taxRate) : item.taxRate || 0;

    const taxableAmount = qty * price;
    let tax = 0;

    if (selectedVendor?.isGSTRegistered) {
      tax = (taxableAmount * taxRate) / 100;
    }

    return { taxableAmount, tax, total: taxableAmount + tax };
  };

  const calculateSummary = () => {
    let subtotal = 0;
    let totalTax = 0;

    (formData.items || []).forEach((item: any) => {
      const calc = calculateItemTotal(item);
      subtotal += calc.taxableAmount;
      totalTax += calc.tax;
    });

    return { subtotal, totalTax, grandTotal: subtotal + totalTax };
  };

  const summary = calculateSummary();

  const vendorSearchSuppliers = (suppliers || []).filter(
    (supplier): supplier is (typeof suppliers)[number] & { _id: string } =>
      typeof supplier._id === "string" && supplier._id.length > 0
  );

  const handleVendorSelect = async (supplierId: string) => {
    setFormData((prev) => ({ ...prev, supplierId }));

    try {
      const vendor = await fetchSupplierById(supplierId);
      if (vendor) {
        setSelectedVendor({
          ...vendor,
          state: vendor.billingAddress?.state,
          address: vendor.billingAddress,
        });
      }
    } catch (err) {
      console.error("Error fetching vendor:", err);
    }
  };

  const handleAddItem = () => {
    if (!newItem.productId) {
      setNewItemErrors({ productId: "Product is required" });
      return;
    }

    const qty = typeof newItem.quantity === "string" ? parseFloat(newItem.quantity) : newItem.quantity || 0;
    if (qty <= 0) {
      setNewItemErrors({ ...newItemErrors, quantity: "Quantity must be greater than 0" });
      return;
    }

    const price = typeof newItem.purchasePrice === "string" ? parseFloat(newItem.purchasePrice) : newItem.purchasePrice || 0;
    if (price < 0) {
      setNewItemErrors({ ...newItemErrors, purchasePrice: "Price cannot be negative" });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      items: [...(prev.items || []), newItem],
    }));

    setNewItem({ quantity: 1, purchasePrice: 0, taxRate: 0, unit: "" });
    setNewItemErrors({});
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const newItems = [...(prev.items || [])];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setErrors({});
    setSaving(true);

    try {
      const validationResult = purchaseSchema.safeParse(formData);

      if (!validationResult.success) {
        const fieldErrors: Record<string, string> = {};
        validationResult.error.issues.forEach((err) => {
          const fieldName = err.path.join(".");
          fieldErrors[fieldName] = err.message;
        });
        setErrors(fieldErrors);
        setError("Please fix the errors in the form");
        setSaving(false);
        return;
      }

      await updatePurchase(purchaseId, validationResult.data);
      router.push(`/inventory/purchases/${purchaseId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update purchase";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 w-full text-center">
        <Loader2 size={40} className="animate-spin mx-auto text-blue-600" />
        <p className="text-gray-600 mt-2">Loading purchase...</p>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="p-6 w-full">
        <Link
          href="/inventory/purchases"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Purchases
        </Link>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 text-lg">{error || "Purchase not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full space-y-6 max-w-7xl mx-auto">
      <div>
        <Link
          href="/inventory/purchases"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Purchases
        </Link>
        <h1 className="text-3xl font-bold">Edit Purchase {purchase.purchaseNumber}</h1>
        <p className="text-gray-600 mt-1">Update purchase details and items</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Vendor Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Vendor</h2>

          <VendorSearch
            suppliers={vendorSearchSuppliers}
            value={formData.supplierId || ""}
            onSelect={handleVendorSelect}
            onAddNew={() => setShowAddVendor(true)}
            isLoading={saving}
          />
        </div>

        {/* Vendor Preview */}
        {selectedVendor && (
          <VendorPreviewCard vendor={selectedVendor} />
        )}

        {/* Items */}
        {formData.items && (formData.items || []).length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Items</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-left">Qty</th>
                    <th className="px-4 py-2 text-left">Price</th>
                    <th className="px-4 py-2 text-left">Tax %</th>
                    <th className="px-4 py-2 text-right">Total</th>
                    <th className="px-4 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(formData.items || []).map((item: any, idx: number) => {
                    const calc = calculateItemTotal(item);
                    return (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2">{item.productName || item.productId}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">{formatCurrency(item.purchasePrice)}</td>
                        <td className="px-4 py-2">{item.taxRate}%</td>
                        <td className="px-4 py-2 text-right font-medium">{formatCurrency(calc.total)}</td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary */}
        {(formData.items || []).length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>

            <div className="space-y-2 text-right max-w-xs ml-auto">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST:</span>
                <span>{formatCurrency(summary.totalTax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Grand Total:</span>
                <span>{formatCurrency(summary.grandTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes & Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Additional Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              name="status"
              label="Status"
              value={formData.status || "draft"}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.value as PurchaseFormData["status"] }))
              }
              options={[
                { value: "draft", label: "Draft" },
                { value: "confirmed", label: "Confirmed" },
                { value: "cancelled", label: "Cancelled" },
              ]}
              disabled={saving}
            />
          </div>

          <TextAreaField
            name="notes"
            label="Notes"
            value={formData.notes || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Add notes..."
            disabled={saving}
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={saving}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition"
          >
            {saving && <Loader2 size={20} className="animate-spin" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Add Vendor Modal */}
      <AddVendorModal
        isOpen={showAddVendor}
        onClose={() => setShowAddVendor(false)}
        onVendorCreated={(vendorId) => {
          handleVendorSelect(vendorId);
          setShowAddVendor(false);
        }}
      />
    </div>
  );
}
