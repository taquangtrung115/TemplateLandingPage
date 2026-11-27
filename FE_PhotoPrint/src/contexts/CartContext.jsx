import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { workspaceKey } from '../utils/tenantScope';
import { isDemoMode } from '../api/axios';

const CartContext = createContext(null);

function loadCart(key) {
  try {
    const items = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(items) ? items.filter(item => item?.id && item?.productId && Array.isArray(item.photoFiles)) : [];
  } catch { return []; }
}

export function CartProvider({ children }) {
  const key = 'photoprint_cart:' + workspaceKey() + (isDemoMode ? ':demo' : '');
  const [items, setItems] = useState(() => loadCart(key));
  const latest = useRef(items);

  useEffect(() => {
    function synchronize(event) {
      if (event.key !== null && event.key !== key) return;
      latest.current = loadCart(key);
      setItems(latest.current);
    }
    window.addEventListener('storage', synchronize);
    return () => window.removeEventListener('storage', synchronize);
  }, [key]);

  function update(mutator) {
    const next = mutator(latest.current);
    latest.current = next;
    setItems(next);
    try {
      const durable = isDemoMode ? next.filter(item => !item.photoFiles.some(photo => photo.fileUrl?.startsWith('blob:'))) : next;
      localStorage.setItem(key, JSON.stringify(durable));
    } catch { /* Keep the cart usable when storage is restricted in an iframe. */ }
  }

  const add = item => update(previous => [...previous, { ...item, id: crypto.randomUUID() }]);
  const remove = id => update(previous => previous.filter(item => item.id !== id));
  const clear = () => update(() => []);
  const removeOrdered = submitted => {
    const ids = new Set(submitted.map(item => item.id));
    update(previous => previous.filter(item => !ids.has(item.id)));
  };
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const photoCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return <CartContext.Provider value={{ items, add, remove, clear, removeOrdered, total, photoCount }}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
