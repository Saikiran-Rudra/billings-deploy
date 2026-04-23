"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSuppliers } from "@/hooks/use-suppliers";
import { Supplier } from "@/lib/validations/supplier";
import { formatPaymentTerms } from "@/data/supplier-form.config";

export default function ViewSupplierPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params.id as string;

  const { fetchSupplierById } = useSuppliers();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSupplier = async () => {
      try {
        setLoading(true);
        const data = await fetchSupplierById(supplierId);
        setSupplier(data);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load supplier");
      } finally {
        setLoading(false);
      }
    };

    if (supplierId) {
      loadSupplier();
    }
  }, [supplierId]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading supplier...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Link
          href="/inventory/suppliers"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={18} />
          Back to Suppliers
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="p-6">
        <Link
          href="/inventory/suppliers"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={18} />
          Back to Suppliers
        </Link>
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg">
          Supplier not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            href="/inventory/suppliers"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-2"
          >
            <ArrowLeft size={18} />
            Back to Suppliers
          </Link>
          <h1 className="text-3xl font-bold">{supplier.supplierName}</h1>
        </div>
        <Link
          href={`/inventory/suppliers/${supplier._id || supplier.id}/edit`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Edit Supplier
        </Link>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
            supplier.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {supplier.status?.charAt(0).toUpperCase() + supplier.status?.slice(1)}
        </span>
      </div>

      {/* SECTION 1: BASIC DETAILS */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Basic Details</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 text-sm">Supplier Name</p>
            <p className="text-lg font-semibold">{supplier.supplierName}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Company Name</p>
            <p className="text-lg font-semibold">{supplier.companyName}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Email</p>
            <p className="text-lg">
              <a href={`mailto:${supplier.email}`} className="text-blue-600 hover:underline">
                {supplier.email}
              </a>
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Phone</p>
            <p className="text-lg">
              <a href={`tel:${supplier.phone}`} className="text-blue-600 hover:underline">
                {supplier.phone}
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: GST INFORMATION */}
      {supplier.isGSTRegistered && (
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">GST Information</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <p className="text-gray-600 text-sm">GST Status</p>
              <p className="text-lg font-semibold text-green-600">Registered</p>
            </div>
            {supplier.gstNumber && (
              <div>
                <p className="text-gray-600 text-sm">GST Number</p>
                <p className="text-lg font-mono">{supplier.gstNumber}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: BILLING & SHIPPING ADDRESS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Billing Address */}
        {supplier.billingAddress && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Billing Address</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Street Address</p>
                <p className="text-lg">{supplier.billingAddress.street}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">City</p>
                <p className="text-lg">{supplier.billingAddress.city}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">State</p>
                <p className="text-lg">{supplier.billingAddress.state}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Pincode</p>
                <p className="text-lg">{supplier.billingAddress.pincode}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Country</p>
                <p className="text-lg">{supplier.billingAddress.country || "India"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Address */}
        {supplier.shippingAddress && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Shipping Address</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Street Address</p>
                <p className="text-lg">{supplier.shippingAddress.street}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">City</p>
                <p className="text-lg">{supplier.shippingAddress.city}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">State</p>
                <p className="text-lg">{supplier.shippingAddress.state}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Pincode</p>
                <p className="text-lg">{supplier.shippingAddress.pincode}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Country</p>
                <p className="text-lg">{supplier.shippingAddress.country || "India"}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: BUSINESS INFORMATION */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Business Information</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 text-sm">Payment Terms</p>
            <p className="text-lg font-semibold">{formatPaymentTerms(supplier.paymentTerms || "")}</p>
          </div>
          {supplier.openingBalance !== undefined && (
            <div>
              <p className="text-gray-600 text-sm">Opening Balance</p>
              <p className="text-lg font-semibold">₹{supplier.openingBalance.toFixed(2)}</p>
            </div>
          )}
        </div>
        {supplier.notes && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-gray-600 text-sm">Notes</p>
            <p className="text-lg">{supplier.notes}</p>
          </div>
        )}
      </div>

      {/* SECTION 5: METADATA */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p>
          Created on{" "}
          {supplier.createdAt
            ? new Date(supplier.createdAt).toLocaleDateString()
            : "N/A"}
        </p>
        {supplier.updatedAt && (
          <p>
            Last updated on{" "}
            {new Date(supplier.updatedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
