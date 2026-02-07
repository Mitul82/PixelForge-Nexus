import React from 'react';
import { Navigate } from 'react-router-dom';

import { AuthContext } from '../context/authContext.tsx';

const PublicRoute = ({ children }: { children: any }) => {
  const { isAuthenticated, loading } = React.useContext(AuthContext);

  if (loading) {
    return <div className='loading-container'>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />;
  }

  return children;
};

export default PublicRoute;