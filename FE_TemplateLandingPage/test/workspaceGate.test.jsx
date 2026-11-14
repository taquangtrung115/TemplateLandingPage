import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import WorkspaceGate from '../src/components/WorkspaceGate';
import { workspaceApi } from '../src/api/workspaceApi';
const auth = vi.hoisted(() => ({ user: { id: 'user' }, isAuthenticated: true, loading: false, applyWorkspaceRole: vi.fn() }));
vi.mock('../src/hooks/useAuth', () => ({ useAuth: () => auth }));
vi.mock('../src/api/workspaceApi', () => ({ workspaceApi: { contexts: vi.fn() } }));
beforeEach(() => { vi.clearAllMocks(); auth.isAuthenticated = true; window.history.replaceState({}, '', '/t/acme/'); });
afterEach(() => window.history.replaceState({}, '', '/'));
describe('Workspace boundary', () => {
  it('loads effective membership before rendering business content', async () => {
    workspaceApi.contexts.mockResolvedValue({ items: [{ tenantId: 'a', tenantKey: 'acme', tenantName: 'Acme', role: 'Admin' }] });
    render(<WorkspaceGate><p>Private business content</p></WorkspaceGate>);
    expect(screen.queryByText('Private business content')).not.toBeInTheDocument();
    expect(await screen.findByText('Private business content')).toBeInTheDocument();
    expect(auth.applyWorkspaceRole).toHaveBeenCalledWith('Admin');
  });
  it('blocks data screens when membership is absent', async () => {
    workspaceApi.contexts.mockResolvedValue({ items: [] });
    render(<WorkspaceGate><p>Private business content</p></WorkspaceGate>);
    expect(await screen.findByText(/chưa được cấp quyền workspace/)).toBeInTheDocument();
    expect(screen.queryByText('Private business content')).not.toBeInTheDocument();
  });
  it('keeps errors visible and does not treat a failed request as empty success', async () => {
    workspaceApi.contexts.mockRejectedValue(new Error('Máy chủ chưa sẵn sàng'));
    render(<WorkspaceGate><p>Private business content</p></WorkspaceGate>);
    expect(await screen.findByRole('alert')).toHaveTextContent('Máy chủ chưa sẵn sàng');
    expect(screen.queryByText('Private business content')).not.toBeInTheDocument();
  });
  it('keeps public and login routes available before authentication', () => {
    auth.isAuthenticated = false; render(<WorkspaceGate><p>Public landing</p></WorkspaceGate>);
    expect(screen.getByText('Public landing')).toBeInTheDocument(); expect(workspaceApi.contexts).not.toHaveBeenCalled();
  });
});
