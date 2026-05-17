import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="top-nav">
      <div class="brand">jisha<span>.</span>mg</div>
      <div class="nav-tabs">
        <a class="nav-tab" routerLink="/about" routerLinkActive="active">
          <i class="ti ti-user" aria-hidden="true"></i>
          <span>About</span>
        </a>
        <a class="nav-tab" routerLink="/jd-match" routerLinkActive="active">
          <i class="ti ti-briefcase" aria-hidden="true"></i>
          <span>JD Match</span>
        </a>
        <a class="nav-tab" routerLink="/saved-jobs" routerLinkActive="active">
          <i class="ti ti-bookmark" aria-hidden="true"></i>
          <span>Saved Jobs</span>
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .top-nav {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 2rem; height: 56px;
      background: #fff;
      border-bottom: 0.5px solid #e5e5e5;
      position: sticky; top: 0; z-index: 100;
      box-shadow: 0 1px 0 rgba(0,0,0,0.04);
    }
    .brand {
      font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px;
      color: #1a1a1a; letter-spacing: -0.5px; text-decoration: none;
    }
    .brand span { color: #D85A30; }
    .nav-tabs { display: flex; }
    .nav-tab {
      padding: 0 1.25rem; height: 56px; display: flex; align-items: center; gap: 8px;
      font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none;
      color: #6b7280; border-bottom: 2.5px solid transparent;
      transition: color 0.15s, border-color 0.15s;
      font-family: 'DM Sans', sans-serif;
    }
    .nav-tab:hover { color: #1a1a1a; }
    .nav-tab.active { color: #D85A30; border-bottom-color: #D85A30; }
    .nav-tab i { font-size: 16px; }
    @media (max-width: 480px) {
      .top-nav { padding: 0 1rem; }
      .nav-tab span { display: none; }
      .nav-tab { padding: 0 1rem; }
    }
  `]
})
export class NavbarComponent {}
