import { Component, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JdAnalysisRequest } from '../../../../core/models/jd-analysis.model';
import { ResumeDataService } from '../../../../core/services/resume-data.service';

@Component({
  selector: 'app-jd-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" class="jd-grid" (ngSubmit)="submit()">
      <div class="jd-card">
        <label><i class="ti ti-building" aria-hidden="true"></i> Job Details</label>
        <input formControlName="company" type="text" placeholder="Company name (e.g. Google)" />
        <input formControlName="role" type="text" placeholder="Role (e.g. Angular Architect)" />
        <label style="margin-top:8px"><i class="ti ti-file-text" aria-hidden="true"></i> Job Description</label>
        <textarea formControlName="jobDescription" placeholder="Paste the full job description here..."></textarea>
      </div>

      <div class="jd-card">
        <label><i class="ti ti-user-check" aria-hidden="true"></i> My Profile / Resume</label>
        <textarea formControlName="resumeText" class="resume-ta"></textarea>
      </div>

      <div class="submit-row">
        <button type="submit" class="analyze-btn" [disabled]="loading || form.invalid">
          @if (loading) {
            <span class="spinner"></span> Analysing...
          } @else {
            <i class="ti ti-sparkles" aria-hidden="true"></i> Analyse Match with AI
          }
        </button>
      </div>
    </form>

    @if (error) {
      <div class="error-msg"><i class="ti ti-alert-circle"></i> {{ error }}</div>
    }
  `,
  styles: [`
    .jd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 640px) { .jd-grid { grid-template-columns: 1fr; } }
    .jd-card { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; padding: 1.25rem; }
    .jd-card label { font-size: 13px; font-weight: 500; color: #6b7280; display: block; margin-bottom: 8px; }
    .jd-card label i { color: #D85A30; margin-right: 4px; }
    .jd-card input, .jd-card textarea {
      width: 100%; border: 0.5px solid #d1d5db; border-radius: 8px; padding: 8px 12px;
      font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none;
      background: #f9f9f9; color: #1a1a1a; resize: vertical; margin-bottom: 8px;
      transition: border-color 0.15s;
    }
    .jd-card input:focus, .jd-card textarea:focus { border-color: #D85A30; }
    .jd-card textarea { min-height: 180px; }
    .resume-ta { min-height: 230px !important; font-size: 12px !important; line-height: 1.6; }
    .submit-row { grid-column: 1 / -1; }
    .analyze-btn {
      width: 100%; padding: 13px; background: #D85A30; color: #fff;
      border: none; border-radius: 10px; font-size: 15px; font-weight: 500;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
      font-family: 'DM Sans', sans-serif; transition: background 0.15s;
    }
    .analyze-btn:hover:not(:disabled) { background: #993C1D; }
    .analyze-btn:disabled { background: #d1d5db; cursor: not-allowed; }
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error-msg { margin-top: 12px; padding: 10px 14px; background: #FCEBEB; color: #A32D2D; border-radius: 8px; font-size: 13px; display: flex; align-items: center; gap: 8px; }
  `]
})
export class JdFormComponent {
  @Output() analyse = new EventEmitter<JdAnalysisRequest>();
  @Output() loadingChange = new EventEmitter<boolean>();

  private fb = inject(FormBuilder);
  private resumeService = inject(ResumeDataService);

  loading = false;
  error = '';

  form: FormGroup = this.fb.group({
    company: [''],
    role: [''],
    jobDescription: ['', Validators.required],
    resumeText: [this.resumeService.getResumeAsText(), Validators.required]
  });

  submit(): void {
    if (this.form.invalid) return;
    this.analyse.emit(this.form.value as JdAnalysisRequest);
  }

  setLoading(val: boolean): void {
    this.loading = val;
    if (val) this.error = '';
  }

  setError(msg: string): void {
    this.error = msg;
    this.loading = false;
  }
}
