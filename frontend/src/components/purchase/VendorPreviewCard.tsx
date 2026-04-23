"use client";

import { Phone, Mail, MapPin, Building2 } from "lucide-react";
import { SupplierSnapshot } from "@/lib/validations/purchase";

interface VendorPreviewCardProps {
  vendor: SupplierSnapshot | null;
  isLoading?: boolean;
  onClose?: () => void;
}

/**
 * VendorPreviewCard Component
 * Displays vendor/supplier details in a card format
 * Shows address, contact info, and GST details
 */
export default function VendorPreviewCard({
  vendor,
  isLoading = false,
  onClose,
}: VendorPreviewCardProps) {
  if (!vendor && !isLoading) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Vendor Details</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            ✕
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      ) : vendor ? (
        <div className="space-y-6">
          {/* Left Section: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Details */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Vendor Name</p>
                <p className="text-base font-semibold text-gray-900">
                  {vendor.supplierName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Company Name</p>
                <p className="text-base font-semibold text-gray-900">
                  {vendor.companyName}
                </p>
              </div>

              {/* Contact Information */}
              <div className="pt-4 space-y-3 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="text-gray-900 font-medium">{vendor.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium text-xs truncate">
                      {vendor.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section: Address & GST */}
            <div className="space-y-4">
              {/* Address */}
              <div>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    <p className="text-sm text-gray-900">
                      {vendor.address?.street}
                      <br />
                      {vendor.address?.city}, {vendor.address?.state}{" "}
                      {vendor.address?.pincode}
                    </p>
                  </div>
                </div>
              </div>

              {/* GST Details */}
              {vendor.isGSTRegistered && (
                <div className="pt-4 space-y-3 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <Building2
                      size={16}
                      className="text-green-600 mt-1 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">GST Number</p>
                      <p className="text-sm font-medium text-gray-900">
                        {vendor.gstNumber || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Tax Registration</p>
                    <p className="text-xs font-medium text-green-600">
                      ✓ GST Registered
                    </p>
                  </div>
                </div>
              )}

              {!vendor.isGSTRegistered && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">Tax Registration</p>
                  <p className="text-xs font-medium text-gray-600">
                    Not GST Registered
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tax Type Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-xs font-semibold text-blue-900 mb-1">
              TAX LOCATION
            </p>
            <p className="text-sm text-blue-700">
              State: <span className="font-medium">{vendor.state}</span>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              GST calculation will be determined automatically based on your company state
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
