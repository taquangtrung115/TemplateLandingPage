import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { clearAuthSession, writeAuthSession } from '../src/utils/authStorage';
import { authApi } from '../src/api/authApi';
vi.mock('../src/api/authApi', () => ({ authApi: { getMe: vi.fn(), login: vi.fn() } }));
const profile = { id: 'test-user', role: 'Admin', fullName: 'Quản trị viên' };
function Consumer() {
  const auth = useAuth();
  return <><output aria-label="session">{auth.loading ? 'loading' : auth.isAuthenticated ? auth.user.fullName : 'anonymous'}</output><output aria-label="error">{auth.authError}</output><button onClick={auth.logout}>logout</button></>;
}
const open = () => render(<AuthProvider><Consumer /></AuthProvider>);
beforeEach(() => { clearAuthSession(); vi.clearAllMocks(); });
describe('Authentication lifecycle', () => {
  it('does not call the profile endpoint or show a user without a token', async () => {
    open(); await waitFor(() => expect(screen.getByLabelText('session')).toHaveTextContent('anonymous'));
    expect(authApi.getMe).not.toHaveBeenCalled();
  });
  it('restores a profile verified by the backend', async () => {
    writeAuthSession('synthetic-token', { ...profile, fullName: 'Stale name' }); authApi.getMe.mockResolvedValue(profile);
    open(); await waitFor(() => expect(screen.getByLabelText('session')).toHaveTextContent(profile.fullName));
  });
  it('clears an unauthorized session instead of keeping a stale authenticated user', async () => {
    writeAuthSession('synthetic-token', profile); authApi.getMe.mockRejectedValue({ status: 401 });
    open(); await waitFor(() => expect(screen.getByLabelText('session')).toHaveTextContent('anonymous'));
    expect(localStorage.getItem('token')).toBeNull();
  });
  it('keeps a recoverable error when profile verification is temporarily unavailable', async () => {
    writeAuthSession('synthetic-token', profile); authApi.getMe.mockRejectedValue({ status: 503, message: 'Máy chủ tạm ngừng' });
    open(); expect(await screen.findByText('Máy chủ tạm ngừng')).toBeInTheDocument();
  });
  it('cannot restore a pending profile after logout', async () => {
    let resolve; writeAuthSession('synthetic-token', profile); authApi.getMe.mockImplementation(() => new Promise((r) => { resolve = r; }));
    open(); fireEvent.click(screen.getByRole('button', { name: 'logout' }));
    await act(async () => resolve(profile));
    await waitFor(() => expect(screen.getByLabelText('session')).toHaveTextContent('anonymous'));
    expect(localStorage.getItem('token')).toBeNull();
  });
  it('reacts to expiration and logout in another tab', async () => {
    writeAuthSession('synthetic-token', profile); authApi.getMe.mockResolvedValue(profile); open();
    await waitFor(() => expect(screen.getByLabelText('session')).toHaveTextContent(profile.fullName));
    act(() => window.dispatchEvent(new Event('quoting:session-expired')));
    expect(screen.getByLabelText('session')).toHaveTextContent('anonymous');
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: null })));
    expect(localStorage.getItem('user')).toBeNull();
  });
});
