"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Form } from "@/types";
import { useRouter } from "next/navigation";
import { Plus, FileText, Settings, Trash2, LogOut } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function Dashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, userInitial } = useAdminAuth(false);

  useEffect(() => {
    if (!authLoading) {
      fetchForms();
    }
  }, [authLoading, isAuthenticated]);

  const fetchForms = async () => {
    try {
      const res = await api.get("/forms");
      setForms(res.data);
    } catch (error) {
      console.error("Failed to fetch forms", error);
    } finally {
      setLoading(false);
    }
  };

  const createForm = async () => {
    try {
      const res = await api.post("/forms", { title: "Untitled Form" });
      router.push(`/forms/${res.data.id}/edit`);
    } catch (error) {
      console.error("Failed to create form", error);
    }
  };

  const deleteForm = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this form?")) return;
    try {
      await api.delete(`/forms/${id}`);
      fetchForms();
    } catch (error) {
      console.error("Failed to delete form", error);
    }
  };

  if (authLoading || loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  }

  const handleLogout = () => {
    localStorage.removeItem("typeform_token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">TypeForm</h1>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button 
                onClick={handleLogout}
                className="text-sm font-medium text-gray-600 hover:text-black flex items-center gap-2"
              >
                <LogOut size={16} /> Logout
              </button>
              <div className="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-medium">
                {userInitial || "A"}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => router.push('/login')} className="text-sm font-medium text-gray-600 hover:text-black">Login</button>
              <button onClick={() => router.push('/register')} className="text-sm font-medium bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">Register</button>
            </>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-light text-gray-700">{isAuthenticated ? "My Workspace" : "Public Forms"}</h2>
          {isAuthenticated && (
            <button
              onClick={createForm}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-md font-medium transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Create Form
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isAuthenticated && (
            <button
              onClick={createForm}
              className="h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-100/50 transition-all cursor-pointer"
            >
              <Plus size={32} className="mb-2" />
              <span className="font-medium">New form</span>
            </button>
          )}

          {forms.map((form) => (
            <div
              key={form.id}
              onClick={() => router.push(isAuthenticated ? `/forms/${form.id}/edit` : `/f/${form.id}`)}
              className="h-48 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex-1 p-6 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-100">
                <FileText size={40} className="text-gray-300 group-hover:text-black transition-colors" />
              </div>
              <div className="p-4 bg-white flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 truncate max-w-[150px]">{form.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${form.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {form.status}
                    </span>
                  </div>
                </div>
                
                {isAuthenticated && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/forms/${form.id}/results`);
                      }}
                      className="p-1.5 text-gray-400 hover:text-black rounded hover:bg-gray-100"
                      title="View Results"
                    >
                      <Settings size={16} />
                    </button>
                    <button 
                      onClick={(e) => deleteForm(form.id, e)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100"
                      title="Delete Form"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
