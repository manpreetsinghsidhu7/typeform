"use client";

import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { LayoutTemplate, BarChart3, Bot, GitBranch, Mail, Workflow, CheckCircle2 } from "lucide-react";

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
    <div className="min-h-screen bg-[#191919] text-white font-sans selection:bg-white selection:text-black overflow-x-hidden">
      
      {/* Navigation */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 bg-[#191919]/80 backdrop-blur-md h-16 flex items-center justify-between px-6 lg:px-12"
      >
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
          <div className="w-5 h-5 bg-white flex items-center justify-center rounded-sm">
            <div className="w-1.5 h-1.5 bg-[#191919] rounded-sm" />
          </div>
          <span className="text-lg font-bold tracking-tight">Typeform</span>
        </div>
        
        <div className="flex items-center gap-4">
          {!isLoading && (
            isAuthenticated ? (
              <>
                <button 
                  onClick={() => router.push("/dashboard")}
                  className="text-sm font-medium text-neutral-300 hover:text-white hidden sm:block"
                >
                  Workspace
                </button>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-medium text-neutral-300 hover:text-white flex items-center gap-2"
                >
                  Log out
                </button>
                <div className="w-8 h-8 bg-neutral-800 text-white rounded-full flex items-center justify-center font-medium border border-neutral-700">
                  {userInitial || "A"}
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => router.push("/login")}
                  className="text-sm font-medium text-neutral-300 hover:text-white transition-colors hidden sm:block"
                >
                  Log in
                </button>
                <button 
                  onClick={() => router.push("/register")}
                  className="text-sm font-medium bg-white text-black px-4 py-1.5 rounded-md hover:bg-neutral-200 transition-colors"
                >
                  Sign up
                </button>
              </>
            )
          )}
        </div>
      </motion.header>

      {/* Massive Central Glow */}
      <div className="absolute top-[30vh] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[#9e27b0]/20 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 flex flex-col items-center justify-center text-center">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-4xl w-full">
          
          <motion.h1 variants={fadeIn} className="text-[56px] md:text-[72px] lg:text-[84px] font-medium tracking-tight leading-[1.05] mb-6 font-serif">
            Your favorite forms.<br />
            Now with AI automation.
          </motion.h1>
          
          <motion.p variants={fadeIn} className="text-[17px] md:text-[20px] text-neutral-300 font-light max-w-2xl mx-auto mb-10">
            Create beautiful forms that feel like conversations. Let AI handle the follow-ups and data routing automatically.
          </motion.p>
          
          <motion.div variants={fadeIn}>
            <button 
              onClick={() => router.push("/register")}
              className="bg-white text-black px-6 py-3 rounded-md font-medium text-[15px] hover:bg-neutral-200 transition-colors"
            >
              Get started for free
            </button>
          </motion.div>
          
          <motion.div variants={fadeIn} className="mt-8 flex items-center justify-center gap-6 text-xs text-neutral-500 uppercase tracking-widest font-semibold">
            <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-neutral-400"/> No credit card required</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-neutral-400"/> Cancel anytime</div>
          </motion.div>

        </motion.div>
      </section>

      {/* Central Video / App Preview */}
      <section className="px-6 relative z-10 flex justify-center pb-32">
         <motion.div 
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.6, duration: 0.8 }}
           className="w-full max-w-5xl rounded-2xl border border-neutral-700/50 bg-[#222] aspect-[16/9] shadow-2xl overflow-hidden relative group"
         >
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-50 mix-blend-overlay transition-transform duration-700 group-hover:scale-105" />
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 cursor-pointer hover:bg-white/30 transition-colors">
               <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-white border-b-8 border-b-transparent ml-1" />
             </div>
           </div>
           
           {/* Mock Form Overlay */}
           <div className="absolute bottom-8 left-8 bg-[#A4B372] rounded-xl border border-white/20 shadow-2xl p-6 w-80">
              <h4 className="text-black font-bold text-lg leading-tight mb-4">Share your email to get a free class</h4>
              <div className="bg-white/50 text-black text-sm p-3 rounded mb-4 w-full placeholder:text-black/50">name@example.com</div>
              <div className="bg-black text-[#A4B372] text-sm py-2 px-4 rounded inline-block font-bold">Submit</div>
           </div>
         </motion.div>
      </section>

      {/* Features Section 1 */}
      <section className="py-24 px-6 max-w-6xl mx-auto border-t border-neutral-800">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="w-full md:w-1/3">
            <div className="text-purple-400 text-sm font-bold tracking-widest uppercase mb-4">Creation</div>
            <h2 className="text-4xl font-serif mb-6 leading-tight">Build forms at the speed of thought</h2>
            <p className="text-neutral-400 text-lg font-light mb-8">
              Just start typing. Typeform's intuitive builder and AI suggestions help you craft the perfect questions in minutes.
            </p>
            <button className="text-white border border-neutral-600 rounded-md px-6 py-2 text-sm hover:bg-white hover:text-black transition-colors">
              Try it out
            </button>
          </div>
          <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeatureCard icon={<LayoutTemplate/>} title="No-code builder" desc="Drag and drop questions, customize design, and publish in a click." />
            <FeatureCard icon={<Bot/>} title="AI Generation" desc="Describe what you want to ask, and let AI build the form." badge="Coming soon" />
            <FeatureCard icon={<BarChart3/>} title="Real-time analytics" desc="Watch responses roll in with beautiful charts and summaries." />
            <FeatureCard icon={<GitBranch/>} title="Logic jumps" desc="Create personalized paths based on respondent answers." badge="Coming soon" />
          </div>
        </div>
      </section>

      {/* Features Section 2 */}
      <section className="py-24 px-6 max-w-6xl mx-auto border-t border-neutral-800 relative">
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
        
        <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
          <div className="w-full md:w-1/3">
            <div className="text-blue-400 text-sm font-bold tracking-widest uppercase mb-4">Automation</div>
            <h2 className="text-4xl font-serif mb-6 leading-tight">When the form ends, the flow begins.</h2>
            <p className="text-neutral-400 text-lg font-light mb-8">
              Connect your forms to thousands of apps. Automatically route data, trigger emails, and update your CRM.
            </p>
            <button className="text-white border border-neutral-600 rounded-md px-6 py-2 text-sm hover:bg-white hover:text-black transition-colors">
              Explore integrations
            </button>
          </div>
          <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeatureCard icon={<Workflow/>} title="Smart routing" desc="Send data to different tools based on how people answer." badge="Coming soon" />
            <FeatureCard icon={<Mail/>} title="Email follow-ups" desc="Trigger personalized emails immediately after submission." badge="Coming soon" />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-6 max-w-5xl mx-auto border-t border-neutral-800 text-center">
        <h2 className="text-2xl font-light text-neutral-300 mb-12">Join 150,000+ businesses doing event-driven Typeform</h2>
        <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale">
          {/* Mock Logos */}
          <div className="text-2xl font-bold tracking-tighter">Acme Corp</div>
          <div className="text-xl font-serif italic">Globex</div>
          <div className="text-2xl font-black uppercase">Soylent</div>
          <div className="text-2xl font-medium tracking-widest">Initech</div>
          <div className="text-2xl font-light">Stark Ind.</div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center border-t border-neutral-800 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-white/5 blur-[100px] rounded-full pointer-events-none -z-10" />
        <h2 className="text-5xl font-serif mb-8">AI forms and automation.<br/>All in Typeform.</h2>
        <button 
          onClick={() => router.push("/register")}
          className="bg-white text-black px-8 py-3 rounded-md font-medium text-[15px] hover:bg-neutral-200 transition-colors"
        >
          Get started for free
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-[#111] border-t border-neutral-800 text-neutral-500 py-16 text-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 bg-neutral-500 flex items-center justify-center rounded-sm">
                <div className="w-1.5 h-1.5 bg-[#111] rounded-sm" />
              </div>
              <span className="font-bold tracking-tight text-white">Typeform</span>
            </div>
            <p className="text-xs">&copy; {new Date().getFullYear()} Typeform Clone.<br/>All rights reserved.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Forms</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Surveys</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Templates</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Contact Form</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Feedback Survey</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Registration Form</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, badge }: { icon: React.ReactNode, title: string, desc: string, badge?: string }) {
  return (
    <div className="bg-[#222] border border-neutral-800 rounded-xl p-6 hover:bg-[#2a2a2a] transition-colors group">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-[#333] rounded-lg flex items-center justify-center text-neutral-300 group-hover:bg-[#444] transition-colors">
          {icon}
        </div>
        {badge && <span className="text-[10px] uppercase font-bold tracking-wider bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">{badge}</span>}
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-neutral-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}
