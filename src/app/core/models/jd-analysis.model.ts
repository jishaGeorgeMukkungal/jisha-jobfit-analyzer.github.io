export interface JdAnalysisRequest {
  jobDescription: string;
  resumeText: string;
  company: string;
  role: string;
}

export interface ScoreBreakdown {
  skills_match: number;
  experience_level: number;
  education_fit: number;
  keywords_alignment: number;
}

export interface JdAnalysisResult {
  overall_score: number;
  grade: 'Excellent' | 'Strong' | 'Good' | 'Fair' | 'Weak';
  summary: string;
  breakdown: ScoreBreakdown;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
}

export interface AnalysisHistoryItem {
  id: string;
  company: string;
  role: string;
  score: number;
  grade: string;
  analysedAt: Date;
  result: JdAnalysisResult;
}

export interface SavedJob {
  id: string;
  company: string;
  role: string;
  jobDescription: string;
  score: number;
  grade: string;
  savedAt: Date;
  result: JdAnalysisResult;
  applyLink: string;
  applied: boolean;
}
