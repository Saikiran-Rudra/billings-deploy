"use client";

import FormWrapper from "@/components/form/FormWrapper";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import DataTable, { Column, TableAction } from "@/components/table/DataTable";
import { Link } from "lucide-react";
import { mockData } from "@/data/mock-data";
import { useRouter } from "next/navigation";

export default function ReceivablesPage() { 
    const router = useRouter();
    const columns:Column[] = [
        { header: " Invoice No  ", key: "invoiceNo" },
        { header: "Customer", key: "customer" },
        { header : "Amount", key: "amount" },
        { header: "Paid", key: "dueDate" },
        { header: "Balance", key: "Balance" },
        { header: "Status", key: "status" },

    ];
         
    return  (
        <div className="p-6 spac-y-6">
<div>

     <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold">Receivables</h2>
        <button onClick={() => router.push("receivables/new")} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          + Add Receivable
        </button>
      </div>
</div>
<>
        <DataTable columns={columns} data={[mockData]}  />  
</>
        </div>

    );


}
