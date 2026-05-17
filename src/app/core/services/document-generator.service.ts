import { inject, Injectable } from '@angular/core';
import { SavedJob } from '../models/jd-analysis.model';
import { ResumeDataService } from './resume-data.service';

@Injectable({ providedIn: 'root' })
export class DocumentGeneratorService {
  private resumeService = inject(ResumeDataService);

  generateATSResume(job: SavedJob): string {
    const r = this.resumeService.getResumeData();
    const jdWords = this.extractKeywords(job.jobDescription);
    const score = (text: string) => jdWords.filter(kw => text.toLowerCase().includes(kw)).length;

    const allSkills = r.skillGroups.flatMap(g => g.skills);
    const matchedSkills = allSkills.filter(s => score(s) > 0);
    const additionalSkills = allSkills.filter(s => score(s) === 0);

    // Sort each job's bullets so the most JD-relevant come first
    const experiences = r.experiences.map(exp => ({
      ...exp,
      description: [...exp.description].sort((a, b) => score(b) - score(a))
    }));

    const div = '─'.repeat(58);
    const tailoredSummary =
      `Results-driven professional targeting the ${job.role} role at ${job.company}. ` +
      r.personal.summary.replace(/\n\s+/g, ' ').trim();

    const lines: string[] = [
      r.personal.name.toUpperCase(),
      r.personal.title,
      `${r.personal.location}  •  ${r.personal.email}  •  ${r.personal.phone}`,
      r.personal.linkedin,
      '',
      div,
      'PROFESSIONAL SUMMARY',
      div,
      tailoredSummary,
      '',
      div,
      'TECHNICAL SKILLS',
      div,
    ];

    if (matchedSkills.length > 0) lines.push(`Core Match  :  ${matchedSkills.join('  |  ')}`);
    if (additionalSkills.length > 0) lines.push(`Additional  :  ${additionalSkills.join('  |  ')}`);

    lines.push('', div, 'PROFESSIONAL EXPERIENCE', div);
    experiences.forEach(exp => {
      lines.push(exp.role, `${exp.company}  |  ${exp.period}`);
      exp.description.forEach(d => lines.push(`  • ${d}`));
      lines.push('');
    });

    lines.push(div, 'EDUCATION', div);
    r.education.forEach(e => {
      lines.push(e.degree, `${e.institution}  |  ${e.period}  |  ${e.grade}`, '');
    });

    lines.push(div, 'AWARDS & RECOGNITION', div);
    r.awards.forEach(a => lines.push(`  • ${a.title} (${a.year}) — ${a.organization}`));

    return lines.join('\n').trim();
  }

  generateCoverLetter(job: SavedJob): string {
    const r = this.resumeService.getResumeData();
    const jdWords = this.extractKeywords(job.jobDescription);
    const allSkills = r.skillGroups.flatMap(g => g.skills);
    const topMatched = allSkills.filter(s => jdWords.some(kw => s.toLowerCase().includes(kw))).slice(0, 4);
    const date = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    const skillPhrase = topMatched.length > 0
      ? `My hands-on expertise in ${topMatched.join(', ')} aligns directly with your requirements for this position.`
      : 'My extensive frontend engineering and leadership background aligns well with this role.';

    return [
      date,
      '',
      'Hiring Manager',
      job.company,
      '',
      `Re: Application for ${job.role}`,
      '',
      'Dear Hiring Manager,',
      '',
      `I am excited to apply for the ${job.role} position at ${job.company}. With 9+ years of experience architecting and leading delivery of scalable enterprise frontend applications, I bring a strong track record in technical leadership, Angular engineering, and cross-functional collaboration.`,
      '',
      `In my current role as Frontend Engineering Lead at Digit Insurance, I lead a team of 15+ engineers delivering mission-critical customer-facing insurance platforms. I have driven a 35% performance improvement through optimization strategies, led a large-scale Angular 13→20 migration, and architected the Google Pay SPOT integration across multiple high-traffic products. ${skillPhrase}`,
      '',
      `I hold an M.Sc. in Information Technology from Jain University (3rd Rank, 80.5%) and have been recognised with the Top Gun Award (2024) and Tech Titan Award (2021 & 2022) at Digit Insurance for engineering excellence and leadership.`,
      '',
      `I am genuinely excited about this opportunity at ${job.company} and would welcome the chance to discuss how my background fits your needs.`,
      '',
      'Thank you for your time and consideration.',
      '',
      'Warm regards,',
      r.personal.name,
      r.personal.email,
      r.personal.phone,
      r.personal.linkedin,
    ].join('\n');
  }

  generateReferralMessage(job: SavedJob): string {
    const r = this.resumeService.getResumeData();

    return [
      'Hi [Name],',
      '',
      `Hope you\'re doing well! I came across the ${job.role} opening at ${job.company} and it really caught my attention — the role aligns closely with my experience.`,
      '',
      `I\'m ${r.personal.name}, a Frontend Engineering Lead with 9+ years of experience in Angular architecture, frontend engineering, and team leadership. I currently lead a team of 15+ engineers at Digit Insurance, driving frontend strategy and delivery for enterprise-scale insurance platforms.`,
      '',
      `Would you be open to referring me or connecting me with the right person at ${job.company}? I\'d be happy to share my resume and any details that would help make it easier.`,
      '',
      'I truly appreciate any support — even just a nudge in the right direction means a lot!',
      '',
      'Thanks so much,',
      r.personal.name,
      r.personal.email,
      r.personal.linkedin,
    ].join('\n');
  }

  private extractKeywords(jd: string): string[] {
    const stop = new Set(['the', 'and', 'or', 'for', 'with', 'this', 'that', 'will', 'have', 'has', 'are', 'is', 'be', 'to', 'of', 'in', 'a', 'an', 'at', 'by', 'we', 'you', 'our', 'your', 'their', 'can', 'do', 'not', 'on', 'as', 'it']);
    return jd.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !stop.has(w));
  }
}
