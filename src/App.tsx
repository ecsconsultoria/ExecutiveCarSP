import { useEffect } from 'react';
import { AppRoutes } from './routes';
import { initializeDefaultSettings } from './db';
import { ToastProvider } from './components/ui/Toast';
import { initializeNotifications } from './utils/notifications';

function App() {
  useEffect(() => {
    initializeDefaultSettings();
    // Initialize PWA notifications
    initializeNotifications();
  }, []);

  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}

export default App;
