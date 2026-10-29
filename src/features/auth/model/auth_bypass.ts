import { User, Session } from '@supabase/supabase-js';

// ============================================================================
// LOGIN BYPASS TOGGLE
// Set to `true` to allow entering the app without backend / network connection.
// Set to `false` for real authentication via FastAPI & Supabase.
export const LOGIN_BYPASS: boolean = true;
// ============================================================================

export const MOCK_BYPASS_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  app_metadata: { provider: 'email' },
  user_metadata: {
    display_name: 'AureSkin Developer',
    email: 'dev@aureskin.app',
    avatar_url: '',
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'dev@aureskin.app',
  phone: '',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

export const MOCK_BYPASS_SESSION: Session = {
  access_token: 'mock-dev-bypass-access-token',
  refresh_token: 'mock-dev-bypass-refresh-token',
  expires_in: 3600 * 24 * 365, // 1 year
  token_type: 'bearer',
  user: MOCK_BYPASS_USER,
};
