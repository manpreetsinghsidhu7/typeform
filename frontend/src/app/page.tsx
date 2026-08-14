"use client";

import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { LayoutTemplate, BarChart3, ChevronRight, LogOut } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, userInitial } = useAdminAuth(false);

  const handleLogout = () => {
    localStorage.removeItem("typeform_token");
    window.location.reload();
  };

  const fadeIn: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-[#191919] text-white font-sans selection:bg-white selection:text-black">
      {/* Navigation (Dark Mode specifically for Landing) */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 bg-[#191919]/50 backdrop-blur-md h-16 flex items-center justify-between px-6 lg:px-12"
      >
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
          <div className="w-6 h-6 bg-white flex items-center justify-center rounded-md">
            <div className="w-2 h-2 bg-black rounded-sm" />
          </div>
          <span className="text-lg font-bold tracking-tight">Typeform</span>
        </div>
        
        <div className="flex items-center gap-4">
          {!isLoading && (
            isAuthenticated ? (
              <>
                <button 
                  onClick={() => router.push("/dashboard")}
                  className="text-sm font-medium text-gray-300 hover:text-white hidden sm:block"
                >
                  Workspace
                </button>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-300 hover:text-white flex items-center gap-2"
                >
                  <LogOut size={16} /> Log out
                </button>
                <div className="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-medium border border-gray-700">
                  {userInitial || "A"}
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => router.push("/login")}
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block"
                >
                  Log in
                </button>
                <button 
                  onClick={() => router.push("/register")}
                  className="text-sm font-medium bg-white text-black px-5 py-2 rounded-full hover:bg-gray-200 transition-transform active:scale-95"
                >
                  Sign up
                </button>
              </>
            )
          )}
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 flex flex-col items-center justify-center min-h-[90vh] overflow-hidden">
        {/* Subtle dark gradient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
        
        <motion.div 
          className="w-full max-w-4xl text-center z-10"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            variants={fadeIn}
            className="text-5xl md:text-7xl lg:text-[80px] font-medium tracking-tight leading-[1.05] mb-8"
          >
            Your favorite forms. <br />
            Now with AI automation.
          </motion.h1>
          
          <motion.p 
            variants={fadeIn}
            className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto mb-10"
          >
            Create forms that feel like conversations. Get more responses and deeper insights.
          </motion.p>
          
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => router.push("/register")}
              className="bg-white text-black px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-200 transition-colors active:scale-95 w-full sm:w-auto"
            >
              Try for free
            </button>
            <button 
              onClick={() => router.push("/dashboard")}
              className="bg-transparent border border-gray-600 text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-800 transition-colors active:scale-95 w-full sm:w-auto"
            >
              Explore Public Forms
            </button>
          </motion.div>
        </motion.div>

        {/* Feature Cards below Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="w-full max-w-6xl mx-auto mt-24 grid md:grid-cols-3 gap-6 relative z-10"
        >
          {/* Card 1 */}
          <div className="bg-[#2A2A2A]/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-[#333] transition-colors group cursor-default">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">No-code forms</h3>
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                <LayoutTemplate size={16} className="text-gray-400" />
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Build and customize beautiful forms without writing a single line of code.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#2A2A2A]/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-[#333] transition-colors group cursor-default">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                AI Workflows 
                <span className="text-[10px] uppercase font-bold tracking-wider bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">Coming soon</span>
              </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Use AI to spot patterns and trigger automatic follow-ups based on responses.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#2A2A2A]/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-[#333] transition-colors group cursor-default">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Real-time Insights</h3>
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                <BarChart3 size={16} className="text-gray-400" />
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Analyze your responses as they come in. Spot trends and make data-driven decisions.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-[#191919] border-t border-gray-800 text-gray-500 py-12 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-500 flex items-center justify-center rounded-sm">
              <div className="w-1.5 h-1.5 bg-[#191919] rounded-sm" />
            </div>
            <span className="font-bold tracking-tight">Typeform</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Typeform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
