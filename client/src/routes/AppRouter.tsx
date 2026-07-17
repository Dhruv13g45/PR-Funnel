import Dashboard from "@/features/dashboard/components/Dashboard";
import ErrorPage from "@/components/common/ErrorPage";
import LandingPage from "@/components/common/LandingPage";
import SignInPage from "@/features/auth/components/SignInPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GuestRoutes from "./GuestRoutes";
import ProtectedRoutes from "./ProtectedRoutes";
import SideBar from "@/components/layout/SideBar";

const AppRouter = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Common public routes */}
          <Route path="/" element={<LandingPage />} />

          {/* guests routes */}
          <Route element={<GuestRoutes />}>
            <Route path="/sign-in" element={<SignInPage />} />
          </Route>

          {/* Protected  Routes */}
          <Route element={<ProtectedRoutes />}>
            <Route element={<SideBar />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/repositories" element={<Dashboard />} />
              <Route path="/pull-requests" element={<Dashboard />} />
              <Route path="/reviews" element={<Dashboard />} />
              <Route path="/github-apps" element={<Dashboard />} />
            </Route>
          </Route>

          {/* Errors page route */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default AppRouter;
