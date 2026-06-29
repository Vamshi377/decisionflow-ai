import React, { createContext, useContext, useState, useEffect } from 'react';

export type Page = 
  | 'login'
  | 'dashboard'
  | 'customers'
  | 'workspace'
  | 'upload'
  | 'execution'
  | 'recommendations'
  | 'memory'
  | 'analytics'
  | 'audit'
  | 'settings'
  | 'customer_portal';

interface NavContextType {
  currentPage: Page;
  selectedCustomerId: number | null;
  activeTaskId: string | null;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  navigate: (page: Page, customerId?: number | null, taskId?: string | null) => void;
}

const NavContext = createContext<NavContextType | undefined>(undefined);

export const NavProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    setCurrentPage('dashboard');
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    setSelectedCustomerId(null);
    setActiveTaskId(null);
    setCurrentPage('login');
  };

  const navigate = (page: Page, customerId: number | null = null, taskId: string | null = null) => {
    setCurrentPage(page);
    if (customerId !== undefined) setSelectedCustomerId(customerId);
    if (taskId !== undefined) setActiveTaskId(taskId);
  };

  // Sync state if user changes login status manually
  useEffect(() => {
    if (currentPage === 'customer_portal') return;
    if (!isLoggedIn && currentPage !== 'login') {
      setCurrentPage('login');
    } else if (isLoggedIn && currentPage === 'login') {
      setCurrentPage('dashboard');
    }
  }, [isLoggedIn, currentPage]);

  return (
    <NavContext.Provider 
      value={{ 
        currentPage, 
        selectedCustomerId, 
        activeTaskId, 
        isLoggedIn, 
        login, 
        logout, 
        navigate 
      }}
    >
      {children}
    </NavContext.Provider>
  );
};

export const useNav = () => {
  const context = useContext(NavContext);
  if (!context) {
    throw new Error('useNav must be used within a NavProvider');
  }
  return context;
};
