import { useSession } from "@/hooks/useSession";
import { Navigate, Outlet } from "react-router-dom";
import LoadingScreen from "@/components/common/LoadingScreen";

const ProtectedRoutes = () => {
  const { data: session, isPending } = useSession();
  console.log(session);
  console.log(isPending);

  if (isPending) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
