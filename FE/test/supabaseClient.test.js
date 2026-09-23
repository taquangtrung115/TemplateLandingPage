import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockSignInWithOAuth = vi.fn();
const mockGetSession = vi.fn();
const mockCreateClient = vi.fn((url, key, options) => ({
  auth: {
    signInWithOAuth: mockSignInWithOAuth,
    getSession: mockGetSession,
  },
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args) => mockCreateClient(...args),
}));

describe('Supabase Client and Auth Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('a) Happy Paths (Đường chạy thuận lợi)', () => {
    it('signInWithGoogle invokes signInWithOAuth with google provider and offline access prompt', async () => {
      const { signInWithGoogle } = await import('../src/lib/supabaseClient.js');
      mockSignInWithOAuth.mockResolvedValueOnce({
        data: { provider: 'google', url: 'https://accounts.google.com/o/oauth2/v2/auth' },
        error: null,
      });

      const result = await signInWithGoogle();

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      expect(result.data.provider).toBe('google');
      expect(result.error).toBeNull();
    });

    it('signInWithFacebook invokes signInWithOAuth with facebook provider and email/public_profile scopes', async () => {
      const { signInWithFacebook } = await import('../src/lib/supabaseClient.js');
      mockSignInWithOAuth.mockResolvedValueOnce({
        data: { provider: 'facebook', url: 'https://www.facebook.com/v18.0/dialog/oauth' },
        error: null,
      });

      const result = await signInWithFacebook();

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'email,public_profile',
        },
      });
      expect(result.data.provider).toBe('facebook');
      expect(result.error).toBeNull();
    });

    it('getSupabaseSession returns session when active session exists', async () => {
      const { getSupabaseSession } = await import('../src/lib/supabaseClient.js');
      const fakeSession = {
        access_token: 'fake_access_token_123',
        user: { id: 'usr_1', email: 'test@domain.com' },
      };
      mockGetSession.mockResolvedValueOnce({
        data: { session: fakeSession },
        error: null,
      });

      const session = await getSupabaseSession();

      expect(mockGetSession).toHaveBeenCalled();
      expect(session).toEqual(fakeSession);
      expect(session.access_token).toBe('fake_access_token_123');
    });
  });

  describe('b) Edge Cases & Key Fallbacks (Trường hợp biên & Fallback Anon/Publishable Key)', () => {
    it('uses VITE_SUPABASE_ANON_KEY when provided', async () => {
      vi.resetModules();
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon_key_value_123');
      vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'publishable_key_456');

      await import('../src/lib/supabaseClient.js');

      expect(mockCreateClient).toHaveBeenCalledWith(
        expect.any(String),
        'anon_key_value_123',
        expect.objectContaining({
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: 'pkce',
          },
        })
      );
    });

    it('falls back to VITE_SUPABASE_PUBLISHABLE_KEY when VITE_SUPABASE_ANON_KEY is empty', async () => {
      vi.resetModules();
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
      vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_fallback_key');

      await import('../src/lib/supabaseClient.js');

      expect(mockCreateClient).toHaveBeenCalledWith(
        expect.any(String),
        'sb_publishable_fallback_key',
        expect.objectContaining({
          auth: expect.objectContaining({ flowType: 'pkce' }),
        })
      );
    });

    it('falls back to empty string when neither key is provided', async () => {
      vi.resetModules();
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
      vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '');

      await import('../src/lib/supabaseClient.js');

      expect(mockCreateClient).toHaveBeenCalledWith(
        expect.any(String),
        '',
        expect.objectContaining({
          auth: expect.objectContaining({ flowType: 'pkce' }),
        })
      );
    });
  });

  describe('c) Failure Path (Trường hợp kiểm thử lỗi/thất bại)', () => {
    it('getSupabaseSession throws an exception when getSession returns an error', async () => {
      const { getSupabaseSession } = await import('../src/lib/supabaseClient.js');
      const authError = new Error('Network error fetching Supabase session');
      mockGetSession.mockResolvedValueOnce({
        data: null,
        error: authError,
      });

      await expect(getSupabaseSession()).rejects.toThrow('Network error fetching Supabase session');
    });
  });
});
