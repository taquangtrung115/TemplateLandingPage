export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Template Landing Page. Xây dựng với React 19, Vite, Tailwind CSS và .NET 10 Clean Architecture.</p>
      </div>
    </footer>
  );
}
