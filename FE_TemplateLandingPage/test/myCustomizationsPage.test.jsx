import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyCustomizationsPage from '../src/pages/MyCustomizationsPage';
import { customizationApi } from '../src/api/customizationApi';
import useAuth from '../src/hooks/useAuth';

vi.mock('../src/hooks/useAuth', () => ({ default: vi.fn() }));
vi.mock('../src/api/customizationApi', () => ({
  customizationApi: {
    getMyCustomizations: vi.fn(),
    getVersions: vi.fn(),
    unpublishSite: vi.fn(),
  },
}));

const site = {
  id: 'site-with-public-history',
  templateId: 'template-one',
  templateName: 'Wedding',
  title: 'Site with public history',
  slug: 'wedding-site',
  revision: 8,
  lastVersionNumber: 3,
  publishedVersionId: null,
  createdAtUtc: '2026-09-20T00:00:00.000Z',
};
const publicVersions = [
  { id: 'version-1', versionNumber: 1, title: 'Old public copy', isPublic: true, isMain: false, createdAtUtc: '2026-09-21T00:00:00.000Z' },
  { id: 'version-2', versionNumber: 2, title: 'Another public copy', isPublic: true, isMain: false, createdAtUtc: '2026-09-22T00:00:00.000Z' },
];

describe('My Sites publication controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ accountId: 'owner-a' });
    customizationApi.getMyCustomizations.mockResolvedValue({ data: [site], total: 1 });
    customizationApi.getVersions.mockResolvedValue({ data: publicVersions, page: 1, pageSize: 50, total: 2 });
    customizationApi.unpublishSite.mockResolvedValue({ revision: 9 });
  });

  it('lets an owner remove all public URLs after the main version was already cleared', async () => {
    render(<MemoryRouter><MyCustomizationsPage /></MemoryRouter>);

    const siteHeading = await screen.findByText('Site with public history');
    const siteCard = siteHeading.closest('article');
    expect(within(siteCard).getByText('URL chính đang đóng')).toBeInTheDocument();

    fireEvent.click(within(siteCard).getByRole('button', { name: 'Phiên bản' }));
    expect(await screen.findByText(/v1 · Old public copy/)).toBeInTheDocument();
    expect(screen.getByText(/v2 · Another public copy/)).toBeInTheDocument();

    const removeAll = within(siteCard).getByRole('button', { name: 'Gỡ toàn bộ trang khỏi công khai' });
    fireEvent.click(removeAll);

    expect(customizationApi.unpublishSite).toHaveBeenCalledWith(site.id, site.revision);
    expect(await screen.findAllByText(/Riêng tư/)).toHaveLength(2);
    expect(within(siteCard).getByText('URL chính đang đóng')).toBeInTheDocument();
  });
});
