import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { JdAnalysisService } from './jd-analysis.service';
import { ResumeDataService } from './resume-data.service';
import { JdAnalysisRequest } from '../models/jd-analysis.model';
import { DEFAULT_CRITERIA, DiscoveredJob } from '../models/job-hunt.model';

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo: string;
  category: string;
  tags: string[];
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
}

interface RemotiveResponse {
  'job-count': number;
  jobs: RemotiveJob[];
}

const REMOTIVE_BASE = 'https://remotive.com/api/remote-jobs';

@Injectable({ providedIn: 'root' })
export class JobSearchService {
  private http = inject(HttpClient);
  private analysisService = inject(JdAnalysisService);
  private resumeService = inject(ResumeDataService);

  searchJobs(): Observable<DiscoveredJob[]> {
    const resumeText = this.resumeService.getResumeAsText();

    // Fetch all queries in parallel
    const fetches$ = DEFAULT_CRITERIA.queries.map(q =>
      this.http.get<RemotiveResponse>(
        `${REMOTIVE_BASE}?category=software-dev&search=${encodeURIComponent(q)}&limit=15`
      ).pipe(catchError(() => of({ 'job-count': 0, jobs: [] } as RemotiveResponse)))
    );

    return forkJoin(fetches$).pipe(
      map(responses => {
        // Combine and deduplicate by job id
        const all = responses.flatMap(r => r.jobs);
        return Array.from(new Map(all.map(j => [j.id, j])).values());
      }),
      switchMap(jobs => {
        if (jobs.length === 0) return of([]);
        // Score every job against resume
        const scored$ = jobs.map(job => {
          const description = this.stripHtml(job.description);
          const request: JdAnalysisRequest = {
            company: job.company_name,
            role: job.title,
            jobDescription: description,
            resumeText,
          };
          return this.analysisService.analyse(request).pipe(
            map(result => ({
              id: String(job.id),
              title: job.title,
              company: job.company_name,
              companyLogo: job.company_logo,
              location: job.candidate_required_location || 'Remote',
              jobType: this.formatJobType(job.job_type),
              url: job.url,
              description,
              salary: job.salary || '',
              postedAt: job.publication_date,
              tags: job.tags ?? [],
              score: result.overall_score,
              grade: result.grade,
              result,
            } as DiscoveredJob))
          );
        });
        return forkJoin(scored$);
      }),
      map(jobs =>
        jobs
          .filter(j => j.score >= DEFAULT_CRITERIA.minScore)
          .sort((a, b) => b.score - a.score)
      )
    );
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  private formatJobType(raw: string): string {
    const map: Record<string, string> = {
      full_time: 'Full-time', part_time: 'Part-time',
      contract: 'Contract', freelance: 'Freelance', internship: 'Internship',
    };
    return map[raw] ?? raw;
  }
}
