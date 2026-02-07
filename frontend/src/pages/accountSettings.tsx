import '../styles/account-settings.css';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext.tsx';
import { authAPI } from '../services/api.tsx';

function AccountSettings() {
    const { user, logout, loading, setLoading } = React.useContext(AuthContext);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = React.useState<'profile' | 'password'>('profile');
    const [successMessage, setSuccessMessage] = React.useState<string | ''>('');
    const [errorMessage, setErrorMessage] = React.useState<string | ''>('');

    const [formData, setFormData] = React.useState({
        fullName: user?.fullName,
        email: user?.email
    });

    const [passwordData, setPasswordData] = React.useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    }

    const handlePasswordChange = (e: any) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleUpdateProfile = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            await authAPI.updateProfile(formData);

            setSuccessMessage('Profile updated successfully');

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch(err: any) {
            setErrorMessage(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    }

    const handleUpdatePassword = async (e: any) => {
        e.preventDefault();
        setLoading(false);
        setErrorMessage('');
        setSuccessMessage('');

        if(passwordData.newPassword !== passwordData.confirmPassword) {
            setErrorMessage('New passwords do no match');
            setLoading(false);
            return;
        }

        if(passwordData.newPassword.length < 8) {
            setErrorMessage('Password must be atleast 8 characters');
            setLoading(false);
            return;
        }

        try {
            await authAPI.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setSuccessMessage('Password updated succesfully! Please log in again');
            
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || 'Failed to update Password');
        } finally {
            setLoading(false);
        }
    }

    const handleGoBack = () => {
        navigate('/dashboard');
    }

    return (
        <div className='account-settings-container'>
            <div className='settings-card'>
                <div className='settings-header'>
                    <button className='back-button' onClick={handleGoBack}>
                        ← Back to Dashboard
                    </button>
                    <h1>Account Settings</h1>
                    <div className='user-badge'>
                        <span className='badge-label'>{user?.fullName}</span>
                        <span className='badge-role'>{user?.role}</span>
                    </div>
                </div>

                {successMessage && <div className='alert alert-success'>{successMessage}</div>}
                {errorMessage && <div className='alert alert-error'>{errorMessage}</div>}

                <div className='settings-tabs'>
                        <button className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => {
                            setActiveTab('profile'); 
                            setErrorMessage(''); 
                            setSuccessMessage('');
                        }}>
                            Profile Information
                        </button>
                        <button className={`tab-button ${activeTab === 'password' ? 'active' : ''}`} onClick={() => {
                            setActiveTab('password');
                            setErrorMessage('');
                            setSuccessMessage('');
                        }}>
                            Change Password
                        </button>
                    </div>

                    <div className='settings-content'>
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleUpdateProfile} className='settings-form'>
                            <h2>Profile Information</h2>
                    
                            <div className='form-group'>
                                <label htmlFor='fullName'>Full Name</label>
                                <input type='text' id='fullName' name='fullName' value={formData.fullName} onChange={handleInputChange} placeholder='Enter your full name' required/>
                            </div>

                            <div className='form-group'>
                                <label htmlFor='email'>Email Address</label>
                                <input type='email' id='email' name='email' value={formData.email} disabled placeholder='Your email (cannot be changed)' />
                                <small>Email cannot be changed for security reasons</small>
                            </div>

                            <div className='form-group'>
                                <label>User Role</label>
                                <div className='role-display'>
                                    <span className='role-badge' style={{ backgroundColor: user?.role === 'admin' ? '#e74c3c' : user?.role === 'project-lead' ? '#f39c12' : '#3498db' }}>
                                        {user?.role.split('-').map((w : any) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    </span>
                                </div>
                            </div>

                            <div className='form-group'>
                                <label>Account Status</label>
                                <div className='status-display'>
                                    <span className='status-badge active'>Active</span>
                                </div>
                            </div>

                            <button type='submit' className='btn btn-primary' disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    )}

                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <form onSubmit={handleUpdatePassword} className='settings-form'>
                            <h2>Change Password</h2>
                        
                            <div className='password-warning'>
                                <p>⚠️ Choose a strong password with at least 8 characters.</p>
                            </div>

                            <div className='form-group'>
                                <label htmlFor='currentPassword'>Current Password</label>
                                <input type='password' id='currentPassword' name='currentPassword' value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder='Enter your current password' required />
                            </div>

                            <div className='form-group'>
                                <label htmlFor='newPassword'>New Password</label>
                                <input type='password' id='newPassword' name='newPassword' value={passwordData.newPassword} onChange={handlePasswordChange} placeholder='Enter your new password' required />
                                <small>Minimum 8 characters</small>
                            </div>

                            <div className='form-group'>
                                <label htmlFor='confirmPassword'>Confirm New Password</label>
                                <input type='password' id='confirmPassword' name='confirmPassword' value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder='Confirm your new password' required />
                            </div>

                            <button type='submit' className='btn btn-primary' disabled={loading}>
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AccountSettings;