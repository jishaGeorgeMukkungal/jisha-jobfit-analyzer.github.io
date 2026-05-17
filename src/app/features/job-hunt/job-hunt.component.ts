import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobSearchService } from '../../core/services/job-search.service';
import { SavedJobsService } from '../../core/services/saved-jobs.service';
import { SectionLabelComponent } from '../../shared/components/section-label.component';
import { DiscoveredJob } from '../../core/models/job-hunt.model';
import { JdAnalysisRequest } from '../../core/models/jd-analysis.model';

@Component({
  selector: 'app-job-hunt',
  standalone: true,
  imports: [DatePipe, FormsModule, SectionLabelComponent],
  template: `
    <app-section-label text="Job Hunt by AI" />

    <!-- AI Search bar -->
    <div class="search-wrap">
      <div class="search-bar">
        <i class="ti ti-sparkles search-icon" aria-hidden="true"></i>
        <input
          class="search-input"
          [(ngModel)]="userQuery"
          (keydown.enter)="onSearch()"
          placeholder="e.g. Angular lead Bangalore  ·  UI architect Germany  ·  Frontend manager remote"
        />
        @if (userQuery) {
          <button class="clear-query-btn" (click)="clearSearch()" title="Clear and reset to AI defaults">
            <i class="ti ti-x" aria-hidden="true"></i>
          </button>
        }
        <button class="search-btn" (click)="onSearch()" [disabled]="loading || !userQuery.trim()">
          <i class="ti ti-arrow-right" aria-hidden="true"></i> Search
        </button>
      </div>
      <div class="search-tips">
        Try: <span (click)="quickSearch('Angular architect Bangalore hybrid')">Angular architect Bangalore hybrid</span>
        &nbsp;·&nbsp; <span (click)="quickSearch('Frontend lead Germany relocation')">Frontend lead Germany relocation</span>
        &nbsp;·&nbsp; <span (click)="quickSearch('UI architect remote Europe')">UI architect remote Europe</span>
      </div>
    </div>

    <!-- Search criteria bar -->
    <div class="criteria-bar">
      <div class="criteria-info">
        <i class="ti ti-robot" aria-hidden="true"></i>
        <div>
          @if (isCustomSearch) {
            <div class="criteria-roles">Custom search: "{{ activeQueryLabel }}"</div>
            <div class="criteria-sub">Posted ≤ 7 days &nbsp;·&nbsp; Score ≥ 65% &nbsp;·&nbsp;
              <span class="reset-link" (click)="clearSearch()">← Reset to AI defaults</span>
            </div>
          } @else {
            <div class="criteria-roles">Angular · UI Architect · JavaScript / TypeScript roles</div>
            <div class="criteria-sub">Bangalore (Hybrid/Remote) &nbsp;·&nbsp; Germany &amp; Europe (relocation) &nbsp;·&nbsp; Posted ≤ 7 days &nbsp;·&nbsp; Score ≥ 65%</div>
          }
        </div>
      </div>
      <button class="refresh-btn" (click)="runSearch()" [disabled]="loading">
        <i class="ti" [class.ti-refresh]="!loading" [class.ti-loader-2]="loading" [class.spin]="loading" aria-hidden="true"></i>
        {{ loading ? 'Searching…' : 'Refresh' }}
      </button>
    </div>

    <!-- Loading state -->
    @if (loading) {
      <div class="loading-wrap">
        <div class="ai-pulse">
          <div class="pulse-ring"></div>
          <i class="ti ti-robot pulse-icon" aria-hidden="true"></i>
        </div>
        <p class="loading-msg">{{ loadingMsg }}</p>
        <p class="loading-sub">Scoring each role against your resume…</p>
      </div>
    }

    <!-- Error state -->
    @if (error && !loading) {
      <div class="error-state">
        <i class="ti ti-wifi-off" aria-hidden="true"></i>
        <p>{{ error }}</p>
        <button class="retry-btn" (click)="runSearch()">Try again</button>
      </div>
    }

    <!-- Empty state -->
    @if (!loading && !error && searched && results.length === 0) {
      <div class="empty-state">
        <i class="ti ti-mood-empty" aria-hidden="true"></i>
        <p>No roles above 65% match found right now.</p>
        <p class="empty-sub">Try refreshing — new jobs are posted daily.</p>
      </div>
    }

    <!-- Results -->
    @if (!loading && results.length > 0) {
      <div class="results-header">
        <span class="results-count">
          <strong>{{ results.length }}</strong> matching role{{ results.length !== 1 ? 's' : '' }} found
        </span>
        <span class="results-hint">All scored ≥ 65% against your resume · Sorted by best match</span>
      </div>

      @for (job of results; track job.id) {
        <div class="job-card" [class.is-open]="expandedId === job.id">

          <!-- Card header (always visible) -->
          <div class="card-top">
            <div class="card-left">
              @if (job.companyLogo) {
                <img class="company-logo" [src]="job.companyLogo" [alt]="job.company" (error)="onLogoError($event)" />
              } @else {
                <div class="logo-placeholder">{{ job.company[0] }}</div>
              }
            </div>
            <div class="card-body">
              <div class="job-title">{{ job.title }}</div>
              <div class="job-meta">
                <span class="company-name">{{ job.company }}</span>
                <span class="meta-dot">·</span>
                <span class="job-location"><i class="ti ti-map-pin" aria-hidden="true"></i>{{ job.location }}</span>
                <span class="meta-dot">·</span>
                <span class="job-type">{{ job.jobType }}</span>
                @if (job.salary) {
                  <span class="meta-dot">·</span>
                  <span class="job-salary"><i class="ti ti-currency-dollar" aria-hidden="true"></i>{{ job.salary }}</span>
                }
              </div>
              <div class="tag-row">
                @for (tag of job.tags.slice(0, 5); track tag) {
                  <span class="tag">{{ tag }}</span>
                }
                <span class="posted-date">{{ job.postedAt | date:'d MMM yyyy' }}</span>
              </div>
            </div>
            <div class="card-right">
              <div class="score-block" [class]="scoreClass(job.score)">
                <span class="score-num">{{ job.score }}</span>
                <span class="score-denom">/100</span>
              </div>
              <span class="grade-label" [class]="scoreClass(job.score)">{{ job.grade }}</span>
              <button class="view-btn" (click)="toggleExpand(job.id)">
                {{ expandedId === job.id ? 'Close' : 'View' }}
                <i class="ti" [class.ti-chevron-down]="expandedId !== job.id" [class.ti-chevron-up]="expandedId === job.id" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <!-- Expanded analysis panel -->
          @if (expandedId === job.id) {
            <div class="card-detail">

              <!-- Score breakdown -->
              <div class="breakdown-grid">
                @for (item of breakdownOf(job); track item.label) {
                  <div class="b-item">
                    <div class="b-label">{{ item.label }}</div>
                    <div class="b-bar"><div class="b-fill" [style.width.%]="item.value" [style.background]="item.color"></div></div>
                    <div class="b-val">{{ item.value }}%</div>
                  </div>
                }
              </div>

              <!-- Strengths / Gaps -->
              <div class="feedback-row">
                <div class="feedback-col">
                  <div class="fb-title"><i class="ti ti-circle-check success-icon"></i> Strengths</div>
                  <ul>@for (s of job.result.strengths; track s) { <li>{{ s }}</li> }</ul>
                </div>
                <div class="feedback-col">
                  <div class="fb-title"><i class="ti ti-alert-circle danger-icon"></i> Gaps</div>
                  <ul>@for (g of job.result.gaps; track g) { <li>{{ g }}</li> }</ul>
                </div>
              </div>

              <!-- Suggestions -->
              @if (job.result.suggestions.length) {
                <div class="suggestions">
                  <div class="fb-title"><i class="ti ti-bulb warn-icon"></i> Suggestions</div>
                  <ul>@for (s of job.result.suggestions; track s) { <li>{{ s }}</li> }</ul>
                </div>
              }

              <!-- Actions -->
              <div class="detail-actions">
                <a class="apply-btn" [href]="job.url" target="_blank" rel="noopener noreferrer">
                  <i class="ti ti-external-link" aria-hidden="true"></i> View Job
                </a>
                @if (!isSaved(job)) {
                  <button class="save-btn" (click)="saveJob(job)">
                    <i class="ti ti-bookmark" aria-hidden="true"></i> Save to Apply Later
                  </button>
                } @else {
                  <button class="save-btn saved" disabled>
                    <i class="ti ti-bookmark-filled" aria-hidden="true"></i> Saved
                  </button>
                }
              </div>

            </div>
          }
        </div>
      }
    }
  `,
  styles: [`
    /* ── Search bar ──────────────────────────────────────────── */
    .search-wrap { margin-bottom: 12px; }
    .search-bar { display: flex; align-items: center; gap: 0; background: #fff; border: 1.5px solid #D85A30; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(216,90,48,0.1); }
    .search-icon { font-size: 18px; color: #D85A30; padding: 0 12px; flex-shrink: 0; }
    .search-input { flex: 1; border: none; outline: none; font-size: 14px; color: #1a1a1a; font-family: 'DM Sans', sans-serif; padding: 13px 4px; background: transparent; min-width: 0; }
    .search-input::placeholder { color: #9ca3af; }
    .clear-query-btn { background: none; border: none; cursor: pointer; color: #9ca3af; padding: 0 8px; display: flex; align-items: center; flex-shrink: 0; font-size: 14px; }
    .clear-query-btn:hover { color: #E24B4A; }
    .search-btn { background: #D85A30; color: #fff; border: none; padding: 0 20px; height: 100%; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; gap: 6px; flex-shrink: 0; white-space: nowrap; transition: background 0.15s; min-height: 48px; }
    .search-btn:hover:not(:disabled) { background: #c04e26; }
    .search-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .search-tips { font-size: 11px; color: #9ca3af; margin-top: 6px; padding-left: 2px; }
    .search-tips span { color: #D85A30; cursor: pointer; text-decoration: underline dotted; text-underline-offset: 2px; }
    .search-tips span:hover { color: #993C1D; }
    .reset-link { color: rgba(255,255,255,0.7); cursor: pointer; text-decoration: underline dotted; text-underline-offset: 2px; }
    .reset-link:hover { color: #fff; }

    /* ── Criteria bar ────────────────────────────────────────── */
    .criteria-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; background: linear-gradient(135deg, #1a1a2e 0%, #26215C 100%); border-radius: 12px; padding: 14px 18px; margin-bottom: 18px; }
    .criteria-info { display: flex; align-items: flex-start; gap: 12px; }
    .criteria-info > i { font-size: 24px; color: #a78bfa; flex-shrink: 0; margin-top: 2px; }
    .criteria-roles { font-size: 13px; font-weight: 600; color: #fff; font-family: 'Syne', sans-serif; }
    .criteria-sub { font-size: 11px; color: rgba(255,255,255,0.55); margin-top: 3px; }
    .refresh-btn { display: inline-flex; align-items: center; gap: 7px; background: rgba(255,255,255,0.12); border: 0.5px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 8px 16px; font-size: 13px; color: #fff; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; flex-shrink: 0; transition: background 0.15s; }
    .refresh-btn:hover:not(:disabled) { background: rgba(255,255,255,0.2); }
    .refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .spin { animation: spin 0.9s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Loading ─────────────────────────────────────────────── */
    .loading-wrap { text-align: center; padding: 4rem 1rem; }
    .ai-pulse { position: relative; width: 72px; height: 72px; margin: 0 auto 20px; }
    .pulse-ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid #D85A30; animation: pulse-ring 1.5s ease-out infinite; }
    .pulse-icon { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #D85A30; width: 100%; height: 100%; }
    @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1.6); opacity: 0; } }
    .loading-msg { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; }
    .loading-sub { font-size: 13px; color: #9ca3af; }

    /* ── Error & empty ───────────────────────────────────────── */
    .error-state, .empty-state { text-align: center; padding: 3rem 1rem; color: #9ca3af; }
    .error-state i, .empty-state i { font-size: 40px; display: block; margin-bottom: 12px; }
    .error-state i { color: #E24B4A; }
    .error-state p, .empty-state p { font-size: 14px; margin-bottom: 6px; }
    .empty-sub { font-size: 12px; }
    .retry-btn { margin-top: 10px; background: none; border: 0.5px solid #D85A30; border-radius: 6px; padding: 7px 16px; color: #D85A30; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }

    /* ── Results header ──────────────────────────────────────── */
    .results-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .results-count { font-size: 13px; color: #1a1a1a; }
    .results-hint { font-size: 11px; color: #9ca3af; }

    /* ── Job card ────────────────────────────────────────────── */
    .job-card { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; margin-bottom: 8px; overflow: hidden; transition: box-shadow 0.15s; }
    .job-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .job-card.is-open { border-color: #D85A30; }

    .card-top { display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px; }
    .card-left { flex-shrink: 0; }
    .company-logo { width: 44px; height: 44px; border-radius: 8px; object-fit: contain; border: 0.5px solid #e5e5e5; background: #fafafa; }
    .logo-placeholder { width: 44px; height: 44px; border-radius: 8px; background: linear-gradient(135deg, #D85A30, #26215C); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: #fff; }

    .card-body { flex: 1; min-width: 0; }
    .job-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; }
    .job-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; font-size: 12px; color: #6b7280; margin-bottom: 7px; }
    .company-name { font-weight: 500; color: #374151; }
    .meta-dot { color: #d1d5db; }
    .job-location i, .job-salary i { font-size: 12px; margin-right: 2px; }
    .tag-row { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; }
    .tag { background: #f3f4f6; color: #6b7280; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
    .posted-date { font-size: 11px; color: #d1d5db; margin-left: auto; }

    .card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
    .score-block { display: flex; align-items: baseline; gap: 2px; font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; border-radius: 10px; padding: 6px 12px; }
    .score-denom { font-size: 11px; font-weight: 400; color: #9ca3af; }
    .grade-label { font-size: 11px; font-weight: 600; }
    .view-btn { display: inline-flex; align-items: center; gap: 5px; background: none; border: 0.5px solid #e5e5e5; border-radius: 6px; padding: 5px 12px; font-size: 12px; color: #6b7280; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
    .view-btn:hover { border-color: #D85A30; color: #D85A30; }

    /* ── Detail panel ────────────────────────────────────────── */
    .card-detail { border-top: 0.5px solid #f0f0f0; padding: 16px; background: #fafafa; display: flex; flex-direction: column; gap: 14px; }

    .breakdown-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; }
    .b-item { background: #fff; border-radius: 8px; padding: 10px; border: 0.5px solid #e5e5e5; }
    .b-label { font-size: 10px; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
    .b-bar { height: 5px; border-radius: 3px; background: #e5e5e5; margin-bottom: 5px; overflow: hidden; }
    .b-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
    .b-val { font-size: 12px; font-weight: 600; color: #1a1a1a; }

    .feedback-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .feedback-col, .suggestions { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 8px; padding: 12px; }
    .fb-title { font-size: 12px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px; display: flex; align-items: center; gap: 5px; }
    .feedback-col ul, .suggestions ul { list-style: none; padding: 0; margin: 0; }
    .feedback-col li, .suggestions li { font-size: 12px; color: #6b7280; padding: 2px 0 2px 14px; position: relative; line-height: 1.5; }
    .feedback-col li::before, .suggestions li::before { content: '•'; position: absolute; left: 4px; color: #D85A30; }
    .success-icon { color: #1D9E75; } .danger-icon { color: #E24B4A; } .warn-icon { color: #BA7517; }

    .detail-actions { display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap; }
    .apply-btn { display: inline-flex; align-items: center; gap: 6px; background: #D85A30; color: #fff; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none; font-family: 'DM Sans', sans-serif; }
    .apply-btn:hover { background: #c04e26; }
    .save-btn { display: inline-flex; align-items: center; gap: 6px; background: none; border: 1.5px solid #D85A30; color: #D85A30; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; }
    .save-btn:hover { background: #FAECE7; }
    .save-btn.saved { border-color: #1D9E75; color: #1D9E75; cursor: default; }

    /* ── Score colours ───────────────────────────────────────── */
    .score-excellent { background: #E1F5EE; color: #085041; }
    .score-good      { background: #FAECE7; color: #993C1D; }
    .score-weak      { background: #FCEBEB; color: #A32D2D; }

    @media (max-width: 600px) {
      .feedback-row { grid-template-columns: 1fr; }
      .card-top { flex-wrap: wrap; }
      .card-right { flex-direction: row; align-items: center; flex-wrap: wrap; width: 100%; justify-content: space-between; }
      .tag-row { display: none; }
    }
  `]
})
export class JobHuntComponent implements OnInit {
  private searchService = inject(JobSearchService);
  private savedJobsService = inject(SavedJobsService);

  results: DiscoveredJob[] = [];
  loading = false;
  error: string | null = null;
  searched = false;
  expandedId: string | null = null;
  userQuery = '';
  isCustomSearch = false;
  activeQueryLabel = '';

  readonly loadingMessages = [
    'Scanning for Angular & UI Architect roles…',
    'Filtering Bangalore, Remote & Europe jobs…',
    'Checking posts from the last 7 days…',
    'Scoring each role against your resume…',
    'Filtering matches above 65%…',
    'Ranking results — almost done…',
  ];
  loadingMsg = this.loadingMessages[0];
  private msgInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.runSearch();
  }

  runSearch(): void {
    this.isCustomSearch = false;
    this.activeQueryLabel = '';
    this.executeSearch(this.searchService.searchJobs());
  }

  onSearch(): void {
    const q = this.userQuery.trim();
    if (!q || this.loading) return;
    this.isCustomSearch = true;
    this.activeQueryLabel = q;
    this.executeSearch(this.searchService.searchWithQuery(q));
  }

  quickSearch(query: string): void {
    this.userQuery = query;
    this.onSearch();
  }

  clearSearch(): void {
    this.userQuery = '';
    this.runSearch();
  }

  private executeSearch(search$: ReturnType<typeof this.searchService.searchJobs>): void {
    this.loading = true;
    this.error = null;
    this.results = [];
    this.expandedId = null;
    this.startMessages();

    search$.subscribe({
      next: jobs => {
        this.results = jobs;
        this.searched = true;
        this.stopMessages();
        this.loading = false;
      },
      error: err => {
        this.error = err?.message ?? 'Failed to fetch jobs. Check your connection and try again.';
        this.stopMessages();
        this.loading = false;
        this.searched = true;
      }
    });
  }

  toggleExpand(id: string): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  scoreClass(score: number): string {
    if (score >= 80) return 'score-excellent';
    if (score >= 65) return 'score-good';
    return 'score-weak';
  }

  breakdownOf(job: DiscoveredJob) {
    return [
      { label: 'Skills Match',  value: job.result.breakdown.skills_match,       color: '#D85A30' },
      { label: 'Experience',    value: job.result.breakdown.experience_level,   color: '#534AB7' },
      { label: 'Education',     value: job.result.breakdown.education_fit,      color: '#1D9E75' },
      { label: 'Keywords',      value: job.result.breakdown.keywords_alignment, color: '#BA7517' },
    ];
  }

  isSaved(job: DiscoveredJob): boolean {
    return this.savedJobsService.isSaved(job.company, job.title);
  }

  saveJob(job: DiscoveredJob): void {
    const request: JdAnalysisRequest = {
      company: job.company,
      role: job.title,
      jobDescription: job.description,
      resumeText: '',
    };
    this.savedJobsService.save(request, job.result);
  }

  onLogoError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  private startMessages(): void {
    let i = 0;
    this.loadingMsg = this.loadingMessages[0];
    this.msgInterval = setInterval(() => {
      i = (i + 1) % this.loadingMessages.length;
      this.loadingMsg = this.loadingMessages[i];
    }, 2000);
  }

  private stopMessages(): void {
    if (this.msgInterval) { clearInterval(this.msgInterval); this.msgInterval = null; }
  }
}
