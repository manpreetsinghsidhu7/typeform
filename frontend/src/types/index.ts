export type QuestionType = 
  | 'short_text' 
  | 'long_text' 
  | 'multiple_choice' 
  | 'dropdown' 
  | 'email' 
  | 'number' 
  | 'yes_no' 
  | 'rating';

export interface Question {
  id: string;
  form_id: string;
  title: string;
  description?: string;
  type: QuestionType;
  is_required: boolean;
  order: number;
  options?: string; // JSON string array for multiple_choice/dropdown
}

export interface Form {
  id: string;
  title: string;
  status: 'draft' | 'published';
  is_public: boolean;
  created_at: string;
  updated_at: string;
  questions: Question[];
}

export interface Answer {
  id?: string;
  question_id: string;
  value: string;
}

export interface Response {
  id: string;
  form_id: string;
  submitted_at: string;
  answers: Answer[];
}
