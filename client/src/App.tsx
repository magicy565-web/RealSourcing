import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import NotFound from "./pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import SignIn from "./pages/SignIn";
import Webinars from "./pages/Webinars";
import WebinarCreate from "./pages/CreateWebinar";
import WebinarDetail from "./pages/WebinarDetail";
import WebinarReplay from "./pages/WebinarReplay";
import WebinarRoom from "./pages/WebinarRoom";
import NegotiationRoom from "./pages/NegotiationRoom";
import Factories from "./pages/Factories";
import FactoryDetail from "./pages/FactoryDetail";
import Reports from "./pages/Reports";
import ReportView from "./pages/ReportView";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import PaymentSuccess from "./pages/PaymentSuccess";
import Messages from "./pages/Messages";
import { Subscription } from "./pages/Subscription";
import { QuotaDashboard } from "./pages/QuotaDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CommandPalette from "./components/CommandPalette";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/signin" component={SignIn} />
      <Route path="/home" component={Home} />
      <Route path="/dashboard" component={Home} />
      <Route path="/" component={LandingPage} />
      <Route path="/webinars" component={Webinars} />
      <Route path="/webinars/create" component={WebinarCreate} />
      <Route path="/webinars/:id/room" component={WebinarRoom} />
      <Route path="/webinars/:id">{(params) => <WebinarDetail params={params} />}</Route>
      <Route path="/webinars/:id/replay" component={WebinarReplay} />
      <Route path="/factories" component={Factories} />
      <Route path="/factories/:id" component={FactoryDetail} />
      <Route path="/reports" component={Reports} />
      <Route path="/reports/:id">{(params) => <ReportView params={params} />}</Route>
      <Route path="/settings" component={Settings} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/subscription" component={SubscriptionManagement} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/messages" component={Messages} />
      <Route path="/subscription-plans" component={Subscription} />
      <Route path="/quota" component={QuotaDashboard} />
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
