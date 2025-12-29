import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { Wizard } from './components/Wizard/Wizard';
import { HardwareCatalog } from './components/Catalogs/HardwareCatalog';
import { DrawerSystemCatalog } from './components/Catalogs/DrawerSystemCatalog';
import { MaterialCatalog } from './components/Catalogs/MaterialCatalog';
import { WallModuleCatalog } from './components/Catalogs/WallModuleCatalog';
import { BaseModuleCatalog } from './components/Catalogs/BaseModuleCatalog';
import { TowerModuleCatalog } from './components/Catalogs/TowerModuleCatalog';
import { IslandModuleCatalog } from './components/Catalogs/IslandModuleCatalog';
import { LegSystemCatalog } from './components/Catalogs/LegSystemCatalog';
import { MaterialsHub } from './components/Catalogs/MaterialsHub';
import { EdgeBandCatalog } from './components/Catalogs/EdgeBandCatalog';
import { ConsumiblesCatalog } from './components/Catalogs/ConsumiblesCatalog';

import { AuthProvider, useAuth } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/wizard"
        element={user ? <Wizard /> : <Navigate to="/login" />}
      />
      <Route
        path="/catalogs/hardware"
        element={user ? <HardwareCatalog /> : <Navigate to="/login" />}
      />
      <Route
        path="/catalogs/drawer-systems"
        element={user ? <DrawerSystemCatalog /> : <Navigate to="/login" />}
      />
      <Route
        path="/catalogs/materials"
        element={user ? <MaterialCatalog /> : <Navigate to="/login" />}
      />
      <Route
        path="/catalogs/materials-hub"
        element={user ? <MaterialsHub /> : <Navigate to="/login" />}
      />
      <Route
        path="/catalogs/edge-banding"
        element={user ? <EdgeBandCatalog /> : <Navigate to="/login" />}
      />
      <Route
        path="/catalogs/consumables"
        element={user ? <ConsumiblesCatalog /> : <Navigate to="/login" />}
      />
      <Route
        path="/catalogs/modules/wall"
        element={user ? <WallModuleCatalog /> : <Navigate to="/login" />}
      />
      <Route
        path="/catalogs/modules/base"
        element={user ? <BaseModuleCatalog /> : <Navigate to="/login" />}
      />
      <Route
        path="/catalogs/modules/tower"
        element={user ? <TowerModuleCatalog /> : <Navigate to="/login" />}
      />
      <Route
        path="/catalogs/modules/island"
        element={user ? <IslandModuleCatalog /> : <Navigate to="/login" />}
      />
      <Route
        path="/catalogs/leg-systems"
        element={user ? <LegSystemCatalog /> : <Navigate to="/login" />}
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
