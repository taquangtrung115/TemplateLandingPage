import { createContext, useContext, useState } from 'react';

const PhotoDraftContext = createContext(null);

export function PhotoDraftProvider({ children }) {
  const [draft, setDraft] = useState(null);
  return <PhotoDraftContext.Provider value={{ draft, setDraft }}>{children}</PhotoDraftContext.Provider>;
}

export const usePhotoDraft = () => useContext(PhotoDraftContext);
