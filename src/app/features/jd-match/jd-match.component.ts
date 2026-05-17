import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { JdFormComponent } from './components/jd-form/jd-form.component';
import { ScoreResultComponent } from './components/score-result/score-result.component';
import { JdAnalysisService } from '../../core/services/jd-analysis.service';
import { ExcelExportService } from '../../core/services/excel-export.service';
import { JdAnalysisRequest, JdAnalysisResult } from '../../core/models/jd-analysis.model';

@Component({
  selector: 'app-jd-match',
  standalone: true,
  imports: [JdFormComponent, ScoreResultComponent],
  template: `
    <app-jd-form #jdForm (analyse)="onAnalyse($event)" />

    @if (loading) {
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Analysing your profile against the JD...</p>
      </div>
    }

    @if (result && !loading) {
      <div #resultSection>
        <app-score-result [result]="result" [request]="currentRequest!" />
      </div>
    }
  `,
  styles: [`
    .loading-state { text-align: center; padding: 3rem 1rem; margin-top: 1.5rem; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e5e5e5; border-top-color: #D85A30; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 14px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-state p { font-size: 14px; color: #9ca3af; }
  `]
})
export class JdMatchComponent {
  @ViewChild('jdForm') jdFormRef!: JdFormComponent;
  @ViewChild('resultSection') resultSection!: ElementRef<HTMLElement>;

  private analysisService = inject(JdAnalysisService);
  private excelExport = inject(ExcelExportService);
  result: JdAnalysisResult | null = null;
  currentRequest: JdAnalysisRequest | null = null;
  loading = false;

  onAnalyse(request: JdAnalysisRequest): void {
    this.loading = true;
    this.result = null;
    this.currentRequest = request;
    this.jdFormRef.setLoading(true);

    this.analysisService.analyse(request).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
        this.jdFormRef.setLoading(false);
        this.excelExport.trackJob(request, res);
        setTimeout(() => {
          this.resultSection?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      },
      error: (err) => {
        this.loading = false;
        this.jdFormRef.setError(err.message);
      }
    });
  }
}
