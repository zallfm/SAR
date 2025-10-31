import React, { useMemo, useState } from "react";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import Version from "../common/Version";
import type { ActiveView } from "../../store/uiStore";
import type { MenuItem } from "../../api/auth.api";

// props
interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  items: MenuItem[];
  loading?: boolean;
  error?: string | null;
}

/**
 * Map backend MENU_ID → frontend view name
 * (samakan dengan switch-case di Dashboard.tsx)
 */
const idToView: Record<string, ActiveView> = {
  Dashboard: "dashboard",
  LogMonitoring: "logging_monitoring",
  Application: "application",
  Schedule: "schedule",
  SystemMaster: "system_master",
  UAR_PIC: "uar_pic",
  UAR_Division_User: "uar_division_user",
  UAR_Latest_Role: "uar_latest_role",
  UAR_Progress: "uar_progress",
  UAR_System_Owner: "uar_system_owner",
};

const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  items,
  loading,
  error,
}) => {
  // open state untuk dropdown parent
  const [open, setOpen] = useState<Record<string, boolean>>({});

  // cari root menus (parent === 'menu')
  const roots = useMemo(
    () => items?.filter((i) => (i.parent ?? "menu") === "menu") ?? [],
    [items]
  );

  // tombol menu
  const NavItem: React.FC<{ item: MenuItem; indent?: boolean }> = ({
    item,
    indent,
  }) => {
    const view = idToView[item.menuId] ?? "dashboard";
    const hasChildren = item.submenu && item.submenu.length > 0;
    const isActive =
      view === "logging_monitoring"
        ? activeView === "logging_monitoring" ||
          activeView === "logging_monitoring_detail"
        : view === "uar_division_user"
        ? activeView === "uar_division_user" ||
          activeView === "uar_division_user_detail"
        : view === "uar_system_owner"
        ? activeView === "uar_system_owner" ||
          activeView === "uar_system_owner_detail"
        : activeView === view;

    // kalau punya anak → dropdown
    if (hasChildren) {
      const isOpen = open[item.menuId] ?? true;
      return (
        <div>
          <button
            className="flex items-center justify-between w-full text-sm font-medium px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-200"
            onClick={() =>
              setOpen((prev) => ({ ...prev, [item.menuId]: !isOpen }))
            }
            aria-expanded={isOpen}
          >
            <span>{item.menuText}</span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isOpen && (
            <div className="mt-1 space-y-1">
              {item.submenu!.map((child) => (
                <NavItem key={child.menuId} item={child} indent />
              ))}
            </div>
          )}
        </div>
      );
    }

    // leaf item → navigasi langsung
    return (
      <button
        onClick={() => setActiveView(view)}
        className={`flex items-center w-full text-left text-sm font-medium px-4 py-2.5 rounded-lg transition-colors ${
          isActive
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700 hover:bg-gray-200"
        } ${indent ? "pl-8" : ""}`}
      >
        {item.menuText}
      </button>
    );
  };

  // state loading
  if (loading) {
    return (
      <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
        <div className="p-4 text-sm text-gray-500">Loading menu...</div>
        <Version />
      </aside>
    );
  }

  // state error
  if (error) {
    return (
      <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
        <div className="p-4 text-sm text-red-600">
          Failed to load menu: {error}
        </div>
        <Version />
      </aside>
    );
  }

  // menu normal
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 flex-1">
        <nav className="space-y-1">
          {roots.map((root) => (
            <NavItem key={root.menuId} item={root} />
          ))}
        </nav>
      </div>
      <Version />
    </aside>
  );
};

export default Sidebar;
