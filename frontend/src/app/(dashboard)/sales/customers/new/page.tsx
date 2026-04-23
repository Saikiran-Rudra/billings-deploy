"use client";

import React, { FormEvent, useState} from "react";
import { useRouter } from "next/navigation";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormWrapper from "@/components/form/FormWrapper";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import TextAreaField from "@/components/form/TextAreaField";
import CheckboxField from "@/components/form/CheckboxField";
import { customerSchema, type CustomerFormData } from "@/lib/validations/customer";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

export default function NewCustomerPage() {
  const router = useRouter();
  const auth = useAuth();
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema) as Resolver<CustomerFormData>,
    mode: "onBlur",
    defaultValues: {
      customerType: undefined,
      salutation: "",
      firstName: "",
      lastName: "",
      companyName: "",
      displayName: "",
      email: "",
      companyNumber: "",
      primaryPhone: "",
      alternatePhone: "",
      gstTreatment: undefined as any,
      gstNumber: "",
      gstName: "",
      tradeName: "",
      reverseCharge: "",
      reverseChargeReason: "",
      countryOfResidence: "",
      billing: { street: "", city: "", state: "", pinCode: "", country: "" },
      sameAsBilling: false,
      shipping: { street: "", city: "", state: "", pinCode: "", country: "" },
      placeOfSupply: "",
      panNumber: "",
      taxPreference: "",
      taxExemptionReason: "",
      defaultTaxRate: "",
      openingBalance: "",
      creditLimit: "",
      paymentTerms: "",
      preferredPaymentMethod: "",
      notes: "",
      tags: "",
      customerStatus: "active",
    },
  });

  const gstTreatment = watch("gstTreatment");
  const reverseCharge = watch("reverseCharge");
  const sameAsBilling = watch("sameAsBilling");
  const taxPreference = watch("taxPreference");
  const customerType = watch("customerType");

  const onSubmit = async (data: CustomerFormData) => {
    setApiError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      console.log("[NewCustomerPage] Auth state:", {
        user: auth.user,
        companyId: auth.user?.companyId,
        companyIdType: typeof auth.user?.companyId,
      });

      // Build clean payload - only include fields with actual values
      const cleanPayload: Record<string, unknown> = {
        // Convert to string to ensure it's a valid ObjectId string
        companyId: typeof auth.user?.companyId === 'string' 
          ? auth.user.companyId 
          : (auth.user?.companyId as any)?.toString?.() || String(auth.user?.companyId),

        // Required fields
        customerType: data.customerType,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName,
        email: data.email,
        primaryPhone: data.primaryPhone,
        customerStatus: data.customerStatus,

        // Addresses - always include but clean them
        billing: {
          street: data.billing?.street || "",
          city: data.billing?.city || "",
          state: data.billing?.state || "",
          pinCode: data.billing?.pinCode || "",
          country: data.billing?.country || "",
        },
        sameAsBilling: data.sameAsBilling,
        shipping: data.sameAsBilling
          ? {
              street: data.billing?.street || "",
              city: data.billing?.city || "",
              state: data.billing?.state || "",
              pinCode: data.billing?.pinCode || "",
              country: data.billing?.country || "",
            }
          : {
              street: data.shipping?.street || "",
              city: data.shipping?.city || "",
              state: data.shipping?.state || "",
              pinCode: data.shipping?.pinCode || "",
              country: data.shipping?.country || "",
            },

        // Optional fields - only include if not empty
        ...(data.salutation && { salutation: data.salutation }),
        ...(data.companyName && { companyName: data.companyName }),
        ...(data.companyNumber && { companyNumber: data.companyNumber }),
        ...(data.alternatePhone && { alternatePhone: data.alternatePhone }),
        ...(data.gstTreatment && { gstTreatment: data.gstTreatment }),
        ...(data.gstNumber && { gstNumber: data.gstNumber }),
        ...(data.gstName && { gstName: data.gstName }),
        ...(data.tradeName && { tradeName: data.tradeName }),
        ...(data.reverseCharge && { reverseCharge: data.reverseCharge }),
        ...(data.reverseChargeReason && { reverseChargeReason: data.reverseChargeReason }),
        ...(data.countryOfResidence && { countryOfResidence: data.countryOfResidence }),
        ...(data.placeOfSupply && { placeOfSupply: data.placeOfSupply }),
        ...(data.panNumber && { panNumber: data.panNumber }),
        ...(data.taxPreference && { taxPreference: data.taxPreference }),
        ...(data.taxExemptionReason && { taxExemptionReason: data.taxExemptionReason }),
        ...(data.defaultTaxRate && { defaultTaxRate: data.defaultTaxRate }),
        ...(data.paymentTerms && { paymentTerms: data.paymentTerms }),
        ...(data.preferredPaymentMethod && { preferredPaymentMethod: data.preferredPaymentMethod }),
        ...(data.notes && { notes: data.notes }),

        // Numbers and arrays
        openingBalance: data.openingBalance ? Number(data.openingBalance) : 0,
        creditLimit: data.creditLimit ? Number(data.creditLimit) : 0,
        tags: data.tags
          ? data.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      console.log("[NewCustomerPage] Sending payload:", {
        companyId: cleanPayload.companyId,
        companyIdType: typeof cleanPayload.companyId,
        fullPayload: cleanPayload,
      });
      
      await api.post("/customers", cleanPayload);
      setSuccess("Customer created successfully!");
      setTimeout(() => router.push("/sales/customers"), 1500);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Failed to create customer");
      console.error("[NewCustomerPage] API Error:", err); // Debug log
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to get nested error messages
  const fieldError = (path: string) => {
    const parts = path.split(".");
    let current: unknown = errors;
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return (current as { message?: string })?.message;
  };

  const placeOfSupplyOptions = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
    "Lakshadweep", "Puducherry",
  ].map((s) => ({ value: s, label: s }));

  return (
    <FormWrapper
      title="Add New Customer bussiness"
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Save Customer"
      isLoading={isSubmitting}
      error={apiError}
      success={success}
    >
      {/* ── Basic Info ── */}
      <h2 className="text-lg font-semibold mb-4">Basic Info</h2>
      <div>
        <label className="block text-sm font-medium mb-2">Customer Type <span className="text-red-500">*</span></label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input type="radio" value="Business" {...register("customerType")} className="accent-green-500" /> Business
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="Individual" {...register("customerType")} className="accent-green-500" /> Individual
          </label>
        </div>
        {errors.customerType && <p className="text-red-500 text-xs mt-1">{errors.customerType.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField label="Salutation" name="salutation" value={watch("salutation")} onChange={(e) => setValue("salutation", e.target.value)} options={[{ value: "Mr.", label: "Mr." }, { value: "Mrs.", label: "Mrs." }, { value: "Ms.", label: "Ms." }]} placeholder="Select" />
        <InputField label="First Name" name="firstName" placeholder="Enter first name" value={watch("firstName")} onChange={(e) => setValue("firstName", e.target.value, { shouldValidate: true })} error={errors.firstName?.message} required={true} />
        <InputField label="Last Name" name="lastName" placeholder="Enter last name" value={watch("lastName")} onChange={(e) => setValue("lastName", e.target.value, { shouldValidate: true })} error={errors.lastName?.message} required={true} />
        <InputField label="Company Name" name="companyName" placeholder="Enter company name" value={watch("companyName")} onChange={(e) => setValue("companyName", e.target.value)} />
        <InputField label="Display Name" name="displayName" placeholder="Enter display name" value={watch("displayName")} onChange={(e) => setValue("displayName", e.target.value, { shouldValidate: true })} error={errors.displayName?.message} required={true} />
        <InputField label="Email Address" name="email" type="email" placeholder="Enter email address" value={watch("email")} onChange={(e) => setValue("email", e.target.value, { shouldValidate: true })} error={errors.email?.message} required={true} />
        <InputField label="Company Number" name="companyNumber" type="tel" placeholder="Enter phone number" value={watch("companyNumber")} onChange={(e) => setValue("companyNumber", e.target.value)} />
        <InputField label="Primary Phone Number" name="primaryPhone" type="tel" placeholder="Enter phone number" value={watch("primaryPhone")} onChange={(e) => setValue("primaryPhone", e.target.value, { shouldValidate: true })} error={errors.primaryPhone?.message} required={true} />
        <InputField label="Alternate Phone Number" name="alternatePhone" type="tel" placeholder="Enter phone number" value={watch("alternatePhone")} onChange={(e) => setValue("alternatePhone", e.target.value, { shouldValidate: true })} error={errors.alternatePhone?.message} />
      </div>

      {/* ── Other Details ── */}
      <h3 className="text-lg font-semibold mt-6 mb-5">Other Details</h3>

      <SelectField
        label="GST Treatment"
        name="gstTreatment"
        value={gstTreatment}
        onChange={(e) => setValue("gstTreatment", e.target.value as any)}
        placeholder="Select GST Treatment"
        options={[
          { value: "Registered", label: "Registered" },
          { value: "Unregistered", label: "Unregistered" },
          { value: "composition scheme", label: "Composition Scheme" },
          { value: "SEZ", label: "SEZ" },
        ]}
      />

      {(gstTreatment === "Registered" || gstTreatment === "composition scheme" || gstTreatment === "SEZ") && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField label="GST Number" name="gstNumber" placeholder="Enter GST number" value={watch("gstNumber")} onChange={(e) => setValue("gstNumber", e.target.value, { shouldValidate: true })} error={errors.gstNumber?.message} required={true} />
          <InputField label="GST Name" name="gstName" placeholder="Enter GST name" value={watch("gstName")} onChange={(e) => setValue("gstName", e.target.value)} required={true} />
          <InputField label="Trade Name" name="tradeName" placeholder="Enter trade name" value={watch("tradeName")} onChange={(e) => setValue("tradeName", e.target.value)} required={true} />
        </div>
      )}

      {gstTreatment === "composition scheme" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField
            label="Reverse Charge"
            name="reverseCharge"
            value={reverseCharge}
            onChange={(e) => setValue("reverseCharge", e.target.value)}
            placeholder="Select"
            options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
          />
          {reverseCharge === "yes" && (
            <SelectField
              label="Reverse Charge Reason"
              name="reverseChargeReason"
              value={watch("reverseChargeReason")}
              onChange={(e) => setValue("reverseChargeReason", e.target.value)}
              placeholder="Select Reason"
              options={[
                { value: "transport", label: "Transport Service" },
                { value: "legal", label: "Legal Service" },
                { value: "import", label: "Import Service" },
                { value: "government", label: "Government Service" },
              ]}
            />
          )}
        </div>
      )}

      {/* ── Addresses ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Address (Billing address)</h2>
          <div className="grid grid-cols-1 gap-4">
            {(["street", "city", "state", "pinCode", "country"] as const).map((f) => (
              <InputField
                key={f}
                label={f === "pinCode" ? "Pin Code" : f.charAt(0).toUpperCase() + f.slice(1)}
                name={`billing.${f}`}
                placeholder={`Enter ${f === "pinCode" ? "pin code" : f}`}
                value={watch(`billing.${f}`)}
                onChange={(e) => setValue(`billing.${f}`, e.target.value)}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold mb-4">Address (Shipping address)</h2>
            <CheckboxField
              label="Same as billing address"
              name="sameAsBilling"
              checked={sameAsBilling}
              onChange={(e) => setValue("sameAsBilling", e.target.checked)}
            />
          </div>
          {!sameAsBilling && (
            <div className="grid grid-cols-1 gap-4">
              {(["street", "city", "state", "pinCode", "country"] as const).map((f) => (
                <InputField
                  key={f}
                  label={f === "pinCode" ? "Pin Code" : f.charAt(0).toUpperCase() + f.slice(1)}
                  name={`shipping.${f}`}
                  placeholder={`Enter ${f === "pinCode" ? "pin code" : f}`}
                  value={watch(`shipping.${f}`)}
                  onChange={(e) => setValue(`shipping.${f}`, e.target.value)}
                />
              ))}
            </div>
          )}
          {sameAsBilling && (
            <p className="text-sm text-gray-500 italic">Shipping address will be same as billing address</p>
          )}
        </div>
      </div>

      {/* ── Tax Information ── */}
      <h2 className="text-lg font-semibold mb-4">Tax Information</h2>
      <div className="grid grid-cols-2 gap-5">
        <SelectField label="Place of Supply" name="placeOfSupply" value={watch("placeOfSupply")} onChange={(e) => setValue("placeOfSupply", e.target.value)} placeholder="Select Place of Supply" options={placeOfSupplyOptions} />
        <InputField label="PAN Number" name="panNumber" placeholder="Enter PAN number" value={watch("panNumber")} onChange={(e) => setValue("panNumber", e.target.value.toUpperCase(), { shouldValidate: true })} error={fieldError("panNumber")} />
        <div>
          <label className="block text-sm font-medium mb-2">Tax Preference</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input type="radio" value="tax" checked={taxPreference === "tax"} onChange={() => setValue("taxPreference", "tax")} className="accent-green-500" /> Tax
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" value="exempted" checked={taxPreference === "exempted"} onChange={() => setValue("taxPreference", "exempted")} className="accent-green-500" /> Tax Exempted
            </label>
          </div>
          {taxPreference === "exempted" && (
            <div className="mt-4">
              <TextAreaField label="Reason for Tax Exemption" name="taxExemptionReason" placeholder="Enter reason..." rows={3} value={watch("taxExemptionReason")} onChange={(e) => setValue("taxExemptionReason", e.target.value, { shouldValidate: true })} error={errors.taxExemptionReason?.message} />
            </div>
          )}
          {taxPreference === "tax" && (
            <div className="mt-4">
              <SelectField
                label="Default Tax Rate"
                name="defaultTaxRate"
                value={watch("defaultTaxRate")}
                onChange={(e) => setValue("defaultTaxRate", e.target.value, { shouldValidate: true })}
                placeholder="Select Default Tax Rate"
                options={[
                  { value: "0", label: "0%" },
                  { value: "5", label: "5%" },
                  { value: "12", label: "12%" },
                  { value: "18", label: "18%" },
                  { value: "28", label: "28%" },
                ]}
                error={errors.defaultTaxRate?.message}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Payment Settings ── */}
      <h2 className="text-lg font-semibold mb-4 mt-6">Payment Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Opening Balance" name="openingBalance" type="number" placeholder="Enter opening balance" value={watch("openingBalance")} onChange={(e) => setValue("openingBalance", e.target.value === "" ? "" : e.target.value)} error={errors.openingBalance?.message} />
        <InputField label="Credit Limit" name="creditLimit" type="number" placeholder="Enter credit limit" value={watch("creditLimit")} onChange={(e) => setValue("creditLimit", e.target.value === "" ? "" : e.target.value)} error={errors.creditLimit?.message} />
        <SelectField
          label="Payment Terms"
          name="paymentTerms"
          value={watch("paymentTerms")}
          onChange={(e) => setValue("paymentTerms", e.target.value)}
          placeholder="Select Payment Terms"
          options={[
            { value: "net15", label: "Net 15" },
            { value: "net30", label: "Net 30" },
            { value: "net60", label: "Net 60" },
            { value: "due_on_receipt", label: "Due on Receipt" },
          ]}
        />
        <SelectField
          label="Preferred Payment Method"
          name="preferredPaymentMethod"
          value={watch("preferredPaymentMethod")}
          onChange={(e) => setValue("preferredPaymentMethod", e.target.value)}
          placeholder="Select Payment Method"
          options={[
            { value: "cash", label: "Cash" },
            { value: "check", label: "Check" },
            { value: "credit_card", label: "Credit Card" },
            { value: "bank_transfer", label: "Bank Transfer" },
          ]}
        />
      </div>

      {/* ── Additional Details ── */}
      <h2 className="text-lg font-semibold mb-4 mt-6">Additional Details</h2>
      <div className="grid grid-cols-1 gap-4">
        <TextAreaField label="Notes" name="notes" placeholder="Enter notes..." rows={3} value={watch("notes")} onChange={(e) => setValue("notes", e.target.value)} />
        <InputField label="Tags" name="tags" placeholder="Enter tags (comma separated)" value={watch("tags")} onChange={(e) => setValue("tags", e.target.value)} />
        <SelectField
          label="Customer Status"
          name="customerStatus"
          value={watch("customerStatus")}
          onChange={(e) => setValue("customerStatus", e.target.value as "active" | "inactive" | "blocked")}
          placeholder="Select Status"
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "blocked", label: "Blocked" },
          ]}
        />
      </div>
    </FormWrapper>
  );
}
