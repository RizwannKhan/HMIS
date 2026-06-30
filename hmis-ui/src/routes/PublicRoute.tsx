import { jwtDecode } from "jwt-decode";
import { JSX } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

interface PublicRouteProps {
  children: JSX.Element;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const token = useSelector((state: any) => state.jwt);
  if (token) { 
    const decodedUser: any = jwtDecode(token);        
    return <Navigate to={`/${decodedUser?.role?.toLowerCase()}/dashboard`} />;
  }
  return children;
};

export default PublicRoute;
