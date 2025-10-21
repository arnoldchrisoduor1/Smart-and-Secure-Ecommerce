"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  CreditCard,
  ListOrdered,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Users", href: "/users", icon: Users },
  { name: "Products", href: "/products", icon: ShoppingCart },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Orders", href: "/orders", icon: ListOrdered },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-white shadow-lg border border-gray-200 transition-transform active:scale-95"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && !isLargeScreen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 animate-fadeIn"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 z-40
          flex flex-col shadow-lg lg:shadow-none
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-20" : "w-64"}
          ${!isLargeScreen && !isOpen ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div
            className={`flex items-center gap-3 transition-all duration-300 ${
              isCollapsed ? "opacity-0 scale-75" : "opacity-100 scale-100"
            }`}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg" />
            <span className="font-bold text-lg text-gray-800 whitespace-nowrap">
              BeanCart
            </span>
          </div>

          {/* Collapse toggle - hidden on mobile */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-700 text-gray-600 hover:scale-105 active:scale-95 group relative"
              >
                <Icon size={20} className="flex-shrink-0" />

                <span
                  className={`ml-3 whitespace-nowrap transition-all duration-300 ${
                    isCollapsed
                      ? "opacity-0 w-0 overflow-hidden"
                      : "opacity-100"
                  }`}
                >
                  {item.name}
                </span>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {item.name}
                  </div>
                )}
              </a>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200">
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "gap-3"
            }`}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              A
            </div>

            <div
              className={`flex-1 min-w-0 transition-all duration-300 ${
                isCollapsed
                  ? "opacity-0 w-0 overflow-hidden"
                  : "opacity-100"
              }`}
            >
              <p className="text-sm font-medium text-gray-800 truncate">
                Admin User
              </p>
              <p className="text-xs text-gray-500 truncate">
                admin@beancart.com
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
}