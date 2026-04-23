"use client";

import { useState, FormEvent, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";
import FormWrapper from "@/components/form/FormWrapper";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import TextAreaField from "@/components/form/TextAreaField";
import VendorPreviewCard from "@/components/purchase/VendorPreviewCard";
import AddVendorModal from "@/components/purchase/AddVendorModal";
import VendorSearch from "@/components/purchase/VendorSearch";
import CreatableProductSelect from "@/components/purchase/CreatableProductSelect";
import { usePurchases } from "@/hooks/use-purchases";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useProducts } from "@/hooks/use-products";
import { purchaseSchema, type PurchaseFormData, PurchaseItemFormData } from "@/lib/validations/purchase";
import { getPurchaseFormConfig, getPurchaseInitialValues, formatCurrency } from "@/data/purchase-form.config";
import { TAX_RATES } from "@/data/purchase-form.config";

export default function NewPurchasePage() {
  const router = useRouter();
  const { createPurchase } = usePurchases();
  const { suppliers, loading: suppliersLoading, fetchSuppliers, fetchSupplierById } = useSuppliers();
  const { products, loading: productsLoading, fetchProducts } = useProducts();

  const [formData, setFormData] = useState<Partial<PurchaseFormData>>(
    getPurchaseInitialValues()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [loadingVendor, setLoadingVendor] = useState(false);
  const [newItemErrors, setNewItemErrors] = useState<Record<string, string>>({});
  const [newItem, setNewItem] = useState<Partial<PurchaseItemFormData>>({
    quantity: 1,
    purchasePrice: 0,
    taxRate: 0,
    unit: "",
  });

  // Fetch suppliers on mount
  useEffect(() => {
    fetchSuppliers(1, 100);
    fetchProducts(1, 100);
  }, []);

  const formConfig = useMemo(() => getPurchaseFormConfig(), []);

  // Calculate item totals
  const calculateItemTotal = (item: Partial<PurchaseItemFormData>) => {
    const qty = typeof item.quantity === "string" ? parseFloat(item.quantity) : item.quantity || 0;
    const price = typeof item.purchasePrice === "string" ? parseFloat(item.purchasePrice) : item.purchasePrice || 0;
    const taxRate = typeof item.taxRate === "string" ? parseFloat(item.taxRate) : item.taxRate || 0;

    const taxableAmount = qty * price;
    let tax = 0;

    if (selectedVendor?.isGSTRegistered) {
      tax = (taxableAmount * taxRate) / 100;
    }

    return {
      taxableAmount,
      tax,
      total: taxableAmount + tax,
    };
  };

  // Calculate summary totals
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

  const handleVendorSelect = async (supplierId: string) => {
    setFormData((prev) => ({ ...prev, supplierId }));
    setLoadingVendor(true);

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
    } finally {
      setLoadingVendor(false);
    }
  };

  const handleVendorCreated = (vendorId: string) => {
    // Auto-select the new vendor
    handleVendorSelect(vendorId);
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
      items: [...(prev.items || []), newItem as PurchaseItemFormData],
    }));

    setNewItem({
      quantity: 1,
      purchasePrice: 0,
      taxRate: 0,
      unit: "",
    });
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

  const handleNewItemChange = (field: string, value: any) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
    if (newItemErrors[field]) {
      setNewItemErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setErrors({});
    setLoading(true);

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
        setLoading(false);
        return;
      }

      const newPurchase = await createPurchase(validationResult.data);
      router.push(`/inventory/purchases/${newPurchase._id || newPurchase.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create purchase";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">New Purchase</h1>
        <p className="text-gray-600 mt-1">Create a new purchase order</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Section 1: Vendor Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Vendor Selection</h2>

          <VendorSearch
            suppliers={suppliers.filter(
              (supplier): supplier is (typeof suppliers)[number] & { _id: string } =>
                typeof supplier._id === "string" && supplier._id.length > 0
            )}
            value={formData.supplierId || ""}
            onSelect={handleVendorSelect}
            onAddNew={() => setShowAddVendor(true)}
            isLoading={loading || suppliersLoading}
          />
        </div>

        {/* Section 2: Vendor Preview */}
        {formData.supplierId && (
          <VendorPreviewCard
            vendor={selectedVendor}
            isLoading={loadingVendor}
            onClose={() => {
              setFormData((prev) => ({ ...prev, supplierId: "" }));
              setSelectedVendor(null);
            }}
          />
        )}

        {/* Section 3: Purchase Items */}
        {formData.supplierId && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Purchase Items</h2>

            {/* Items Table */}
            {(formData.items || []).length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                        Product
                      </th>
                      <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                        Qty
                      </th>
                      <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                        Price
                      </th>
                      <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                        Tax %
                      </th>
                      <th className="px-4 py-2 text-right text-gray-600 font-semibold">
                        Total
                      </th>
                      <th className="px-4 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(formData.items || []).map((item: any, idx: number) => {
                      const itemCalc = calculateItemTotal(item);
                      return (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-2">{item.productName || item.productId}</td>
                          <td className="px-4 py-2">{item.quantity}</td>
                          <td className="px-4 py-2">{formatCurrency(item.purchasePrice)}</td>
                          <td className="px-4 py-2">{item.taxRate}%</td>
                          <td className="px-4 py-2 text-right font-medium">
                            {formatCurrency(itemCalc.total)}
                          </td>
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
            )}

            {errors.items && (
              <p className="text-sm text-red-600">{errors.items}</p>
            )}

            {/* Add Item Form */}
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <h3 className="font-semibold text-gray-900">Add Item</h3>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <CreatableProductSelect
                  products={products}
                  value={newItem.productId || ""}
                  onChange={(value) => handleNewItemChange("productId", value)}
                  error={newItemErrors.productId}
                  isLoading={productsLoading}
                />

                <InputField
                  name="quantity"
                  label="Quantity"
                  type="number"
                  value={newItem.quantity || ""}
                  onChange={(e) => handleNewItemChange("quantity", parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  error={newItemErrors.quantity}
                />

                <InputField
                  name="purchasePrice"
                  label="Price"
                  type="number"
                  value={newItem.purchasePrice || ""}
                  onChange={(e) => handleNewItemChange("purchasePrice", parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  error={newItemErrors.purchasePrice}
                />

                <SelectField
                  name="taxRate"
                  label="Tax %"
                  value={String(newItem.taxRate ?? 0)}
                  onChange={(e) => handleNewItemChange("taxRate", parseInt(e.target.value) || 0)}
                  options={TAX_RATES}
                />

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Summary */}
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

        {/* Section 5: Notes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h2>

          <TextAreaField
            name="notes"
            label="Notes"
            value={formData.notes || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Add any additional notes..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.supplierId || (formData.items || []).length === 0}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition"
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            {loading ? "Creating..." : "Create Purchase"}
          </button>
        </div>
      </form>

      {/* Add Vendor Modal */}
      <AddVendorModal
        isOpen={showAddVendor}
        onClose={() => setShowAddVendor(false)}
        onVendorCreated={handleVendorCreated}
      />
    </div>
  );
}
