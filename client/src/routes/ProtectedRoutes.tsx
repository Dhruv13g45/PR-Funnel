import { useSession } from "@/hooks/useSession";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoutes = () => {
  const { data: session, isPending } = useSession();
  console.log(session);
  console.log(isPending);

  if (isPending) {
    return <div>Loadinng....</div>;
  }

  if (!session) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
