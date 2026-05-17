import { Component, Input } from '@angular/core';
import { Award } from '../../../../core/models/resume.model';

@Component({
  selector: 'app-awards',
  standalone: true,
  template: `
    <div class="info-card">
      <h3 class="card-title"><i class="ti ti-trophy" aria-hidden="true"></i> Awards & Recognition</h3>
      @for (award of awards; track award.id) {
        <div class="award-item">
          <i class="ti ti-medal award-icon" aria-hidden="true"></i>
          <div>
            <div class="award-name">{{ award.title }}
              <span class="award-year">{{ award.year }}</span>
            </div>
            <div class="award-org">{{ award.organization }}</div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .info-card { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; padding: 1.25rem; }
    .card-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .card-title i { color: #D85A30; font-size: 18px; }
    .award-item { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
    .award-item:last-child { margin-bottom: 0; }
    .award-icon { font-size: 20px; color: #EF9F27; margin-top: 1px; flex-shrink: 0; }
    .award-name { font-size: 14px; font-weight: 500; color: #1a1a1a; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .award-year { font-size: 11px; font-weight: 500; background: #FAEEDA; color: #633806; padding: 2px 8px; border-radius: 20px; }
    .award-org { font-size: 12px; color: #6b7280; margin-top: 2px; line-height: 1.4; }
  `]
})
export class AwardsComponent {
  @Input() awards!: Award[];
}
