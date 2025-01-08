import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './components/pages/HomePage';
import { ScannerPage } from './components/scanner/ScannerPage';
import { InventoryPage } from './components/inventory/InventoryPage';
import { NetworkStatus } from './components/common/NetworkStatus';
import { SafeArea } from './components/layout/SafeArea';
import { useDeviceOrientation } from './hooks/useDeviceOrientation';
import LandingPage from './components/landing/LandingPage';
import { ProductRegistrationPage } from './pages/ProductRegistrationPage';
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  // Asegurarse de que la aplicación esté en modo retrato
  useDeviceOrientation();

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <SafeArea top>
          <Navbar />
        </SafeArea>
        
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/scanner" element={<ScannerPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/register-product" element={<ProductRegistrationPage />} />
          </Routes>
        </main>

        <NetworkStatus />
        <Toaster position="bottom-center" />
      </div>
    </Router>
  );
}

export default App;
