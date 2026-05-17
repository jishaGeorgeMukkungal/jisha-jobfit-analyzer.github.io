import { Component, Input } from '@angular/core';
import { Education } from '../../../../core/models/resume.model';

@Component({
  selector: 'app-education',
  standalone: true,
  template: `
    <div class="info-card">
      <h3 class="card-title"><i class="ti ti-school" aria-hidden="true"></i> Education</h3>
      @for (edu of education; track edu.id; let last = $last) {
        <div class="edu-item" [class.last]="last">
          <div class="edu-dot"><i class="ti ti-certificate" aria-hidden="true"></i></div>
          <div>
            <div class="deg">{{ edu.degree }}</div>
            <div class="school">{{ edu.institution }}</div>
            <div class="meta">{{ edu.period }} &nbsp;·&nbsp; {{ edu.grade }}</div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .info-card { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; padding: 1.25rem; }
    .card-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .card-title i { color: #D85A30; font-size: 18px; }
    .edu-item { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 14px; }
    .edu-item.last { margin-bottom: 0; }
    .edu-dot { width: 36px; height: 36px; border-radius: 8px; background: #FAECE7; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .edu-dot i { color: #D85A30; font-size: 18px; }
    .deg { font-size: 14px; font-weight: 500; color: #1a1a1a; }
    .school { font-size: 13px; color: #6b7280; margin-top: 1px; }
    .meta { font-size: 12px; color: #9ca3af; margin-top: 2px; }
  `]
})
export class EducationComponent {
  @Input() education!: Education[];
}
