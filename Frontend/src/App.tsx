import SuperAdmin from "./pages/SuperAdmin";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SetPassword from "./pages/SetPassword";
import ScheduleDashboard from "./components/ScheduleDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/super-secret" element={<SuperAdmin />} />
        <Route path="/schedule" element={<ScheduleDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
