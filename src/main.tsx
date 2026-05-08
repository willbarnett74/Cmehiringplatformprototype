import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProfileProvider } from './contexts/UserProfileContext';
import AppRoutes from './AppRoutes';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000 },
  },
});

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <UserProfileProvider>
        <AppRoutes />
      </UserProfileProvider>
    </BrowserRouter>
  </QueryClientProvider>,
);
