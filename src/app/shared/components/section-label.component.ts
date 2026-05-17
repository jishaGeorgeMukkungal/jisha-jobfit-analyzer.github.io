import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-label',
  standalone: true,
  template: `<div class="section-label">{{ text }}</div>`,
  styles: [`
    .section-label {
      font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
      letter-spacing: 1.5px; text-transform: uppercase; color: #D85A30;
      margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
    }
    .section-label::after { content: ''; flex: 1; height: 0.5px; background: #e5e5e5; }
  `]
})
export class SectionLabelComponent {
  @Input() text!: string;
}
