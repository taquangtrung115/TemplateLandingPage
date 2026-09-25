const DATABASE_NAME = 'template-landing-page-drafts';
const DATABASE_VERSION = 1;
const STORE_NAME = 'drafts';

let databasePromise;
let changeChannel;

export class DraftConflictError extends Error {
  constructor(message, { remoteDraft = null, copyDraftId = null } = {}) {
    super(message);
    this.name = 'DraftConflictError';
    this.remoteDraft = remoteDraft;
    this.copyDraftId = copyDraftId;
  }
}

const createId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  try {
    if (!globalThis.crypto?.getRandomValues) throw new Error('Secure random is unavailable.');
    globalThis.crypto.getRandomValues(bytes);
  } catch {
    bytes.forEach((_, index) => { bytes[index] = Math.floor(Math.random() * 256); });
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const openDatabase = () => {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('Trình duyệt không hỗ trợ IndexedDB để lưu bản nháp.'));
  }
  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'draftId' });
        store.createIndex('accountId', 'accountId', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
        store.createIndex('legacyKey', 'legacyKey', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Không mở được kho bản nháp.'));
    request.onblocked = () => reject(new Error('Kho bản nháp đang được mở ở cửa sổ khác.'));
  }).catch((error) => {
    databasePromise = null;
    throw error;
  });

  return databasePromise;
};

const broadcast = (draft) => {
  if (typeof BroadcastChannel === 'undefined') return;
  try {
    changeChannel ||= new BroadcastChannel('template-landing-page-drafts');
    changeChannel.postMessage({ draftId: draft.draftId, localRevision: draft.localRevision, updatedAt: draft.updatedAt });
  } catch {
    // IndexedDB compare-and-swap still detects conflicts if BroadcastChannel is unavailable.
  }
};

const makeStoredDraft = (draft, localRevision) => ({
  ...draft,
  draftId: draft.draftId || createId(),
  accountId: draft.accountId || null,
  config: draft.config ?? {},
  metadata: draft.metadata ?? {},
  serverId: draft.serverId || null,
  serverRevision: draft.serverRevision ?? null,
  localRevision,
  updatedAt: new Date().toISOString(),
});

const transactionResult = (transaction, request, mapResult = (value) => value) => new Promise((resolve, reject) => {
  let result;
  let operationError = null;
  if (request) {
    request.onsuccess = () => { result = mapResult(request.result); };
    request.onerror = () => { operationError = request.error; };
  }
  transaction.oncomplete = () => operationError ? reject(operationError) : resolve(result);
  transaction.onerror = () => reject(transaction.error || operationError || new Error('Không lưu được kho bản nháp.'));
  transaction.onabort = () => reject(transaction.error || operationError || new Error('Giao dịch lưu bản nháp đã bị hủy.'));
});

export const listDrafts = async (accountId = null) => {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readonly');
  const request = transaction.objectStore(STORE_NAME).getAll();
  const allDrafts = await transactionResult(transaction, request, (value) => value || []);
  return allDrafts
    .filter((draft) => (draft.accountId || null) === (accountId || null))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
};

export const getDraft = async (draftId) => {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readonly');
  const request = transaction.objectStore(STORE_NAME).get(draftId);
  return transactionResult(transaction, request);
};

export const saveDraft = async (draft, expectedLocalRevision) => {
  if (!Number.isInteger(expectedLocalRevision) || expectedLocalRevision < 0) {
    throw new Error('Cần revision hiện tại để lưu an toàn bản nháp.');
  }
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  const request = store.get(draft.draftId);
  let savedDraft = null;
  let conflict = null;

  request.onsuccess = () => {
    const current = request.result || null;
    const actualRevision = current?.localRevision || 0;
    if (actualRevision !== expectedLocalRevision) {
      const conflictCopy = makeStoredDraft({
        ...draft,
        draftId: createId(),
        serverId: null,
        serverRevision: null,
        pendingSaveRequestId: null,
        pendingVersionRequestId: null,
        sourceDraftId: draft.draftId,
      }, 1);
      store.put(conflictCopy);
      conflict = new DraftConflictError('Bản nháp đã được thay đổi ở cửa sổ khác. Nội dung hiện tại được giữ thành một bản sao.', {
        remoteDraft: current,
        copyDraftId: conflictCopy.draftId,
      });
      return;
    }

    savedDraft = makeStoredDraft(draft, actualRevision + 1);
    store.put(savedDraft);
  };

  await transactionResult(transaction);
  if (conflict) throw conflict;
  broadcast(savedDraft);
  return savedDraft;
};

export const duplicateDraft = async (draftId, overrides = {}) => {
  const source = await getDraft(draftId);
  if (!source) throw new Error('Không tìm thấy bản nháp cần nhân bản.');
  const { preserveServerLink = false, ...draftOverrides } = overrides;
  const database = await openDatabase();
  const copy = makeStoredDraft({
    ...source,
    ...draftOverrides,
    draftId: createId(),
    serverId: preserveServerLink ? source.serverId : null,
    serverRevision: preserveServerLink ? source.serverRevision : null,
    pendingSaveRequestId: null,
    pendingVersionRequestId: null,
    sourceDraftId: source.draftId,
  }, 1);
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  transaction.objectStore(STORE_NAME).put(copy);
  await transactionResult(transaction);
  broadcast(copy);
  return copy;
};

export const deleteDraft = async (draftId) => {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  transaction.objectStore(STORE_NAME).delete(draftId);
  await transactionResult(transaction);
};

export const migrateLegacyDrafts = async () => {
  if (typeof localStorage === 'undefined') return { migrated: 0, skipped: 0 };
  const keys = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith('guest_draft_') && key !== 'guest_draft_migration_v1') keys.push(key);
  }

  let migrated = 0;
  let skipped = 0;
  for (const legacyKey of keys) {
    let legacy;
    try {
      legacy = JSON.parse(localStorage.getItem(legacyKey) || 'null');
    } catch {
      skipped += 1;
      continue;
    }
    if (!legacy?.config || typeof legacy.config !== 'object') {
      skipped += 1;
      continue;
    }

    const database = await openDatabase();
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.index('legacyKey').get(legacyKey);
    let wasInserted = false;
    request.onsuccess = () => {
      if (request.result) return;
      const templateId = legacyKey.slice('guest_draft_'.length);
      const draft = makeStoredDraft({
        draftId: createId(),
        templateId,
        config: legacy.config,
        metadata: legacy.metadata || {},
        accountId: null,
        serverId: null,
        serverRevision: null,
        legacyKey,
        legacySavedAt: legacy.savedAt || null,
      }, 1);
      store.put(draft);
      wasInserted = true;
    };
    await transactionResult(transaction);
    if (wasInserted) migrated += 1;
  }

  if (migrated || !localStorage.getItem('guest_draft_migration_v1')) {
    try {
      localStorage.setItem('guest_draft_migration_v1', new Date().toISOString());
    } catch {
      // The legacy entry remains untouched; the IndexedDB index makes migration idempotent.
    }
  }
  return { migrated, skipped };
};

export const subscribeDraftChanges = (draftId, onChange) => {
  if (typeof BroadcastChannel === 'undefined') return () => {};
  const channel = new BroadcastChannel('template-landing-page-drafts');
  const handleMessage = (event) => {
    if (event.data?.draftId === draftId) onChange(event.data);
  };
  channel.addEventListener('message', handleMessage);
  return () => {
    channel.removeEventListener('message', handleMessage);
    channel.close();
  };
};

export const createDraftId = createId;
