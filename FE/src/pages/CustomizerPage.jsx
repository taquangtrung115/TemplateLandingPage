import React, { useState, useEffect, useDeferredValue, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { templateApi } from '../api/templateApi';
import { customizationApi } from '../api/customizationApi';
import categoryApi from '../api/categoryApi';
import CustomizerToolbar from '../components/customizer/CustomizerToolbar';
import CustomizerSidebar from '../components/customizer/CustomizerSidebar';
import LandingPageRenderer from '../components/templates/LandingPageRenderer';
import DeviceSimulator from '../components/common/DeviceSimulator';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDefaultConfigByCategory } from '../utils/defaultTemplates';
import { exportStandaloneHtml } from '../utils/htmlExporter';
import { registerDraftFlush } from '../utils/draftLifecycle';
import useAuth from '../hooks/useAuth';
import {
  createDraftId,
  DraftConflictError,
  duplicateDraft,
  getDraft,
  migrateLegacyDrafts,
  saveDraft,
  subscribeDraftChanges,
} from '../utils/draftStore';
import {
  clearPendingAuthAction,
  getPendingAuthAction,
  locationToPath,
  storePendingAuthAction,
} from '../contexts/AuthContext';
import { Edit3, Eye, AlertCircle, Check, X } from 'lucide-react';

const parseConfig = (value) => {
  const parsed = typeof value === 'string' ? JSON.parse(value) : value;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Cấu hình bản thiết kế phải là một JSON object.');
  }
  return parsed;
};

const editableSignature = (draft) => JSON.stringify({ config: draft.config, metadata: draft.metadata });

const createMemoryDraft = (draft, error) => ({
  ...draft,
  accountId: draft.accountId || null,
  serverId: draft.serverId || null,
  serverRevision: draft.serverRevision ?? null,
  localRevision: 0,
  updatedAt: new Date().toISOString(),
  storageUnavailable: true,
  storageError: error.message,
});

const saveInitialDraft = async (draft) => {
  try {
    return await saveDraft(draft, 0);
  } catch (error) {
    if (error instanceof DraftConflictError) throw error;
    return createMemoryDraft(draft, error);
  }
};

const publicVersionUrl = (slug, versionNumber) => `${window.location.origin}/p/${encodeURIComponent(slug)}/v/${versionNumber}`;

const toAbsoluteHttpUrl = (value) => {
  if (!value) return '';
  try {
    const url = new URL(value, window.location.origin);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
};

export default function CustomizerPage() {
  const { templateId, customizationId, draftId: routeDraftId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, accountId, isAuthenticated, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localSaveState, setLocalSaveState] = useState('saved');
  const [dirty, setDirty] = useState(false);
  const [serverMessage, setServerMessage] = useState('');
  const [serverConflict, setServerConflict] = useState(false);
  const [localConflict, setLocalConflict] = useState(null);
  const [viewport, setViewport] = useState('desktop');
  const [mobileTab, setMobileTab] = useState('edit');
  const [template, setTemplate] = useState(null);
  const [config, setConfig] = useState(null);
  const [metadata, setMetadata] = useState({ title: '', slug: '' });
  const [currentCustomizationId, setCurrentCustomizationId] = useState(null);
  const [publishedVersionId, setPublishedVersionId] = useState(null);
  const [serverRevision, setServerRevision] = useState(null);
  const [versions, setVersions] = useState([]);
  const [versionsTotal, setVersionsTotal] = useState(0);
  const [versionsPage, setVersionsPage] = useState(1);
  const [versionsLoadingMore, setVersionsLoadingMore] = useState(false);
  const [versionsError, setVersionsError] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [previewVersion, setPreviewVersion] = useState(null);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [communityForm, setCommunityForm] = useState({ name: '', slug: '', description: '', categoryId: '', thumbnailUrl: '' });
  const [communityCategories, setCommunityCategories] = useState([]);
  const [communityError, setCommunityError] = useState('');
  const [communitySuccess, setCommunitySuccess] = useState(false);
  const [communitySaving, setCommunitySaving] = useState(false);

  const deferredConfig = useDeferredValue(config);
  const [activeEditSection, setActiveEditSection] = useState(null);
  const [editFeedbackKey, setEditFeedbackKey] = useState(0);
  const highlightTimeoutRef = useRef(null);
  const generatedDraftIdRef = useRef(null);
  const initializationRef = useRef({ key: null, promise: null });
  const appliedInitializationKeyRef = useRef(null);
  const loadVersionsRef = useRef(null);
  const draftRecordRef = useRef(null);
  const configRef = useRef(null);
  const metadataRef = useRef({ title: '', slug: '' });
  const localRevisionRef = useRef(0);
  const draftStorageErrorRef = useRef(false);
  const localSavePromiseRef = useRef(null);
  const dirtyRef = useRef(false);
  const serverBusyRef = useRef(false);
  const handledPendingActionRef = useRef(null);

  if (!generatedDraftIdRef.current) generatedDraftIdRef.current = createDraftId();

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
    setDirty(true);
    setLocalSaveState('pending');
  }, []);

  const applyDraftRecord = useCallback((record) => {
    draftRecordRef.current = record;
    localRevisionRef.current = record.localRevision || 0;
    draftStorageErrorRef.current = !!record.storageUnavailable;
    configRef.current = record.config;
    metadataRef.current = record.metadata || {};
    setConfig(record.config);
    setMetadata(record.metadata || {});
    setCurrentCustomizationId(record.serverId || null);
    setPublishedVersionId(record.publishedVersionId || null);
    setServerRevision(record.serverRevision ?? null);
    dirtyRef.current = false;
    setDirty(false);
    setLocalSaveState('saved');
  }, []);

  const handleSectionEdit = useCallback((sectionKey) => {
    setActiveEditSection(sectionKey);
    setEditFeedbackKey((key) => key + 1);
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = setTimeout(() => setActiveEditSection(null), 900);
  }, []);

  useEffect(() => () => {
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
  }, []);

  const loadVersions = useCallback(async (rootId = currentCustomizationId) => {
    if (!rootId) {
      setVersions([]);
      setVersionsTotal(0);
      setVersionsPage(1);
      return [];
    }
    setVersionsError('');
    try {
      const result = await customizationApi.getVersions(rootId, { page: 1, pageSize: 50 });
      const items = Array.isArray(result?.data) ? result.data : [];
      setVersions(items);
      setVersionsTotal(result?.total ?? items.length);
      setVersionsPage(result?.page ?? 1);
      setSelectedVersionId((previous) => previous || items.find((item) => item.isPublic)?.id || items[0]?.id || null);
      return items;
    } catch (error) {
      setVersionsError(error.message || 'Không thể tải danh sách phiên bản.');
      return [];
    }
  }, [currentCustomizationId]);
  loadVersionsRef.current = loadVersions;

  const handleLoadMoreVersions = useCallback(async () => {
    if (!currentCustomizationId || versionsLoadingMore || versions.length >= versionsTotal) return;
    setVersionsLoadingMore(true);
    setVersionsError('');
    try {
      const nextPage = versionsPage + 1;
      const result = await customizationApi.getVersions(currentCustomizationId, { page: nextPage, pageSize: 50 });
      const items = Array.isArray(result?.data) ? result.data : [];
      setVersions((current) => {
        const knownIds = new Set(current.map((version) => version.id));
        return [...current, ...items.filter((version) => !knownIds.has(version.id))];
      });
      setVersionsTotal(result?.total ?? versionsTotal);
      setVersionsPage(result?.page ?? nextPage);
    } catch (error) {
      setVersionsError(error.message || 'Không thể tải thêm phiên bản.');
    } finally {
      setVersionsLoadingMore(false);
    }
  }, [currentCustomizationId, versions.length, versionsLoadingMore, versionsPage, versionsTotal]);

  useEffect(() => {
    if (authLoading) return undefined;
    const key = `${routeDraftId || ''}|${customizationId || ''}|${templateId || ''}`;
    // Query/hash navigation must keep the current in-memory draft and autosave lifecycle alive.
    if (appliedInitializationKeyRef.current === key) return undefined;
    let active = true;
    setLoading(true);
    setLoadError('');
    setReady(false);
    if (initializationRef.current.key !== key) initializationRef.current = { key, promise: null };

    if (!initializationRef.current.promise) {
      initializationRef.current.promise = (async () => {
        await migrateLegacyDrafts().catch(() => null);
        if (routeDraftId) {
          const record = await getDraft(routeDraftId);
          if (!record) throw new Error('Không tìm thấy bản nháp trên thiết bị này.');
          if (record.accountId && record.accountId !== accountId) {
            throw new Error('Bản nháp này thuộc một tài khoản khác. Đăng nhập đúng tài khoản để tiếp tục chỉnh sửa.');
          }
          let templateRecord = null;
          try { templateRecord = await templateApi.getTemplateById(record.templateId); } catch { /* Existing draft content remains usable offline. */ }
          return { record, templateRecord, shouldNavigate: false };
        }

        if (customizationId) {
          const serverDraft = await customizationApi.getCustomizationById(customizationId);
          const parsedConfig = parseConfig(serverDraft.configJson);
          let templateRecord = null;
          try { templateRecord = await templateApi.getTemplateById(serverDraft.templateId); } catch { /* The server draft contains its complete editable content. */ }
          const record = await saveInitialDraft({
            draftId: createDraftId(),
            templateId: serverDraft.templateId,
            templateName: serverDraft.templateName || templateRecord?.name || '',
            config: parsedConfig,
            metadata: { title: serverDraft.title || '', slug: serverDraft.slug || '' },
            accountId,
            serverId: serverDraft.id,
            serverRevision: serverDraft.revision,
            publishedVersionId: serverDraft.publishedVersionId || null,
          });
          return { record, templateRecord, shouldNavigate: true };
        }

        if (!templateId) throw new Error('Không xác định được mẫu cần tùy biến.');
        const templateRecord = await templateApi.getTemplateById(templateId);
        const initialConfig = templateRecord.defaultConfigJson
          ? parseConfig(templateRecord.defaultConfigJson)
          : getDefaultConfigByCategory(templateRecord.category);
        const record = await saveInitialDraft({
          draftId: generatedDraftIdRef.current,
          templateId: templateRecord.id || templateId,
          templateName: templateRecord.name || '',
          config: initialConfig,
          metadata: {
            title: `${templateRecord.name || 'Thiết kế mới'} - ${user?.fullName || 'Bản nháp'}`,
            slug: `${templateRecord.slug || 'thiet-ke'}-${Date.now().toString().slice(-6)}`,
          },
          accountId: accountId || null,
          serverId: null,
          serverRevision: null,
        });
        return { record, templateRecord, shouldNavigate: true };
      })();
    }

    initializationRef.current.promise
      .then(({ record, templateRecord, shouldNavigate }) => {
        if (!active) return;
        if (appliedInitializationKeyRef.current === key) {
          setLoading(false);
          return;
        }
        appliedInitializationKeyRef.current = key;
        setTemplate(templateRecord);
        applyDraftRecord(record);
        setReady(true);
        setLoading(false);
        if (record.serverId) void loadVersionsRef.current?.(record.serverId);
        if (record.storageUnavailable) {
          dirtyRef.current = true;
          setDirty(true);
          setLocalSaveState('error');
        }
        if (shouldNavigate && !record.storageUnavailable) navigate(`/customize/draft/${record.draftId}`, { replace: true });
      })
      .catch((error) => {
        if (!active) return;
        if (error.status === 401) {
          navigate('/login', { state: { from: locationToPath(location) } });
          return;
        }
        setLoadError(error.message || 'Không thể mở bản thiết kế.');
        setReady(false);
        setLoading(false);
      });

    return () => { active = false; };
  }, [applyDraftRecord, authLoading, customizationId, location, navigate, routeDraftId, templateId]);

  const flushLocal = useCallback(async () => {
    if (!draftRecordRef.current) return;
    let attempts = 0;
    while (dirtyRef.current) {
      attempts += 1;
      if (attempts > 5) throw new Error('Bản nháp vẫn đang thay đổi. Hãy thử lưu lại sau khi chỉnh sửa xong.');
      if (localSavePromiseRef.current) {
        await localSavePromiseRef.current;
        continue;
      }

      const base = draftRecordRef.current;
      const candidate = { ...base, config: configRef.current, metadata: metadataRef.current };
      const savedSignature = editableSignature(candidate);
      setLocalSaveState('saving');
      const operation = saveDraft(candidate, localRevisionRef.current);
      localSavePromiseRef.current = operation;
      try {
        const saved = await operation;
        draftRecordRef.current = saved;
        localRevisionRef.current = saved.localRevision;
        draftStorageErrorRef.current = false;
        setLocalSaveState('saved');
        const currentSignature = JSON.stringify({ config: configRef.current, metadata: metadataRef.current });
        if (currentSignature === savedSignature) {
          dirtyRef.current = false;
          setDirty(false);
        }
      } catch (error) {
        if (error instanceof DraftConflictError) {
          setLocalConflict(error);
          setLocalSaveState('conflict');
        } else {
          draftStorageErrorRef.current = true;
          setLocalSaveState('error');
        }
        throw error;
      } finally {
        localSavePromiseRef.current = null;
      }
    }
    if (!dirtyRef.current) setLocalSaveState('saved');
  }, []);

  useEffect(() => {
    if (!ready) return undefined;
    return registerDraftFlush(flushLocal);
  }, [flushLocal, ready]);

  useEffect(() => {
    if (!ready || !dirty) return undefined;
    const timer = setTimeout(() => { void flushLocal().catch(() => {}); }, 500);
    return () => clearTimeout(timer);
  }, [dirty, flushLocal, ready, config, metadata]);

  useEffect(() => {
    const activeDraftId = draftRecordRef.current?.draftId;
    if (!activeDraftId) return undefined;
    return subscribeDraftChanges(activeDraftId, async (change) => {
      if ((change.localRevision || 0) <= localRevisionRef.current) return;
      const remoteDraft = await getDraft(activeDraftId).catch(() => null);
      if (remoteDraft && remoteDraft.localRevision > localRevisionRef.current) {
        setLocalConflict(new DraftConflictError('Bản nháp vừa được lưu ở một cửa sổ khác.', { remoteDraft }));
        setLocalSaveState('conflict');
      }
    });
  }, [ready, routeDraftId]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!dirtyRef.current) return;
      void flushLocal().catch(() => {});
      event.preventDefault();
      event.returnValue = '';
    };
    const handlePageHide = () => { if (dirtyRef.current) void flushLocal().catch(() => {}); };
    const handlePopState = () => { if (dirtyRef.current) void flushLocal().catch(() => {}); };
    const handleAuthStorageChange = (event) => {
      if ((event.key === 'token' || event.key === 'user') && dirtyRef.current) {
        void flushLocal().catch(() => setServerMessage('Đổi tài khoản trong cửa sổ khác nhưng bản nháp chưa lưu được. Hãy giữ trang này mở và thử lại.'));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('storage', handleAuthStorageChange);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('storage', handleAuthStorageChange);
    };
  }, [flushLocal]);

  useEffect(() => {
    const handleInternalNavigation = (event) => {
      if (!dirtyRef.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target.closest?.('a[href]');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      const nextPath = `${destination.pathname}${destination.search}${destination.hash}`;
      if (nextPath === locationToPath(location)) return;
      event.preventDefault();
      event.stopPropagation();
      void flushLocal()
        .then(() => navigate(nextPath))
        .catch(() => setServerMessage('Bản nháp chưa lưu được vào thiết bị nên vẫn ở lại trang này.'));
    };
    document.addEventListener('click', handleInternalNavigation, true);
    return () => document.removeEventListener('click', handleInternalNavigation, true);
  }, [flushLocal, location, navigate]);

  const saveLocalRecordFields = useCallback(async (changes) => {
    const base = draftRecordRef.current;
    if (!base) throw new Error('Bản nháp chưa sẵn sàng để lưu.');
    const candidate = {
      ...base,
      ...changes,
      config: configRef.current,
      metadata: metadataRef.current,
    };
    try {
      const saved = await saveDraft(candidate, localRevisionRef.current);
      draftRecordRef.current = saved;
      localRevisionRef.current = saved.localRevision;
      draftStorageErrorRef.current = false;
      setLocalSaveState('saved');
      return saved;
    } catch (error) {
      if (error instanceof DraftConflictError) {
        setLocalConflict(error);
        setLocalSaveState('conflict');
      } else {
        draftStorageErrorRef.current = true;
        draftRecordRef.current = candidate;
        setLocalSaveState('error');
      }
      throw error;
    }
  }, []);

  const flushLocalForServer = useCallback(async () => {
    try {
      await flushLocal();
    } catch (error) {
      if (error instanceof DraftConflictError || !draftStorageErrorRef.current) throw error;
    }
  }, [flushLocal]);

  const saveServerWorking = useCallback(async () => {
    await flushLocalForServer();
    const base = draftRecordRef.current;
    if (!base) throw new Error('Bản nháp chưa sẵn sàng để lưu.');
    if (base.accountId && base.accountId !== accountId) throw new Error('Bản nháp thuộc tài khoản khác; không thể ghi lên máy chủ bằng tài khoản hiện tại.');

    const content = { title: metadataRef.current.title, slug: metadataRef.current.slug, configJson: JSON.stringify(configRef.current) };
    let response;
    let requestId = base.pendingSaveRequestId;
    if (base.serverId) {
      if (!requestId) {
        requestId = createDraftId();
        try {
          await saveLocalRecordFields({ pendingSaveRequestId: requestId });
        } catch (error) {
          if (error instanceof DraftConflictError || !draftStorageErrorRef.current) throw error;
        }
      }
      response = await customizationApi.updateCustomization(base.serverId, {
        ...content,
        expectedRevision: base.serverRevision,
        requestId,
      });
    } else {
      response = await customizationApi.saveCustomization({
        templateId: base.templateId,
        ...content,
        clientDraftId: base.draftId,
      });
    }

    const rootId = response?.id || base.serverId;
    if (!rootId || !Number.isInteger(response?.revision)) {
      throw new Error('Máy chủ trả về kết quả lưu không hợp lệ. Bản nháp trên thiết bị vẫn còn nguyên.');
    }
    try {
      await saveLocalRecordFields({
        serverId: rootId,
        serverRevision: response.revision,
        accountId,
        pendingSaveRequestId: null,
      });
    } catch (error) {
      if (error instanceof DraftConflictError || !draftStorageErrorRef.current) throw error;
    }
    setCurrentCustomizationId(rootId);
    setServerRevision(response.revision);
    setServerConflict(false);
    setServerMessage(draftStorageErrorRef.current
      ? 'Đã lưu bản nháp làm việc trên máy chủ; kho trên thiết bị vẫn báo lỗi nên chưa ghi được bản cục bộ.'
      : 'Đã lưu bản nháp làm việc trên máy chủ.');
    return { id: rootId, revision: response.revision };
  }, [accountId, flushLocalForServer, saveLocalRecordFields]);

  const requestLoginForAction = useCallback(async (type, actionData = {}) => {
    try {
      await flushLocal();
    } catch {
      return;
    }
    const returnTo = locationToPath(location);
    storePendingAuthAction({
      type,
      draftId: draftRecordRef.current?.draftId,
      expectedAccountId: draftRecordRef.current?.accountId || null,
      ...actionData,
    }, returnTo);
    navigate('/login', { state: { from: returnTo } });
  }, [flushLocal, location, navigate]);

  const withServerBusy = useCallback(async (operation) => {
    if (serverBusyRef.current) return;
    serverBusyRef.current = true;
    setSaving(true);
    try {
      await operation();
    } finally {
      serverBusyRef.current = false;
      setSaving(false);
    }
  }, []);

  const handleSaveServer = useCallback(async () => {
    if (serverBusyRef.current) return;
    if (!isAuthenticated) {
      await requestLoginForAction('save');
      return;
    }
    setServerMessage('');
    try {
      await withServerBusy(async () => {
        await saveServerWorking();
        if (draftRecordRef.current?.serverId) void loadVersions(draftRecordRef.current.serverId);
      });
    } catch (error) {
      if (error.status === 401) {
        await requestLoginForAction('save');
        return;
      }
      if (error.status === 409) {
        setServerConflict(true);
        setServerMessage('Bản trên máy chủ đã thay đổi. Nội dung cục bộ vẫn được giữ.');
      } else {
        setServerMessage(error.message || 'Không thể lưu lên máy chủ. Bản nháp trên thiết bị vẫn được giữ.');
      }
    }
  }, [isAuthenticated, loadVersions, requestLoginForAction, saveServerWorking, withServerBusy]);

  const handleCreateVersion = useCallback(async () => {
    if (serverBusyRef.current) return;
    if (!isAuthenticated) {
      await requestLoginForAction('createVersion');
      return;
    }
    if (draftRecordRef.current?.accountId && draftRecordRef.current.accountId !== accountId) {
      setServerMessage('Bản nháp thuộc một tài khoản khác. Hãy đổi lại tài khoản để tạo phiên bản.');
      return;
    }
    setServerMessage('');
    try {
      await withServerBusy(async () => {
        await flushLocalForServer();
        let current = draftRecordRef.current;
        if (!current.serverId) {
          await saveServerWorking();
          current = draftRecordRef.current;
        }
        let requestId = current.pendingVersionRequestId;
        if (!requestId) {
          requestId = createDraftId();
          try {
            current = await saveLocalRecordFields({ pendingVersionRequestId: requestId });
          } catch (error) {
            if (error instanceof DraftConflictError || !draftStorageErrorRef.current) throw error;
            current = draftRecordRef.current;
          }
        }
        const result = await customizationApi.createVersion(current.serverId, {
          title: metadataRef.current.title,
          slug: metadataRef.current.slug,
          configJson: JSON.stringify(configRef.current),
          expectedRevision: current.serverRevision,
          requestId,
        });
        if (!Number.isInteger(result?.revision) || !result?.versionId) {
          throw new Error('Máy chủ không trả về phiên bản đã tạo. Bản nháp cục bộ vẫn được giữ.');
        }
        try {
          await saveLocalRecordFields({ serverRevision: result.revision, pendingVersionRequestId: null });
        } catch (error) {
          if (error instanceof DraftConflictError || !draftStorageErrorRef.current) throw error;
        }
        setServerRevision(result.revision);
        setCurrentCustomizationId(result.id || current.serverId);
        setSelectedVersionId(result.versionId);
        setServerMessage(draftStorageErrorRef.current
          ? `Đã tạo phiên bản v${result.versionNumber}; kho trên thiết bị vẫn báo lỗi.`
          : `Đã tạo phiên bản v${result.versionNumber}.`);
        await loadVersions(current.serverId);
        setSelectedVersionId(result.versionId);
      });
    } catch (error) {
      if (error.status === 401) {
        await requestLoginForAction('createVersion');
        return;
      }
      if (error.status === 409) {
        setServerConflict(true);
        setServerMessage('Máy chủ đã nhận thay đổi khác. Nội dung cục bộ vẫn được giữ; hãy tải bản máy chủ hoặc giữ bản sao.');
      } else {
        setServerMessage(error.message || 'Không thể tạo phiên bản. Bản nháp trên thiết bị vẫn được giữ.');
      }
    }
  }, [accountId, flushLocalForServer, isAuthenticated, loadVersions, requestLoginForAction, saveLocalRecordFields, saveServerWorking, withServerBusy]);

  const updateServerRevision = useCallback(async (response, successMessage, extraLocalFields = {}) => {
    if (!Number.isInteger(response?.revision)) throw new Error('Máy chủ trả về revision không hợp lệ.');
    let localStorageFailed = false;
    try {
      await saveLocalRecordFields({ serverRevision: response.revision, ...extraLocalFields });
    } catch (error) {
      if (error instanceof DraftConflictError || !draftStorageErrorRef.current) throw error;
      localStorageFailed = true;
    }
    setServerRevision(response.revision);
    setServerMessage(localStorageFailed ? `${successMessage} Kho trên thiết bị vẫn báo lỗi.` : successMessage);
    setServerConflict(false);
  }, [saveLocalRecordFields]);

  const handlePublishVersion = useCallback(async (versionId) => {
    if (!isAuthenticated) {
      await requestLoginForAction('publishVersion', { versionId });
      return;
    }
    if (!currentCustomizationId || saving) return;
    try {
      await withServerBusy(async () => {
        await flushLocalForServer();
        const result = await customizationApi.publishVersion(currentCustomizationId, {
          versionId,
          expectedRevision: draftRecordRef.current?.serverRevision,
        });
        await updateServerRevision(result, 'Đã chọn phiên bản làm bản công khai chính.', { publishedVersionId: versionId });
        setPublishedVersionId(versionId);
        await loadVersions(currentCustomizationId);
      });
    } catch (error) {
      if (error.status === 401) {
        await requestLoginForAction('publishVersion', { versionId });
        return;
      }
      if (error.status === 409) setServerConflict(true);
      setServerMessage(error.message || 'Không thể xuất bản phiên bản.');
    }
  }, [currentCustomizationId, flushLocalForServer, isAuthenticated, loadVersions, saving, requestLoginForAction, updateServerRevision, withServerBusy]);

  const handleUnpublishVersion = useCallback(async (versionId) => {
    if (!isAuthenticated) {
      await requestLoginForAction('unpublishVersion', { versionId });
      return;
    }
    if (!currentCustomizationId || saving) return;
    try {
      await withServerBusy(async () => {
        await flushLocalForServer();
        const result = await customizationApi.unpublishVersion(currentCustomizationId, versionId, draftRecordRef.current?.serverRevision);
        const removesMainVersion = publishedVersionId === versionId;
        await updateServerRevision(result, 'Đã gỡ phiên bản khỏi công khai.', removesMainVersion ? { publishedVersionId: null } : {});
        if (removesMainVersion) setPublishedVersionId(null);
        await loadVersions(currentCustomizationId);
      });
    } catch (error) {
      if (error.status === 401) {
        await requestLoginForAction('unpublishVersion', { versionId });
        return;
      }
      if (error.status === 409) setServerConflict(true);
      setServerMessage(error.message || 'Không thể gỡ phiên bản khỏi công khai.');
    }
  }, [currentCustomizationId, flushLocalForServer, isAuthenticated, loadVersions, publishedVersionId, requestLoginForAction, saving, updateServerRevision, withServerBusy]);

  const handleUnpublishSite = useCallback(async () => {
    if (!isAuthenticated) {
      await requestLoginForAction('unpublishSite');
      return;
    }
    if (!currentCustomizationId || saving) return;
    try {
      await withServerBusy(async () => {
        await flushLocalForServer();
        const result = await customizationApi.unpublishSite(currentCustomizationId, draftRecordRef.current?.serverRevision);
        await updateServerRevision(result, 'Đã gỡ toàn bộ trang khỏi công khai.', { publishedVersionId: null });
        setPublishedVersionId(null);
        await loadVersions(currentCustomizationId);
      });
    } catch (error) {
      if (error.status === 401) {
        await requestLoginForAction('unpublishSite');
        return;
      }
      if (error.status === 409) setServerConflict(true);
      setServerMessage(error.message || 'Không thể gỡ trang khỏi công khai.');
    }
  }, [currentCustomizationId, flushLocalForServer, isAuthenticated, loadVersions, requestLoginForAction, saving, updateServerRevision, withServerBusy]);

  const handlePreviewVersion = useCallback(async (version) => {
    if (!currentCustomizationId) return;
    try {
      const detail = await customizationApi.getVersion(currentCustomizationId, version.id);
      setSelectedVersionId(version.id);
      setPreviewVersion({ ...version, config: parseConfig(detail.configJson) });
    } catch (error) {
      setServerMessage(error.message || 'Không thể mở bản xem trước của phiên bản này.');
    }
  }, [currentCustomizationId]);

  const handleContinueFromVersion = useCallback(async (version) => {
    if (!currentCustomizationId) return;
    try {
      await flushLocal();
      const detail = await customizationApi.getVersion(currentCustomizationId, version.id);
      const copy = await duplicateDraft(draftRecordRef.current.draftId, {
        config: parseConfig(detail.configJson),
        metadata: { ...metadataRef.current, title: version.title || metadataRef.current.title },
        preserveServerLink: true,
      });
      navigate(`/customize/draft/${copy.draftId}`);
    } catch (error) {
      setServerMessage(error.message || 'Không thể tiếp tục chỉnh sửa từ phiên bản này.');
    }
  }, [currentCustomizationId, flushLocal, navigate]);

  const handleCopyVersionUrl = useCallback(async (version) => {
    try {
      const url = new URL(version.publicUrl || publicVersionUrl(metadataRef.current.slug, version.versionNumber), window.location.origin).href;
      await navigator.clipboard.writeText(url);
      setServerMessage('Đã sao chép liên kết phiên bản công khai.');
    } catch {
      setServerMessage('Không thể sao chép liên kết. Hãy mở trang công khai và sao chép địa chỉ trên trình duyệt.');
    }
  }, []);

  const openCommunityModal = useCallback(async (versionId = selectedVersionId, initialForm = null) => {
    if (!versions.length) {
      setServerMessage('Hãy tạo ít nhất một phiên bản trước khi chia sẻ vào thư viện cộng đồng.');
      return;
    }
    if (!isAuthenticated) {
      await requestLoginForAction('communityShare', { versionId });
      return;
    }
    setCommunityError('');
    setCommunitySuccess(false);
    try {
      const response = await categoryApi.getCategories({ page: 1, pageSize: 100 });
      const categories = Array.isArray(response) ? response : (response?.data || []);
      setCommunityCategories(categories);
      setCommunityForm(initialForm || {
        name: metadataRef.current.title || template?.name || '',
        slug: `${(metadataRef.current.slug || 'community').replace(/[^a-z0-9-]/gi, '-')}-${Date.now().toString().slice(-4)}`,
        description: template?.description || '',
        categoryId: categories[0]?.id || '',
        thumbnailUrl: toAbsoluteHttpUrl(template?.thumbnailUrl || configRef.current?.hero?.imageUrl || ''),
      });
      setSelectedVersionId(versionId || versions[0]?.id || null);
      setIsCommunityModalOpen(true);
    } catch (error) {
      setServerMessage(error.message || 'Không thể tải danh mục cộng đồng.');
    }
  }, [isAuthenticated, requestLoginForAction, selectedVersionId, template, versions]);

  const submitCommunityShare = async (form, versionId) => {
    if (communitySaving) return;
    if (!versionId || !currentCustomizationId) {
      setCommunityError('Chọn một phiên bản đã tạo để chia sẻ.');
      return;
    }
    if (!isAuthenticated) {
      await requestLoginForAction('communityShare', { versionId, form, submitAfterLogin: true });
      return;
    }
    setCommunitySaving(true);
    setCommunityError('');
    try {
      await templateApi.publishCommunityTemplate({
        sourceCustomizationId: currentCustomizationId,
        customizationVersionId: versionId,
        categoryId: form.categoryId,
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        thumbnailUrl: form.thumbnailUrl.trim(),
      });
      setCommunitySuccess(true);
    } catch (error) {
      if (error.status === 401) {
        await requestLoginForAction('communityShare', { versionId, form, submitAfterLogin: true });
        return;
      }
      setCommunityError(error.message || 'Không thể chia sẻ mẫu. Nội dung biểu mẫu vẫn được giữ để thử lại.');
    } finally {
      setCommunitySaving(false);
    }
  };

  const handleCommunitySubmit = async (event) => {
    event.preventDefault();
    await submitCommunityShare(communityForm, selectedVersionId);
  };

  useEffect(() => {
    if (!ready || !routeDraftId || !isAuthenticated) return;
    const pending = getPendingAuthAction();
    if (!pending || pending.draftId !== routeDraftId || handledPendingActionRef.current === routeDraftId) return;
    if (pending.expectedAccountId && pending.expectedAccountId !== accountId) {
      setServerMessage('Phiên đăng nhập thuộc tài khoản khác. Bản nháp chưa bị thay đổi.');
      return;
    }
    handledPendingActionRef.current = routeDraftId;
    clearPendingAuthAction();
    if (pending.type === 'save') void handleSaveServer();
    if (pending.type === 'createVersion') void handleCreateVersion();
    if (pending.type === 'communityShare') {
      void (async () => {
        await openCommunityModal(pending.versionId, pending.form || null);
        if (pending.submitAfterLogin && pending.form) await submitCommunityShare(pending.form, pending.versionId);
      })();
    }
    if (pending.type === 'publishVersion') void handlePublishVersion(pending.versionId);
    if (pending.type === 'unpublishVersion') void handleUnpublishVersion(pending.versionId);
    if (pending.type === 'unpublishSite') void handleUnpublishSite();
  }, [accountId, handleCreateVersion, handlePublishVersion, handleSaveServer, handleUnpublishSite, handleUnpublishVersion, isAuthenticated, openCommunityModal, ready, routeDraftId]);

  const handleReloadServer = async () => {
    if (!currentCustomizationId) return;
    try {
      const serverDraft = await customizationApi.getCustomizationById(currentCustomizationId);
      const nextConfig = parseConfig(serverDraft.configJson);
      const nextMetadata = { title: serverDraft.title || '', slug: serverDraft.slug || '' };
      configRef.current = nextConfig;
      metadataRef.current = nextMetadata;
      setConfig(nextConfig);
      setMetadata(nextMetadata);
      const saved = await saveDraft({
        ...draftRecordRef.current,
        config: nextConfig,
        metadata: nextMetadata,
        serverRevision: serverDraft.revision,
        publishedVersionId: serverDraft.publishedVersionId || null,
        pendingSaveRequestId: null,
        pendingVersionRequestId: null,
      }, localRevisionRef.current);
      draftRecordRef.current = saved;
      localRevisionRef.current = saved.localRevision;
      setServerRevision(serverDraft.revision);
      setPublishedVersionId(serverDraft.publishedVersionId || null);
      setDirty(false);
      dirtyRef.current = false;
      setServerConflict(false);
      setLocalConflict(null);
      setLocalSaveState('saved');
      setServerMessage('Đã tải lại bản làm việc từ máy chủ.');
    } catch (error) {
      if (error.status === 401) {
        await requestLoginForAction('save');
        return;
      }
      setServerMessage(error.message || 'Không thể tải lại bản máy chủ.');
    }
  };

  const handleKeepLocalCopy = async () => {
    try {
      const copyId = localConflict?.copyDraftId;
      if (copyId) {
        navigate(`/customize/draft/${copyId}`);
        return;
      }
      const copy = await duplicateDraft(draftRecordRef.current.draftId, {
        config: configRef.current,
        metadata: metadataRef.current,
      });
      navigate(`/customize/draft/${copy.draftId}`);
    } catch (error) {
      setServerMessage(error.message || 'Không thể giữ nội dung thành bản sao.');
    }
  };

  const handleReloadLocalConflict = () => {
    const remote = localConflict?.remoteDraft;
    if (!remote) return;
    draftRecordRef.current = remote;
    localRevisionRef.current = remote.localRevision;
    configRef.current = remote.config;
    metadataRef.current = remote.metadata;
    setConfig(remote.config);
    setMetadata(remote.metadata);
    setLocalConflict(null);
    setLocalSaveState('saved');
    dirtyRef.current = false;
    setDirty(false);
  };

  const handleBack = async () => {
    try {
      await flushLocal();
      navigate('/drafts');
    } catch {
      setServerMessage('Bản nháp chưa lưu được vào thiết bị nên vẫn ở lại trang này.');
    }
  };

  const handleDownloadJson = () => {
    const data = { metadata: metadataRef.current, config: configRef.current };
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    downloadAnchor.download = `${metadataRef.current.slug || 'template-config'}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportHtml = () => {
    const publishedUrl = versions.find((version) => version.isPublic)?.publicUrl
      || (versions.some((version) => version.isPublic) ? `${window.location.origin}/p/${metadataRef.current.slug}` : null);
    exportStandaloneHtml(configRef.current, metadataRef.current.title, { publicUrl: publishedUrl });
  };

  const handleOpenLivePreview = () => {
    const publicVersion = versions.find((version) => version.isPublic);
    if (publicVersion) window.open(publicVersion.publicUrl || `${window.location.origin}/p/${metadataRef.current.slug}`, '_blank', 'noopener,noreferrer');
  };

  const handleConfigChange = (nextConfig) => {
    configRef.current = nextConfig;
    setConfig(nextConfig);
    markDirty();
  };

  const handleMetadataChange = (nextMetadata) => {
    metadataRef.current = nextMetadata;
    setMetadata(nextMetadata);
    markDirty();
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><LoadingSpinner size="lg" message="Đang mở bản thiết kế..." /></div>;
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-5">
        <div className="max-w-lg w-full bg-white border border-rose-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <p role="alert" className="mt-3 text-sm text-gray-700">{loadError}</p>
          <button onClick={() => navigate('/drafts')} className="mt-5 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm">Mở danh sách bản nháp</button>
        </div>
      </div>
    );
  }

  const localStatusText = localSaveState === 'saving'
    ? 'Đang lưu trên thiết bị…'
    : localSaveState === 'pending' || dirty
      ? 'Có thay đổi chưa lưu'
      : localSaveState === 'error'
        ? 'Lỗi lưu trên thiết bị'
        : localSaveState === 'conflict'
          ? 'Có xung đột bản nháp'
          : 'Đã lưu trên thiết bị';
  const hasPublishedVersion = versions.some((version) => version.isPublic);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      <CustomizerToolbar
        viewport={viewport}
        setViewport={setViewport}
        onSave={handleSaveServer}
        saving={saving}
        onCreateVersion={handleCreateVersion}
        localSaveStatus={localStatusText}
        onDownloadJson={handleDownloadJson}
        onExportHtml={handleExportHtml}
        onOpenLivePreview={hasPublishedVersion ? handleOpenLivePreview : null}
        onPublishCommunity={() => openCommunityModal()}
        canShareCommunity={versions.length > 0}
        title={metadata.title}
        onBack={handleBack}
      />

      {(serverMessage || versionsError || localSaveState === 'error' || localConflict || serverConflict) && (
        <div className="px-3 sm:px-6 py-2 bg-white border-b border-gray-200 space-y-2">
          {serverMessage && <div role="status" className="text-xs text-gray-700">{serverMessage}</div>}
          {versionsError && <div role="alert" className="text-xs text-amber-700">{versionsError}</div>}
          {localSaveState === 'error' && <div role="alert" className="text-xs text-rose-700">Không lưu được vào thiết bị. Nội dung vẫn đang mở trong bộ nhớ trình duyệt; thử lại trước khi rời trang.</div>}
          {(serverConflict || localConflict) && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-amber-800">
              <span>{localConflict ? 'Bản nháp đã thay đổi ở cửa sổ khác.' : 'Bản máy chủ đã thay đổi kể từ lần đồng bộ gần nhất.'}</span>
              {localConflict?.remoteDraft && <button onClick={handleReloadLocalConflict} className="px-2 py-1 border rounded">Tải bản ở cửa sổ khác</button>}
              {serverConflict && <button onClick={handleReloadServer} className="px-2 py-1 border rounded">Tải bản máy chủ</button>}
              <button onClick={handleKeepLocalCopy} className="px-2 py-1 border rounded">Giữ nội dung này thành bản sao</button>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        <div className={`w-full md:w-auto ${mobileTab === 'edit' ? 'flex' : 'hidden'} md:flex flex-col h-full z-10`}>
          {config && <CustomizerSidebar
            config={config}
            onChange={handleConfigChange}
            metadata={metadata}
            onMetadataChange={handleMetadataChange}
            onSectionEdit={handleSectionEdit}
            versions={versions}
            versionsTotal={versionsTotal}
            versionsLoadingMore={versionsLoadingMore}
            onLoadMoreVersions={handleLoadMoreVersions}
            selectedVersionId={selectedVersionId}
            onSelectVersion={setSelectedVersionId}
            onPreviewVersion={handlePreviewVersion}
            onContinueFromVersion={handleContinueFromVersion}
            onPublishVersion={handlePublishVersion}
            onUnpublishVersion={handleUnpublishVersion}
            onUnpublishSite={handleUnpublishSite}
            onCopyVersionUrl={handleCopyVersionUrl}
            hasServerSite={!!currentCustomizationId}
            publishedVersionId={publishedVersionId}
            saving={saving}
          />}
        </div>

        <div className={`flex-1 bg-gray-900/95 overflow-y-auto ${mobileTab === 'preview' ? 'flex' : 'hidden'} md:flex items-center justify-center p-2 sm:p-6 transition-all duration-300 pb-20 md:pb-6`}>
          {config && (viewport === 'desktop' ? (
            <div className="w-full h-full rounded-2xl overflow-y-auto shadow-2xl bg-white no-scrollbar">
              <LandingPageRenderer config={deferredConfig} customizationId={currentCustomizationId} isPreview={true} activeEditSection={activeEditSection} editFeedbackKey={editFeedbackKey} />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <DeviceSimulator initialOs="ios" showToolbar={true}>
                <LandingPageRenderer config={deferredConfig} customizationId={currentCustomizationId} isPreview={true} activeEditSection={activeEditSection} editFeedbackKey={editFeedbackKey} />
              </DeviceSimulator>
            </div>
          ))}
        </div>

        <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 p-1.5 flex items-center justify-around gap-2">
          <button onClick={() => setMobileTab('edit')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold ${mobileTab === 'edit' ? 'bg-rose-600 text-white shadow-md' : 'text-gray-600'}`}>
            <Edit3 className="w-4 h-4" /> Chỉnh sửa
          </button>
          <button onClick={() => setMobileTab('preview')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold ${mobileTab === 'preview' ? 'bg-rose-600 text-white shadow-md' : 'text-gray-600'}`}>
            <Eye className="w-4 h-4" /> Xem trước
          </button>
        </div>
      </div>

      <Modal isOpen={isCommunityModalOpen} onClose={() => setIsCommunityModalOpen(false)} title="Chia sẻ phiên bản vào thư viện cộng đồng">
        {communitySuccess ? (
          <div className="py-6 text-center space-y-4">
            <Check className="w-10 h-10 text-emerald-600 mx-auto" />
            <p className="font-semibold text-gray-900">Đã chia sẻ phiên bản thiết kế.</p>
            <button onClick={() => setIsCommunityModalOpen(false)} className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm">Đóng</button>
          </div>
        ) : (
          <form onSubmit={handleCommunitySubmit} className="space-y-4 text-sm">
            {communityError && <div role="alert" className="p-3 rounded-lg bg-rose-50 text-rose-700">{communityError}</div>}
            <label className="block text-xs font-semibold text-gray-700">Tên mẫu
              <input required value={communityForm.name} onChange={(event) => setCommunityForm({ ...communityForm, name: event.target.value })} className="mt-1 w-full p-2 border rounded-lg" />
            </label>
            <label className="block text-xs font-semibold text-gray-700">Slug
              <input required value={communityForm.slug} onChange={(event) => setCommunityForm({ ...communityForm, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} className="mt-1 w-full p-2 border rounded-lg" />
            </label>
            <label className="block text-xs font-semibold text-gray-700">Phiên bản
              <select required value={selectedVersionId || ''} onChange={(event) => setSelectedVersionId(event.target.value)} className="mt-1 w-full p-2 border rounded-lg bg-white">
                {versions.map((version) => <option key={version.id} value={version.id}>v{version.versionNumber} · {version.title}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-gray-700">Danh mục
              <select required value={communityForm.categoryId} onChange={(event) => setCommunityForm({ ...communityForm, categoryId: event.target.value })} className="mt-1 w-full p-2 border rounded-lg bg-white">
                <option value="">Chọn danh mục</option>
                {communityCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-gray-700">URL ảnh thumbnail
              <input required type="url" value={communityForm.thumbnailUrl} onChange={(event) => setCommunityForm({ ...communityForm, thumbnailUrl: event.target.value })} className="mt-1 w-full p-2 border rounded-lg" />
            </label>
            <label className="block text-xs font-semibold text-gray-700">Mô tả
              <textarea rows={3} value={communityForm.description} onChange={(event) => setCommunityForm({ ...communityForm, description: event.target.value })} className="mt-1 w-full p-2 border rounded-lg resize-y" />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsCommunityModalOpen(false)} className="px-4 py-2 rounded-lg border text-sm">Hủy</button>
              <button type="submit" disabled={communitySaving || !communityCategories.length} className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm disabled:opacity-50">{communitySaving ? 'Đang chia sẻ…' : 'Chia sẻ phiên bản'}</button>
            </div>
          </form>
        )}
      </Modal>

      {previewVersion && (
        <div className="fixed inset-0 z-[70] bg-gray-950 flex flex-col">
          <div className="h-14 shrink-0 px-4 flex items-center justify-between bg-white border-b">
            <div className="text-sm font-semibold">Xem trước v{previewVersion.versionNumber} · {previewVersion.title}</div>
            <button onClick={() => setPreviewVersion(null)} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Đóng xem trước"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto bg-white">
            <LandingPageRenderer config={previewVersion.config} customizationId={currentCustomizationId} customizationVersionId={previewVersion.id} isPreview={true} />
          </div>
        </div>
      )}
    </div>
  );
}
