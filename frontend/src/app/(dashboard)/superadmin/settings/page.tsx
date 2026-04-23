"use client";

import { useState, useEffect } from "react";
import { Settings, Shield, Bell, Eye } from "lucide-react";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      setSettings({
        general: {
          platformName: "Hisaab Kitaab",
          platformVersion: "v2.0.0",
          environment: "Production",
          timezone: "Asia/Kolkata",
        },
        security: {
          sessionTimeout: "30 minutes",
          passwordPolicy: "Strong (min 8 chars, numbers, special chars)",
          twoFactorAuth: "Enabled",
          encryptionMethod: "AES-256",
        },
        email: {
          emailProvider: "SendGrid",
          emailsPerDay: "10,000",
          emailQueueStatus: "Active",
          noreplyAddress: "noreply@hisaabkitaab.com",
        },
        notifications: {
          adminAlerts: "Enabled",
          trialExpiringAlerts: "Enabled",
          maintenanceNotifications: "Enabled",
          userOnboardingEmails: "Enabled",
        },
        database: {
          dbType: "MongoDB",
          backupFrequency: "Daily",
          lastBackup: "2024-04-17 02:30:00",
          dataRetention: "365 days",
        },
        api: {
          rateLimitPerMinute: "1000",
          apiVersion: "v1",
          webhooksEnabled: "Yes",
          apiDocumentation: "Available",
        },
      });
      setIsLoading(false);
    }, 800);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-96" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const SettingSection = ({ title, icon: Icon, settings: sectionSettings }: any) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <Icon size={24} className="text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-4">
        {Object.entries(sectionSettings).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center py-2">
            <span className="text-gray-700 font-medium capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </span>
            <span className="text-gray-900 font-semibold">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Settings size={32} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        </div>
        <p className="text-gray-600">Configure system-wide settings and preferences (View Only)</p>
      </div>

      {/* Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Note:</span> These settings are currently view-only. To make changes, please contact support.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <SettingSection title="General Settings" icon={Settings} settings={settings.general} />

        {/* Security Settings */}
        <SettingSection title="Security Settings" icon={Shield} settings={settings.security} />

        {/* Email Configuration */}
        <SettingSection title="Email Configuration" icon={Bell} settings={settings.email} />

        {/* Notifications */}
        <SettingSection title="Notifications" icon={Eye} settings={settings.notifications} />

        {/* Database Settings */}
        <SettingSection title="Database Settings" icon={Settings} settings={settings.database} />

        {/* API Settings */}
        <SettingSection title="API Settings" icon={Settings} settings={settings.api} />
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">System Health</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">API Server Status</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Operational
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Database Status</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Operational
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Email Service Status</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Operational
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">System Uptime</span>
            <span className="font-semibold text-gray-900">99.2%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
