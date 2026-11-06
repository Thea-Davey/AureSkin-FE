export interface BootstrapStep {
  id: string;
  label: string;
  weight: number; // Percentage contribution (0 to 100)
}

export const BOOTSTRAP_STEPS: BootstrapStep[] = [
  { id: 'connect', label: 'Connecting to AureSkin service...', weight: 20 },
  { id: 'ingredients', label: 'Downloading ingredients directory...', weight: 45 },
  { id: 'products', label: 'Syncing skincare product catalog...', weight: 70 },
  { id: 'articles', label: 'Preparing skincare guides & routines...', weight: 90 },
  { id: 'ready', label: 'Welcome to AureSkin!', weight: 100 },
];

