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

  if (authLoading || loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><p>Loading results...</p></div>;
  if (!isAuthenticated) return null;
  if (!form) return <div className="flex h-screen items-center justify-center bg-gray-50"><p>Form not found.</p></div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="h-14 bg-white border-b flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-100 rounded-md text-gray-500 hover:text-black">
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-semibold text-lg">{form.title} - Results</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{responses.length} response{responses.length !== 1 && 's'}</span>
          <button onClick={exportCSV} disabled={responses.length === 0} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8">
        {responses.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
             <h2 className="text-xl font-medium text-gray-700 mb-2">No responses yet</h2>
             <p className="text-gray-500">Share your form link to start collecting data.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
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
                    <tr key={response.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(response.submitted_at).toLocaleString()}
                      </td>
                      {form.questions.map((q) => {
                        const answer = response.answers.find(a => a.question_id === q.id);
                        return (
                          <td key={q.id} className="px-6 py-4">
                            {answer ? answer.value : <span className="text-gray-300">-</span>}
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
