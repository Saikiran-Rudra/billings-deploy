import Link from "next/link";

const products = [
  { name: "Premium Widgets888", units: 145, amount: "₹1,45,000" },
  { name: "Standard Package", units: 89, amount: "₹89,000" },
  { name: "Deluxe Bundle", units: 67, amount: "₹1,34,000" },
  { name: "Basic Item", units: 54, amount: "₹27,000" },
];

const TopSellingProducts = () => {
  const maxUnits = Math.max(...products.map((product) => product.units));

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm min-w-[280px]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
          <p className="text-sm text-gray-500">Best performers by units sold this month.</p>
        </div>
        <Link href="/products" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View All</Link>
      </div>
      <ul className="space-y-4">
        {products.map((product, index) => (
          <li key={product.name} className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-gray-800">{product.name}</p>
              <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-4">
              <p className="text-xs text-gray-400">{product.units} units sold</p>
              <span className="text-sm font-semibold text-gray-900">{product.amount}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-gray-100">
              <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${(product.units / maxUnits) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopSellingProducts;
