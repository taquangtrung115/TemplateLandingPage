let flushCurrentDraft = null;

export const registerDraftFlush = (flush) => {
  flushCurrentDraft = flush;
  return () => {
    if (flushCurrentDraft === flush) flushCurrentDraft = null;
  };
};

export const flushActiveDraft = async () => {
  if (flushCurrentDraft) await flushCurrentDraft();
};
