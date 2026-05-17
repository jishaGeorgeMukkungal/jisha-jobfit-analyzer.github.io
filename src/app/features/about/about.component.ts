import { Component, inject, OnInit } from '@angular/core';
import { ResumeDataService } from '../../core/services/resume-data.service';
import { ResumeData } from '../../core/models/resume.model';
import { HeroComponent } from './components/hero/hero.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { SkillsComponent } from './components/skills/skills.component';
import { EducationComponent } from './components/education/education.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { AwardsComponent } from './components/awards/awards.component';
import { SectionLabelComponent } from '../../shared/components/section-label.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    HeroComponent,
    ExperienceComponent,
    SkillsComponent,
    EducationComponent,
    ProjectsComponent,
    AwardsComponent,
    SectionLabelComponent
  ],
  template: `
    @if (resumeData) {
      <app-hero [info]="resumeData.personal" (onDownload)="downloadResume()" />

      <app-section-label text="Professional Summary" />
      <div class="bio-card">{{ resumeData.personal.summary }}</div>

      <app-section-label text="Work Experience" />
      <app-experience [experiences]="resumeData.experiences" />

      <div class="two-col">
        <div>
          <app-section-label text="Skills & Tech Stack" />
          <app-skills [skillGroups]="resumeData.skillGroups" />
        </div>
        <div>
          <app-section-label text="Education" />
          <app-education [education]="resumeData.education" />
        </div>
      </div>

      <app-section-label text="Key Projects" />
      <app-projects [projects]="resumeData.projects" />

      <app-section-label text="Awards & Recognition" />
      <app-awards [awards]="resumeData.awards" />
    }
  `,
  styles: [`
    .bio-card {
      background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px;
      padding: 1.25rem; margin-bottom: 1.5rem;
      font-size: 14px; color: #6b7280; line-height: 1.7;
    }
    app-experience, app-skills, app-education, app-projects, app-awards { display: block; margin-bottom: 1.5rem; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 0; }
    @media (max-width: 640px) { .two-col { grid-template-columns: 1fr; } }
  `]
})
export class AboutComponent implements OnInit {
  private resumeService = inject(ResumeDataService);
  resumeData!: ResumeData;

  ngOnInit(): void {
    this.resumeData = this.resumeService.getResumeData();
  }

  downloadResume(): void {
    const text = this.resumeService.getResumeAsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Jisha_MG_Resume_2026.txt';
    a.click();
    URL.revokeObjectURL(url);
  }
}
