"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem("typeform_token");
  }, []);

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Za-z]/.test(pass) || !/[0-9]/.test(pass)) {
      return "Password must contain both letters and numbers.";
    }
    return "";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const passError = validatePassword(password);
    if (passError) {
      setError(passError);
      return;
    }

    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      localStorage.setItem("typeform_token", res.data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-neutral-900 font-sans">
      {/* Top Navbar */}
      <div className="fixed top-0 w-full h-16 flex items-center justify-between px-6 lg:px-12 z-50 bg-white">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-5 h-5 bg-[#191919] flex items-center justify-center rounded-sm">
            <div className="w-1.5 h-1.5 bg-white rounded-sm" />
          </div>
          <span className="font-bold tracking-tight text-[#191919] text-xl">Typeform</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-sm text-neutral-600">
            Have a question? <span className="underline cursor-pointer hover:text-neutral-900 font-medium">Contact us</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-neutral-200 rounded-md text-sm text-neutral-700 cursor-pointer hover:bg-neutral-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            English
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {/* Left Column - Auth */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 pt-16">
        <div className="w-full max-w-[360px]">
          <h1 className="text-[28px] font-normal text-neutral-900 mb-2">Log in</h1>
          <p className="text-neutral-500 mb-8 text-[15px] leading-relaxed">
            Build forms, gather responses, and automate your workflows.
          </p>

          <div className="space-y-3 mb-6 relative group">
            <button disabled className="w-full bg-white border border-neutral-300 rounded-md py-2.5 flex items-center justify-center gap-3 font-medium text-sm text-neutral-700 opacity-80 cursor-not-allowed hover:bg-neutral-50 transition-colors">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
            <button disabled className="w-full bg-white border border-neutral-300 rounded-md py-2.5 flex items-center justify-center gap-3 font-medium text-sm text-neutral-700 opacity-80 cursor-not-allowed hover:bg-neutral-50 transition-colors">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 21 21"><path d="M10 0H0v10h10V0z" fill="#f25022"/><path d="M21 0H11v10h10V0z" fill="#7fba00"/><path d="M10 11H0v10h10V11z" fill="#00a4ef"/><path d="M21 11H11v10h10V11z" fill="#ffb900"/></svg>
              Continue with Microsoft
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-md">{error}</div>}
            
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Email</label>
              <input
                type="text"
                required
                className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-shadow"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-shadow"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3D3A42] text-white rounded-md py-3 text-sm font-medium hover:bg-[#2A272E] transition-colors mt-2"
            >
              {loading ? "Logging in..." : "Continue with email"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-sm font-medium underline text-neutral-600 cursor-not-allowed opacity-70">Log in with SSO</span>
          </div>

          <div className="mt-12 text-center text-sm text-neutral-500">
            Don't have an account? <span onClick={() => router.push("/register")} className="underline cursor-pointer font-medium text-neutral-900">Sign up</span>
          </div>
        </div>
      </div>

      {/* Right Column - Carousel UI perfectly matching Typeform */}
      <div className="hidden lg:flex w-1/2 bg-[#2D2633] items-center justify-center p-12 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2D2633] via-[#3B2947] to-[#1E1724]" />
        
        <div className="text-center z-10 w-full max-w-[550px]">
          <h2 className="text-[22px] text-white mb-10 leading-snug">
            Continue exploring powerful features <br />
            that make data collection effortless
          </h2>
          
          <div className="w-full aspect-[1.4/1] rounded-[24px] border border-neutral-700/50 bg-[#151118] p-6 relative overflow-hidden shadow-2xl flex flex-col items-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none" />
            
            <h3 className="text-white text-base font-medium mt-4 relative z-10">Manage your audience</h3>
            <p className="text-neutral-300 font-medium text-lg mb-8 relative z-10">Enrich and segment contacts automatically</p>
            
            <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center">
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 px-4 border border-white/10 flex items-center gap-3 text-white text-sm shadow-xl absolute top-10 right-10">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">👤</div>
                Enrich contact data
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 px-4 border border-white/10 flex items-center gap-3 text-white text-sm shadow-xl absolute top-24 right-20">
                <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold">👤+</div>
                Add new contact<br/><span className="text-[10px] bg-white text-black px-1 rounded ml-1">Prospect List</span>
              </div>
              
              <div className="w-64 h-32 bg-[#A4B372] rounded-xl border border-white/20 shadow-2xl mt-auto relative overflow-hidden flex items-center">
                <div className="p-4 flex-1">
                  <h4 className="text-black font-bold text-sm leading-tight mb-2">Share your email<br/>to get a free class</h4>
                  <div className="bg-white/50 text-black text-[10px] p-1.5 rounded mb-2 w-3/4">robin.smith@example.com</div>
                  <div className="bg-black text-[#A4B372] text-[10px] py-1.5 px-3 rounded inline-block font-bold">Submit</div>
                </div>
                <div className="w-1/3 h-full bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=200&auto=format&fit=crop")' }} />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 mt-8">
            <ChevronLeft className="w-4 h-4 text-neutral-500 cursor-not-allowed" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <ChevronRight className="w-4 h-4 text-neutral-500 cursor-not-allowed" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronLeft(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"/></svg>
}
function ChevronRight(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>
}
