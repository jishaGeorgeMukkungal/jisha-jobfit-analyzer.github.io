import { Injectable } from '@angular/core';
import { JdAnalysisRequest, JdAnalysisResult, SavedJob } from '../models/jd-analysis.model';
import * as XLSX from 'xlsx';

const TRACKER_KEY = 'jisha_job_tracker';
const MAX_JOBS = 25;

interface TrackedJob {
  company: string; role: string; score: number; grade: string;
  skillsMatch: number; experienceLevel: number; educationFit: number; keywordsAlignment: number;
  strengths: string; gaps: string; suggestions: string; analysedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ExcelExportService {

  // ── Called after every JD analysis ──────────────────────────────────────
  trackJob(request: JdAnalysisRequest, result: JdAnalysisResult): void {
    const jobs = this.loadTracker();
    const idx = jobs.findIndex(j => j.company === request.company && j.role === request.role);
    const entry: TrackedJob = {
      company: request.company, role: request.role,
      score: result.overall_score, grade: result.grade,
      skillsMatch: result.breakdown.skills_match,
      experienceLevel: result.breakdown.experience_level,
      educationFit: result.breakdown.education_fit,
      keywordsAlignment: result.breakdown.keywords_alignment,
      strengths: result.strengths.join('; '),
      gaps: result.gaps.join('; '),
      suggestions: result.suggestions.join('; '),
      analysedAt: new Date().toISOString(),
    };
    if (idx !== -1) { jobs[idx] = entry; }
    else { jobs.unshift(entry); if (jobs.length > MAX_JOBS) jobs.splice(MAX_JOBS); }
    this.persistTracker(jobs);
  }

  // ── Export: Saved Jobs (Sheet 1) + Analysis History (Sheet 2) ───────────
  exportAll(savedJobs: SavedJob[]): void {
    const wb = XLSX.utils.book_new();

    // Sheet 1 — Saved Jobs (human-readable + _data column for import)
    if (savedJobs.length > 0) {
      const jobRows = savedJobs.map((j, i) => ({
        '#': i + 1,
        'Company': j.company,
        'Role': j.role,
        'Score': j.score,
        'Grade': j.grade,
        'Applied': j.applied ? 'Yes' : 'No',
        'Apply Link': j.applyLink,
        'Saved Date': new Date(j.savedAt).toLocaleDateString('en-GB'),
        'Skills Match %': j.result.breakdown.skills_match,
        'Experience %': j.result.breakdown.experience_level,
        'Education %': j.result.breakdown.education_fit,
        'Keywords %': j.result.breakdown.keywords_alignment,
        'Summary': j.result.summary,
        'Strengths': j.result.strengths.join('; '),
        'Gaps': j.result.gaps.join('; '),
        'Suggestions': j.result.suggestions.join('; '),
        '_data': JSON.stringify(j),
      }));
      const ws1 = XLSX.utils.json_to_sheet(jobRows);
      ws1['!cols'] = [
        {wch:4},{wch:22},{wch:32},{wch:8},{wch:10},{wch:8},{wch:35},{wch:14},
        {wch:14},{wch:12},{wch:12},{wch:12},{wch:45},{wch:55},{wch:55},{wch:55},{wch:10},
      ];
      XLSX.utils.book_append_sheet(wb, ws1, 'Saved Jobs');
    } else {
      const ws1 = XLSX.utils.aoa_to_sheet([['No saved jobs yet.']]);
      XLSX.utils.book_append_sheet(wb, ws1, 'Saved Jobs');
    }

    // Sheet 2 — Analysis History
    const history = this.loadTracker();
    const historyRows = history.length > 0
      ? history.map((j, i) => ({
          '#': i + 1,
          'Company': j.company, 'Role': j.role,
          'Score': j.score, 'Grade': j.grade,
          'Skills Match %': j.skillsMatch, 'Experience %': j.experienceLevel,
          'Education %': j.educationFit, 'Keywords %': j.keywordsAlignment,
          'Strengths': j.strengths, 'Gaps': j.gaps, 'Suggestions': j.suggestions,
          'Analysed At': new Date(j.analysedAt).toLocaleString('en-GB'),
        }))
      : [{ 'Note': 'No analyses run yet.' }];

    const ws2 = XLSX.utils.json_to_sheet(historyRows);
    ws2['!cols'] = [
      {wch:4},{wch:22},{wch:32},{wch:8},{wch:10},{wch:14},{wch:12},{wch:12},{wch:12},
      {wch:50},{wch:50},{wch:50},{wch:20},
    ];
    XLSX.utils.book_append_sheet(wb, ws2, 'Analysis History');

    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Jisha_Jobs_${date}.xlsx`);
  }

  // ── Import: read Saved Jobs sheet, return SavedJob array ────────────────
  importSavedJobs(file: File): Promise<SavedJob[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          const ws = wb.Sheets['Saved Jobs'];
          if (!ws) { reject(new Error('Sheet "Saved Jobs" not found. Make sure you are importing a file exported from this app.')); return; }

          const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
          const jobs: SavedJob[] = rows
            .filter(r => typeof r['_data'] === 'string' && r['_data'])
            .map(r => {
              const job = JSON.parse(r['_data'] as string) as SavedJob;
              job.savedAt = new Date(job.savedAt);
              job.applyLink = job.applyLink ?? '';
              job.applied = job.applied ?? false;
              return job;
            });

          if (jobs.length === 0) { reject(new Error('No valid job data found in the file.')); return; }
          resolve(jobs);
        } catch (err: unknown) {
          reject(new Error(err instanceof Error ? err.message : 'Failed to read file.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsArrayBuffer(file);
    });
  }

  private loadTracker(): TrackedJob[] {
    try { const r = localStorage.getItem(TRACKER_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
  }

  private persistTracker(jobs: TrackedJob[]): void {
    try { localStorage.setItem(TRACKER_KEY, JSON.stringify(jobs)); } catch {}
  }
}
