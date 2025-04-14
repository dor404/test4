import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import { Login, Register } from './pages/Auth';
import LearningHub from './components/Learning/LearningHub';
import ModuleList from './components/Training/ModuleList';
import ModuleViewer from './components/Training/ModuleViewer';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';
import ResetPassword from './components/Auth/ResetPassword';
import AdminDashboard from './components/Admin/AdminDashboard';
import AboutUs from './pages/AboutUs';
import { UserProfile } from './pages/Profile';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/profile" element={
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      } />
      <Route path="/learn" element={
        <ProtectedRoute>
          <LearningHub />
        </ProtectedRoute>
      } />
      <Route path="/training" element={
        <ProtectedRoute>
          <ModuleList />
        </ProtectedRoute>
      } />
      <Route path="/training/:moduleId" element={
        <ProtectedRoute>
          <ModuleViewer />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
    </Routes>
  );
};

export default AppRoutes; 