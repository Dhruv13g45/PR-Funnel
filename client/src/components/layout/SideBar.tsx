import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ComputerIcon,
  LayoutGrid,
  GitBranch,
  Database,
  Settings,
  UserCircle,
  LogOut,
} from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SideBar = () => {
  const [width, setWidth] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-width");
      return saved ? Number(saved) : 260;
    }
    return 260;
  });

  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  const { data: user } = useSession();
  const profileImage = user?.user?.image || undefined;
  const displayName = user?.user?.name || "GitHub user";
  const displayEmail = user?.user?.email || "No email available";

  const MIN_WIDTH = 300;
  const MAX_WIDTH = 450;

  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutGrid },
    { label: "GitHub App", to: "/github-app", icon: ComputerIcon },
    { label: "Pull Requests", to: "/pull-requests", icon: GitBranch },
    { label: "Repositories", to: "/repositories", icon: Database },
    { label: "Settings", to: "/settings", icon: Settings },
  ];

  useEffect(() => {
    localStorage.setItem("sidebar-width", width.toString());
  }, [width]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizing) return;
      const sidebar = sidebarRef.current;
      if (!sidebar) return;

      const newWidth = event.clientX - sidebar.getBoundingClientRect().left;
      setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth)));
    };

    const stopResize = () => setIsResizing(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResize);
    };
  }, [isResizing]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <aside
        ref={sidebarRef}
        style={{ width }}
        className="relative flex h-full flex-col shrink-0 border-r border-slate-900 bg-slate-950/80 backdrop-blur-xl select-none"
      >
        <div className="flex h-full flex-col gap-6 overflow-hidden px-4 py-5">
          {/* Top Panel - Logo, Title & Profile Dropdown */}
          <div className="relative flex flex-col gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/30 px-4 py-3 shadow-inner shadow-slate-950/20">
            <div className="flex items-center justify-between gap-3">
              <NavLink to="/dashboard" className="flex items-center gap-2.5 outline-none group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-md shadow-sky-500/10 group-hover:scale-105 transition-transform duration-200">
                  <GitBranch className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold tracking-wide bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    PR Funnel
                  </p>
                  <p className="text-[10px] font-semibold text-sky-400/80 tracking-wider uppercase">
                    Platform
                  </p>
                </div>
              </NavLink>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="relative group inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-slate-200 hover:border-slate-650 focus:outline-none cursor-pointer transition-all duration-205"
                  >
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserCircle className="h-5 w-5" />
                    )}
                    <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border border-slate-950" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="bottom"
                  sideOffset={8}
                  className="w-56 border border-slate-900 bg-slate-950 p-1.5 text-slate-200 shadow-2xl rounded-xl"
                >
                  <DropdownMenuLabel className="px-2 py-1.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-medium text-slate-500">Logged in as</span>
                      <span className="text-xs font-semibold text-slate-200 truncate">{displayName}</span>
                      <span className="text-[10px] text-slate-400 truncate">{displayEmail}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-900/60" />

                  {/* <DropdownMenuItem
                    asChild
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-900 hover:text-white cursor-pointer transition-colors focus:bg-slate-900 focus:text-white"
                  >
                    <a
                      href={`https://github.com/${displayName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4 text-slate-400" />
                      <span>GitHub Profile</span>
                    </a>
                  </DropdownMenuItem> */}

                  <DropdownMenuSeparator className="bg-slate-900/60" />

                  <DropdownMenuItem
                    onClick={async () => {
                      await authClient.signOut();
                      window.location.href = "/sign-in";
                    }}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 cursor-pointer transition-colors focus:bg-rose-950/20 focus:text-rose-300"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "relative flex items-center h-10 rounded-xl px-3 text-sm font-medium transition-all duration-200 outline-none group",
                    isActive
                      ? "text-sky-300 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  )}
                >

                  {isActive && (
                    <motion.div
                      layoutId="activeNavHighlight"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-900/80 to-slate-900/30 border border-slate-800/80 shadow-sm"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}


                  {isActive && (
                    <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-gradient-to-b from-sky-400 to-blue-500 shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                  )}


                  {!isActive && (
                    <div className="absolute inset-0 rounded-xl bg-slate-900/0 group-hover:bg-slate-900/40 border border-transparent group-hover:border-slate-900/60 transition-all duration-200" />
                  )}

                  <div className="relative z-10 flex items-center gap-3 w-full">
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200",
                        isActive
                          ? "text-sky-400 bg-sky-950/20"
                          : "text-slate-400 group-hover:text-slate-300 group-hover:bg-slate-900/20"
                      )}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[13px] tracking-wide">{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto px-2 py-1 border-t border-slate-900/40 flex items-center justify-between text-[11px] text-slate-500 font-medium tracking-wide">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Systems operational</span>
            </div>
            <span className="text-slate-600 font-mono">v1.0.0</span>
          </div>
        </div>


        <div
          className="absolute right-0 top-0 bottom-0 z-20 w-1 cursor-col-resize group"
          onMouseDown={() => setIsResizing(true)}
        >
          <div className={cn(
            "absolute right-0 top-0 bottom-0 w-[2px] transition-colors duration-200",
            isResizing ? "bg-sky-500" : "bg-slate-900 group-hover:bg-slate-700"
          )} />
        </div>
      </aside>


      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default SideBar;
