import { useEffect } from 'react';
import { AppRoutes } from './routes';
import { initializeDefaultSettings } from './db';
import { ToastProvider } from './components/ui/Toast';

function App() {
  useEffect(() => {
    initializeDefaultSettings();
  }, []);

  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}

export default App;
