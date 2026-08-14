"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Form, Question, QuestionType } from "@/types";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, Plus, GripVertical, Settings2, Trash2, Eye, Share, GitBranch, Zap } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

// Sortable Item Component for Questions
function SortableQuestion({ id, question, isActive, onClick, onDelete }: { id: string, question: Question, isActive: boolean, onClick: () => void, onDelete: (e: React.MouseEvent) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={`p-4 mb-3 border rounded-xl bg-white dark:bg-neutral-900 cursor-pointer transition-all ${isActive ? 'border-black dark:border-white shadow-md' : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'}`} onClick={onClick}>
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 p-1">
          <GripVertical size={16} />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">{question.title || 'Untitled Question'}</p>
          <p className="text-xs text-neutral-500 uppercase mt-1">{question.type.replace('_', ' ')}</p>
        </div>
        <button onClick={onDelete} className="text-neutral-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default function FormBuilder() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchForm();
    }
  }, [formId, isAuthenticated]);

  const fetchForm = async () => {
    try {
      const res = await api.get(`/forms/${formId}`);
      setForm(res.data);
      if (res.data.questions.length > 0) {
        setActiveQuestionId(res.data.questions[0].id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async () => {
    if (!form) return;
    try {
      const res = await api.post(`/forms/${form.id}/questions`, {
        title: "New Question",
        type: "short_text",
        order: form.questions.length
      });
      setForm({ ...form, questions: [...form.questions, res.data] });
      setActiveQuestionId(res.data.id);
    } catch (error) {
      console.error(error);
    }
  };

  const updateQuestion = async (updates: Partial<Question>) => {
    if (!activeQuestionId || !form) return;
    const qIndex = form.questions.findIndex(q => q.id === activeQuestionId);
    if (qIndex === -1) return;

    // Optimistic UI update
    const updatedQuestions = [...form.questions];
    updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], ...updates };
    setForm({ ...form, questions: updatedQuestions });

    try {
      await api.put(`/questions/${activeQuestionId}`, updates);
    } catch (error) {
      console.error(error);
      fetchForm(); // Revert on error
    }
  };

  const deleteQuestion = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!form) return;
    try {
      await api.delete(`/questions/${id}`);
      setForm({ ...form, questions: form.questions.filter(q => q.id !== id) });
      if (activeQuestionId === id) setActiveQuestionId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const updateFormMetadata = async (updates: Partial<Form>) => {
    if (!form) return;
    setForm({ ...form, ...updates });
    try {
      await api.put(`/forms/${form.id}`, updates);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id && form) {
      const oldIndex = form.questions.findIndex(q => q.id === active.id);
      const newIndex = form.questions.findIndex(q => q.id === over.id);
      const newQuestions = arrayMove(form.questions, oldIndex, newIndex);
      
      setForm({ ...form, questions: newQuestions });
      
      try {
        await api.put(`/forms/${form.id}/questions/reorder`, newQuestions.map(q => q.id));
      } catch (error) {
        console.error(error);
        fetchForm();
      }
    }
  };

  if (authLoading || loading) return <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-[#0a0a0a] transition-colors"><p className="text-neutral-500 dark:text-neutral-400">Loading builder...</p></div>;
  if (!isAuthenticated) return null;
  if (!form) return <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-[#0a0a0a] transition-colors"><p className="text-neutral-500 dark:text-neutral-400">Form not found.</p></div>;

  const activeQuestion = form.questions.find(q => q.id === activeQuestionId);

  return (
    <div className="flex flex-col h-screen bg-neutral-50 dark:bg-black text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Header */}
      <header className="h-14 bg-white dark:bg-[#0a0a0a] border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 shrink-0 transition-colors">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateFormMetadata({ title: e.target.value })}
            className="font-semibold text-lg bg-transparent outline-none hover:bg-neutral-50 dark:hover:bg-neutral-900 focus:bg-neutral-100 dark:focus:bg-neutral-800 px-2 py-1 rounded transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          
          <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-500 dark:text-neutral-400 opacity-50 cursor-not-allowed">
            <GitBranch size={16} /> Logic Jumps (Soon)
          </button>
          <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-500 dark:text-neutral-400 opacity-50 cursor-not-allowed">
            <Zap size={16} /> Integrations (Soon)
          </button>

          <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700 mx-2 hidden md:block"></div>

          <div className="flex items-center gap-2 mr-2">
             <label className="text-sm text-neutral-600 dark:text-neutral-400">Public</label>
             <input 
               type="checkbox" 
               checked={form.is_public} 
               onChange={(e) => updateFormMetadata({ is_public: e.target.checked })}
               className="toggle-checkbox"
               title="If unchecked, form is only accessible via direct link"
             />
          </div>
          <div className="flex items-center gap-2 mr-4">
             <label className="text-sm text-neutral-600 dark:text-neutral-400">Published</label>
             <input 
               type="checkbox" 
               checked={form.status === 'published'} 
               onChange={(e) => updateFormMetadata({ status: e.target.checked ? 'published' : 'draft' })}
               className="toggle-checkbox"
             />
          </div>
          <button onClick={() => window.open(`/f/${form.id}`, '_blank')} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            <Eye size={16} /> Preview
          </button>
          <button onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/f/${form.id}`);
              alert('Link copied to clipboard!');
            }} 
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            <Share size={16} /> Share Link
          </button>
        </div>
      </header>

      {/* Main Builder Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Questions List */}
        <div className="w-72 bg-neutral-50 dark:bg-[#0a0a0a] border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-full overflow-hidden shrink-0 transition-colors">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-neutral-900 transition-colors">
            <h2 className="font-semibold text-sm">Content</h2>
            <button onClick={addQuestion} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors">
              <Plus size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={form.questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                {form.questions.map((q) => (
                  <SortableQuestion 
                    key={q.id} 
                    id={q.id} 
                    question={q} 
                    isActive={activeQuestionId === q.id} 
                    onClick={() => setActiveQuestionId(q.id)}
                    onDelete={(e) => deleteQuestion(q.id, e)}
                  />
                ))}
              </SortableContext>
            </DndContext>
            <button onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors flex items-center justify-center gap-2 text-sm font-medium mt-2">
              <Plus size={16} /> Add Question
            </button>
          </div>
        </div>

        {/* Center: Live Preview */}
        <div className="flex-1 bg-neutral-100 dark:bg-[#050505] p-8 flex items-center justify-center overflow-y-auto transition-colors">
          <div className="w-full max-w-2xl aspect-[4/3] bg-white dark:bg-[#111111] rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden relative flex flex-col p-12 justify-center transition-all">
            {activeQuestion ? (
              <div className="w-full max-w-xl mx-auto slide-up-anim">
                <h1 className="text-3xl font-medium mb-2 text-black dark:text-white">
                  {activeQuestion.order + 1}. {activeQuestion.title || "..."} {activeQuestion.is_required && <span className="text-red-500">*</span>}
                </h1>
                {activeQuestion.description && <p className="text-neutral-500 dark:text-neutral-400 text-lg mb-8">{activeQuestion.description}</p>}
                
                <div className="mt-8">
                  {/* Mock input based on type */}
                  {activeQuestion.type === 'short_text' && <input type="text" disabled placeholder="Type your answer here..." className="w-full border-b-2 border-neutral-300 dark:border-neutral-700 pb-2 text-2xl bg-transparent outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-600 text-black dark:text-white transition-colors" />}
                  {activeQuestion.type === 'long_text' && <textarea disabled placeholder="Type your answer here..." className="w-full border-b-2 border-neutral-300 dark:border-neutral-700 pb-2 text-xl bg-transparent outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-600 text-black dark:text-white resize-none transition-colors" rows={3} />}
                  {(activeQuestion.type === 'multiple_choice' || activeQuestion.type === 'dropdown') && (
                     <div className="space-y-3">
                       {JSON.parse(activeQuestion.options || '["Option 1", "Option 2"]').map((opt: string, i: number) => (
                         <div key={i} className="px-4 py-3 border border-neutral-200 dark:border-neutral-700 rounded-md text-lg bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-300 flex items-center gap-3 transition-colors">
                           <div className="w-6 h-6 border border-neutral-200 dark:border-neutral-600 rounded-sm flex items-center justify-center text-xs font-bold text-neutral-400 dark:text-neutral-500 bg-white dark:bg-neutral-800">{String.fromCharCode(65 + i)}</div>
                           {opt}
                         </div>
                       ))}
                     </div>
                  )}
                  {activeQuestion.type === 'yes_no' && (
                    <div className="flex gap-4">
                      <div className="px-6 py-4 border border-neutral-200 dark:border-neutral-700 rounded-md text-xl font-medium bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-300 transition-colors">Yes</div>
                      <div className="px-6 py-4 border border-neutral-200 dark:border-neutral-700 rounded-md text-xl font-medium bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-300 transition-colors">No</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
               <div className="text-center text-neutral-400 dark:text-neutral-600">Select or add a question to preview</div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Settings */}
        {activeQuestion && (
          <div className="w-80 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 flex flex-col h-full overflow-y-auto shrink-0 p-6 transition-colors">
             <div className="flex items-center gap-2 mb-6 text-neutral-800 dark:text-neutral-200 font-semibold">
               <Settings2 size={18} /> Settings
             </div>

             <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Question Type</label>
                  <select 
                    value={activeQuestion.type}
                    onChange={(e) => updateQuestion({ type: e.target.value as QuestionType })}
                    className="w-full bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm p-2 border outline-none focus:border-black dark:focus:border-white transition-colors"
                  >
                    <option value="short_text">Short Text</option>
                    <option value="long_text">Long Text</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                    <option value="yes_no">Yes / No</option>
                    <option value="rating">Rating</option>
                    <option value="payment" disabled>Payment (Coming Soon)</option>
                    <option value="file_upload" disabled>File Upload (Coming Soon)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Title</label>
                  <input 
                    type="text" 
                    value={activeQuestion.title}
                    onChange={(e) => updateQuestion({ title: e.target.value })}
                    className="w-full bg-transparent text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm p-2 border outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description (Optional)</label>
                  <textarea 
                    value={activeQuestion.description || ''}
                    onChange={(e) => updateQuestion({ description: e.target.value })}
                    className="w-full bg-transparent text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm p-2 border outline-none focus:border-black dark:focus:border-white min-h-[80px] transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Required</label>
                  <input 
                    type="checkbox" 
                    checked={activeQuestion.is_required}
                    onChange={(e) => updateQuestion({ is_required: e.target.checked })}
                    className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-black dark:focus:ring-white bg-white dark:bg-[#0a0a0a]"
                  />
                </div>

                {(activeQuestion.type === 'multiple_choice' || activeQuestion.type === 'dropdown') && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Options</label>
                    <textarea 
                      value={JSON.parse(activeQuestion.options || '["Option 1", "Option 2"]').join('\n')}
                      onChange={(e) => {
                        const opts = e.target.value.split('\n').filter(o => o.trim());
                        updateQuestion({ options: JSON.stringify(opts) });
                      }}
                      placeholder="One option per line"
                      className="w-full bg-transparent text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm p-2 border outline-none focus:border-black dark:focus:border-white min-h-[120px] transition-colors"
                    />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Enter one option per line.</p>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>
      
      {/* Global styles for toggle/animations added here for simplicity */}
      <style dangerouslySetInnerHTML={{__html: `
        .slide-up-anim { animation: slideUp 0.3s ease-out forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
