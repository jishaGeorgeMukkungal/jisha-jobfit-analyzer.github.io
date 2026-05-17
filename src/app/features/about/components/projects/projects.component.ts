import { Component, Input } from '@angular/core';
import { Project } from '../../../../core/models/resume.model';

@Component({
  selector: 'app-projects',
  standalone: true,
  template: `
    <div class="info-card">
      <h3 class="card-title"><i class="ti ti-rocket" aria-hidden="true"></i> Key Projects</h3>
      @for (project of projects; track project.id) {
        <div class="project-item">
          <div class="project-icon" [style.background]="project.iconColor">
            <i class="ti" [class]="project.icon" aria-hidden="true"></i>
          </div>
          <div>
            <div class="proj-title">{{ project.title }}</div>
            <div class="proj-desc">{{ project.description }}</div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .info-card { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; padding: 1.25rem; }
    .card-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .card-title i { color: #D85A30; font-size: 18px; }
    .project-item { display: flex; gap: 14px; align-items: flex-start; padding: 12px; background: #f9f9f9; border-radius: 8px; margin-bottom: 10px; }
    .project-item:last-child { margin-bottom: 0; }
    .project-icon { width: 38px; height: 38px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .project-icon i { font-size: 18px; color: #534AB7; }
    .proj-title { font-size: 14px; font-weight: 500; color: #1a1a1a; margin-bottom: 4px; }
    .proj-desc { font-size: 12px; color: #6b7280; line-height: 1.55; }
  `]
})
export class ProjectsComponent {
  @Input() projects!: Project[];
}
