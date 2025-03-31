import { Navigate } from "react-router-dom";
import { useAuth } from "../../App";

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ element }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return element;
};

export default ProtectedRoute;
