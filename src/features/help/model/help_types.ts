export type GuideCategory = 'scan' | 'ingredients' | 'routine';

export interface GuideItem {
  id: string;
  category: GuideCategory;
  title: string;
  summary: string;
  steps: string[];
  iconType: 'camera' | 'sparkles' | 'sliders';
}

export interface DiagnosticItem {
  id: string;
  label: string;
  status: 'ready' | 'online' | 'active';
  statusText: string;
}

export interface SupportChannel {
  email: string;
  responseTime: string;
  faqHint: string;
}

export interface HelpData {
  guides: GuideItem[];
  diagnostics: DiagnosticItem[];
  support: SupportChannel;
}

