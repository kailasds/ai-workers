import { Search, Bell, HelpCircle, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AskWorkforceAI } from "@/components/shared/ask-workforce-ai";

export function Topbar() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-6 border-b border-border bg-card px-6">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card-sunken px-3.5 h-9 w-80 shrink-0 text-ink-faint">
        <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        <input
          placeholder="Search workers, customers, environments…"
          className="w-full min-w-0 bg-transparent text-[13px] text-ink placeholder:text-ink-faint outline-none"
        />
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3 shrink-0">
        <AskWorkforceAI />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-full border border-status-green/25 bg-status-green-soft px-3 h-8 text-[11.5px] font-semibold text-status-green">
              <span className="h-1.5 w-1.5 rounded-full bg-status-green" />
              PRODUCTION
              <ChevronDown className="h-3 w-3" strokeWidth={2} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem>Production</DropdownMenuItem>
            <DropdownMenuItem>Staging</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sandbox</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="h-6 w-px bg-border shrink-0" />

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="relative grid h-9 w-9 place-items-center rounded-lg text-ink-mute transition hover:bg-card-sunken hover:text-ink">
                <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
                <span className="absolute right-1.5 top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-status-red text-[9px] font-bold text-white">
                  3
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent>3 need attention</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="grid h-9 w-9 place-items-center rounded-lg text-ink-mute transition hover:bg-card-sunken hover:text-ink">
                <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Help</TooltipContent>
          </Tooltip>
        </div>

        <span className="h-6 w-px bg-border shrink-0" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg pl-1.5 pr-2 h-9 transition hover:bg-card-sunken">
              <Avatar className="h-7 w-7">
                <AvatarFallback>AW</AvatarFallback>
              </Avatar>
              <span className="text-[12.5px] font-medium text-ink-soft">awpadmin</span>
              <ChevronDown className="h-3.5 w-3.5 text-ink-faint" strokeWidth={1.75} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem>Profile settings</DropdownMenuItem>
            <DropdownMenuItem>API keys</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
