import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export function MainLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="min-h-screen" style={{ background: "#F9FAFB" }}>
      <Sidebar open={open} />
      <div className="flex flex-col min-h-screen transition-[margin] duration-200" style={{ marginLeft: open ? 220 : 0 }}>
        <Navbar onToggleSidebar={() => setOpen((v) => !v)} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
