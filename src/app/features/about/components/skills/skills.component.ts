import { Component, Input } from '@angular/core';
import { SkillGroup } from '../../../../core/models/resume.model';

@Component({
  selector: 'app-skills',
  standalone: true,
  template: `
    <div class="info-card">
      <h3 class="card-title"><i class="ti ti-code" aria-hidden="true"></i> Skills & Tech Stack</h3>
      @for (group of skillGroups; track group.category) {
        <div class="skill-group">
          <div class="group-label">{{ group.category }}</div>
          <div class="skill-pills">
            @for (skill of group.skills; track skill) {
              <span class="skill-pill" [class]="group.colorClass">{{ skill }}</span>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .info-card { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; padding: 1.25rem; }
    .card-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .card-title i { color: #D85A30; font-size: 18px; }
    .skill-group { margin-bottom: 14px; }
    .skill-group:last-child { margin-bottom: 0; }
    .group-label { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
    .skill-pills { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-pill { font-size: 12px; padding: 4px 10px; border-radius: 20px; font-weight: 500; }
    .pill-orange { background: #FAECE7; color: #993C1D; }
    .pill-purple { background: #EEEDFE; color: #3C3489; }
    .pill-teal   { background: #E1F5EE; color: #085041; }
    .pill-blue   { background: #E6F1FB; color: #185FA5; }
  `]
})
export class SkillsComponent {
  @Input() skillGroups!: SkillGroup[];
}
