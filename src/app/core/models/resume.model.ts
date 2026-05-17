export interface PersonalInfo {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  summary: string;
  tags: string[];
  initials: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  grade: string;
  period: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  iconColor: string;
  icon: string;
}

export interface Award {
  id: string;
  title: string;
  year: string;
  organization: string;
}

export interface SkillGroup {
  category: string;
  colorClass: string;
  skills: string[];
}

export interface ResumeData {
  personal: PersonalInfo;
  experiences: Experience[];
  skillGroups: SkillGroup[];
  education: Education[];
  projects: Project[];
  awards: Award[];
}
