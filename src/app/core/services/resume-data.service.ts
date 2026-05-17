import { Injectable } from '@angular/core';
import { ResumeData } from '../models/resume.model';

@Injectable({ providedIn: 'root' })
export class ResumeDataService {

  private readonly resumeData: ResumeData = {
    personal: {
      name: 'Jisha MG',
      title: 'Frontend Engineering Lead | Angular Architect | Team Lead Frontend',
      location: 'Bangalore, India',
      email: 'jishageorgemukkungal.1224@gmail.com',
      phone: '+918867912874',
      linkedin: 'https://www.linkedin.com/in/jisha-george/',
      github: 'https://github.com/jishaGeorgeMukkungal',
      portfolio: 'https://jisha-job-match-analyzer.netlify.app',
      summary: `Frontend Engineering Lead with 9+ years of experience designing, architecting, and delivering
        scalable enterprise web applications using Angular and modern frontend technologies. Proven expertise
        in frontend architecture, UI scalability, performance optimization, reusable component systems, and
        technical leadership. Currently leading cross-functional frontend teams for mission-critical
        customer-facing platforms at Digit Insurance, driving frontend strategy, engineering standards,
        delivery execution, and architecture modernization. Experienced in leading teams of 15+ engineers.`,
      tags: ['Open to work', 'Bangalore, India', '9+ years exp', 'Angular Architect'],
      initials: 'JM'
    },

    experiences: [
      {
        id: 'exp-1',
        role: 'Frontend Engineering Lead / Technical Lead',
        company: 'Digit Insurance – Bangalore, India',
        period: 'September 2018 – Present',
        description: [
          'Lead frontend architecture and technical delivery for mission-critical customer-facing insurance platforms',
          'Manage and mentor frontend engineering team of 15+ developers and drive engineering excellence across multiple initiatives',
          'Define scalable frontend standards, reusable UI component systems, and architectural best practices',
          'Improved application performance by 35% through optimization strategies, lazy loading, caching, and code splitting',
          'Spearheaded Google Pay SPOT integration across multiple insurance products',
          'Led Angular migration initiatives from Angular 13 to Angular 20',
          'Collaborate with Product, QA, Design, and Engineering teams to deliver scalable, high-quality digital experiences'
        ]
      },
      {
        id: 'exp-2',
        role: 'Senior Software Engineer (Angular)',
        company: 'Tech Mahindra (Client: Thomson Reuters) – Bangalore, India',
        period: 'March 2017 – September 2018',
        description: [
          'Developed Angular-based enterprise applications for legal and financial platforms',
          'Implemented responsive UI components and secure frontend workflows',
          'Integrated REST APIs and optimized frontend application performance',
          'Collaborated within Agile teams to deliver scalable and maintainable solutions'
        ]
      },
      {
        id: 'exp-3',
        role: 'Software Engineer Trainee',
        company: 'GKHR Consultancy Pvt Ltd (Client: Thomson Reuters) – Bangalore, India',
        period: 'August 2016 – February 2017',
        description: [
          'Worked on XML-based ETL workflows and enterprise data transformation systems',
          'Supported development and maintenance of enterprise applications'
        ]
      }
    ],

    skillGroups: [
      {
        category: 'Frontend Technologies',
        colorClass: 'pill-orange',
        skills: ['Angular (2–20)', 'TypeScript', 'JavaScript (ES6+)', 'RxJS', 'HTML5', 'CSS3', 'REST APIs']
      },
      {
        category: 'Frontend Architecture',
        colorClass: 'pill-purple',
        skills: ['Scalable UI Architecture', 'Component-Based Architecture', 'Design Systems', 'Performance Optimization', 'Reusable Component Libraries', 'Responsive UI']
      },
      {
        category: 'Engineering Leadership',
        colorClass: 'pill-teal',
        skills: ['Technical Leadership', 'Team Management', 'Agile/Scrum', 'Stakeholder Management', 'Sprint Planning', 'Mentoring', 'Code Review']
      },
      {
        category: 'Tools & Platforms',
        colorClass: 'pill-blue',
        skills: ['Git', 'Bitbucket', 'Jenkins', 'Jira', 'Confluence', 'CI/CD Pipelines']
      }
    ],

    education: [
      {
        id: 'edu-1',
        degree: 'Master of Science in Information Technology',
        institution: 'Jain University, Bangalore',
        grade: '80.5% | 3rd Rank',
        period: '2014 – 2016'
      },
      {
        id: 'edu-2',
        degree: 'Bachelor of Computer Application',
        institution: "St. Anne's Degree College, Mangalore University",
        grade: '83%',
        period: '2011 – 2014'
      }
    ],

    projects: [
      {
        id: 'proj-1',
        title: 'Direct Portal – Enterprise Insurance Platform',
        description: 'Led frontend architecture for a large-scale insurance platform. Built reusable component libraries that reduced development effort by 30% while improving scalability, maintainability, accessibility, and performance.',
        iconColor: '#EEEDFE',
        icon: 'ti-layout-dashboard'
      },
      {
        id: 'proj-2',
        title: 'Google Pay SPOT Integration',
        description: 'Architected secure Angular-based Google Pay SPOT purchase journeys, delivering scalable high-traffic frontend experiences handling millions of transactions in collaboration with external stakeholders.',
        iconColor: '#E1F5EE',
        icon: 'ti-credit-card'
      },
      {
        id: 'proj-3',
        title: 'Angular 13 → 20 Migration',
        description: 'Led end-to-end Angular migration initiative across mission-critical insurance platforms, modernizing the architecture and adopting latest Angular features for improved DX and performance.',
        iconColor: '#FAEEDA',
        icon: 'ti-refresh'
      }
    ],

    awards: [
      {
        id: 'award-1',
        title: 'Top Gun Award',
        year: '2024',
        organization: 'Digit Insurance – Critical security issue resolution and successful project delivery'
      },
      {
        id: 'award-2',
        title: 'Tech Titan Award',
        year: '2021 & 2022',
        organization: 'Digit Insurance – Engineering excellence and mentorship'
      },
      {
        id: 'award-3',
        title: 'Pat on Back Award',
        year: '2017',
        organization: 'Tech Mahindra – Outstanding contribution'
      },
      {
        id: 'award-4',
        title: 'Academic Merit Award',
        year: '2016',
        organization: 'Jain University – Top 3 Rank in M.Sc. Information Technology'
      }
    ]
  };

  getResumeData(): ResumeData {
    return this.resumeData;
  }

  getResumeAsText(): string {
    const d = this.resumeData;
    return `
Name: ${d.personal.name}
Title: ${d.personal.title}
Location: ${d.personal.location}

PROFESSIONAL SUMMARY:
${d.personal.summary}

SKILLS:
${d.skillGroups.map(g => `${g.category}: ${g.skills.join(', ')}`).join('\n')}

EXPERIENCE:
${d.experiences.map(e => `${e.role} at ${e.company} (${e.period})\n${e.description.join('\n')}`).join('\n\n')}

EDUCATION:
${d.education.map(e => `${e.degree} – ${e.institution} (${e.period}) – ${e.grade}`).join('\n')}

AWARDS:
${d.awards.map(a => `${a.title} (${a.year}) – ${a.organization}`).join('\n')}
    `.trim();
  }
}
