import React from 'react';
import { Navigate } from 'react-router-dom';

import { AuthContext } from '../context/authContext.tsx';

const ProtectedRoute = ({ children }: { children: any }) => {
  const { isAuthenticated } = React.useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  return children;
};

export default ProtectedRoute;