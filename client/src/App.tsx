import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, getTRPCClient } from './lib/trpc';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/sonner';
import { Route, Switch } from 'wouter';

// Import pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Webinars from './pages/Webinars';
import WebinarDetail from './pages/WebinarDetailNew';
import Factories from './pages/FactoriesNew';
import FactoryDetail from './pages/FactoryDetailOptimized';
import NotFound from './pages/NotFound';
import ApiTest from './pages/ApiTest';

function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));
  
  const [trpcClient] = useState(() => getTRPCClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Switch>
              <Route path="/" component={LandingPage} />
              <Route path="/login" component={Login} />
              <Route path="/signin" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/home" component={Home} />
              <Route path="/webinars" component={Webinars} />
              <Route path="/webinar/:id" component={WebinarDetail} />
              <Route path="/factories" component={Factories} />
              <Route path="/factory/:id" component={FactoryDetail} />
              <Route path="/api-test" component={ApiTest} />
              <Route component={NotFound} />
            </Switch>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
