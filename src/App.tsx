import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import FullMap from "./pages/FullMap";
import DetailsPage from "./pages/DetailsPage";
import SelectSlot from "./pages/SelectSlot";
import Ongoing from "./pages/Ongoing";
import Compeleted from "./pages/Compeleted";
import Cancelled from "./pages/Cancelled";
import WinnerDetails from "./pages/WinnerDetails";
import Wallets from "./pages/Wallets";
import Contect from "./pages/Contect";
import Profile from "./pages/Profile";
import './App.css';
import EditProfile from "./pages/EditProfile";
import { WalletProvider } from './context/WalletContext';
import Tournament from "./pages/Tournament";
import Task from "./pages/Task";
import About from "./pages/About";
import Upcoming from "./pages/Upcoming";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import TournamentRules from "./pages/TournamentRules";

// Admin Route Guard Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const adminToken = localStorage.getItem("adminToken");

  if (!isAdmin || !adminToken) {
    return <Navigate to="/al-admin-128900441" replace />;
  }

  return <>{children}</>;
};

// Guest Route Guard Component (for login/register pages)
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  
  if (token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Protected Route Guard Component (requires login)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();
  
  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

const queryClient = new QueryClient();


const App = () => (
  <WalletProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ToastContainer position="top-right" autoClose={1000} hideProgressBar={true} newestOnTop closeOnClick draggable />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/fullmap" element={<FullMap />} />
            <Route path="/tournament" element={<Tournament />} />
            <Route path="/lone-wolf" element={<FullMap />} />
            <Route path="/survival" element={<FullMap />} />
            <Route path="/free-matches" element={<FullMap />} />
            <Route path="/detail" element={<DetailsPage />} />
            <Route path="/contact" element={<Contect />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/rules" element={<TournamentRules />} />
            <Route path="/edit" element={<EditProfile />} />
            <Route path="/task" element={<ProtectedRoute><Task /></ProtectedRoute>} />

            {/* Guest Only Routes (Login/Register) */}
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

            {/* Protected Routes (Login Required) */}
            <Route path="/select-slot" element={<ProtectedRoute><SelectSlot /></ProtectedRoute>} />
            <Route path="/ongoing" element={<ProtectedRoute><Ongoing /></ProtectedRoute>} />
            <Route path="/completed" element={<ProtectedRoute><Compeleted /></ProtectedRoute>} />
            <Route path="/upcoming" element={<ProtectedRoute><Upcoming /></ProtectedRoute>} />
            <Route path="/cancelled" element={<ProtectedRoute><Cancelled /></ProtectedRoute>} />
            <Route path="/winner" element={<ProtectedRoute><WinnerDetails /></ProtectedRoute>} />
            <Route path="/wallets" element={<ProtectedRoute><Wallets /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/al-admin-128900441" element={<AdminLogin />} />
            <Route
              path="/al-dashboard-1289"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WalletProvider>
);

export default App;
