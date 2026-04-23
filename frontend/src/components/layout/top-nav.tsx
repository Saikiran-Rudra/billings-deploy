"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const quickActions = [
  { label: "Create invoices", description: "Start a new sales invoice", href: "/invoices/new", keywords: ["invoice", "sale", "billing"] },
  { label: "Add customer", description: "Create a new customer profile", href: "/customers/new", keywords: ["customer", "party", "contact"] },
  { label: "Record payment", description: "Capture a received payment", href: "/payments/new", keywords: ["payment", "collection", "receipt"] },
  { label: "Check receivables", description: "Review outstanding balances", href: "/receivables", keywords: ["receivables", "outstanding", "dues"] },
  { label: "Review stock", description: "Inspect inventory and low stock alerts", href: "/stock", keywords: ["stock", "inventory", "product"] },
  { label: "Open reports", description: "See sales and business performance", href: "/reports", keywords: ["report", "analytics", "sales"] },
];

const notifications = [
  { title: "3 invoices need follow-up", description: "Review overdue receivables and collect payment.", href: "/receivables" },
  { title: "Sales are up 12% today", description: "Open payments to verify fresh collections.", href: "/payments" },
];

const TopNav = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredActions = !normalizedQuery
    ? quickActions
    : quickActions.filter((action) =>
        [action.label, action.description, ...action.keywords].some((value) => value.toLowerCase().includes(normalizedQuery))
      );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (searchRef.current && !searchRef.current.contains(target)) {
        setIsSearchOpen(false);
      }

      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavigate = (href: string) => {
    router.push(href);
    setQuery("");
    setIsSearchOpen(false);
    setIsNotificationsOpen(false);
  };

  return (
    <div className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3">
      <div ref={searchRef} className="relative w-full max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsSearchOpen(true);
          }}
          onFocus={() => setIsSearchOpen(true)}
          placeholder="Search pages, tasks, and records..."
          className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-20 text-sm text-gray-600 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-gray-200 px-2 py-1 text-xs text-gray-400">
          Ctrl K
        </span>

        {isSearchOpen ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-20 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Quick Access
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredActions.length ? (
                filteredActions.map((action) => (
                  <button
                    key={action.href}
                    type="button"
                    onClick={() => handleNavigate(action.href)}
                    className="flex w-full items-start justify-between rounded-xl px-3 py-3 text-left transition hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{action.label}</p>
                      <p className="mt-1 text-xs text-gray-500">{action.description}</p>
                    </div>
                    <span className="text-xs font-medium text-emerald-600">Open</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-6 text-sm text-gray-500">No matches. Try invoice, customer, payment, or stock.</div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-4 ml-6">
        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className="relative rounded-lg p-2 transition hover:bg-gray-100"
          >
            <Bell size={20} className="text-gray-600" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {isNotificationsOpen ? (
            <div className="absolute right-0 top-[calc(100%+0.75rem)] z-20 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">Priority updates</p>
                <p className="mt-1 text-xs text-gray-500">Items that need action today.</p>
              </div>
              <div className="p-2">
                {notifications.map((notification) => (
                  <button
                    key={notification.title}
                    type="button"
                    onClick={() => handleNavigate(notification.href)}
                    className="w-full rounded-xl px-3 py-3 text-left transition hover:bg-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                    <p className="mt-1 text-xs text-gray-500">{notification.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {user ? `${user.firstName} ${user.lastName}`.trim() : "My Business"}
            </p>
            <p className="text-xs text-gray-500">{user?.email ?? "Owner"}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
            <User size={18} className="text-emerald-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
