import 'fake-indexeddb/auto';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import CustomizerPage from '../src/pages/CustomizerPage';
import DraftsPage from '../src/pages/DraftsPage';
import { templateApi } from '../src/api/templateApi';
import { customizationApi } from '../src/api/customizationApi';
import useAuth from '../src/hooks/useAuth';
import * as htmlExporter from '../src/utils/htmlExporter';
import { clearPendingAuthAction } from '../src/contexts/AuthContext';
import { deleteDraft, getDraft, listDrafts, saveDraft } from '../src/utils/draftStore';

vi.mock('../src/api/templateApi', () => ({
  templateApi: {
    getTemplateById: vi.fn(),
    publishCommunityTemplate: vi.fn(),
  },
}));

vi.mock('../src/api/customizationApi', () => ({
  customizationApi: {
    saveCustomization: vi.fn(),
    updateCustomization: vi.fn(),
    getCustomizationById: vi.fn(),
    getVersions: vi.fn(),
  },
}));

vi.mock('../src/hooks/useAuth', () => ({ default: vi.fn() }));

const mockTemplate = {
  id: 'tpl-wedding-01',
  name: 'Đám Cưới Hoàng Gia',
  slug: 'dam-cuoi-hoang-gia',
  category: 'Wedding',
  defaultConfigJson: JSON.stringify({
    theme: { primaryColor: '#e11d48', defaultAnimation: 'fade-up' },
    hero: { title: 'Tuấn & Hương', badge: 'SAVE THE DATE' },
    coupleOrCelebrant: {
      type: 'wedding',
      person1: { name: 'Tuấn', title: 'Chú Rể' },
      person2: { name: 'Hương', title: 'Cô Dâu' },
    },
  }),
};

const guestAuth = { user: null, accountId: null, isAuthenticated: false, loading: false };

function TestRouteControls() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      <output data-testid="current-route">{`${location.pathname}${location.search}${location.hash}`}</output>
      <button type="button" onClick={() => navigate('/customize/tpl-wedding-01')}>Start another copy of the same template</button>
      <button type="button" onClick={() => navigate(`${location.pathname}?panel=versions#history`, { replace: true })}>Change query and hash on this draft</button>
    </>
  );
}

const renderCustomizer = (initialRoute = '/customize/tpl-wedding-01') => render(
  <MemoryRouter initialEntries={[initialRoute]}>
    <TestRouteControls />
    <Routes>
      <Route path="/drafts" element={<DraftsPage />} />
      <Route path="/customize/draft/:draftId" element={<CustomizerPage />} />
      <Route path="/customize/:templateId" element={<CustomizerPage />} />
      <Route path="/customize/:templateId/:customizationId" element={<CustomizerPage />} />
      <Route path="/login" element={<h1>Login screen</h1>} />
    </Routes>
  </MemoryRouter>
);

describe('guest local drafts and account-only server actions', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    clearPendingAuthAction();
    for (const accountId of [null, 'owner-1', 'owner-2']) {
      for (const draft of await listDrafts(accountId)) await deleteDraft(draft.draftId);
    }
    useAuth.mockReturnValue(guestAuth);
    templateApi.getTemplateById.mockResolvedValue(mockTemplate);
    customizationApi.getVersions.mockResolvedValue({ data: [], total: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lets a guest edit and reopen a local draft without creating a server customization', async () => {
    renderCustomizer();

    expect(await screen.findByRole('heading', { name: 'Đám Cưới Hoàng Gia - Bản nháp' })).toBeInTheDocument();
    expect(await screen.findByText('Đã lưu trên thiết bị')).toBeInTheDocument();
    expect(await listDrafts(null)).toHaveLength(1);
    expect(customizationApi.saveCustomization).not.toHaveBeenCalled();
    expect(customizationApi.updateCustomization).not.toHaveBeenCalled();

    const firstDraft = (await listDrafts(null))[0];
    fireEvent.click(screen.getByTitle('Lưu bản nháp và mở danh sách'));
    expect(await screen.findByRole('heading', { name: 'Bản nháp trên thiết bị này' })).toBeInTheDocument();
    expect(await screen.findByText('Đám Cưới Hoàng Gia - Bản nháp')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Start another copy of the same template' }));
    expect(await screen.findByRole('heading', { name: 'Đám Cưới Hoàng Gia - Bản nháp' })).toBeInTheDocument();
    await waitFor(async () => expect(await listDrafts(null)).toHaveLength(2));

    const savedDrafts = await listDrafts(null);
    expect(savedDrafts.map((draft) => draft.draftId)).toContain(firstDraft.draftId);
    expect(new Set(savedDrafts.map((draft) => draft.draftId)).size).toBe(2);
    expect(savedDrafts.every((draft) => draft.templateId === 'tpl-wedding-01')).toBe(true);
    expect(customizationApi.saveCustomization).not.toHaveBeenCalled();
  });

  it('keeps the requested draft and full query/hash when a guest starts server save', async () => {
    await saveDraft({
      draftId: 'guest-auth-resume',
      templateId: 'tpl-wedding-01',
      config: JSON.parse(mockTemplate.defaultConfigJson),
      metadata: { title: 'Requested draft', slug: 'requested-draft' },
      accountId: null,
      serverId: null,
      serverRevision: null,
    }, 0);

    renderCustomizer('/customize/draft/guest-auth-resume?source=invite#rsvp');
    expect(await screen.findByRole('heading', { name: 'Requested draft' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /lưu server/i }));

    expect(await screen.findByRole('heading', { name: 'Login screen' })).toBeInTheDocument();
    const pending = JSON.parse(localStorage.getItem('pending_auth_action_v1'));
    expect(pending).toMatchObject({
      type: 'save',
      draftId: 'guest-auth-resume',
      returnTo: '/customize/draft/guest-auth-resume?source=invite#rsvp',
    });
    expect(customizationApi.saveCustomization).not.toHaveBeenCalled();
    expect((await listDrafts(null)).map((draft) => draft.draftId)).toEqual(['guest-auth-resume']);
  });

  it('continues autosaving after query/hash navigation within the same draft route', async () => {
    await saveDraft({
      draftId: 'same-draft-navigation',
      templateId: 'tpl-wedding-01',
      templateName: mockTemplate.name,
      config: JSON.parse(mockTemplate.defaultConfigJson),
      metadata: { title: 'Same draft navigation', slug: 'same-draft-navigation' },
      accountId: null,
      serverId: null,
      serverRevision: null,
    }, 0);
    const initialDraft = await getDraft('same-draft-navigation');

    renderCustomizer('/customize/draft/same-draft-navigation?panel=initial#hero');
    expect(await screen.findByRole('heading', { name: 'Same draft navigation' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Change query and hash on this draft' }));
    expect(await screen.findByTestId('current-route')).toHaveTextContent('/customize/draft/same-draft-navigation?panel=versions#history');

    fireEvent.click(screen.getByRole('button', { name: /màn hình đầu/i }));
    fireEvent.change(screen.getByDisplayValue('Tuấn & Hương'), { target: { value: 'Edited after URL change' } });

    await waitFor(async () => {
      const saved = await getDraft('same-draft-navigation');
      expect(saved.localRevision).toBeGreaterThan(initialDraft.localRevision);
      expect(saved.config.hero.title).toBe('Edited after URL change');
    }, { timeout: 2500 });
  });

  it('migrates legacy data into IndexedDB, retains the original and skips a corrupt entry', async () => {
    const legacy = {
      metadata: { title: 'Bản Nháp Khôi Phục', slug: 'ban-nhap-khoi-phuc' },
      config: {
        theme: { primaryColor: '#2563eb' },
        hero: { title: 'Tiệc Khôi Phục' },
        coupleOrCelebrant: { person1: { name: 'Người Khôi Phục', title: 'Chủ Tiệc' } },
      },
    };
    localStorage.setItem('guest_draft_tpl-wedding-01', JSON.stringify(legacy));
    localStorage.setItem('guest_draft_corrupt-entry', '{broken');

    renderCustomizer('/drafts');
    expect(await screen.findByText('Bản Nháp Khôi Phục')).toBeInTheDocument();
    expect(localStorage.getItem('guest_draft_tpl-wedding-01')).toBe(JSON.stringify(legacy));
    expect(localStorage.getItem('guest_draft_corrupt-entry')).toBe('{broken');

    fireEvent.click(screen.getByRole('button', { name: /tiếp tục/i }));
    expect(await screen.findByRole('heading', { name: 'Bản Nháp Khôi Phục' })).toBeInTheDocument();
    expect(await screen.findByText('Tiệc Khôi Phục')).toBeInTheDocument();
    expect((await listDrafts(null)).filter((draft) => draft.legacyKey === 'guest_draft_tpl-wedding-01'))
      .toHaveLength(1);
  });

  it('exports the current local draft as HTML without issuing a server write', async () => {
    const exportSpy = vi.spyOn(htmlExporter, 'exportStandaloneHtml').mockImplementation(() => {});
    renderCustomizer();

    expect(await screen.findByRole('heading', { name: 'Đám Cưới Hoàng Gia - Bản nháp' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /xuất html/i }));

    expect(exportSpy).toHaveBeenCalledWith(
      expect.objectContaining({ hero: expect.objectContaining({ title: 'Tuấn & Hương' }) }),
      'Đám Cưới Hoàng Gia - Bản nháp',
      expect.any(Object)
    );
    expect(customizationApi.saveCustomization).not.toHaveBeenCalled();
    expect(customizationApi.updateCustomization).not.toHaveBeenCalled();
  });

  it('keeps the local draft and reports a failed server save without showing success', async () => {
    useAuth.mockReturnValue({
      user: { id: 'owner-1', email: 'owner@test.invalid', fullName: 'Owner' },
      accountId: 'owner-1',
      isAuthenticated: true,
      loading: false,
    });
    customizationApi.saveCustomization.mockRejectedValueOnce(Object.assign(new Error('Network disconnected'), { status: 503 }));
    renderCustomizer();

    expect(await screen.findByRole('heading', { name: /Đám Cưới Hoàng Gia/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /lưu server/i }));

    expect(await screen.findByText('Network disconnected')).toBeInTheDocument();
    expect(customizationApi.saveCustomization).toHaveBeenCalledTimes(1);
    expect(await listDrafts('owner-1')).toHaveLength(1);
    expect(screen.queryByText('Đã lưu bản nháp làm việc trên máy chủ.')).not.toBeInTheDocument();
  });

  it('shows an authorization/load error for an inaccessible server draft instead of a default template', async () => {
    useAuth.mockReturnValue({
      user: { id: 'owner-1', email: 'owner@test.invalid', fullName: 'Owner' },
      accountId: 'owner-1',
      isAuthenticated: true,
      loading: false,
    });
    customizationApi.getCustomizationById.mockRejectedValueOnce(Object.assign(new Error('Forbidden'), { status: 403 }));
    renderCustomizer('/customize/tpl-wedding-01/server-draft-from-another-owner');

    expect(await screen.findByRole('alert')).toHaveTextContent('Forbidden');
    expect(screen.queryByText('Thiệp Mời Của Tôi')).not.toBeInTheDocument();
    expect(customizationApi.saveCustomization).not.toHaveBeenCalled();
    expect(templateApi.getTemplateById).not.toHaveBeenCalled();
  });
});
