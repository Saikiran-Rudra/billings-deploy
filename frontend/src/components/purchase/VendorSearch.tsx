"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Plus } from "lucide-react";

interface Supplier {
  _id: string;
  id?: string;
  supplierName: string;
  companyName?: string;
  billingAddress?: {
    state?: string;
  };
}

interface VendorSearchProps {
  suppliers: Supplier[];
  value: string;
  onSelect: (supplierId: string) => void;
  onAddNew: () => void;
  isLoading?: boolean;
}

export default function VendorSearch({
  suppliers,
  value,
  onSelect,
  onAddNew,
  isLoading = false,
}: VendorSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>(suppliers);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suppliers based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSuppliers(suppliers);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredSuppliers(
        suppliers.filter(
          (s) =>
            s.supplierName.toLowerCase().includes(term) ||
            s.companyName?.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, suppliers]);

  // Get selected supplier
  const selectedSupplier = suppliers.find((s) => (s._id || s.id) === value);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle vendor select
  const handleSelect = (supplierId: string) => {
    onSelect(supplierId);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get avatar background color
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-red-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-indigo-500",
      "bg-cyan-500",
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium mb-1">
        Select Vendor<span className="text-red-500 ml-1">*</span>
      </label>

      {/* Main Button/Input */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left"
      >
        <span className={selectedSupplier ? "text-gray-900" : "text-gray-500"}>
          {selectedSupplier ? selectedSupplier.supplierName : "Select a Vendor"}
        </span>
        <Search size={20} className="text-gray-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Vendor List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier) => (
                <button
                  key={supplier._id || supplier.id}
                  type="button"
                  onClick={() =>
                    handleSelect(supplier._id || supplier.id || "")
                  }
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition ${
                    (supplier._id || supplier.id) === value ? "bg-blue-100" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full ${getAvatarColor(
                      supplier.supplierName
                    )} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-white text-sm font-semibold">
                      {getInitials(supplier.supplierName)}
                    </span>
                  </div>

                  {/* Supplier Info */}
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {supplier.supplierName}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <span>🏢</span>
                      {supplier.companyName || "N/A"}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500">
                No vendors found
              </div>
            )}
          </div>

          {/* Add New Vendor Button */}
          <button
            type="button"
            onClick={() => {
              onAddNew();
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 border-t border-gray-200 font-medium"
          >
            <Plus size={18} />
            New Vendor
          </button>
        </div>
      )}
    </div>
  );
}
