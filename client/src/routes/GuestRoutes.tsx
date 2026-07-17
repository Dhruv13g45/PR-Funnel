import { useSession } from "@/hooks/useSession";
import { Navigate, Outlet } from "react-router-dom";

const GuestRoutes = () => {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div>Loading....</div>;
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestRoutes;
