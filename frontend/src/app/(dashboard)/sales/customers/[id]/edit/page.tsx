"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormWrapper from "@/components/form/FormWrapper";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import TextAreaField from "@/components/form/TextAreaField";
import CheckboxField from "@/components/form/CheckboxField";
import { customerSchema, type CustomerFormData } from "@/lib/validations/customer";
import { api } from "@/lib/api-client";

export default function EditCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
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

  // Load existing customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await api.get<{ success: boolean; message: string; data: Record<string, unknown> }>(`/customers/${id}`);
        const c = (res as { success: boolean; message: string; data: Record<string, unknown> }).data;
        reset({
          customerType: c.customerType as "Business" | "Individual",
          salutation: (c.salutation as string) || "",
          firstName: (c.firstName as string) || "",
          lastName: (c.lastName as string) || "",
          companyName: (c.companyName as string) || "",
          displayName: (c.displayName as string) || "",
          email: (c.email as string) || "",
          companyNumber: (c.companyNumber as string) || "",
          primaryPhone: (c.primaryPhone as string) || "",
          alternatePhone: (c.alternatePhone as string) || "",
          gstTreatment: ((c.gstTreatment as string) || "") as any,
          gstNumber: (c.gstNumber as string) || "",
          gstName: (c.gstName as string) || "",
          tradeName: (c.tradeName as string) || "",
          reverseCharge: typeof c.reverseCharge === "boolean" 
            ? (c.reverseCharge ? "yes" : "no") 
            : ((c.reverseCharge as string) || ""),
          reverseChargeReason: (c.reverseChargeReason as string) || "",
          countryOfResidence: (c.countryOfResidence as string) || "",
          billing: {
            street: ((c.billing as Record<string, string>)?.street) || "",
            city: ((c.billing as Record<string, string>)?.city) || "",
            state: ((c.billing as Record<string, string>)?.state) || "",
            pinCode: ((c.billing as Record<string, string>)?.pinCode) || "",
            country: ((c.billing as Record<string, string>)?.country) || "",
          },
          sameAsBilling: (c.sameAsBilling as boolean) || false,
          shipping: {
            street: ((c.shipping as Record<string, string>)?.street) || "",
            city: ((c.shipping as Record<string, string>)?.city) || "",
            state: ((c.shipping as Record<string, string>)?.state) || "",
            pinCode: ((c.shipping as Record<string, string>)?.pinCode) || "",
            country: ((c.shipping as Record<string, string>)?.country) || "",
          },
          placeOfSupply: (c.placeOfSupply as string) || "",
          panNumber: (c.panNumber as string) || "",
          taxPreference: (c.taxPreference as "" | "tax" | "exempted") || "",
          taxExemptionReason: (c.taxExemptionReason as string) || "",
          defaultTaxRate: (c.defaultTaxRate as string) || "",
          openingBalance: (c.openingBalance as number) !== undefined ? (c.openingBalance as number) : "",
          creditLimit: (c.creditLimit as number) !== undefined ? (c.creditLimit as number) : "",
          paymentTerms: (c.paymentTerms as string) || "",
          preferredPaymentMethod: (c.preferredPaymentMethod as string) || "",
          notes: (c.notes as string) || "",
          tags: Array.isArray(c.tags) ? (c.tags as string[]).join(", ") : "",
          customerStatus: (c.customerStatus as "active" | "inactive" | "blocked") || "active",
        });
      } catch (err: unknown) {
        setApiError(err instanceof Error ? err.message : "Failed to load customer");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
    console.log("Loaded customer ID:", id);
  }, [id, reset]);

  const gstTreatment = watch("gstTreatment");
  const reverseCharge = watch("reverseCharge");
  const sameAsBilling = watch("sameAsBilling");
  const taxPreference = watch("taxPreference");

  const onSubmit = async (data: CustomerFormData) => {
    setApiError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const payload = {
        ...data,
        openingBalance: data.openingBalance ? Number(data.openingBalance) : 0,
        creditLimit: data.creditLimit ? Number(data.creditLimit) : 0,
        tags: data.tags
          ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };

      await api.put(`/customers/${id}`, payload);
      setSuccess("Customer updated successfully!");
      setTimeout(() => router.push("/sales/customers"), 1500);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Failed to update customer");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (loading) return <div className="p-6 text-center text-gray-500">Loading customer...</div>;

  return (
    <FormWrapper
      title="Edit Customer"
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSubmit(onSubmit)(e);
      }}
      submitLabel="Update Customer"
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
        {errors.customerType && <p className="text-red-900 text-xs mt-1">{errors.customerType.message}</p>}
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
            { value: "credit card", label: "Credit Card" },
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
