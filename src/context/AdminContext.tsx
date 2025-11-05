import { createContext, useContext, ReactNode } from 'react';
import AdminDashboard from '../pages/AdminDashboard';

// Create a context that provides access to AdminDashboard functions
const AdminContext = createContext<{ dashboard: typeof AdminDashboard } | null>(null);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AdminContext.Provider value={{ dashboard: AdminDashboard }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

