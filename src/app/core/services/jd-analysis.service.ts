import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AnalysisHistoryItem, JdAnalysisRequest, JdAnalysisResult } from '../models/jd-analysis.model';

@Injectable({ providedIn: 'root' })
export class JdAnalysisService {

  private history = signal<AnalysisHistoryItem[]>([]);
  readonly history$ = this.history.asReadonly();

  analyse(request: JdAnalysisRequest): Observable<JdAnalysisResult> {
    const result = this.analyseLocally(request);
    this.addToHistory(result, request.company, request.role);
    return of(result);
  }

  private analyseLocally(request: JdAnalysisRequest): JdAnalysisResult {
    const jd = request.jobDescription.toLowerCase();
    const resume = request.resumeText.toLowerCase();

    // ── Tech skills ──────────────────────────────────────────────────────────
    const techSkills = [
      'angular', 'react', 'vue', 'svelte', 'next.js', 'nuxt',
      'typescript', 'javascript', 'python', 'java', 'c#', 'c++', 'go', 'rust', 'kotlin', 'swift',
      'node.js', 'nodejs', 'express', 'nestjs', 'fastify', 'django', 'flask', 'fastapi',
      'spring', 'spring boot', 'laravel', 'rails',
      'html', 'css', 'scss', 'sass', 'tailwind', 'bootstrap', 'material',
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'firebase',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible',
      'git', 'ci/cd', 'jenkins', 'github actions', 'gitlab ci',
      'rest', 'graphql', 'grpc', 'microservices', 'api',
      'rxjs', 'ngrx', 'redux', 'mobx', 'zustand', 'signals',
      'jest', 'jasmine', 'cypress', 'playwright', 'selenium', 'testing', 'tdd',
      'agile', 'scrum', 'kanban', 'jira', 'confluence',
      'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'nlp', 'llm',
      'linux', 'bash', 'powershell', 'figma', 'ux', 'ui', 'accessibility', 'wcag'
    ];

    // ── Soft skills ───────────────────────────────────────────────────────────
    const softSkills = [
      'communication', 'teamwork', 'leadership', 'problem-solving', 'analytical',
      'collaboration', 'initiative', 'adaptable', 'creative', 'detail-oriented',
      'time management', 'critical thinking', 'interpersonal', 'mentoring', 'mentorship'
    ];

    const jdTech = techSkills.filter(s => jd.includes(s));
    const jdSoft = softSkills.filter(s => jd.includes(s));
    const matchedTech = jdTech.filter(s => resume.includes(s));
    const matchedSoft = jdSoft.filter(s => resume.includes(s));
    const missingTech = jdTech.filter(s => !resume.includes(s));

    // ── Skills match score (0-100) ────────────────────────────────────────────
    const techRatio = jdTech.length > 0 ? matchedTech.length / jdTech.length : 0.7;
    const softRatio = jdSoft.length > 0 ? matchedSoft.length / jdSoft.length : 0.6;
    const skillsMatch = Math.min(100, Math.round(techRatio * 70 + softRatio * 30));

    // ── Experience level score (0-100) ────────────────────────────────────────
    const jdYearsMatch = jd.match(/(\d+)\+?\s*(?:to\s*\d+)?\s*years?/);
    let experienceScore = 70;
    if (jdYearsMatch) {
      const required = parseInt(jdYearsMatch[1], 10);
      const resumeYears = (resume.match(/(\d+)\+?\s*years?/g) || [])
        .map(m => parseInt(m, 10))
        .filter(n => n < 40);
      const maxFound = resumeYears.length > 0 ? Math.max(...resumeYears) : 0;
      if (maxFound >= required)      experienceScore = Math.min(100, 85 + (maxFound - required) * 3);
      else if (maxFound >= required - 1) experienceScore = 65;
      else                           experienceScore = Math.max(30, 65 - (required - maxFound) * 10);
    }
    experienceScore = Math.min(100, Math.round(experienceScore));

    // ── Education fit score (0-100) ───────────────────────────────────────────
    const eduRank: Record<string, number> = {
      'phd': 5, 'doctorate': 5,
      "master's": 4, 'masters': 4, 'msc': 4, 'mba': 4, 'm.tech': 4,
      "bachelor's": 3, 'bachelors': 3, 'bsc': 3, 'btech': 3, 'b.tech': 3, 'b.e': 3,
      'diploma': 2, 'certification': 1, 'certified': 1
    };
    const jdEduRank  = Math.max(0, ...Object.entries(eduRank).filter(([k]) => jd.includes(k)).map(([, v]) => v));
    const resumeEduRank = Math.max(0, ...Object.entries(eduRank).filter(([k]) => resume.includes(k)).map(([, v]) => v));
    const educationFit = resumeEduRank >= jdEduRank     ? 90
      : resumeEduRank === jdEduRank - 1 ? 70
      : resumeEduRank === jdEduRank - 2 ? 50 : 35;

    // ── Keywords alignment score (0-100) ──────────────────────────────────────
    const stopWords = new Set([
      'the','and','or','for','with','this','that','will','have','has','are','is',
      'be','to','of','in','a','an','at','by','we','you','our','your','their',
      'can','do','not','on','as','it','its','from','than','more','but','if',
      'up','so','he','she','they','was','were','been','being','about','into',
      'through','during','before','after','above','below','between','each',
      'when','where','who','which','what','how','all','any','both','few',
      'other','such','only','own','same','then','too','very','just','over'
    ]);
    const jdWords = jd.split(/\W+/).filter(w => w.length > 3 && !stopWords.has(w));
    const freq: Record<string, number> = {};
    jdWords.forEach(w => freq[w] = (freq[w] || 0) + 1);
    const topWords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([w]) => w);
    const keywordsAlignment = topWords.length > 0
      ? Math.min(100, Math.round((topWords.filter(w => resume.includes(w)).length / topWords.length) * 100))
      : 50;

    // ── Overall score ─────────────────────────────────────────────────────────
    const overallScore = Math.min(100, Math.round(
      skillsMatch      * 0.35 +
      experienceScore  * 0.30 +
      educationFit     * 0.15 +
      keywordsAlignment * 0.20
    ));

    // ── Grade ─────────────────────────────────────────────────────────────────
    const grade: JdAnalysisResult['grade'] =
      overallScore >= 80 ? 'Excellent' :
      overallScore >= 65 ? 'Strong'    :
      overallScore >= 50 ? 'Good'      :
      overallScore >= 35 ? 'Fair'      : 'Weak';

    // ── Strengths ─────────────────────────────────────────────────────────────
    const strengths: string[] = [];
    if (matchedTech.length > 0)
      strengths.push(`Matched technical skills: ${matchedTech.slice(0, 4).join(', ')}`);
    if (experienceScore >= 75)
      strengths.push('Experience level meets or exceeds requirements');
    if (educationFit >= 75)
      strengths.push('Educational background aligns with the role');
    if (keywordsAlignment >= 60)
      strengths.push('Resume language closely mirrors the job description');
    if (strengths.length === 0)
      strengths.push('Foundational skills present with room to highlight more alignment');

    // ── Gaps ─────────────────────────────────────────────────────────────────
    const gaps: string[] = [];
    if (missingTech.length > 0)
      gaps.push(`Skills not found in resume: ${missingTech.slice(0, 4).join(', ')}`);
    if (experienceScore < 65)
      gaps.push('Experience level may be below the stated requirement');
    if (keywordsAlignment < 50)
      gaps.push('Resume language could better mirror the job description keywords');
    if (gaps.length === 0 && overallScore < 80)
      gaps.push('Minor alignment gaps in specific technical requirements');

    // ── Suggestions ───────────────────────────────────────────────────────────
    const suggestions: string[] = [
      keywordsAlignment < 70
        ? 'Add more keywords from the job description directly into your resume bullets'
        : 'Tailor your opening summary to mention the specific company and role',
      missingTech.length > 0
        ? `Consider adding projects or coursework covering: ${missingTech.slice(0, 2).join(', ')}`
        : 'Highlight measurable achievements for your strongest skills',
      'Quantify impact wherever possible (e.g., "reduced load time by 40%", "led team of 5")'
    ];

    const summary =
      `${grade === 'Excellent' || grade === 'Strong' ? 'Strong' : 'Moderate'} match for the ` +
      `${request.role} role at ${request.company}. ` +
      `Resume aligns ${overallScore >= 65 ? 'well' : 'partially'} with the job requirements ` +
      `across skills, experience, and keyword usage.`;

    return {
      overall_score: overallScore,
      grade,
      summary,
      breakdown: { skills_match: skillsMatch, experience_level: experienceScore, education_fit: educationFit, keywords_alignment: keywordsAlignment },
      strengths,
      gaps,
      suggestions
    };
  }

  private addToHistory(result: JdAnalysisResult, company: string, role: string): void {
    const item: AnalysisHistoryItem = {
      id: crypto.randomUUID(),
      company,
      role,
      score: result.overall_score,
      grade: result.grade,
      analysedAt: new Date(),
      result
    };
    this.history.update(h => [item, ...h]);
  }

  clearHistory(): void {
    this.history.set([]);
  }

  getScoreColorClass(score: number): string {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    return 'score-weak';
  }
}
