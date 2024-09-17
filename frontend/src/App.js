import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext'; // Thêm dòng này
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import CreateProduct from './components/CreateProduct';
import ResetPassword from './components/ResetPassword';
import ForgotPassword from './components/ForgotPassword';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProductManagement from './components/ProductManagement';
import OrderManagement from './components/OrderManagement';
import UserManagement from './components/UserManagement';
import Statistics from './components/Statistics';
import UserProfile from './components/UserProfile';
import UserOrders from './components/UserOrders';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route 
        path="/user/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
        
          </ProtectedRoute>
        } >
         <Route path="profile" element={<UserProfile />} />
        <Route path="orders" element={<UserOrders />} />

        </Route>
      
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      >
        <Route path="products" element={<ProductManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="create-product" element={<CreateProduct />} />
        <Route path="statistics" element={<Statistics />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider> {/* Thêm CartProvider ở đây */}
        <Router>
          <MainLayout>
            <AppRoutes />
          </MainLayout>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;