import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import { ContactConfigProvider } from './contexts/ContactConfigContext';
import { PhotoDraftProvider } from './contexts/PhotoDraftContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return <AuthProvider><ThemeProvider><ContactConfigProvider><CartProvider><PhotoDraftProvider>
    <AppRoutes />
  </PhotoDraftProvider></CartProvider></ContactConfigProvider></ThemeProvider></AuthProvider>;
}
