import { inject, Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { ResumeDataService } from './resume-data.service';

const MARGIN_X = 18;
const MARGIN_Y = 18;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN_X * 2;
const BLACK = '#1a1a1a';
const DARK_GRAY = '#444444';
const MID_GRAY = '#666666';
const LINE_COLOR = '#aaaaaa';
const LINE_HEIGHT_BODY = 5;
const LINE_HEIGHT_BULLET = 4.8;

@Injectable({ providedIn: 'root' })
export class PdfGeneratorService {
  private resumeService = inject(ResumeDataService);

  downloadCV(): void {
    const data = this.resumeService.getResumeData();
    const p = data.personal;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    let y = MARGIN_Y;

    const addPage = () => { doc.addPage(); y = MARGIN_Y; };

    const checkBreak = (needed: number) => {
      if (y + needed > PAGE_H - MARGIN_Y) addPage();
    };

    const hRule = () => {
      doc.setDrawColor(LINE_COLOR);
      doc.setLineWidth(0.3);
      doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
      y += 4;
    };

    const sectionHeader = (title: string) => {
      checkBreak(14);
      y += 1;
      hRule();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(BLACK);
      doc.text(title, MARGIN_X, y);
      y += 5;
    };

    const paragraph = (text: string, indent = 0, size = 9, color = DARK_GRAY) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(size);
      doc.setTextColor(color);
      const lines = doc.splitTextToSize(text.trim(), CONTENT_W - indent);
      checkBreak(lines.length * LINE_HEIGHT_BODY + 1);
      doc.text(lines, MARGIN_X + indent, y);
      y += lines.length * LINE_HEIGHT_BODY;
    };

    const bullet = (text: string, indent = 4) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(DARK_GRAY);
      const lines = doc.splitTextToSize(text.trim(), CONTENT_W - indent - 3);
      checkBreak(lines.length * LINE_HEIGHT_BULLET + 1);
      doc.text('•', MARGIN_X + indent - 3, y);
      doc.text(lines, MARGIN_X + indent, y);
      y += lines.length * LINE_HEIGHT_BULLET + 0.5;
    };

    // ── NAME ─────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(BLACK);
    doc.text(p.name, MARGIN_X, y);
    y += 6;

    // ── TITLE ─────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(DARK_GRAY);
    doc.text(p.title, MARGIN_X, y);
    y += 6;

    // ── TWO-COLUMN CONTACT INFO ───────────────────────────────────────────
    const leftX = MARGIN_X;
    const rightX = PAGE_W / 2 + 2;
    doc.setFontSize(8.5);

    // Row 1
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(DARK_GRAY);
    doc.text(`Location: ${p.location}`, leftX, y);
    doc.setFont('helvetica', 'bold');
    doc.text('GitHub: ', rightX, y);
    const ghLabelW = doc.getTextWidth('GitHub: ');
    doc.setFont('helvetica', 'normal');
    doc.text(p.github.replace('https://', ''), rightX + ghLabelW, y);
    doc.link(rightX + ghLabelW, y - 3.5, doc.getTextWidth(p.github.replace('https://', '')), 4.5, { url: p.github });
    y += 5;

    // Row 2
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(DARK_GRAY);
    doc.text(`Phone: ${p.phone}`, leftX, y);
    doc.setFont('helvetica', 'bold');
    doc.text('Portfolio: ', rightX, y);
    const portLabelW = doc.getTextWidth('Portfolio: ');
    doc.setFont('helvetica', 'normal');
    const portText = p.portfolio.replace('https://', '');
    doc.text(portText, rightX + portLabelW, y);
    doc.link(rightX + portLabelW, y - 3.5, doc.getTextWidth(portText), 4.5, { url: p.portfolio });
    y += 5;

    // Row 3
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(DARK_GRAY);
    doc.text(`Email: ${p.email}`, leftX, y);
    doc.text('LinkedIn: ', rightX, y);
    const liLabelW = doc.getTextWidth('LinkedIn: ');
    const liText = p.linkedin.replace('https://', '');
    doc.text(liText, rightX + liLabelW, y);
    doc.link(rightX + liLabelW, y - 3.5, doc.getTextWidth(liText), 4.5, { url: p.linkedin });
    y += 8;

    // ── PROFESSIONAL SUMMARY ──────────────────────────────────────────────
    sectionHeader('PROFESSIONAL SUMMARY');
    const summaryParas = p.summary.split('\n\n');
    for (let i = 0; i < summaryParas.length; i++) {
      paragraph(summaryParas[i]);
      if (i < summaryParas.length - 1) y += 2.5;
    }
    y += 2;

    // ── CORE SKILLS ───────────────────────────────────────────────────────
    sectionHeader('CORE SKILLS');
    for (const group of data.skillGroups) {
      checkBreak(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(BLACK);
      doc.text(group.category, MARGIN_X, y);
      y += 4.5;
      paragraph(group.skills.join(', '));
      y += 2;
    }
    y += 1;

    // ── PROFESSIONAL EXPERIENCE ───────────────────────────────────────────
    sectionHeader('PROFESSIONAL EXPERIENCE');

    for (const exp of data.experiences) {
      checkBreak(18);
      // Bold: Company – Role on same line
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(BLACK);
      const companyRole = `${exp.company} ${exp.role}`;
      const crLines = doc.splitTextToSize(companyRole, CONTENT_W);
      doc.text(crLines, MARGIN_X, y);
      y += crLines.length * 5;

      // Period
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(MID_GRAY);
      doc.text(exp.period, MARGIN_X, y);
      y += 5.5;

      // Bullets
      for (const item of exp.description) {
        bullet(item);
      }
      y += 4;
    }

    // ── KEY ACHIEVEMENTS ──────────────────────────────────────────────────
    sectionHeader('KEY ACHIEVEMENTS');
    for (const proj of data.projects) {
      checkBreak(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(BLACK);
      doc.text(proj.title, MARGIN_X, y);
      y += 5;
      paragraph(proj.description);
      y += 3;
    }

    // ── EDUCATION ─────────────────────────────────────────────────────────
    sectionHeader('EDUCATION');
    for (const edu of data.education) {
      checkBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(BLACK);
      doc.text(`${edu.degree} – ${edu.institution}`, MARGIN_X, y);
      y += 4.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(DARK_GRAY);
      doc.text(`Grade: ${edu.grade} (${edu.period})`, MARGIN_X, y);
      y += 6;
    }

    // ── AWARDS & RECOGNITION ──────────────────────────────────────────────
    sectionHeader('AWARDS & RECOGNITION');
    for (const award of data.awards) {
      const yearPart = award.year ? ` (${award.year})` : '';
      bullet(`${award.title}${yearPart} – ${award.organization}`);
    }
    y += 2;

    // ── ADDITIONAL INFORMATION ────────────────────────────────────────────
    sectionHeader('ADDITIONAL INFORMATION');
    for (const info of data.additionalInfo) {
      bullet(info);
    }

    doc.save('Jisha_MG_Resume_2026.pdf');
  }
}
