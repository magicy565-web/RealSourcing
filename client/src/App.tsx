import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Webinars from "./pages/Webinars";
import WebinarCreate from "./pages/CreateWebinar";
import NegotiationRoom from "./pages/NegotiationRoom";
import Factories from "./pages/Factories";
import FactoryDetail from "./pages/FactoryDetail";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import CommandPalette from "./components/CommandPalette";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/webinars" component={Webinars} />
      <Route path="/webinars/create" component={WebinarCreate} />
      <Route path="/webinars/:id" component={NegotiationRoom} />
      <Route path="/factories" component={Factories} />
      <Route path="/factories/:id" component={FactoryDetail} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster position="top-right" />
          <CommandPalette />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
