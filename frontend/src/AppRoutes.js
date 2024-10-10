import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
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
import OrderSuccess from './components/OrderSuccess';
import CategoryManagement from './components/CategoryManagement';
import Checkout from './components/Checkout';
import InventoryManagement from './components/InventoryManagement';
import PurchaseOrderManagement from './components/PurchaseOrderManagement';
import SupplierManagement from './components/SupplierManagement';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/product/:slug" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/category/:slug" element={<ProductList />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route 
        path="/user/*" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        } 
      >
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="orders" element={<UserOrders />} />
      </Route>

      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      > 
        <Route path="suppliers" element={<SupplierManagement />} />
        <Route index element={<Navigate to="statistics" replace />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="create-product" element={<CreateProduct />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="inventory" element={<InventoryManagement />} />
        <Route path="purchase-orders" element={<PurchaseOrderManagement />} />
      </Route>
      
      <Route path="/order-success" element={<OrderSuccess />} />
      
      {/* Catch-all route for 404 Not Found */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;