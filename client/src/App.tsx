import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import NotFound from "./pages/NotFound";
import { Route, Switch } from "wouter";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import Webinars from "./pages/Webinars";
import WebinarDetail from "./pages/WebinarDetail";
import WebinarLiveRoom from "./pages/WebinarLiveRoom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Factories from "./pages/Factories";
import FactoryDetail from "./pages/FactoryDetail";
import CommandPalette from "./components/CommandPalette";

// Simplified router with only core pages that work with mock data
function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/home" component={Home} />
      <Route path="/dashboard" component={Home} />
      <Route path="/" component={LandingPage} />
      <Route path="/webinars" component={Webinars} />
      <Route path="/webinars/:id" component={WebinarDetail} />
      <Route path="/webinars/:id/live" component={WebinarLiveRoom} />
      <Route path="/factories" component={Factories} />
      <Route path="/factories/:id" component={FactoryDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster position="top-right" />
            <CommandPalette />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
