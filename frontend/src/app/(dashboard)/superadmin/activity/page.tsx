"use client";

import { useState, useEffect } from "react";
import { Activity, User, Building, LogOut, UserPlus, Settings } from "lucide-react";

export default function ActivityPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setActivities([
        {
          id: "1",
          type: "login",
          user: "Rajesh Kumar",
          company: "Tech Innovations Ltd",
          action: "User login",
          timestamp: "2024-04-17 14:32:00",
          description: "Successful login from IP 192.168.1.100",
        },
        {
          id: "2",
          type: "user_created",
          user: "Priya Sharma",
          company: "Fashion Forward Inc",
          action: "New user created",
          timestamp: "2024-04-17 13:45:00",
          description: "Created user: Rajesh Desai",
        },
        {
          id: "3",
          type: "plan_upgraded",
          user: "Amit Patel",
          company: "GreenEnergy Solutions",
          action: "Plan upgraded",
          timestamp: "2024-04-17 12:20:00",
          description: "Upgraded from Starter to Professional",
        },
        {
          id: "4",
          type: "settings_updated",
          user: "Neha Singh",
          company: "Digital Marketing Pro",
          action: "Settings updated",
          timestamp: "2024-04-17 11:15:00",
          description: "Updated company settings",
        },
        {
          id: "5",
          type: "login",
          user: "Vikram Patel",
          company: "Fashion Forward Inc",
          action: "User login",
          timestamp: "2024-04-17 10:05:00",
          description: "Successful login from IP 192.168.1.50",
        },
        {
          id: "6",
          type: "user_created",
          user: "Admin User",
          company: "Tech Innovations Ltd",
          action: "New user created",
          timestamp: "2024-04-17 09:30:00",
          description: "Created user: Priya Desai",
        },
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const getActivityIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      login: <LogOut size={16} className="text-blue-600" />,
      user_created: <UserPlus size={16} className="text-green-600" />,
      plan_upgraded: <Activity size={16} className="text-purple-600" />,
      settings_updated: <Settings size={16} className="text-orange-600" />,
    };
    return icons[type] || <Activity size={16} className="text-gray-600" />;
  };

  const getActivityColor = (type: string) => {
    const colors: { [key: string]: string } = {
      login: "bg-blue-50",
      user_created: "bg-green-50",
      plan_upgraded: "bg-purple-50",
      settings_updated: "bg-orange-50",
    };
    return colors[type] || "bg-gray-50";
  };

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Activity size={32} className="text-orange-600" />
          <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        </div>
        <p className="text-gray-600">System-wide activity and user actions</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Activities (24h)</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{activities.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Logins</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {activities.filter((a) => a.type === "login").length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Changes Made</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {activities.filter((a) => a.type !== "login").length}
          </p>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className={`rounded-lg p-4 border border-gray-200 ${getActivityColor(activity.type)}`}>
            <div className="flex items-start gap-4">
              <div className="mt-1">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">{activity.action}</h3>
                  <span className="text-xs text-gray-500">{activity.timestamp}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">{activity.user}</span> • {activity.company}
                </p>
                <p className="text-sm text-gray-700">{activity.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium">
          Load More Activities
        </button>
      </div>
    </div>
  );
}
