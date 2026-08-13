"use client";

import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Form, Question } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

export default function RespondentFlow() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const inputRef = useRef<any>(null);

  useEffect(() => {
    fetchForm();
  }, [formId]);

  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, router]);

  useEffect(() => {
    // Auto-focus input when question changes
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentQuestionIndex]);

  const fetchForm = async () => {
    try {
      const res = await api.get(`/forms/${formId}`);
      if (res.data.status !== 'published') {
        setError("This form is not currently accepting responses.");
      } else {
        setForm(res.data);
      }
    } catch (error) {
      console.error(error);
      setError("Failed to load form.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const goNext = () => {
    if (!form) return;
    const currentQ = form.questions[currentQuestionIndex];
    if (currentQ.is_required && !answers[currentQ.id]) {
      // Could add a small shake animation or toast here
      return;
    }

    if (currentQuestionIndex < form.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitForm();
    }
  };

  const goPrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitForm = async () => {
    if (!form) return;
    setIsSubmitting(true);

    const formattedAnswers = Object.entries(answers).map(([question_id, value]) => ({
      question_id,
      value
    }));

    try {
      await api.post(`/forms/${form.id}/responses`, { answers: formattedAnswers });
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("Failed to submit response.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Don't auto-advance on enter for long_text
      if (form?.questions[currentQuestionIndex].type === 'long_text') return;
      e.preventDefault();
      goNext();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      goPrev();
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      goNext();
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-white"><p className="text-gray-400 font-light text-xl tracking-wider">Loading...</p></div>;
  if (error) return <div className="flex h-screen items-center justify-center bg-white"><p className="text-red-500 font-light text-xl">{error}</p></div>;
  if (!form) return null;

  if (isSubmitted) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white p-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg">
          <Check size={64} className="mx-auto mb-6 text-green-400" />
          <h1 className="text-4xl font-semibold mb-4">Thank you!</h1>
          <p className="text-gray-400 text-xl font-light">Your response has been recorded.</p>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = form.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / form.questions.length) * 100;

  return (
    <div className="flex flex-col h-screen bg-white text-black font-sans overflow-hidden select-none">

      {/* Progress Bar */}
      <div className="h-1 bg-gray-100 w-full fixed top-0 left-0 z-50">
        <div className="h-full bg-black transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center max-w-4xl w-full mx-auto p-8 relative" onKeyDown={handleKeyDown}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <div className="flex items-start mb-2">
              <span className="text-xl text-gray-400 font-medium mr-4 mt-1">{currentQuestionIndex + 1}</span>
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight mb-2">
                  {currentQuestion.title}
                  {currentQuestion.is_required && <span className="text-red-500 ml-2 text-2xl">*</span>}
                </h1>
                {currentQuestion.description && (
                  <p className="text-xl text-gray-500 font-light mb-8">{currentQuestion.description}</p>
                )}
              </div>
            </div>

            <div className="mt-8 ml-10 max-w-2xl">
              {/* Short Text */}
              {currentQuestion.type === 'short_text' && (
                <input
                  ref={inputRef}
                  type="text"
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full text-3xl font-light border-b-2 border-gray-200 focus:border-black outline-none py-2 bg-transparent transition-colors placeholder:text-gray-300"
                />
              )}

              {/* Long Text */}
              {currentQuestion.type === 'long_text' && (
                <textarea
                  ref={inputRef}
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer here..."
                  rows={3}
                  className="w-full text-2xl font-light border-b-2 border-gray-200 focus:border-black outline-none py-2 bg-transparent transition-colors placeholder:text-gray-300 resize-none"
                />
              )}

              {/* Email */}
              {currentQuestion.type === 'email' && (
                <input
                  ref={inputRef}
                  type="email"
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-3xl font-light border-b-2 border-gray-200 focus:border-black outline-none py-2 bg-transparent transition-colors placeholder:text-gray-300"
                />
              )}

              {/* Number */}
              {currentQuestion.type === 'number' && (
                <input
                  ref={inputRef}
                  type="number"
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Enter a number"
                  className="w-full text-3xl font-light border-b-2 border-gray-200 focus:border-black outline-none py-2 bg-transparent transition-colors placeholder:text-gray-300"
                />
              )}

              {/* Multiple Choice / Dropdown */}
              {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'dropdown') && (
                <div className="space-y-3">
                  {JSON.parse(currentQuestion.options || '[]').map((opt: string, i: number) => {
                    const isSelected = answers[currentQuestion.id] === opt;
                    const letter = String.fromCharCode(65 + i);
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          handleAnswerChange(currentQuestion.id, opt);
                          setTimeout(goNext, 300); // Auto-advance after choice
                        }}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'border-black bg-black/5' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                      >
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-black text-white' : 'bg-white border text-gray-500'}`}>
                          {letter}
                        </div>
                        <span className="text-xl font-light">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Yes / No */}
              {currentQuestion.type === 'yes_no' && (
                <div className="flex gap-4">
                  {['Yes', 'No'].map((opt, i) => {
                    const isSelected = answers[currentQuestion.id] === opt;
                    const letter = i === 0 ? 'Y' : 'N';
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          handleAnswerChange(currentQuestion.id, opt);
                          setTimeout(goNext, 300);
                        }}
                        className={`flex items-center gap-4 px-8 py-5 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'border-black bg-black/5' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                      >
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-black text-white' : 'bg-white border text-gray-500'}`}>
                          {letter}
                        </div>
                        <span className="text-xl font-light">{opt}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Rating */}
              {currentQuestion.type === 'rating' && (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => {
                    const isSelected = answers[currentQuestion.id] === rating.toString();
                    return (
                      <div
                        key={rating}
                        onClick={() => {
                          handleAnswerChange(currentQuestion.id, rating.toString());
                          setTimeout(goNext, 300);
                        }}
                        className={`w-14 h-14 flex items-center justify-center rounded-xl border-2 text-2xl transition-all cursor-pointer ${isSelected ? 'border-black bg-black text-white' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                      >
                        {rating}
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={goNext}
                  disabled={currentQuestion.is_required && !answers[currentQuestion.id]}
                  className="bg-black text-white px-6 py-3 rounded-md font-medium text-lg flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {currentQuestionIndex === form.questions.length - 1 ? (isSubmitting ? 'Submitting...' : 'Submit') : 'OK'}
                  <Check size={20} />
                </button>
                <span className="text-xs text-gray-400 font-medium tracking-wider hidden sm:inline-block">
                  press <b className="font-bold">Enter ↵</b>
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="fixed bottom-0 right-0 p-8 flex gap-2">
        <button onClick={goPrev} disabled={currentQuestionIndex === 0} className="w-10 h-10 bg-black text-white rounded flex items-center justify-center disabled:opacity-30 hover:bg-gray-800 transition-colors">
          <ChevronUp size={20} />
        </button>
        <button onClick={goNext} disabled={currentQuestionIndex === form.questions.length - 1 && (!answers[currentQuestion.id] && currentQuestion.is_required)} className="w-10 h-10 bg-black text-white rounded flex items-center justify-center disabled:opacity-30 hover:bg-gray-800 transition-colors">
          <ChevronDown size={20} />
        </button>
      </div>

    </div>
  );
}
