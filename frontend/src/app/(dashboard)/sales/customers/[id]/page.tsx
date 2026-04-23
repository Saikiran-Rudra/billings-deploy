"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

interface Address {
  street: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
}

interface Customer {
  _id: string;
  customerType: string;
  salutation: string;
  firstName: string;
  lastName: string;
  companyName: string;
  displayName: string;
  email: string;
  companyNumber: string;
  primaryPhone: string;
  alternatePhone: string;
  gstTreatment: string;
  gstNumber: string;
  gstName: string;
  tradeName: string;
  reverseCharge: string;
  reverseChargeReason: string;
  countryOfResidence: string;
  billing: Address;
  sameAsBilling: boolean;
  shipping: Address;
  placeOfSupply: string;
  panNumber: string;
  taxPreference: string;
  taxExemptionReason: string;
  defaultTaxRate: string;
  openingBalance: number;
  creditLimit: number;
  paymentTerms: string;
  preferredPaymentMethod: string;
  notes: string;
  tags: string[];
  customerStatus: string;
  createdAt: string;
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium">{String(value)}</span>
    </div>
  );
}

function AddressBlock({ title, address }: { title: string; address: Address }) {
  const parts = [address.street, address.city, address.state, address.pinCode, address.country].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-600 mb-1">{title}</h4>
      <p className="text-sm">{parts.join(", ")}</p>
    </div>
  );
}

export default function ViewCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await api.get<{ success: boolean; message: string; data: Record<string, unknown> }>(`/customers/${id}`);
        const c = (res as { success: boolean; message: string; data: Record<string, unknown> }).data;
        setCustomer(c as unknown as Customer);
        console.log('customer', (res as { success: boolean; message: string; data: Record<string, unknown> }).data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load customer");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading customer...</div>;
  if (error) return <div className="p-6"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div></div>;
  if (!customer) return <div className="p-6 text-center text-gray-400">Customer not found</div>;

  const statusColor = customer.customerStatus === "active" ? "bg-green-100 text-green-700" : customer.customerStatus === "blocked" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700";

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{customer.displayName}</h2>
          <p className="text-sm text-gray-500">{customer.customerType} &middot; {customer.email}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push(`/sales/customers/${id}/edit`)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Edit</button>
          <button onClick={() => router.push("/sales/customers")} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition">Back</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">Basic Info</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoRow label="Salutation" value={customer.salutation} />
            <InfoRow label="First Name" value={customer.firstName} />
            <InfoRow label="Last Name" value={customer.lastName} />
            <InfoRow label="Company Name" value={customer.companyName} />
            <InfoRow label="Primary Phone" value={customer.primaryPhone} />
            <InfoRow label="Alternate Phone" value={customer.alternatePhone} />
            <InfoRow label="Company Number" value={customer.companyNumber} />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Status</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full w-fit ${statusColor}`}>{customer.customerStatus}</span>
            </div>
          </div>
        </div>

        {/* GST Details */}
        {customer.gstTreatment && (
          <div>
            <h3 className="text-lg font-semibold mb-3 border-b pb-2">GST Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoRow label="GST Treatment" value={customer.gstTreatment} />
              <InfoRow label="GST Number" value={customer.gstNumber} />
              <InfoRow label="GST Name" value={customer.gstName} />
              <InfoRow label="Trade Name" value={customer.tradeName} />
              <InfoRow label="Reverse Charge" value={customer.reverseCharge} />
              <InfoRow label="Reverse Charge Reason" value={customer.reverseChargeReason} />
              <InfoRow label="Country of Residence" value={customer.countryOfResidence} />
            </div>
          </div>
        )}

        {/* Addresses */}
        <div>
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">Addresses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AddressBlock title="Billing Address" address={customer.billing} />
            <AddressBlock title="Shipping Address" address={customer.sameAsBilling ? customer.billing : customer.shipping} />
          </div>
          {customer.sameAsBilling && <p className="text-xs text-gray-400 mt-1 italic">Shipping same as billing</p>}
        </div>

        {/* Tax */}
        <div>
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">Tax Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoRow label="Place of Supply" value={customer.placeOfSupply} />
            <InfoRow label="PAN Number" value={customer.panNumber} />
            <InfoRow label="Tax Preference" value={customer.taxPreference} />
            <InfoRow label="Default Tax Rate" value={customer.defaultTaxRate} />
            <InfoRow label="Tax Exemption Reason" value={customer.taxExemptionReason} />
          </div>
        </div>

        {/* Payment */}
        <div>
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">Payment Settings</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoRow label="Opening Balance" value={customer.openingBalance} />
            <InfoRow label="Credit Limit" value={customer.creditLimit} />
            <InfoRow label="Payment Terms" value={customer.paymentTerms} />
            <InfoRow label="Preferred Payment Method" value={customer.preferredPaymentMethod} />
          </div>
        </div>

        {/* Additional */}
        {(customer.notes || customer.tags.length > 0) && (
          <div>
            <h3 className="text-lg font-semibold mb-3 border-b pb-2">Additional Details</h3>
            <InfoRow label="Notes" value={customer.notes} />
            {customer.tags.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-gray-500">Tags</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {customer.tags.map((tag) => (
                    <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
