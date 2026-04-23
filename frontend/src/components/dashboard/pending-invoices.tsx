import Link from "next/link";

interface Invoice {
  id: string;
  company: string;
  amount: string;
  date: string;
  overdue?: boolean;
}

const invoices: Invoice[] = [
  { id: "INV-1247", company: "ABC Corporation", amount: "₹45,000", date: "Jan 25, 2026" },
  { id: "INV-1235", company: "XYZ Enterprises", amount: "₹28,000", date: "Overdue", overdue: true },
  { id: "INV-1198", company: "Tech Solutions Ltd", amount: "₹67,000", date: "Jan 28, 2026" },
];

const PendingInvoices = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm min-w-[320px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Pending Invoices</h3>
          <p className="text-sm text-gray-500">Prioritize overdue invoices before they age further.</p>
        </div>
        <Link href="/invoices" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View All</Link>
      </div>
      <div className="space-y-3">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="rounded-lg border border-gray-100 p-3 transition hover:bg-gray-50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800">{invoice.id}</p>
                <p className="text-xs text-gray-400">{invoice.company}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{invoice.amount}</p>
                <p className={`text-xs ${invoice.overdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                  {invoice.date}
                </p>
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-4 text-sm font-medium">
              <Link href="/invoices" className="text-gray-500 hover:text-gray-700">View Invoice</Link>
              <Link href="/payments/new" className="text-emerald-600 hover:text-emerald-700">
                {invoice.overdue ? "Record Payment" : "Send Reminder"}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingInvoices;
