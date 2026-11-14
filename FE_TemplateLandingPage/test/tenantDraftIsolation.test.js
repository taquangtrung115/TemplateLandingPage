import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
let store;
beforeEach(async () => { vi.resetModules(); vi.stubGlobal('indexedDB', new IDBFactory()); window.history.replaceState({}, '', '/t/company-a/drafts'); store = await import('../src/utils/draftStore'); });
afterEach(() => { window.history.replaceState({}, '', '/'); vi.unstubAllGlobals(); });
it('does not list, open, overwrite, duplicate or delete another workspace draft', async () => {
  await store.saveDraft({ draftId: 'a', accountId: 'user', config: { title: 'Company A' } }, 0);
  window.history.replaceState({}, '', '/t/company-b/drafts');
  expect(await store.listDrafts('user')).toEqual([]); expect(await store.getDraft('a')).toBeNull();
  await expect(store.saveDraft({ draftId: 'a', accountId: 'user', config: { title: 'Overwrite' } }, 1)).rejects.toThrow('workspace');
  await expect(store.duplicateDraft('a')).rejects.toThrow(); await expect(store.deleteDraft('a')).rejects.toThrow();
  window.history.replaceState({}, '', '/t/company-a/drafts'); expect((await store.getDraft('a')).config.title).toBe('Company A');
});
it('separates guest drafts between workspaces', async () => {
  await store.saveDraft({ draftId: 'guest-a', config: {} }, 0);
  window.history.replaceState({}, '', '/t/company-b/drafts'); expect(await store.listDrafts(null)).toEqual([]);
  await store.saveDraft({ draftId: 'guest-b', config: {} }, 0); expect((await store.listDrafts(null)).map(draft => draft.draftId)).toEqual(['guest-b']);
});
