import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import PublicLayout from './layouts/PublicLayout';

// Public pages
import HomePage from './pages/public/HomePage';
import SearchRoomsPage from './pages/public/SearchRoomsPage';
import RoomDetailPage from './pages/public/RoomDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin/Staff pages
import DashboardPage from './pages/admin/DashboardPage';
import RoomsManagementPage from './pages/admin/RoomsManagementPage';
import BookingsManagementPage from './pages/admin/BookingsManagementPage';
import GuestsManagementPage from './pages/admin/GuestsManagementPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import RoomTypesPage from './pages/admin/RoomTypesPage';

// Guest pages
import MyBookingsPage from './pages/guest/MyBookingsPage';
import BookingDetailPage from './pages/guest/BookingDetailPage';
import ProfilePage from './pages/guest/ProfilePage';
import NotificationsPage from './pages/guest/NotificationsPage';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const { user } = useAuthStore();

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms" element={<SearchRoomsPage />} />
        <Route path="/rooms/:id" element={<RoomDetailPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      </Route>

      {/* Protected routes - Admin/Staff */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin/rooms" element={<RoomsManagementPage />} />
        <Route path="/admin/room-types" element={<RoomTypesPage />} />
        <Route path="/admin/bookings" element={<BookingsManagementPage />} />
        <Route path="/admin/guests" element={<GuestsManagementPage />} />
        <Route path="/admin/payments" element={<PaymentsPage />} />
        <Route path="/admin/analytics" element={<AnalyticsPage />} />
      </Route>

      {/* Protected routes - All authenticated users */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'GUEST']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/bookings" element={<MyBookingsPage />} />
        <Route path="/bookings/:id" element={<BookingDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
