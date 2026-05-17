import { Injectable, signal } from '@angular/core';
import { JdAnalysisRequest, JdAnalysisResult, SavedJob } from '../models/jd-analysis.model';

const STORAGE_KEY = 'jisha_saved_jobs';

@Injectable({ providedIn: 'root' })
export class SavedJobsService {
  private _savedJobs = signal<SavedJob[]>(this.load());
  readonly savedJobs = this._savedJobs.asReadonly();

  isSaved(company: string, role: string): boolean {
    return this._savedJobs().some(j => j.company === company && j.role === role);
  }

  save(request: JdAnalysisRequest, result: JdAnalysisResult): void {
    const job: SavedJob = {
      id: crypto.randomUUID(),
      company: request.company,
      role: request.role,
      jobDescription: request.jobDescription,
      score: result.overall_score,
      grade: result.grade,
      savedAt: new Date(),
      result,
      applyLink: '',
      applied: false
    };
    this._savedJobs.update(jobs => [job, ...jobs]);
    this.persist();
  }

  updateJob(id: string, update: Partial<Pick<SavedJob, 'applyLink' | 'applied'>>): void {
    this._savedJobs.update(jobs => jobs.map(j => j.id === id ? { ...j, ...update } : j));
    this.persist();
  }

  remove(company: string, role: string): void {
    this._savedJobs.update(jobs => jobs.filter(j => !(j.company === company && j.role === role)));
    this.persist();
  }

  removeById(id: string): void {
    this._savedJobs.update(jobs => jobs.filter(j => j.id !== id));
    this.persist();
  }

  clearAll(): void {
    this._savedJobs.set([]);
    this.persist();
  }

  mergeImport(incoming: SavedJob[]): { added: number; updated: number } {
    const current = [...this._savedJobs()];
    let added = 0, updated = 0;
    for (const job of incoming) {
      const idx = current.findIndex(j => j.id === job.id);
      if (idx !== -1) { current[idx] = job; updated++; }
      else { current.unshift(job); added++; }
    }
    this._savedJobs.set(current);
    this.persist();
    return { added, updated };
  }

  private persist(): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this._savedJobs())); } catch {}
  }

  private load(): SavedJob[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const jobs = raw ? JSON.parse(raw) : [];
      return jobs.map((j: SavedJob) => ({ ...j, applyLink: j.applyLink ?? '', applied: j.applied ?? false }));
    } catch { return []; }
  }
}
