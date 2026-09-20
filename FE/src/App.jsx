import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}
