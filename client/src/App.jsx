// src/App.jsx

import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import IndexPage from './pages/IndexPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import CreateCampaignPage from './pages/CreatecampaignPage';
import SettingsPage from './pages/SettingsPage';
import CampaignDetailPage from './pages/CampaignDetailPage'; // --- THIS WAS MISSING ---
import OrganizerProfilePage from './pages/OrganizerProfilePage.jsx'; 
import NotFoundPage from './pages/NotFoundPage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { ThemeProvider } from './contexts/ThemeProvider';
import { UserProvider } from './contexts/UserProvider';
import ProtectedRoute from './components/ProtectedRoute'; 
import BackgroundGraphic from './components/common/BackgroundGraphic';
import NotificationDisplay from './components/common/NotificationDisplay';

function App() {
  const location = useLocation();
  const noLayoutRoutes = ['/auth'];
  const showLayout = !noLayoutRoutes.includes(location.pathname);

  return (
    <ThemeProvider>
      <UserProvider> {/* UserProvider must be INSIDE NotificationProvider (which we did in main.jsx) */}
        <div className="text-gray-800 dark:text-gray-200 min-h-screen font-sans">
          
          <BackgroundGraphic /> 
          <NotificationDisplay />
          
          {showLayout && <Header />}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<IndexPage />} />
            <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/create" element={<CreateCampaignPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              
              {/* --- THIS IS THE FIX: ADDED THE ROUTE FOR CAMPAIGN DETAILS --- */}
              <Route path="/campaign/:id" element={<CampaignDetailPage />} />
              
              <Route path="/organizer/:id" element={<OrganizerProfilePage />} /> 
            
           
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          {showLayout && <Footer />}
        </div>
      </UserProvider>
    </ThemeProvider>
  );
}
export default App;