import Dashboard from "@/features/dashboard/components/Dashboard";
import ErrorPage from "@/components/common/ErrorPage";
import LandingPage from "@/components/common/LandingPage";
import SignInPage from "@/features/auth/components/SignInPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GuestRoutes from "./GuestRoutes";
import ProtectedRoutes from "./ProtectedRoutes";
import SideBar from "@/components/layout/SideBar";
import Repositories from "@/features/repositories/components/Repositories";
import PullRequests from "@/features/pull-requests/components/PullRequests";
import GithubApps from "@/features/github-apps/components/GithubApps";
import Review from "@/features/reviews/components/Review";
import Workflow from "@/components/common/Workflow";

const AppRouter = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/show-workflow" element={<Workflow />} />

          <Route element={<GuestRoutes />}>
            <Route path="/sign-in" element={<SignInPage />} />
          </Route>

          <Route element={<ProtectedRoutes />}>
            <Route element={<SideBar />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/repositories" element={<Repositories />} />
              <Route path="/pull-requests" element={<PullRequests />} />
              <Route path="/github-apps" element={<GithubApps />} />
              <Route path="/reviews" element={<Review />} />
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
