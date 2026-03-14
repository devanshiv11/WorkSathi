import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import StickyCTA from './components/StickyCTA';

import Home from './pages/Home';
import WorkerRegister from './pages/WorkerRegister';
import EmployerDashboard from './pages/EmployerDashboard';
import EmployerLogin from './pages/EmployerLogin';
import WorkerDashboard from './pages/WorkerDashboard';
import WorkerLogin from './pages/WorkerLogin';
import CampRegister from './pages/CampRegister';
import About from './pages/About';
import EmployerRegister from './pages/EmployerRegister';

import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthProvider';

import ProtectedRoute from './routes/ProtectedRoute';
import ContractorLogin from './pages/ContractorLogin';
import ContractorRegister from './pages/ContractorRegister';
import ContractorDashboard from './pages/ContractorDashboard';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/register-worker" element={<WorkerRegister />} />
                <Route path="/worker-login" element={<WorkerLogin />} />
                <Route path="/employer-login" element={<EmployerLogin />} />
                <Route path="/contractor-login" element={<ContractorLogin />} />
                <Route path="/contractor-register" element={<ContractorRegister />} />


                <Route path="/employer-register" element={<EmployerRegister />} />
                <Route path="/camp-register" element={<CampRegister />} />
                <Route path="/about" element={<About />} />

                {/* Employer Dashboard (Protected) */}
                <Route
                  path="/employer-dashboard"
                  element={
                    <ProtectedRoute role="employer">
                      <EmployerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Worker Dashboard (Protected) */}
                <Route
                  path="/worker-dashboard"
                  element={
                    <ProtectedRoute role="worker">
                      <WorkerDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/contractor-dashboard"
                  element={
                    <ProtectedRoute role="contractor">
                      <ContractorDashboard />
                    </ProtectedRoute>
                  }
                />


                {/* Optional legacy route */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <EmployerDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>

            <StickyCTA />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
