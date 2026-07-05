import React, { useState } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { MPDashboard } from './pages/MPDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { DecisionSimulator } from './pages/DecisionSimulator';
import { ShieldAlert } from 'lucide-react';

type Page = 'landing' | 'citizen' | 'mp' | 'admin' | 'login' | 'simulator';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const { user } = useAuth();

  // Role-based route protection wrapper
  const renderProtectedPage = (page: Page, allowedRoles: string[]) => {
    if (!user) {
      return <LoginPage onLoginSuccess={() => setCurrentPage(page)} />;
    }

    if (!allowedRoles.includes(user.role)) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[calc(100vh-64px)]">
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-full mb-4">
            <ShieldAlert size={36} />
          </div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">Access Restriction Policy</h2>
          <p className="text-xs text-slate-500 max-w-sm mt-2">
            Your authenticated profile ({user.displayName}, role: <strong className="capitalize">{user.role}</strong>) does not have authorization to view this panel.
          </p>
          <button
            onClick={() => setCurrentPage('landing')}
            className="mt-6 px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover transition-colors cursor-pointer"
          >
            Return to Overview
          </button>
        </div>
      );
    }

    switch (page) {
      case 'citizen':
        return <CitizenDashboard />;
      case 'mp':
        return <MPDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'simulator':
        return <DecisionSimulator />;
      default:
        return <LandingPage onStartClicked={() => setCurrentPage('citizen')} />;
    }
  };

  const renderActivePage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onStartClicked={() => setCurrentPage(user ? (user.role === 'citizen' ? 'citizen' : 'mp') : 'login')} />;
      case 'login':
        return <LoginPage onLoginSuccess={() => setCurrentPage(user?.role === 'citizen' ? 'citizen' : 'mp')} />;
      case 'citizen':
        return renderProtectedPage('citizen', ['citizen', 'mp', 'admin']);
      case 'mp':
        return renderProtectedPage('mp', ['mp', 'admin']);
      case 'admin':
        return renderProtectedPage('admin', ['admin']);
      case 'simulator':
        return renderProtectedPage('simulator', ['mp', 'admin']);
      default:
        return <LandingPage onStartClicked={() => setCurrentPage('citizen')} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar onPageChange={setCurrentPage} currentPage={currentPage} />
      <main className="flex-1 flex flex-col">
        {renderActivePage()}
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
