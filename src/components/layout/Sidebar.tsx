import React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  LayoutList,
  Wrench,
  Store,
  CreditCard,
  Briefcase,
  Building2,
  Users,
  ShoppingCart,
  Tag,
  Star,
  MessageSquare,
  Newspaper,
  FileText,
  Settings,
  UserCircle,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Circle,
  Dot,
} from "lucide-react";

type SubItem = { label: string; href: string; search?: Record<string, unknown> };
type Item = {
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  label: string;
  href?: string;
  expandable?: boolean;
  subItems?: SubItem[];
};

const items: Item[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: LayoutList, label: "Listings", expandable: true },
  {
    icon: Wrench,
    label: "Services",
    expandable: true,
    href: "/services",
    subItems: [
      { label: "Create Services", href: "/service-categories", search: undefined },
      { label: "All Services", href: "/services", search: undefined },
    ],
  },
  {
    icon: Store,
    label: "Vendors",
    expandable: true,
    href: "/vendors",
    subItems: [{ label: "All Vendors", href: "/vendors", search: undefined }],
  },
  {
    icon: Users,
    label: "Employees",
    expandable: true,
    href: "/employees",
    subItems: [{ label: "All Employees", href: "/employees", search: undefined }],
  },
  { icon: CreditCard, label: "Finance", expandable: true },
  { icon: Briefcase, label: "Jobs", expandable: true },
  { icon: Building2, label: "Employers", expandable: true },
  { icon: Users, label: "Job Seekers", expandable: true },
  { icon: ShoppingCart, label: "Orders" },
  { icon: Tag, label: "Coupons" },
  { icon: Star, label: "Reviews" },
  { icon: MessageSquare, label: "Messages" },
  { icon: Newspaper, label: "News & Blog", expandable: true },
  { icon: FileText, label: "Pages" },
  { icon: Settings, label: "Settings", expandable: true },
  { icon: UserCircle, label: "Users", expandable: true },
];

export function Sidebar({ open = true }: { open?: boolean }) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <aside
      className="fixed left-0 top-0 z-30 h-screen border-r bg-white flex flex-col overflow-hidden transition-all duration-200"
      style={{ width: open ? 220 : 0, borderColor: "#E5E7EB" }}
    >
      <div className="px-4 pt-4 pb-3">
        <Link to="/services" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#7C3AED" }}
          >
            <Briefcase size={18} color="#fff" />
          </div>
          <span className="font-extrabold text-[18px]" style={{ color: "#7C3AED" }}>
            Trak<span className="text-[#111827]">Jobs</span>
          </span>
        </Link>
      </div>

      <div
        className="mx-3 mb-2 pb-3 border-b flex items-center gap-2"
        style={{ borderColor: "#E5E7EB" }}
      >
        <div
          className="w-9 h-9 rounded-full text-white flex items-center justify-center font-bold"
          style={{ background: "#7C3AED" }}
        >
          A
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-[#111827] leading-tight">Admin</div>
          <div className="text-[11px] text-[#6B7280] leading-tight">Super Administrator</div>
        </div>
        <ChevronDown size={16} className="text-[#9CA3AF]" />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {items.map((it, i) => {
          const Icon = it.icon;
          const isSubActive = it.subItems?.some(
            (s) => pathname === s.href || pathname.startsWith(s.href + "/"),
          );
          const isActive =
            (it.href && (pathname === it.href || pathname.startsWith(it.href + "/"))) ||
            !!isSubActive;
          const Chevron = isActive ? ChevronUp : ChevronDown;
          const body = (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.025 }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
              style={{
                background: isActive ? "#EDE9FE" : "transparent",
                color: isActive ? "#7C3AED" : "#374151",
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "#F9FAFB";
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }}
            >
              <Icon size={18} color={isActive ? "#7C3AED" : "#6B7280"} />
              <span className="text-[13.5px] font-semibold flex-1">{it.label}</span>
              {it.expandable && <Chevron size={14} />}
            </motion.div>
          );
          return (
            <div key={it.label}>
              {it.href ? <Link to={it.href}>{body}</Link> : body}
              {isActive && it.subItems && (
                <div className="pl-9 pr-2 mt-1 mb-2 flex flex-col gap-1">
                  {it.subItems.map((s) => (
                    <Link
                      key={s.label}
                      to={s.href}
                      search={s.search}
                      className="flex items-center gap-2 py-1.5 text-[13px] cursor-pointer text-[#6B7280] font-medium hover:text-[#111827] transition-colors"
                      activeProps={{ style: { color: "#111827", fontWeight: 700 } }}
                    >
                      {({ isActive: isItemActive }) => (
                        <>
                          {isItemActive ? (
                            <Dot size={22} className="-ml-1.5" style={{ color: "#7C3AED" }} />
                          ) : (
                            <Circle size={6} className="ml-1" fill="#D1D5DB" stroke="none" />
                          )}
                          <span>{s.label}</span>
                        </>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div
        className="border-t px-4 py-3 flex items-center justify-between text-[13px] text-[#6B7280]"
        style={{ borderColor: "#E5E7EB" }}
      >
        <div className="flex items-center gap-2">
          <Globe size={16} />
          <span className="font-medium">View Website</span>
        </div>
        <ExternalLink size={14} />
      </div>
    </aside>
  );
}
