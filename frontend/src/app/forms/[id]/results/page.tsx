"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Form, Response } from "@/types";
import { ArrowLeft, Download } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function Results() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [formId, isAuthenticated]);

  const fetchData = async () => {
    try {
      const [formRes, responsesRes] = await Promise.all([
        api.get(`/forms/${formId}`),
        api.get(`/forms/${formId}/responses`)
      ]);
      setForm(formRes.data);
      setResponses(responsesRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!form || responses.length === 0) return;
    
    const headers = ["Submission Date", ...form.questions.map(q => q.title || 'Untitled')];
    
    const rows = responses.map(response => {
      const date = new Date(response.submitted_at).toLocaleString();
      const rowData = [date];
      
      form.questions.forEach(q => {
        const answer = response.answers.find(a => a.question_id === q.id);
        // Escape quotes and wrap in quotes for CSV
        const val = answer ? `"${answer.value.replace(/"/g, '""')}"` : "";
        rowData.push(val);
      });
      return rowData.join(",");
    });

    const csvContent = [headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${form.title}_responses.csv`);
    link.click();
  };

  if (authLoading || loading) return <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-[#0a0a0a] transition-colors"><p className="text-neutral-500 dark:text-neutral-400">Loading results...</p></div>;
  if (!isAuthenticated) return null;
  if (!form) return <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-[#0a0a0a] transition-colors"><p className="text-neutral-500 dark:text-neutral-400">Form not found.</p></div>;

  return (
    <div className="flex flex-col h-screen bg-neutral-50 dark:bg-[#0a0a0a] transition-colors text-black dark:text-white">
      <header className="h-14 bg-white dark:bg-[#111] border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-6 shrink-0 transition-colors">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-semibold text-lg">{form.title} - Results</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">{responses.length} response{responses.length !== 1 && 's'}</span>
          <button onClick={exportCSV} disabled={responses.length === 0} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-neutral-700 dark:text-neutral-300">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8">
        {responses.length === 0 ? (
          <div className="bg-white dark:bg-[#111] rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center transition-colors">
             <h2 className="text-xl font-medium text-neutral-700 dark:text-neutral-300 mb-2">No responses yet</h2>
             <p className="text-neutral-500 dark:text-neutral-400">Share your form link to start collecting data.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#111] rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
                <thead className="text-xs text-neutral-700 dark:text-neutral-400 uppercase bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
                  <tr>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Submitted At</th>
                    {form.questions.map((q) => (
                      <th key={q.id} className="px-6 py-4 font-medium min-w-[200px]">
                        {q.title || 'Untitled'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responses.map((response) => (
                    <tr key={response.id} className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(response.submitted_at).toLocaleString()}
                      </td>
                      {form.questions.map((q) => {
                        const answer = response.answers.find(a => a.question_id === q.id);
                        return (
                          <td key={q.id} className="px-6 py-4">
                            {answer ? answer.value : <span className="text-neutral-300 dark:text-neutral-600">-</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
