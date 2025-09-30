"use client";

import { Grid, Map } from "lucide-react";

const TRANSPORT_TABS = [
  { id: "list", label: "List View", icon: Grid },
  { id: "map", label: "Map View", icon: Map },
];

export default function TransportTabs({ activeTab, onTabChange }) {
  return (
    <div className="bg-white border-b border-gray-200  top-0 mb-8">
      <div className="max-w-6xl mx-auto px-6 ">
        <div className="flex z-0 overflow-x-auto">
          {TRANSPORT_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center  gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
