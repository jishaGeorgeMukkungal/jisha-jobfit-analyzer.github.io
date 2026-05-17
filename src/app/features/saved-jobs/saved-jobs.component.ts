import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SavedJobsService } from '../../core/services/saved-jobs.service';
import { DocumentGeneratorService } from '../../core/services/document-generator.service';
import { ExcelExportService } from '../../core/services/excel-export.service';
import { SectionLabelComponent } from '../../shared/components/section-label.component';
import { SavedJob } from '../../core/models/jd-analysis.model';

@Component({
  selector: 'app-saved-jobs',
  standalone: true,
  imports: [DatePipe, SectionLabelComponent, RouterLink, FormsModule],
  template: `
    <app-section-label text="Saved Jobs" />

    <!-- Import status banner -->
    @if (importStatus) {
      <div class="import-banner" [class.import-error]="importStatus.isError">
        <i class="ti" [class.ti-circle-check]="!importStatus.isError" [class.ti-alert-circle]="importStatus.isError" aria-hidden="true"></i>
        {{ importStatus.message }}
        <button class="banner-close" (click)="importStatus = null"><i class="ti ti-x"></i></button>
      </div>
    }

    <!-- Always-visible toolbar (export + import even when list is empty) -->
    <div class="list-actions">
      @if (jobs().length > 0) {
        <span class="list-count">{{ jobs().length }} saved job{{ jobs().length !== 1 ? 's' : '' }}</span>
      } @else {
        <span class="list-count">No saved jobs yet — <a class="go-link-inline" routerLink="/jd-match">analyse a job</a> or import a backup.</span>
      }
      <div class="list-btns">
        <button class="export-btn" (click)="exportJobs()" title="Export all saved jobs to Excel (use as backup)">
          <i class="ti ti-file-spreadsheet" aria-hidden="true"></i> Export Excel
        </button>
        <button class="import-btn" (click)="fileInput.click()" title="Restore saved jobs from a previously exported Excel file">
          <i class="ti ti-upload" aria-hidden="true"></i> Import Excel
        </button>
        <input #fileInput type="file" accept=".xlsx,.xls" style="display:none" (change)="onFileSelected($event)" />
        @if (jobs().length > 0) {
          <button class="clear-btn" (click)="service.clearAll()">
            <i class="ti ti-trash" aria-hidden="true"></i> Clear all
          </button>
        }
      </div>
    </div>

    @if (jobs().length === 0) {
      <div class="empty-state">
        <i class="ti ti-bookmark-off" aria-hidden="true"></i>
        <p>No saved jobs — analyse a job and click "Save job to apply later".</p>
      </div>
    } @else {

      @for (job of jobs(); track job.id) {
        <!-- Compact row -->
        <div class="job-row" [class.is-open]="expandedId === job.id">
          <span class="score-badge" [class]="scoreClass(job.score)">{{ job.score }}</span>
          <div class="job-body">
            <div class="company">{{ job.company }}</div>
            <div class="role-row">
              <span class="role">{{ job.role }}</span>
              @if (job.applied) {
                <span class="chip chip-applied">✓ Applied</span>
              } @else {
                <span class="chip chip-pending">Not Applied</span>
              }
            </div>
            <div class="saved-date">Saved {{ job.savedAt | date:'d MMM yyyy' }}</div>
          </div>
          <div class="row-right">
            <span class="grade" [class]="scoreClass(job.score)">{{ job.grade }}</span>
            <button class="view-btn" (click)="toggleExpand(job)">
              {{ expandedId === job.id ? 'Close' : 'View' }}
              <i class="ti" [class.ti-chevron-down]="expandedId !== job.id" [class.ti-chevron-up]="expandedId === job.id" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <!-- Expanded detail panel -->
        @if (expandedId === job.id) {
          <div class="detail-panel">

            <!-- ① Job info -->
            <div class="detail-header">
              <div>
                <div class="detail-company">{{ job.company }}</div>
                <div class="detail-role">{{ job.role }}</div>
              </div>
              <div class="detail-score-block">
                <span class="big-score" [class]="scoreClass(job.score)">
                  {{ job.score }}<span class="denom">/100</span>
                </span>
                <span class="detail-grade" [class]="scoreClass(job.score)">{{ job.grade }} Match</span>
              </div>
            </div>

            <!-- ② Applied status -->
            <div class="status-row">
              <span class="status-label">Application Status</span>
              @if (job.applied) {
                <span class="status-badge applied">✓ Job Applied</span>
              } @else {
                <span class="status-badge pending">● Not Applied</span>
              }
              <button class="toggle-btn" (click)="service.updateJob(job.id, { applied: !job.applied })">
                {{ job.applied ? 'Mark as Not Applied' : 'Mark as Applied' }}
              </button>
            </div>

            <!-- ③ Apply link + Apply Now -->
            <div class="link-row">
              <i class="ti ti-link link-icon" aria-hidden="true"></i>
              <input
                class="link-input"
                [(ngModel)]="applyLinkInput"
                placeholder="Paste the job application URL…"
              />
              <button class="save-link-btn" (click)="saveLink(job)">Save</button>
              @if (job.applyLink) {
                <a class="apply-now-btn" [href]="job.applyLink" target="_blank" rel="noopener noreferrer">
                  Apply Now <i class="ti ti-external-link" aria-hidden="true"></i>
                </a>
              }
            </div>

            <!-- ④ Action buttons -->
            <div class="action-row">
              <button class="action-btn" (click)="generate('resume', job)">
                <i class="ti ti-file-text" aria-hidden="true"></i> Generate ATS Resume
              </button>
              <button class="action-btn" (click)="generate('cover', job)">
                <i class="ti ti-mail" aria-hidden="true"></i> Generate Cover Letter
              </button>
              <button class="action-btn" (click)="generate('referral', job)">
                <i class="ti ti-message-circle" aria-hidden="true"></i> Generate Referral Message
              </button>
            </div>

            <!-- ⑤ Generated content -->
            @if (generatedContent) {
              <div class="gen-panel">
                <div class="gen-header">
                  <span class="gen-title">{{ generatedContent.title }}</span>
                  <div class="gen-actions">
                    @if (!isEditing) {
                      <button class="edit-btn" (click)="startEdit()" title="Edit content">
                        <i class="ti ti-edit" aria-hidden="true"></i> Edit
                      </button>
                    } @else {
                      <button class="save-edit-btn" (click)="saveEdit()" title="Save edits">
                        <i class="ti ti-device-floppy" aria-hidden="true"></i> Save
                      </button>
                      <button class="discard-btn" (click)="discardEdit()" title="Discard edits">
                        <i class="ti ti-x" aria-hidden="true"></i>
                      </button>
                    }
                    <button class="copy-btn" [class.copied]="copied" (click)="copy()">
                      <i class="ti" [class.ti-copy]="!copied" [class.ti-check]="copied" aria-hidden="true"></i>
                      {{ copied ? 'Copied!' : 'Copy' }}
                    </button>
                    @if (!isEditing) {
                      <button class="close-gen-btn" (click)="generatedContent = null" title="Close">
                        <i class="ti ti-x" aria-hidden="true"></i>
                      </button>
                    }
                  </div>
                </div>
                @if (isEditing) {
                  <textarea class="gen-textarea" [(ngModel)]="editText"></textarea>
                } @else {
                  <pre class="gen-text">{{ generatedContent.text }}</pre>
                }
              </div>
            }

            <!-- ⑥ Footer -->
            <div class="detail-footer">
              <button class="remove-btn" (click)="removeJob(job.id)">
                <i class="ti ti-trash" aria-hidden="true"></i> Remove from saved
              </button>
            </div>

          </div>
        }
      }
    }
  `,
  styles: [`
    /* ── Import status banner ────────────────────────────────── */
    .import-banner { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #E1F5EE; border: 0.5px solid #1D9E75; border-radius: 8px; margin-bottom: 12px; font-size: 13px; color: #085041; }
    .import-banner.import-error { background: #FCEBEB; border-color: #E24B4A; color: #A32D2D; }
    .import-banner i { font-size: 16px; flex-shrink: 0; }
    .banner-close { margin-left: auto; background: none; border: none; cursor: pointer; color: inherit; opacity: 0.6; padding: 0; display: flex; }
    .banner-close:hover { opacity: 1; }

    /* ── Empty state ─────────────────────────────────────────── */
    .empty-state { text-align: center; padding: 3rem 1rem; color: #9ca3af; }
    .empty-state i { font-size: 48px; display: block; margin-bottom: 12px; color: #d1d5db; }
    .empty-state p { font-size: 14px; }

    /* ── List header ─────────────────────────────────────────── */
    .list-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
    .list-count { font-size: 13px; color: #9ca3af; }
    .go-link-inline { color: #D85A30; text-decoration: none; font-weight: 500; }
    .go-link-inline:hover { text-decoration: underline; }
    .list-btns { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .export-btn { background: none; border: 0.5px solid #1D9E75; border-radius: 6px; padding: 6px 12px; font-size: 13px; color: #1D9E75; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'DM Sans', sans-serif; font-weight: 500; white-space: nowrap; }
    .export-btn:hover { background: #E1F5EE; }
    .import-btn { background: none; border: 0.5px solid #534AB7; border-radius: 6px; padding: 6px 12px; font-size: 13px; color: #534AB7; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'DM Sans', sans-serif; font-weight: 500; white-space: nowrap; }
    .import-btn:hover { background: #EEEDFE; }
    .clear-btn { background: none; border: 0.5px solid #e5e5e5; border-radius: 6px; padding: 6px 12px; font-size: 13px; color: #6b7280; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
    .clear-btn:hover { color: #E24B4A; border-color: #E24B4A; }

    /* ── Compact row ─────────────────────────────────────────── */
    .job-row { display: flex; align-items: center; gap: 14px; padding: 12px 16px; background: #fff; border: 0.5px solid #e5e5e5; border-radius: 10px; margin-bottom: 2px; }
    .job-row.is-open { border-bottom-left-radius: 0; border-bottom-right-radius: 0; border-bottom-color: transparent; background: #fafafa; }
    .score-badge { font-size: 14px; font-weight: 700; padding: 6px 12px; border-radius: 8px; font-family: 'Syne', sans-serif; flex-shrink: 0; }
    .job-body { flex: 1; min-width: 0; }
    .company { font-size: 14px; font-weight: 500; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .role-row { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; margin-top: 2px; }
    .role { font-size: 12px; color: #9ca3af; }
    .chip { font-size: 11px; font-weight: 500; border-radius: 4px; padding: 1px 7px; }
    .chip-applied { color: #085041; background: #E1F5EE; }
    .chip-pending { color: #9ca3af; background: #f3f4f6; }
    .saved-date { font-size: 11px; color: #d1d5db; margin-top: 3px; }
    .row-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
    .grade { font-size: 12px; font-weight: 600; }
    .view-btn { display: inline-flex; align-items: center; gap: 5px; background: none; border: 0.5px solid #e5e5e5; border-radius: 6px; padding: 5px 12px; font-size: 12px; color: #6b7280; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
    .view-btn:hover { border-color: #D85A30; color: #D85A30; }

    /* ── Detail panel ────────────────────────────────────────── */
    .detail-panel { background: #fafafa; border: 0.5px solid #e5e5e5; border-top: none; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; padding: 18px 16px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 14px; }

    /* ① Header */
    .detail-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
    .detail-company { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #1a1a1a; }
    .detail-role { font-size: 13px; color: #6b7280; margin-top: 3px; }
    .detail-score-block { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
    .big-score { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; line-height: 1; }
    .denom { font-size: 13px; font-weight: 400; color: #9ca3af; }
    .detail-grade { font-size: 12px; font-weight: 600; }

    /* ② Status */
    .status-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 10px 12px; background: #fff; border: 0.5px solid #e5e5e5; border-radius: 8px; }
    .status-label { font-size: 12px; color: #9ca3af; flex-shrink: 0; }
    .status-badge { font-size: 12px; font-weight: 600; border-radius: 6px; padding: 3px 10px; }
    .status-badge.applied { color: #085041; background: #E1F5EE; }
    .status-badge.pending { color: #9ca3af; }
    .toggle-btn { margin-left: auto; background: none; border: 0.5px solid #e5e5e5; border-radius: 6px; padding: 5px 12px; font-size: 12px; color: #6b7280; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
    .toggle-btn:hover { border-color: #1D9E75; color: #1D9E75; }

    /* ③ Link row */
    .link-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .link-icon { color: #9ca3af; font-size: 16px; flex-shrink: 0; }
    .link-input { flex: 1; min-width: 180px; border: 0.5px solid #e5e5e5; border-radius: 6px; padding: 7px 10px; font-size: 13px; color: #1a1a1a; font-family: 'DM Sans', sans-serif; outline: none; background: #fff; }
    .link-input:focus { border-color: #D85A30; }
    .save-link-btn { background: none; border: 0.5px solid #e5e5e5; border-radius: 6px; padding: 7px 14px; font-size: 13px; color: #6b7280; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; flex-shrink: 0; }
    .save-link-btn:hover { border-color: #D85A30; color: #D85A30; }
    .apply-now-btn { display: inline-flex; align-items: center; gap: 5px; background: #D85A30; color: #fff; border-radius: 6px; padding: 7px 14px; font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none; white-space: nowrap; font-family: 'DM Sans', sans-serif; flex-shrink: 0; }
    .apply-now-btn:hover { background: #c04e26; }

    /* ④ Action buttons */
    .action-row { display: flex; flex-wrap: wrap; gap: 8px; }
    .action-btn { display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px; border: 0.5px solid #e5e5e5; border-radius: 8px; font-size: 13px; color: #1a1a1a; background: #fff; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; transition: border-color 0.15s, color 0.15s; }
    .action-btn:hover { border-color: #D85A30; color: #D85A30; }

    /* ⑤ Generated content */
    .gen-panel { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 8px; overflow: hidden; }
    .gen-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #f9f9f9; border-bottom: 0.5px solid #e5e5e5; }
    .gen-title { font-size: 13px; font-weight: 600; color: #1a1a1a; font-family: 'Syne', sans-serif; }
    .gen-actions { display: flex; gap: 6px; align-items: center; }
    .edit-btn { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border: 0.5px solid #6b7280; border-radius: 6px; font-size: 12px; color: #6b7280; background: none; cursor: pointer; font-family: 'DM Sans', sans-serif; }
    .edit-btn:hover { border-color: #534AB7; color: #534AB7; }
    .save-edit-btn { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border: 0.5px solid #1D9E75; border-radius: 6px; font-size: 12px; color: #1D9E75; background: none; cursor: pointer; font-family: 'DM Sans', sans-serif; }
    .save-edit-btn:hover { background: #E1F5EE; }
    .discard-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: 0.5px solid #e5e5e5; border-radius: 6px; color: #9ca3af; background: none; cursor: pointer; }
    .discard-btn:hover { border-color: #E24B4A; color: #E24B4A; }
    .copy-btn { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border: 0.5px solid #D85A30; border-radius: 6px; font-size: 12px; color: #D85A30; background: none; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: border-color 0.15s, color 0.15s; }
    .copy-btn.copied { border-color: #1D9E75; color: #1D9E75; }
    .close-gen-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: 0.5px solid #e5e5e5; border-radius: 6px; color: #9ca3af; background: none; cursor: pointer; }
    .close-gen-btn:hover { border-color: #E24B4A; color: #E24B4A; }
    .gen-text { padding: 14px; font-size: 12px; line-height: 1.75; color: #374151; white-space: pre-wrap; word-break: break-word; font-family: 'Courier New', monospace; max-height: 420px; overflow-y: auto; margin: 0; }
    .gen-textarea { width: 100%; min-height: 380px; padding: 14px; font-size: 12px; line-height: 1.75; color: #374151; font-family: 'Courier New', monospace; border: none; border-top: 0.5px solid #e5e5e5; resize: vertical; outline: none; box-sizing: border-box; background: #fefefe; }

    /* ⑥ Footer */
    .detail-footer { display: flex; justify-content: flex-end; }
    .remove-btn { display: inline-flex; align-items: center; gap: 5px; background: none; border: 0.5px solid #e5e5e5; border-radius: 6px; padding: 6px 12px; font-size: 12px; color: #9ca3af; cursor: pointer; font-family: 'DM Sans', sans-serif; }
    .remove-btn:hover { color: #E24B4A; border-color: #E24B4A; }

    /* ── Score colours ───────────────────────────────────────── */
    .score-excellent { background: #E1F5EE; color: #085041; }
    .score-good      { background: #FAECE7; color: #993C1D; }
    .score-weak      { background: #FCEBEB; color: #A32D2D; }

    @media (max-width: 600px) {
      .detail-header { flex-direction: column; }
      .detail-score-block { align-items: flex-start; }
      .action-btn { font-size: 12px; padding: 7px 10px; }
      .link-row { flex-direction: column; align-items: stretch; }
      .link-input { min-width: unset; }
    }
  `]
})
export class SavedJobsComponent {
  service = inject(SavedJobsService);
  private generator = inject(DocumentGeneratorService);
  private excelSvc = inject(ExcelExportService);

  jobs = this.service.savedJobs;
  expandedId: string | null = null;
  applyLinkInput = '';
  generatedContent: { title: string; text: string } | null = null;
  copied = false;
  isEditing = false;
  editText = '';
  importStatus: { message: string; isError: boolean } | null = null;

  exportJobs(): void {
    this.excelSvc.exportAll(this.jobs());
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    (event.target as HTMLInputElement).value = '';
    this.excelSvc.importSavedJobs(file).then(imported => {
      const { added, updated } = this.service.mergeImport(imported);
      this.importStatus = {
        message: `Import complete: ${added} new job${added !== 1 ? 's' : ''} added, ${updated} updated.`,
        isError: false
      };
      setTimeout(() => (this.importStatus = null), 6000);
    }).catch(err => {
      this.importStatus = { message: err.message ?? 'Import failed.', isError: true };
    });
  }

  scoreClass(score: number): string {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    return 'score-weak';
  }

  toggleExpand(job: SavedJob): void {
    if (this.expandedId === job.id) {
      this.expandedId = null;
      this.generatedContent = null;
      this.isEditing = false;
    } else {
      this.expandedId = job.id;
      this.applyLinkInput = job.applyLink ?? '';
      this.generatedContent = null;
      this.isEditing = false;
    }
  }

  saveLink(job: SavedJob): void {
    this.service.updateJob(job.id, { applyLink: this.applyLinkInput.trim() });
  }

  generate(type: 'resume' | 'cover' | 'referral', job: SavedJob): void {
    const map: Record<typeof type, { title: string; text: string }> = {
      resume:   { title: 'ATS-Friendly Resume',      text: this.generator.generateATSResume(job) },
      cover:    { title: 'Cover Letter',             text: this.generator.generateCoverLetter(job) },
      referral: { title: 'Referral Request Message', text: this.generator.generateReferralMessage(job) },
    };
    this.generatedContent = map[type];
    this.copied = false;
    this.isEditing = false;
  }

  startEdit(): void {
    if (!this.generatedContent) return;
    this.editText = this.generatedContent.text;
    this.isEditing = true;
  }

  saveEdit(): void {
    if (this.generatedContent) this.generatedContent.text = this.editText;
    this.isEditing = false;
  }

  discardEdit(): void {
    this.isEditing = false;
  }

  copy(): void {
    if (!this.generatedContent) return;
    const text = this.isEditing ? this.editText : this.generatedContent.text;
    navigator.clipboard.writeText(text).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }

  removeJob(id: string): void {
    this.service.removeById(id);
    this.expandedId = null;
    this.generatedContent = null;
  }
}
