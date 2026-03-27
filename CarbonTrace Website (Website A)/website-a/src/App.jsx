import { Routes, Route, Navigate } from 'react-router-dom';
import GovLayout from './layouts/GovLayout';
import PanchayatLayout from './layouts/PanchayatLayout';
import NgoLayout from './layouts/NgoLayout';
import Login from './pages/Login';
import Landing from './pages/Landing';

// Government pages
import Dashboard from './pages/Dashboard';
import LandRequests from './pages/LandRequests';
import DocumentReview from './pages/DocumentReview';
import NdviMonitoring from './pages/NdviMonitoring';
import CreditIssuance from './pages/CreditIssuance';
import Payouts from './pages/Payouts';
import BlockchainAudit from './pages/BlockchainAudit';

// Panchayat pages
import PanchayatDashboard     from './pages/panchayat/PanchayatDashboard';
import PanchayatRequests      from './pages/panchayat/PanchayatRequests';
import PanchayatSubmitRequest from './pages/panchayat/PanchayatSubmitRequest';
import PanchayatPayouts       from './pages/panchayat/PanchayatPayouts';

// NGO pages
import NgoDashboard  from './pages/ngo/NgoDashboard';
import NgoLands      from './pages/ngo/NgoLands';
import NgoMrvUpload  from './pages/ngo/NgoMrvUpload';
import NgoPayments   from './pages/ngo/NgoPayments';

export function redirectAfterLogin(role) {
  if (role === 'GOVERNMENT') return '/gov/dashboard';
  if (role === 'PANCHAYAT')  return '/panchayat/dashboard';
  if (role === 'NGO')        return '/ngo/dashboard';
  return '/gov/dashboard';
}

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectAfterLogin(user.role)} replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Government routes — protected */}
      <Route
        path="/gov"
        element={
          <ProtectedRoute allowedRoles={['GOVERNMENT']}>
            <GovLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard"    element={<Dashboard />} />
        <Route path="land-requests" element={<LandRequests />} />
        <Route path="documents"    element={<DocumentReview />} />
        <Route path="ndvi"         element={<NdviMonitoring />} />
        <Route path="credits"      element={<CreditIssuance />} />
        <Route path="payouts"      element={<Payouts />} />
        <Route path="audit"        element={<BlockchainAudit />} />
      </Route>

      {/* Panchayat routes — protected */}
      <Route
        path="/panchayat"
        element={
          <ProtectedRoute allowedRoles={['PANCHAYAT']}>
            <PanchayatLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PanchayatDashboard />} />
        <Route path="dashboard" element={<PanchayatDashboard />} />
        <Route path="requests"  element={<PanchayatRequests />} />
        <Route path="submit"    element={<PanchayatSubmitRequest />} />
        <Route path="payouts"   element={<PanchayatPayouts />} />
      </Route>

      {/* NGO routes — protected */}
      <Route
        path="/ngo"
        element={
          <ProtectedRoute allowedRoles={['NGO']}>
            <NgoLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<NgoDashboard />} />
        <Route path="dashboard" element={<NgoDashboard />} />
        <Route path="lands"     element={<NgoLands />} />
        <Route path="mrv"       element={<NgoMrvUpload />} />
        <Route path="payments"  element={<NgoPayments />} />
      </Route>

    </Routes>
  );
}

export default App;
