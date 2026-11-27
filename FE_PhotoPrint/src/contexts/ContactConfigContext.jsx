import { createContext, useContext, useState } from 'react';
import { contactConfigApi } from '../api/contactConfigApi';
import useRequest from '../hooks/useRequest';

const ContactContext = createContext(null);

export function ContactConfigProvider({ children }) {
  const request = useRequest(contactConfigApi.get);
  const [updatedConfig, setUpdatedConfig] = useState(null);
  const config = updatedConfig || request.data || {};
  return <ContactContext.Provider value={{ config, loading: request.loading, error: request.error, reload: request.reload, setUpdatedConfig }}>
    {children}
  </ContactContext.Provider>;
}

export const useContactConfig = () => useContext(ContactContext);
