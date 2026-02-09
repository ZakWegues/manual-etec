import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from "@/components/auth/ProtectedRoutes";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Subjects from "./pages/Subjects";
import SubjectDetail from "./pages/SubjectDetail";
import ActivityDetail from "./pages/ActivityDetail";
import CalendarPage from "./pages/Calendar";
import AIAssistant from "./pages/AIAssistant";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AdminSubjects from "./pages/AdminSubjects";
import AdminActivities from "./pages/AdminActivities";
import AdminFeedback from "./pages/AdminFeedback";
import Study from "./pages/Study";
import StudySubject from "./pages/StudySubject";
import AdminStudy from "./pages/AdminStudy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Auth route - only for non-authenticated users */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/auth" element={<Auth />} />
            </Route>
            
            {/* Protected routes - require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/subjects/:subjectId" element={<SubjectDetail />} />
                <Route path="/subjects/:subjectId/activities/:activityId" element={<ActivityDetail />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/study" element={<Study />} />
                <Route path="/study/:subjectId" element={<StudySubject />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                
                {/* Admin routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin/subjects" element={<AdminSubjects />} />
                  <Route path="/admin/activities" element={<AdminActivities />} />
                  <Route path="/admin/feedback" element={<AdminFeedback />} />
                  <Route path="/admin/study" element={<AdminStudy />} />
                </Route>
              </Route>
            </Route>
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;