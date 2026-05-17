import { Component, inject, Input } from '@angular/core';
import { JdAnalysisRequest, JdAnalysisResult } from '../../../../core/models/jd-analysis.model';
import { SavedJobsService } from '../../../../core/services/saved-jobs.service';

@Component({
  selector: 'app-score-result',
  standalone: true,
  template: `
    <div class="score-panel">
      <div class="score-top">
        <div class="score-circle" [class]="scoreClass">
          <span class="score-number">{{ result.overall_score }}</span>
          <span class="score-sub">/ 100</span>
        </div>
        <div>
          <div class="score-grade" [class]="scoreClass">{{ result.grade }} Match</div>
          <div class="score-summary">{{ result.summary }}</div>
        </div>
      </div>

      <div class="breakdown-grid">
        @for (item of breakdownItems; track item.label) {
          <div class="breakdown-item">
            <div class="b-label">{{ item.label }}</div>
            <div class="b-bar">
              <div class="b-fill" [style.width.%]="item.value" [style.background]="item.color"></div>
            </div>
            <div class="b-score">{{ item.value }}%</div>
          </div>
        }
      </div>

      <div class="section-divider">Detailed Feedback</div>

      <div class="feedback-block">
        <h4><i class="ti ti-circle-check success-icon"></i> Strengths</h4>
        <ul>@for (s of result.strengths; track s) { <li>{{ s }}</li> }</ul>
      </div>

      <div class="feedback-block">
        <h4><i class="ti ti-alert-circle danger-icon"></i> Gaps to Address</h4>
        <ul>@for (g of result.gaps; track g) { <li>{{ g }}</li> }</ul>
      </div>

      <div class="feedback-block">
        <h4><i class="ti ti-bulb warn-icon"></i> Suggestions</h4>
        <ul>@for (s of result.suggestions; track s) { <li>{{ s }}</li> }</ul>
      </div>

      <div class="save-row">
        @if (!saved) {
          <button class="save-btn" (click)="saveJob()">
            <i class="ti ti-bookmark"></i> Save job to apply later
          </button>
        } @else {
          <button class="save-btn saved" (click)="unsaveJob()">
            <i class="ti ti-bookmark-filled"></i> Saved — click to remove
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .score-panel { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; padding: 1.5rem; margin-top: 1.5rem; }
    .score-top { display: flex; align-items: center; gap: 2rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .score-circle {
      width: 110px; height: 110px; border-radius: 50%; flex-shrink: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      border: 5px solid;
    }
    .score-number { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; }
    .score-sub { font-size: 12px; color: #9ca3af; }
    .score-grade { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 6px; }
    .score-summary { font-size: 14px; color: #6b7280; line-height: 1.6; }

    .score-excellent { border-color: #1D9E75 !important; background: #E1F5EE; color: #085041; }
    .score-good      { border-color: #D85A30 !important; background: #FAECE7; color: #993C1D; }
    .score-weak      { border-color: #E24B4A !important; background: #FCEBEB; color: #A32D2D; }

    .breakdown-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 1.5rem; }
    .breakdown-item { background: #f9f9f9; border-radius: 8px; padding: 12px; }
    .b-label { font-size: 11px; color: #9ca3af; margin-bottom: 6px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
    .b-bar { height: 6px; border-radius: 3px; background: #e5e5e5; margin-bottom: 6px; overflow: hidden; }
    .b-fill { height: 100%; border-radius: 3px; transition: width 0.8s ease; }
    .b-score { font-size: 13px; font-weight: 500; color: #1a1a1a; }

    .section-divider { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #D85A30; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .section-divider::after { content: ''; flex: 1; height: 0.5px; background: #e5e5e5; }

    .feedback-block { margin-bottom: 14px; }
    .feedback-block h4 { font-size: 13px; font-weight: 500; color: #1a1a1a; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
    .feedback-block ul { list-style: none; padding: 0; }
    .feedback-block li { font-size: 13px; color: #6b7280; padding: 3px 0 3px 18px; position: relative; line-height: 1.5; }
    .feedback-block li::before { content: '•'; position: absolute; left: 6px; color: #D85A30; }
    .success-icon { color: #1D9E75; font-size: 16px; }
    .danger-icon  { color: #E24B4A; font-size: 16px; }
    .warn-icon    { color: #BA7517; font-size: 16px; }

    .save-row { margin-top: 1.25rem; display: flex; justify-content: flex-end; }
    .save-btn {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 500;
      cursor: pointer; border: 1.5px solid #D85A30; color: #D85A30; background: transparent;
      transition: background 0.15s, color 0.15s;
    }
    .save-btn:hover { background: #FAECE7; }
    .save-btn.saved { border-color: #1D9E75; color: #1D9E75; }
    .save-btn.saved:hover { background: #E1F5EE; }
  `]
})
export class ScoreResultComponent {
  @Input() request!: JdAnalysisRequest;

  private savedJobsService = inject(SavedJobsService);

  @Input() set result(val: JdAnalysisResult) {
    this._result = val;
    this.scoreClass = val.overall_score >= 80 ? 'score-excellent' : val.overall_score >= 60 ? 'score-good' : 'score-weak';
    this.breakdownItems = [
      { label: 'Skills Match',    value: val.breakdown.skills_match,       color: '#D85A30' },
      { label: 'Experience',      value: val.breakdown.experience_level,   color: '#534AB7' },
      { label: 'Education',       value: val.breakdown.education_fit,      color: '#1D9E75' },
      { label: 'Keywords',        value: val.breakdown.keywords_alignment, color: '#BA7517' }
    ];
  }
  get result(): JdAnalysisResult { return this._result; }

  private _result!: JdAnalysisResult;
  scoreClass = '';
  breakdownItems: { label: string; value: number; color: string }[] = [];

  get saved(): boolean {
    return this.request ? this.savedJobsService.isSaved(this.request.company, this.request.role) : false;
  }

  saveJob(): void {
    this.savedJobsService.save(this.request, this._result);
  }

  unsaveJob(): void {
    this.savedJobsService.remove(this.request.company, this.request.role);
  }
}
