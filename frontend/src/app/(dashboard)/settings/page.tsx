import ProductConfigSettings from "@/components/settings/ProductConfigSettings";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-gray-500 mt-2">Manage your account and application settings here.</p>
      </div>

      {/* Product Configuration */}
      <ProductConfigSettings />
    </div>
  );
}
