import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import NotFound from "./pages/NotFound";
import { Route, Switch } from "wouter";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import SignIn from "./pages/SignIn";
import Webinars from "./pages/Webinars";
import WebinarCreate from "./pages/CreateWebinar";
import WebinarDetailEnhanced from "./pages/WebinarDetailEnhanced";
import WebinarReplay from "./pages/WebinarReplay";
import WebinarRoom from "./pages/WebinarRoom";
import ProductShowcase from "./pages/ProductShowcase";
import MyFavorites from "./pages/MyFavorites";
import AdminProducts from "./pages/admin/AdminProducts";
import AddProduct from "./pages/admin/AddProduct";
import AdminDashboard from "./pages/AdminDashboard";
import AdminWebinarForm from "./pages/AdminWebinarForm";
import AdminProductForm from "./pages/AdminProductForm";
import NegotiationRoom from "./pages/NegotiationRoom";
import WebinarLiveRoom from "./pages/WebinarLiveRoom";
import Factories from "./pages/Factories";
import FactoriesNew from "./pages/FactoriesNew";
import FactoriesOptimized from "./pages/FactoriesOptimized";
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
      <Route path="/webinars/:id/live" component={WebinarLiveRoom} />
      <Route path="/webinars/:id/sourcing" component={ProductShowcase} />
      <Route path="/webinars/:id/favorites" component={MyFavorites} />
      <Route path="/admin/products">
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminProducts />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/products/new">
        <ProtectedRoute allowedRoles={['admin']}>
          <AddProduct />
        </ProtectedRoute>
      </Route>
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/webinars/:id/edit" component={AdminWebinarForm} />
      <Route path="/admin/products/:id/edit" component={AdminProductForm} />
      <Route path="/webinars/:id">{(params) => <WebinarDetailEnhanced params={params} />}</Route>
      <Route path="/webinars/:id/replay" component={WebinarReplay} />
      <Route path="/factories" component={FactoriesOptimized} />
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
