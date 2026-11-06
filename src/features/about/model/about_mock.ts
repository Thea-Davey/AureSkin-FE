import { AboutInfo } from './about_types';

export const MOCK_ABOUT_INFO: AboutInfo = {
  version: '1.0.0',
  releaseDate: 'Release 2026.1',
  mission:
    'AureSkin makes personalized, dermatological skincare intelligence accessible to everyone. By pairing computer vision facial analysis with empirical ingredient compatibility evaluation, we empower users to understand their skin, track barrier health, and make informed cosmetic decisions.',
  technologies: [
    {
      id: 'tech-1',
      name: 'MobileNetV3 Deep Learning',
      description:
        'Specialized CNN models for 5-class skin type determination and 8-condition multi-label detection.',
      badge: 'Vision AI',
    },
    {
      id: 'tech-2',
      name: 'MediaPipe 468-Point Mesh',
      description:
        'Dynamic 3D facial landmark detection ensuring tilt-invariant anatomical T-zone and cheek cropping.',
      badge: 'Face Mesh',
    },
    {
      id: 'tech-3',
      name: 'Harmful Pairs Relational Engine',
      description:
        'Deterministic conflict matching flagging dangerous active ingredient interactions.',
      badge: 'Safety Engine',
    },
  ],
  academicAffiliation: {
    institution: 'De La Salle University — Dasmariñas (DLSUD)',
    college: 'College of Science and Computer Studies (CSCS)',
    program: 'Computer Science Department',
    projectType: 'Academic Software Engineering Capstone Research Project',
  },
  team: [
    {
      id: 'dev-1',
      name: 'Lead Developer',
      role: 'Lead Developer & Systems Architect',
      subRole:
        'Full-Stack Mobile Architecture, On-Device Neural Model Integration & Native Pipeline',
      isDeveloper: true,
      department: 'Computer Science Dept, DLSUD',
    },
    {
      id: 'res-1',
      name: 'Lead Researcher I',
      role: 'Lead AI / ML Researcher',
      subRole:
        'Computer Vision Dataset Training, Facial Normalization & Model Benchmarking',
      isDeveloper: false,
      department: 'Computer Science Dept, DLSUD',
    },
    {
      id: 'res-2',
      name: 'Lead Researcher II',
      role: 'Lead Skincare Domain Researcher',
      subRole:
        'Empirical Dermatological Dataset Curation & Ingredient Compatibility Matrix Validation',
      isDeveloper: false,
      department: 'Computer Science Dept, DLSUD',
    },
  ],
};

