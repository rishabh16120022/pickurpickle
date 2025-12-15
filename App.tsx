
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import Auth from './pages/Auth';
import TrackOrder from './pages/TrackOrder';
import MyOrders from './pages/MyOrders';

// Protected Route Component
const ProtectedAdminRoute = ({ children }: { children?: React.ReactNode }) => {
    const { user } = useStore();
    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

const AppRoutes = () => {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/track" element={<TrackOrder />} />
                <Route path="/orders" element={<MyOrders />} />
                <Route 
                    path="/admin" 
                    element={
                        <ProtectedAdminRoute>
                            <AdminDashboard />
                        </ProtectedAdminRoute>
                    } 
                />
            </Routes>
        </Layout>
    );
};

const App = () => {
  return (
    <StoreProvider>
        <Router>
            <AppRoutes />
        </Router>
    </StoreProvider>
  );
};

export default App;
