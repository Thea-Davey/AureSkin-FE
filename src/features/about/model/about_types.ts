export interface TeamMember {
  id: string;
  name: string;
  role: string;
  subRole: string;
  isDeveloper: boolean;
  department: string;
}

export interface CoreTechItem {
  id: string;
  name: string;
  description: string;
  badge: string;
}

export interface AcademicAffiliation {
  institution: string;
  college: string;
  program: string;
  projectType: string;
}

export interface AboutInfo {
  version: string;
  releaseDate: string;
  mission: string;
  technologies: CoreTechItem[];
  academicAffiliation: AcademicAffiliation;
  team: TeamMember[];
}

