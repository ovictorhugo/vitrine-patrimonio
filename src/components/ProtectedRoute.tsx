import React from 'react';
import { Navigate, } from 'react-router-dom';

interface ProtectedRouteProps {
  element: React.ReactElement;
  hasPermission: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, hasPermission }) => {


 

  return (hasPermission) ? element : <Navigate to="/unauthorized" />;
};

export default ProtectedRoute;
