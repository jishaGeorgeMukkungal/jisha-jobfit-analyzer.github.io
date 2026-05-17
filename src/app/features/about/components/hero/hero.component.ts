import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PersonalInfo } from '../../../../core/models/resume.model';

@Component({
  selector: 'app-hero',
  standalone: true,
  template: `
    <div class="hero-card">
      <div class="hero-bg-circle c1"></div>
      <div class="hero-bg-circle c2"></div>
      <div class="avatar">{{ info.initials }}</div>
      <div class="hero-info">
        <h1>{{ info.name }}</h1>
        <p class="hero-title">{{ info.title }}</p>
        <div class="hero-tags">
          @for (tag of info.tags; track tag) {
            <span class="hero-tag">{{ tag }}</span>
          }
        </div>
        <div class="contact-links">
          <a class="contact-link" [href]="'mailto:' + info.email">
            <i class="ti ti-mail" aria-hidden="true"></i>{{ info.email }}
          </a>
          <a class="contact-link" [href]="'tel:' + info.phone">
            <i class="ti ti-phone" aria-hidden="true"></i>{{ info.phone }}
          </a>
          <a class="contact-link" [href]="info.linkedin" target="_blank" rel="noopener noreferrer">
            <i class="ti ti-brand-linkedin" aria-hidden="true"></i>LinkedIn
          </a>
          <a class="contact-link" [href]="info.github" target="_blank" rel="noopener noreferrer">
            <i class="ti ti-brand-github" aria-hidden="true"></i>GitHub
          </a>
          <a class="contact-link" [href]="info.portfolio" target="_blank" rel="noopener noreferrer">
            <i class="ti ti-world" aria-hidden="true"></i>Portfolio
          </a>
        </div>
      </div>
      <button class="download-btn" (click)="onDownload.emit()">
        <i class="ti ti-download" aria-hidden="true"></i>
        Download CV
      </button>
    </div>
  `,
  styles: [`
    .hero-card {
      background: linear-gradient(135deg, #D85A30 0%, #993C1D 55%, #26215C 100%);
      border-radius: 16px; padding: 2.5rem; margin-bottom: 1.5rem;
      display: flex; align-items: center; gap: 2rem; position: relative; overflow: hidden;
    }
    .hero-bg-circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.06); }
    .c1 { width: 220px; height: 220px; right: -60px; top: -60px; }
    .c2 { width: 180px; height: 180px; right: 60px; bottom: -80px; background: rgba(255,255,255,0.04); }
    .avatar {
      width: 88px; height: 88px; border-radius: 50%; flex-shrink: 0;
      background: rgba(255,255,255,0.18);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 800; color: #fff;
      border: 3px solid rgba(255,255,255,0.3); z-index: 1;
    }
    .hero-info { flex: 1; z-index: 1; }
    .hero-info h1 { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 4px; }
    .hero-title { color: rgba(255,255,255,0.75); font-size: 13px; margin-bottom: 12px; line-height: 1.5; }
    .hero-tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .hero-tag { background: rgba(255,255,255,0.15); color: #fff; font-size: 12px; padding: 4px 10px; border-radius: 20px; }
    .contact-links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
    .contact-link {
      display: inline-flex; align-items: center; gap: 5px;
      color: rgba(255,255,255,0.85); font-size: 12px; text-decoration: none;
      background: rgba(255,255,255,0.1); border-radius: 20px; padding: 4px 10px;
      transition: background 0.15s, color 0.15s;
    }
    .contact-link:hover { background: rgba(255,255,255,0.22); color: #fff; }
    .contact-link i { font-size: 13px; }
    .download-btn {
      flex-shrink: 0; z-index: 1;
      background: #fff; color: #993C1D; border: none; cursor: pointer;
      padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 500;
      display: flex; align-items: center; gap: 6px;
      font-family: 'DM Sans', sans-serif; transition: opacity 0.15s;
    }
    .download-btn:hover { opacity: 0.9; }
    @media (max-width: 600px) {
      .hero-card { flex-wrap: wrap; padding: 1.5rem; }
      .download-btn { width: 100%; justify-content: center; }
    }
  `]
})
export class HeroComponent {
  @Input() info!: PersonalInfo;
  @Output() onDownload = new EventEmitter<void>();
}
