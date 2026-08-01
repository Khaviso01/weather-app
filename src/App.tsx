import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import Home from "./pages/Home";
import Locations from "./pages/Locations";
import Settings from "./pages/Settings";
import { ToastProvider } from "./context/ToastContext";
import { AppProvider } from "./context/AppContext";

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </AppProvider>
    </ToastProvider>
  );
}
