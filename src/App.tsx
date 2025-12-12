// src/App.tsx
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterSuccessPage from './pages/RegisterSuccessPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import Layout from './components/Layout';
import ProtectedRoute from "./components/auth/ProtectedRoute.tsx";
import PublicRoute from "./components/auth/PublicRoute.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import OAuth2RedirectHandler from "./pages/OAuth2RedirectHandler.tsx";
import CoursesPage from "./pages/CoursesPage.tsx";
import CourseDetailPage from "./pages/CourseDetailPage.tsx";
import TeacherDashboardPage from "./pages/TeacherDashboardPage.tsx";
import AuthProvider from "./components/AuthProvider.tsx";
import StudentDashboardPage from "./pages/StudentDashboardPage.tsx";
import ChatPage from "./pages/ChatPage.tsx";
import { ChatNotificationProvider } from "./context/ChatNotificationContext.tsx";

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ChatNotificationProvider>
                    <Routes>
                        <Route element={<Layout />}>
                        {/* Routes publiques */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/courses" element={<CoursesPage />} />
                        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
                        <Route path="/oauth/redirect" element={<OAuth2RedirectHandler />} />
                        
                        {/* Routes réservées aux visiteurs (non connectés) */}
                        <Route element={<PublicRoute />}>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/register-success" element={<RegisterSuccessPage />} />
                            <Route path="/verify-email" element={<VerifyEmailPage />} />
                        </Route>

                        {/* Routes protégées */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/teacher-dashboard" element={<TeacherDashboardPage />} />
                            <Route path="/student-dashboard" element={<StudentDashboardPage />} />
                            <Route path="/chat" element={<ChatPage />} />
                        </Route>
                        </Route>
                    </Routes>
                </ChatNotificationProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
