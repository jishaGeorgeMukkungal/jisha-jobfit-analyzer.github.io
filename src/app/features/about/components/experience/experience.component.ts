import { Component, Input } from '@angular/core';
import { Experience } from '../../../../core/models/resume.model';

@Component({
  selector: 'app-experience',
  standalone: true,
  template: `
    <div class="info-card">
      @for (exp of experiences; track exp.id; let last = $last) {
        <div class="exp-item" [class.last]="last">
          <div class="exp-dot"><i class="ti ti-briefcase" aria-hidden="true"></i></div>
          <div class="exp-content">
            <div class="exp-role">{{ exp.role }}</div>
            <div class="exp-company">{{ exp.company }}</div>
            <div class="exp-period">{{ exp.period }}</div>
            <ul class="exp-bullets">
              @for (point of exp.description; track point) {
                <li>{{ point }}</li>
              }
            </ul>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .info-card { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; padding: 1.25rem; }
    .exp-item { display: flex; gap: 16px; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 0.5px solid #f0f0f0; position: relative; }
    .exp-item.last { border: none; padding: 0; margin: 0; }
    .exp-dot {
      width: 36px; height: 36px; border-radius: 8px; background: #FAECE7; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; margin-top: 2px;
    }
    .exp-dot i { color: #D85A30; font-size: 18px; }
    .exp-role { font-weight: 500; font-size: 14px; color: #1a1a1a; margin-bottom: 2px; }
    .exp-company { font-size: 13px; color: #D85A30; font-weight: 500; margin-bottom: 2px; }
    .exp-period { font-size: 12px; color: #9ca3af; margin-bottom: 8px; }
    .exp-bullets { list-style: none; padding: 0; margin: 0; }
    .exp-bullets li {
      font-size: 13px; color: #6b7280; padding: 3px 0 3px 16px;
      position: relative; line-height: 1.55;
    }
    .exp-bullets li::before { content: '•'; position: absolute; left: 4px; color: #D85A30; }
  `]
})
export class ExperienceComponent {
  @Input() experiences!: Experience[];
}
