import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Home } from './pages/Home';
import { CreateBill } from './pages/CreateBill';
import { ViewBill } from './pages/ViewBill';
import { Dashboard } from './pages/Dashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 2,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateBill />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bill/:token" element={<ViewBill />} />
          <Route path="/bill/id/:id" element={<ViewBill />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
