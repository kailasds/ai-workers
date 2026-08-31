import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppShell() {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-screen w-screen overflow-hidden bg-page">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-page">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
