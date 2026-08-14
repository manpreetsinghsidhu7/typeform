"use client";

import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { LogOut, Sun, Moon, Users } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Navbar() {
  const router = useRouter();
  const { isAuthenticated, isLoading, userInitial } = useAdminAuth(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("typeform_token");
    router.push("/login");
  };

  return (
    <header className="fixed top-0 w-full bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md z-50 border-b border-neutral-100 dark:border-neutral-800 h-16 flex items-center justify-between px-6 transition-colors">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => router.push("/")}
      >
        {/* Abstract Typeform-style Logo */}
        <div className="w-6 h-6 bg-[#191919] dark:bg-white flex items-center justify-center rounded-md">
          <div className="w-2 h-2 bg-white dark:bg-[#191919] rounded-sm" />
        </div>
        <span className="text-lg font-bold tracking-tight text-[#191919] dark:text-white">Typeform</span>
      </div>
      
      <div className="flex items-center gap-4">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        {/* Team Collaboration Placeholder */}
        <button 
          className="text-sm font-medium text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hidden md:flex items-center gap-2 opacity-60 cursor-not-allowed"
          title="Team Collaboration (Coming Soon)"
        >
          <Users size={16} /> <span className="hidden lg:inline">Team (Coming Soon)</span>
        </button>

        {!isLoading && (
          isAuthenticated ? (
            <>
              <button 
                onClick={() => router.push("/dashboard")}
                className="text-sm font-medium text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white hidden sm:block"
              >
                Workspace
              </button>
              <button 
                onClick={handleLogout}
                className="text-sm font-medium text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white flex items-center gap-2"
              >
                <LogOut size={16} /> <span className="hidden sm:inline">Log out</span>
              </button>
              <div className="w-8 h-8 bg-neutral-800 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-full flex items-center justify-center font-medium">
                {userInitial || "A"}
              </div>
            </>
          ) : (
            <>
              <button 
                onClick={() => router.push("/login")}
                className="text-sm font-medium text-neutral-900 dark:text-neutral-100 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors hidden sm:block"
              >
                Log in
              </button>
              <button 
                onClick={() => router.push("/register")}
                className="text-sm font-medium bg-[#191919] dark:bg-white text-white dark:text-black px-5 py-2 rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-transform active:scale-95"
              >
                Sign up
              </button>
            </>
          )
        )}
      </div>
    </header>
  );
}
