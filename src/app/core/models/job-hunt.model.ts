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
    'angular ui architect',
    'angular frontend lead',
    'javascript ui architect',
    'frontend architect angular',
  ],
  minScore: 65,
};

export const LOCATION_INCLUDE = [
  'worldwide', 'anywhere', 'global', 'remote',
  'india', 'bangalore', 'bengaluru',
  'europe', 'european', ' eu ', 'eu,', 'eu.',
  'germany', 'netherlands', 'france', 'spain', 'poland',
  'portugal', 'sweden', 'denmark', 'norway', 'austria',
  'switzerland', 'belgium', 'czech', 'ireland', 'finland',
  'italy', 'romania', 'hungary', 'bulgaria', 'croatia', 'estonia',
];

export const LOCATION_EXCLUDE = [
  'usa only', 'us only', 'united states only',
  'canada only', 'australia only', 'latin america only',
  'north america only', 'apac only',
];

export const REQUIRED_KEYWORDS = ['angular', 'ui architect', 'ui architecture', 'javascript', 'typescript'];

export const POSTED_WITHIN_DAYS = 7;
