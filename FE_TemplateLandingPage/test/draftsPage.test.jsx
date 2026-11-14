import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DraftsPage from '../src/pages/DraftsPage';
import useAuth from '../src/hooks/useAuth';
import { listDrafts, migrateLegacyDrafts } from '../src/utils/draftStore';

vi.mock('../src/hooks/useAuth', () => ({ default: vi.fn() }));
vi.mock('../src/utils/draftStore', () => ({
  deleteDraft: vi.fn(),
  duplicateDraft: vi.fn(),
  listDrafts: vi.fn(),
  migrateLegacyDrafts: vi.fn(),
}));

const accountDraft = {
  draftId: 'account-draft',
  templateId: 'template-one',
  metadata: { title: 'Account draft' },
  updatedAt: '2026-09-25T00:00:00.000Z',
};
const guestDraft = {
  draftId: 'guest-draft',
  templateId: 'template-one',
  metadata: { title: 'Guest draft from before sign-in' },
  updatedAt: '2026-09-24T00:00:00.000Z',
};

const renderPage = () => render(<MemoryRouter><DraftsPage /></MemoryRouter>);

describe('DraftsPage account and guest draft scopes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ accountId: 'account-a' });
    migrateLegacyDrafts.mockResolvedValue({ migrated: 0, skipped: 0 });
    listDrafts.mockImplementation(async (accountId) => accountId ? [accountDraft] : [guestDraft]);
  });

  it('keeps guest drafts available after sign-in through an explicit scope switch', async () => {
    renderPage();

    expect(await screen.findByText('Account draft')).toBeInTheDocument();
    expect(screen.queryByText('Guest draft from before sign-in')).not.toBeInTheDocument();
    expect(listDrafts).toHaveBeenLastCalledWith('account-a');

    fireEvent.click(screen.getByRole('button', { name: 'Nháp khách' }));

    expect(await screen.findByText('Guest draft from before sign-in')).toBeInTheDocument();
    expect(screen.queryByText('Account draft')).not.toBeInTheDocument();
    expect(listDrafts).toHaveBeenLastCalledWith(null);
    expect(screen.getByRole('button', { name: 'Nháp khách' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows a storage read error with retry and does not claim the list is empty', async () => {
    listDrafts
      .mockRejectedValueOnce(new Error('IndexedDB read failed'))
      .mockResolvedValueOnce([]);

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('IndexedDB read failed');
    expect(screen.queryByText('Chưa có bản nháp nào')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));

    expect(await screen.findByText('Chưa có bản nháp nào')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(listDrafts).toHaveBeenCalledTimes(2);
  });
});
