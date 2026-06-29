import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavProvider, useNav } from './context/NavContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';

// Pages imports
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Workspace } from './pages/Workspace';
import { Upload } from './pages/Upload';
import { AIExecution } from './pages/AIExecution';
import { Recommendations } from './pages/Recommendations';
import { Memory } from './pages/Memory';
import { Analytics } from './pages/Analytics';
import { Audit } from './pages/Audit';
import { Settings } from './pages/Settings';
import { CustomerPortal } from './pages/CustomerPortal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const AppContent: React.FC = () => {
  const { currentPage, isLoggedIn } = useNav();

  if (currentPage === 'customer_portal') {
    return <CustomerPortal />;
  }

  if (!isLoggedIn || currentPage === 'login') {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'customers': return <Customers />;
      case 'workspace': return <Workspace />;
      case 'upload': return <Upload />;
      case 'execution': return <AIExecution />;
      case 'recommendations': return <Recommendations />;
      case 'memory': return <Memory />;
      case 'analytics': return <Analytics />;
      case 'audit': return <Audit />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_42%,#f8fafc_100%)] dark:bg-[linear-gradient(135deg,#05070b_0%,#0b1220_48%,#05070b_100%)] text-neutral-800 dark:text-neutral-100 flex font-sans transition-colors duration-200 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 opacity-[0.28] dark:opacity-[0.18] bg-[linear-gradient(rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen relative z-0">
        {/* Top Header Controls */}
        <TopNav />

        {/* Page Inner Container (offset by header 16rem = 64px) */}
        <main className="flex-grow pt-16 px-8 py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-200">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NavProvider>
          <AppContent />
        </NavProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
