"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Form } from "@/types";
import { useRouter } from "next/navigation";
import { Plus, FileText, Settings, Trash2, Users } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Navbar } from "@/components/Navbar";

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
    return <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-[#0a0a0a] transition-colors"><p className="text-neutral-500 dark:text-neutral-400">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] transition-colors">
      <Navbar />

      <main className="max-w-6xl mx-auto px-8 pt-28 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-light text-neutral-700 dark:text-neutral-200">{isAuthenticated ? "My Workspace" : "Public Forms"}</h2>
          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <button
                className="hidden md:flex border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-4 py-2.5 rounded-md font-medium transition-colors items-center gap-2 opacity-60 cursor-not-allowed"
                title="Team Collaboration (Coming Soon)"
              >
                <Users size={18} />
                Team (Coming Soon)
              </button>
              <button
                onClick={createForm}
                className="bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black px-6 py-2.5 rounded-md font-medium transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Create Form
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isAuthenticated && (
            <button
              onClick={createForm}
              className="h-48 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-all cursor-pointer"
            >
              <Plus size={32} className="mb-2" />
              <span className="font-medium">New form</span>
            </button>
          )}

          {forms.map((form) => (
            <div
              key={form.id}
              onClick={() => router.push(isAuthenticated ? `/forms/${form.id}/edit` : `/f/${form.id}`)}
              className="h-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col overflow-hidden hover:shadow-lg dark:hover:shadow-neutral-800/50 transition-all cursor-pointer group"
            >
              <div className="flex-1 p-6 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
                <FileText size={40} className="text-neutral-300 dark:text-neutral-600 group-hover:text-black dark:group-hover:text-white transition-colors" />
              </div>
              <div className="p-4 bg-white dark:bg-neutral-900 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-[150px]">{form.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${form.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'}`}>
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
                      className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      title="View Results"
                    >
                      <Settings size={16} />
                    </button>
                    <button 
                      onClick={(e) => deleteForm(form.id, e)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
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
