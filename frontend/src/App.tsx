import './styles/app.css';

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthContext } from './context/authContext.tsx';
import ProtectedRoute from './middleware/protectedRoute.tsx';
import PublicRoute from './middleware/publicRoute.tsx';

import Login from './pages/login.tsx';
import DashBoard from './pages/dashboard.tsx';
import ProjectDetails from './pages/projectDetails.tsx';
import AccountSettings from './pages/accountSettings.tsx';
import CreateProject from './pages/createProject.tsx';
import TeamManagement from './pages/teamManagement.tsx';
import UserManagement from './pages/userManagement.tsx';

function App() {
    const { isAuthenticated } = React.useContext(AuthContext);
    return (
        <Routes>
            <Route path='/' element={ isAuthenticated ? <Navigate to='/dashboard' replace /> : <Navigate to='/login' replace /> }/>
            <Route path='/login' element={ <PublicRoute><Login/></PublicRoute> }/>
            <Route path='/dashboard' element={ <ProtectedRoute><DashBoard/></ProtectedRoute> }/>
            <Route path='/project/:id' element={ <ProtectedRoute><ProjectDetails/></ProtectedRoute> }/>
            <Route path='/create-project' element={  <ProtectedRoute><CreateProject/></ProtectedRoute> }/>
            <Route path='/users' element={ <ProtectedRoute><UserManagement/></ProtectedRoute> }/>
            <Route path='/account-settings' element={<ProtectedRoute><AccountSettings/></ProtectedRoute>}/>
            <Route path='/team-management' element={ <ProtectedRoute><TeamManagement/></ProtectedRoute> }/>
        </Routes>
    );
}

export default App;