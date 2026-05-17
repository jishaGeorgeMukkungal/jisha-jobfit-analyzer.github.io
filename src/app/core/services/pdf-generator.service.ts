import { inject, Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { ResumeDataService } from './resume-data.service';

const ORANGE = '#D85A30';
const DARK = '#1a1a1a';
const GRAY = '#6b7280';
const LIGHT_GRAY = '#e5e5e5';
const MARGIN = 16;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;

@Injectable({ providedIn: 'root' })
export class PdfGeneratorService {
  private resumeService = inject(ResumeDataService);

  downloadCV(): void {
    const data = this.resumeService.getResumeData();
    const p = data.personal;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    let y = MARGIN;

    const addPage = () => {
      doc.addPage();
      y = MARGIN;
    };

    const checkBreak = (needed: number) => {
      if (y + needed > PAGE_H - MARGIN) addPage();
    };

    const drawLine = (color: string, thickness = 0.3) => {
      doc.setDrawColor(color);
      doc.setLineWidth(thickness);
      doc.line(MARGIN, y, PAGE_W - MARGIN, y);
      y += 3;
    };

    const sectionHeader = (title: string) => {
      checkBreak(12);
      y += 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(ORANGE);
      doc.text(title.toUpperCase(), MARGIN, y);
      y += 3;
      doc.setDrawColor(ORANGE);
      doc.setLineWidth(0.4);
      doc.line(MARGIN, y, PAGE_W - MARGIN, y);
      y += 4;
    };

    const bodyText = (text: string, indent = 0, size = 9, color = DARK) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(size);
      doc.setTextColor(color);
      const lines = doc.splitTextToSize(text, CONTENT_W - indent);
      checkBreak(lines.length * 4.5);
      doc.text(lines, MARGIN + indent, y);
      y += lines.length * 4.5;
    };

    // ── Header ────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(DARK);
    doc.text(p.name, MARGIN, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(GRAY);
    doc.text(p.title, MARGIN, y);
    y += 6;

    // Contact row
    doc.setFontSize(8.5);
    doc.setTextColor(GRAY);
    const contactLine = `${p.email}  ·  ${p.phone}  ·  ${p.location}`;
    doc.text(contactLine, MARGIN, y);
    y += 5;

    // Links row
    doc.setTextColor(ORANGE);
    const linkedInLabel = 'LinkedIn';
    const githubLabel = 'GitHub';
    const portfolioLabel = p.portfolio;
    const linkLine = `${linkedInLabel}  ·  ${githubLabel}  ·  ${portfolioLabel}`;
    doc.text(linkLine, MARGIN, y);

    // Add actual hyperlinks
    doc.link(MARGIN, y - 3.5, 18, 4.5, { url: p.linkedin });
    const githubX = MARGIN + doc.getTextWidth(linkedInLabel + '  ·  ');
    doc.link(githubX, y - 3.5, 14, 4.5, { url: p.github });
    const portfolioX = githubX + doc.getTextWidth(githubLabel + '  ·  ');
    doc.link(portfolioX, y - 3.5, doc.getTextWidth(portfolioLabel), 4.5, { url: p.portfolio });

    y += 5;
    doc.setDrawColor(ORANGE);
    doc.setLineWidth(0.8);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 5;

    // ── Summary ───────────────────────────────────────────────────────────
    sectionHeader('Professional Summary');
    bodyText(p.summary.replace(/\s+/g, ' ').trim(), 0, 9, GRAY);
    y += 2;

    // ── Skills ────────────────────────────────────────────────────────────
    sectionHeader('Technical Skills');
    for (const group of data.skillGroups) {
      checkBreak(8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(DARK);
      doc.text(group.category + ':', MARGIN, y);
      const labelW = doc.getTextWidth(group.category + ':  ');
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(GRAY);
      const skillsText = group.skills.join('  ·  ');
      const skillLines = doc.splitTextToSize(skillsText, CONTENT_W - labelW);
      doc.text(skillLines[0], MARGIN + labelW, y);
      if (skillLines.length > 1) {
        y += 4.5;
        for (let i = 1; i < skillLines.length; i++) {
          doc.text(skillLines[i], MARGIN + labelW, y);
          y += 4.5;
        }
      } else {
        y += 4.5;
      }
    }
    y += 2;

    // ── Experience ────────────────────────────────────────────────────────
    sectionHeader('Professional Experience');
    for (const exp of data.experiences) {
      checkBreak(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(DARK);
      doc.text(exp.role, MARGIN, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(GRAY);
      const periodW = doc.getTextWidth(exp.period);
      doc.text(exp.period, PAGE_W - MARGIN - periodW, y);
      y += 4.5;

      doc.setFontSize(8.5);
      doc.setTextColor(ORANGE);
      doc.text(exp.company, MARGIN, y);
      y += 5;

      doc.setTextColor(GRAY);
      for (const bullet of exp.description) {
        checkBreak(9);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text('•', MARGIN + 1, y);
        const lines = doc.splitTextToSize(bullet, CONTENT_W - 7);
        doc.text(lines, MARGIN + 5, y);
        y += lines.length * 4.2 + 0.5;
      }
      y += 3;
    }

    // ── Education ─────────────────────────────────────────────────────────
    sectionHeader('Education');
    for (const edu of data.education) {
      checkBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(DARK);
      doc.text(edu.degree, MARGIN, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(GRAY);
      const pW = doc.getTextWidth(edu.period);
      doc.text(edu.period, PAGE_W - MARGIN - pW, y);
      y += 4.5;

      doc.setFontSize(8.5);
      doc.setTextColor(GRAY);
      doc.text(`${edu.institution}  ·  ${edu.grade}`, MARGIN, y);
      y += 6;
    }

    // ── Awards ────────────────────────────────────────────────────────────
    sectionHeader('Awards & Recognition');
    for (const award of data.awards) {
      checkBreak(9);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(DARK);
      doc.text(`${award.title}  (${award.year})`, MARGIN, y);
      y += 4.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(GRAY);
      doc.text(award.organization, MARGIN + 3, y);
      y += 5.5;
    }

    doc.save('Jisha_MG_CV_2026.pdf');
  }
}
