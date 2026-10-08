import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppShell() {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-[100dvh] w-screen overflow-hidden bg-page">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto bg-page">
          <div className="mx-auto w-full max-w-[1280px]">
            <Outlet />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
