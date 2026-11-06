export type LegalTab = 'terms' | 'privacy' | 'disclaimers';

export interface LegalSection {
  title: string;
  content: string[];
}

export interface LegalTabContent {
  id: LegalTab;
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: LegalSection[];
}

