"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Form, Question, QuestionType } from "@/types";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, Plus, GripVertical, Settings2, Trash2, Eye, Share } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

// Sortable Item Component for Questions
function SortableQuestion({ id, question, isActive, onClick, onDelete }: { id: string, question: Question, isActive: boolean, onClick: () => void, onDelete: (e: React.MouseEvent) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={`p-4 mb-3 border rounded-xl bg-white cursor-pointer transition-all ${isActive ? 'border-black shadow-md' : 'border-gray-200 hover:border-gray-300'}`} onClick={onClick}>
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-700 p-1">
          <GripVertical size={16} />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="font-medium text-sm text-gray-900 truncate">{question.title || 'Untitled Question'}</p>
          <p className="text-xs text-gray-500 uppercase mt-1">{question.type.replace('_', ' ')}</p>
        </div>
        <button onClick={onDelete} className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-gray-100">
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

  if (authLoading || loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><p>Loading builder...</p></div>;
  if (!isAuthenticated) return null;
  if (!form) return <div className="flex h-screen items-center justify-center bg-gray-50"><p>Form not found.</p></div>;

  const activeQuestion = form.questions.find(q => q.id === activeQuestionId);

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-100 rounded-md text-gray-500 hover:text-black">
            <ArrowLeft size={18} />
          </button>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateFormMetadata({ title: e.target.value })}
            className="font-semibold text-lg bg-transparent outline-none hover:bg-gray-50 focus:bg-gray-100 px-2 py-1 rounded"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4">
             <label className="text-sm text-gray-600">Public</label>
             <input 
               type="checkbox" 
               checked={form.is_public} 
               onChange={(e) => updateFormMetadata({ is_public: e.target.checked })}
               className="toggle-checkbox"
               title="If unchecked, form is only accessible via direct link"
             />
          </div>
          <div className="flex items-center gap-2 mr-4">
             <label className="text-sm text-gray-600">Published</label>
             <input 
               type="checkbox" 
               checked={form.status === 'published'} 
               onChange={(e) => updateFormMetadata({ status: e.target.checked ? 'published' : 'draft' })}
               className="toggle-checkbox"
             />
          </div>
          <button onClick={() => window.open(`/f/${form.id}`, '_blank')} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-md hover:bg-gray-50">
            <Eye size={16} /> Preview
          </button>
          <button onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/f/${form.id}`);
              alert('Link copied to clipboard!');
            }} 
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800"
          >
            <Share size={16} /> Share Link
          </button>
        </div>
      </header>

      {/* Main Builder Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Questions List */}
        <div className="w-72 bg-gray-50 border-r flex flex-col h-full overflow-hidden shrink-0">
          <div className="p-4 border-b flex items-center justify-between bg-white">
            <h2 className="font-semibold text-sm">Content</h2>
            <button onClick={addQuestion} className="p-1 hover:bg-gray-100 rounded">
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
            <button onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-black hover:border-gray-400 hover:bg-gray-100/50 transition-colors flex items-center justify-center gap-2 text-sm font-medium mt-2">
              <Plus size={16} /> Add Question
            </button>
          </div>
        </div>

        {/* Center: Live Preview */}
        <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-2xl aspect-[4/3] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative flex flex-col p-12 justify-center transition-all">
            {activeQuestion ? (
              <div className="w-full max-w-xl mx-auto slide-up-anim">
                <h1 className="text-3xl font-medium mb-2 text-black">
                  {activeQuestion.order + 1}. {activeQuestion.title || "..."} {activeQuestion.is_required && <span className="text-red-500">*</span>}
                </h1>
                {activeQuestion.description && <p className="text-gray-500 text-lg mb-8">{activeQuestion.description}</p>}
                
                <div className="mt-8">
                  {/* Mock input based on type */}
                  {activeQuestion.type === 'short_text' && <input type="text" disabled placeholder="Type your answer here..." className="w-full border-b-2 border-gray-300 pb-2 text-2xl bg-transparent outline-none placeholder:text-gray-300" />}
                  {activeQuestion.type === 'long_text' && <textarea disabled placeholder="Type your answer here..." className="w-full border-b-2 border-gray-300 pb-2 text-xl bg-transparent outline-none placeholder:text-gray-300 resize-none" rows={3} />}
                  {(activeQuestion.type === 'multiple_choice' || activeQuestion.type === 'dropdown') && (
                     <div className="space-y-3">
                       {JSON.parse(activeQuestion.options || '["Option 1", "Option 2"]').map((opt: string, i: number) => (
                         <div key={i} className="px-4 py-3 border rounded-md text-lg bg-gray-50 text-gray-600 flex items-center gap-3">
                           <div className="w-6 h-6 border rounded-sm flex items-center justify-center text-xs font-bold text-gray-400">{String.fromCharCode(65 + i)}</div>
                           {opt}
                         </div>
                       ))}
                     </div>
                  )}
                  {activeQuestion.type === 'yes_no' && (
                    <div className="flex gap-4">
                      <div className="px-6 py-4 border rounded-md text-xl font-medium bg-gray-50 text-gray-600">Yes</div>
                      <div className="px-6 py-4 border rounded-md text-xl font-medium bg-gray-50 text-gray-600">No</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
               <div className="text-center text-gray-400">Select or add a question to preview</div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Settings */}
        {activeQuestion && (
          <div className="w-80 bg-white border-l flex flex-col h-full overflow-y-auto shrink-0 p-6">
             <div className="flex items-center gap-2 mb-6 text-gray-800 font-semibold">
               <Settings2 size={18} /> Settings
             </div>

             <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                  <select 
                    value={activeQuestion.type}
                    onChange={(e) => updateQuestion({ type: e.target.value as QuestionType })}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border outline-none focus:border-black"
                  >
                    <option value="short_text">Short Text</option>
                    <option value="long_text">Long Text</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                    <option value="yes_no">Yes / No</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input 
                    type="text" 
                    value={activeQuestion.title}
                    onChange={(e) => updateQuestion({ title: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea 
                    value={activeQuestion.description || ''}
                    onChange={(e) => updateQuestion({ description: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border outline-none focus:border-black min-h-[80px]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Required</label>
                  <input 
                    type="checkbox" 
                    checked={activeQuestion.is_required}
                    onChange={(e) => updateQuestion({ is_required: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                </div>

                {(activeQuestion.type === 'multiple_choice' || activeQuestion.type === 'dropdown') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                    <textarea 
                      value={JSON.parse(activeQuestion.options || '["Option 1", "Option 2"]').join('\n')}
                      onChange={(e) => {
                        const opts = e.target.value.split('\n').filter(o => o.trim());
                        updateQuestion({ options: JSON.stringify(opts) });
                      }}
                      placeholder="One option per line"
                      className="w-full border-gray-300 rounded-md shadow-sm p-2 border outline-none focus:border-black min-h-[120px]"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter one option per line.</p>
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
