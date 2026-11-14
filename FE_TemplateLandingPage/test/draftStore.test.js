import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';

describe('IndexedDB local draft store', () => {
  let drafts;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubGlobal('indexedDB', new IDBFactory());
    vi.stubGlobal('BroadcastChannel', undefined);
    localStorage.clear();
    drafts = await import('../src/utils/draftStore');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const saveNewDraft = (draft) => drafts.saveDraft({
    templateId: 'same-template',
    config: {},
    metadata: {},
    accountId: null,
    serverId: null,
    serverRevision: null,
    ...draft,
  }, 0);

  it('keeps independent drafts for the same template instead of overwriting one', async () => {
    const first = await saveNewDraft({
      draftId: 'draft-one',
      config: { hero: { title: 'First copy' } },
    });
    const second = await saveNewDraft({
      draftId: 'draft-two',
      config: { hero: { title: 'Second copy' } },
    });

    expect(first.draftId).not.toBe(second.draftId);
    expect((await drafts.listDrafts()).map((draft) => draft.draftId).sort())
      .toEqual(['draft-one', 'draft-two']);
    expect((await drafts.getDraft('draft-one')).config.hero.title).toBe('First copy');
    expect((await drafts.getDraft('draft-two')).config.hero.title).toBe('Second copy');
  });

  it('lists guest and account drafts only in their own scope', async () => {
    await saveNewDraft({ draftId: 'guest-draft', accountId: null });
    await saveNewDraft({ draftId: 'account-a-draft', accountId: 'account-a' });
    await saveNewDraft({ draftId: 'account-b-draft', accountId: 'account-b' });

    expect((await drafts.listDrafts(null)).map((draft) => draft.draftId))
      .toEqual(['guest-draft']);
    expect((await drafts.listDrafts('account-a')).map((draft) => draft.draftId))
      .toEqual(['account-a-draft']);
    expect((await drafts.listDrafts('account-b')).map((draft) => draft.draftId))
      .toEqual(['account-b-draft']);
  });

  it('migrates valid legacy drafts idempotently and leaves valid and corrupt source records intact', async () => {
    const validLegacy = {
      metadata: { title: 'Legacy invitation' },
      config: { hero: { title: 'Legacy event' } },
      savedAt: '2025-06-01T12:00:00.000Z',
    };
    localStorage.setItem('guest_draft_template-legacy', JSON.stringify(validLegacy));
    localStorage.setItem('guest_draft_broken', '{not valid json');

    expect(await drafts.migrateLegacyDrafts()).toEqual({ migrated: 1, skipped: 1 });
    const migrated = await drafts.listDrafts(null);
    expect(migrated).toHaveLength(1);
    expect(migrated[0]).toMatchObject({
      templateId: 'template-legacy',
      accountId: null,
      metadata: validLegacy.metadata,
      config: validLegacy.config,
      legacyKey: 'guest_draft_template-legacy',
      legacySavedAt: validLegacy.savedAt,
    });
    expect(localStorage.getItem('guest_draft_template-legacy')).toBe(JSON.stringify(validLegacy));
    expect(localStorage.getItem('guest_draft_broken')).toBe('{not valid json');

    expect(await drafts.migrateLegacyDrafts()).toEqual({ migrated: 0, skipped: 1 });
    expect(await drafts.listDrafts(null)).toHaveLength(1);
  });

  it('uses compare-and-swap across stale tabs and preserves the losing content as a separate local copy', async () => {
    const openedByBothTabs = await saveNewDraft({
      draftId: 'shared-draft',
      config: { hero: { title: 'Original' } },
      serverId: 'server-site',
      serverRevision: 7,
      pendingSaveRequestId: 'retry-token',
    });

    const winner = await drafts.saveDraft({
      ...openedByBothTabs,
      config: { hero: { title: 'Saved in tab A' } },
    }, openedByBothTabs.localRevision);

    let conflict;
    try {
      await drafts.saveDraft({
        ...openedByBothTabs,
        config: { hero: { title: 'Unsaved in tab B' } },
      }, openedByBothTabs.localRevision);
    } catch (error) {
      conflict = error;
    }

    expect(conflict).toBeInstanceOf(drafts.DraftConflictError);
    expect(conflict.remoteDraft.config.hero.title).toBe('Saved in tab A');
    expect(conflict.copyDraftId).toBeTruthy();
    expect(await drafts.getDraft('shared-draft')).toMatchObject({
      localRevision: winner.localRevision,
      config: { hero: { title: 'Saved in tab A' } },
    });
    expect(await drafts.getDraft(conflict.copyDraftId)).toMatchObject({
      config: { hero: { title: 'Unsaved in tab B' } },
      serverId: null,
      serverRevision: null,
      pendingSaveRequestId: null,
      sourceDraftId: 'shared-draft',
      localRevision: 1,
    });
  });

  it('duplicates a draft with a new identity while leaving the server link behind by default', async () => {
    await saveNewDraft({
      draftId: 'server-linked-draft',
      accountId: 'account-a',
      serverId: 'server-site',
      serverRevision: 3,
      config: { hero: { title: 'Copied content' } },
    });

    const copy = await drafts.duplicateDraft('server-linked-draft');

    expect(copy.draftId).not.toBe('server-linked-draft');
    expect(copy).toMatchObject({
      accountId: 'account-a',
      serverId: null,
      serverRevision: null,
      sourceDraftId: 'server-linked-draft',
      localRevision: 1,
      config: { hero: { title: 'Copied content' } },
    });
  });

  it('reports IndexedDB unavailability instead of claiming the draft was saved', async () => {
    vi.stubGlobal('indexedDB', undefined);

    await expect(drafts.listDrafts()).rejects.toThrow('không hỗ trợ IndexedDB');
    await expect(saveNewDraft({ draftId: 'cannot-save' })).rejects.toThrow('không hỗ trợ IndexedDB');
  });
});
