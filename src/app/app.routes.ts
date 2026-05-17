import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'about',
    pathMatch: 'full'
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'jd-match',
    loadComponent: () =>
      import('./features/jd-match/jd-match.component').then(m => m.JdMatchComponent)
  },
  {
    path: 'saved-jobs',
    loadComponent: () =>
      import('./features/saved-jobs/saved-jobs.component').then(m => m.SavedJobsComponent)
  },
  {
    path: '**',
    redirectTo: 'about'
  }
];
