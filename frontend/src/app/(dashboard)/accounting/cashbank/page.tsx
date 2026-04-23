"use client";
import { Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { cashbank_Data } from "@/data/mock-data";
import DataTable from "@/components/table/DataTable";
import type { Column } from "@/components/table/DataTable";

const cashbankColumns: Column[] = [
  { key: "date", header: "Date" },
  { key: "description", header: "Description" },
  { key: "amount", header: "Amount" },
  { key: "mode", header: "Mode" },
  { key: "balance", header: "Balance" },
];

export default function CashbankPage() {
  const router = useRouter();

  return (
    <>
      <div className="w-full p-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-4">Cash &amp; Bank</h1>
        <button onClick={() => router.push("/accounting/cashbank/new")} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">+ Add Records</button>
      </div>

      <div className="flex flex-row gap-4 px-8">
        <div className="bg-gradient-to-r from-[#AD46FF] to-[#9810FA] rounded-lg shadow-md w-xl p-6 mx-5">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4"><Wallet /></div>
            <div>
              <h2 className="text-lg font-semibold text-white">Cash in Hand</h2>
              <p className="text-md text-white">Balance: 5,000</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-[#2B7FFF] to-[#155DFC] rounded-lg shadow-md w-xl p-6 mx-5">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4"><Wallet /></div>
            <div>
              <h2 className="text-lg font-semibold text-white">Bank Account</h2>
              <p className="text-md text-white">Balance: 20,000</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4">
        <DataTable columns={cashbankColumns} data={cashbank_Data} />
      </div>
    </>
  );
}
