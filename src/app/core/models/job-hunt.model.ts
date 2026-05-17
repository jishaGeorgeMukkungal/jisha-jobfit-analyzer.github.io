import { JdAnalysisResult } from './jd-analysis.model';

export interface DiscoveredJob {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  jobType: string;
  url: string;
  description: string;
  salary: string;
  postedAt: string;
  tags: string[];
  score: number;
  grade: string;
  result: JdAnalysisResult;
}

export interface JobSearchCriteria {
  queries: string[];
  minScore: number;
}

export const DEFAULT_CRITERIA: JobSearchCriteria = {
  queries: [
    'angular frontend lead',
    'frontend engineering lead',
    'angular architect',
    'engineering manager frontend',
  ],
  minScore: 65,
};
