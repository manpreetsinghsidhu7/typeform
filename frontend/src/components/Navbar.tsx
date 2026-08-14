"use client";

import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { LogOut } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const { isAuthenticated, isLoading, userInitial } = useAdminAuth(false);

  const handleLogout = () => {
    localStorage.removeItem("typeform_token");
    router.push("/login");
  };

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 h-16 flex items-center justify-between px-6">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => router.push("/")}
      >
        {/* Abstract Typeform-style Logo */}
        <div className="w-6 h-6 bg-[#191919] flex items-center justify-center rounded-md">
          <div className="w-2 h-2 bg-white rounded-sm" />
        </div>
        <span className="text-lg font-bold tracking-tight text-[#191919]">Typeform</span>
      </div>
      
      <div className="flex items-center gap-4">
        {!isLoading && (
          isAuthenticated ? (
            <>
              <button 
                onClick={() => router.push("/dashboard")}
                className="text-sm font-medium text-gray-600 hover:text-black hidden sm:block"
              >
                Workspace
              </button>
              <button 
                onClick={handleLogout}
                className="text-sm font-medium text-gray-600 hover:text-black flex items-center gap-2"
              >
                <LogOut size={16} /> Log out
              </button>
              <div className="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-medium">
                {userInitial || "A"}
              </div>
            </>
          ) : (
            <>
              <button 
                onClick={() => router.push("/login")}
                className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors hidden sm:block"
              >
                Log in
              </button>
              <button 
                onClick={() => router.push("/register")}
                className="text-sm font-medium bg-[#191919] text-white px-5 py-2 rounded-md hover:bg-gray-800 transition-transform active:scale-95"
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
