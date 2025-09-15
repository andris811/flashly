// main.tsx
// ---- super-early diagnostics (remove later) ----
window.addEventListener('error', (e) => {
  // surface synchronous errors
  console.log('[global error]', e.error || e.message);
});
window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
  // surface async errors (e.g., React suspends/throws, API init)
  console.log('[global unhandledrejection]', e.reason);
});

console.log('[boot] A: main.tsx starting');
// ---- end diagnostics ----
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import MePage from "./pages/MePage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Boot from "./Boot";
import { setupStatusBar } from './boot/statusBar';

setupStatusBar();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Boot>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/me" element={<MePage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </Boot>
  </StrictMode>
);
console.log('[boot] B: root.render done');