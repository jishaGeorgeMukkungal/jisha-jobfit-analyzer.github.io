import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { JdAnalysisService } from '../../../../core/services/jd-analysis.service';
import { SectionLabelComponent } from '../../../../shared/components/section-label.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [DatePipe, SectionLabelComponent],
  template: `
    <app-section-label text="Analysis History" />

    @if (history().length === 0) {
      <div class="empty-state">
        <i class="ti ti-history" aria-hidden="true"></i>
        <p>No analyses yet. Go to JD Match and analyse your first job!</p>
      </div>
    } @else {
      <div class="history-actions">
        <span class="history-count">{{ history().length }} analysis run</span>
        <button class="clear-btn" (click)="analysisService.clearHistory()">
          <i class="ti ti-trash" aria-hidden="true"></i> Clear all
        </button>
      </div>

      @for (item of history(); track item.id) {
        <div class="history-row">
          <span class="score-badge" [class]="getClass(item.score)">{{ item.score }}</span>
          <div class="history-body">
            <div class="company">{{ item.company || 'Unknown Company' }}</div>
            <div class="role">{{ item.role || 'Unknown Role' }}</div>
          </div>
          <div class="history-meta">
            <div class="grade" [class]="getClass(item.score)">{{ item.grade }}</div>
            <div class="date">{{ item.analysedAt | date:'d MMM yyyy' }}</div>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    .empty-state { text-align: center; padding: 4rem 1rem; color: #9ca3af; }
    .empty-state i { font-size: 48px; display: block; margin-bottom: 12px; color: #d1d5db; }
    .empty-state p { font-size: 14px; }
    .history-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .history-count { font-size: 13px; color: #9ca3af; }
    .clear-btn { background: none; border: 0.5px solid #e5e5e5; border-radius: 6px; padding: 6px 12px; font-size: 13px; color: #6b7280; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'DM Sans', sans-serif; }
    .clear-btn:hover { color: #E24B4A; border-color: #E24B4A; }
    .history-row { display: flex; align-items: center; gap: 14px; padding: 12px 16px; background: #fff; border: 0.5px solid #e5e5e5; border-radius: 10px; margin-bottom: 8px; }
    .score-badge { font-size: 14px; font-weight: 700; padding: 6px 12px; border-radius: 8px; font-family: 'Syne', sans-serif; flex-shrink: 0; }
    .history-body { flex: 1; }
    .company { font-size: 14px; font-weight: 500; color: #1a1a1a; }
    .role { font-size: 12px; color: #9ca3af; }
    .history-meta { text-align: right; }
    .grade { font-size: 12px; font-weight: 600; }
    .date { font-size: 12px; color: #9ca3af; margin-top: 2px; }
    .score-excellent { background: #E1F5EE; color: #085041; }
    .score-good      { background: #FAECE7; color: #993C1D; }
    .score-weak      { background: #FCEBEB; color: #A32D2D; }
  `]
})
export class HistoryComponent {
  analysisService = inject(JdAnalysisService);
  history = this.analysisService.history$;

  getClass(score: number): string {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    return 'score-weak';
  }
}
