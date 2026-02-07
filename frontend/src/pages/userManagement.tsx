import '../styles/user-management.css';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { userAPI, authAPI } from '../services/api';

interface User {
    _id: string;
    fullName: string;
    email: string;
    role: 'admin' | 'project-lead' | 'developer';
    isActive: boolean;
}

function UserManagement() {
    const navigate = useNavigate();
    const [users, setUsers] = React.useState<User[]>([]);
    const [success, setSuccess] = React.useState('');
    const [showCreateForm, setShowCreateForm] = React.useState(false);
    const [editingUser, setEditingUser] = React.useState<string | null>(null);

    const { loading, setLoading, error, setError } =  React.useContext(AuthContext);

    const [formData, setFormData] = React.useState({
        fullName: '',
        email: '',
        password: '',
        role: 'developer',
    });

    React.useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            
            const response = await userAPI.getAllUsers();
            
            setUsers(response.data.data);
            
            setError('');
        } catch (err) {
            setError('Failed to load users');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    }

    const handleCreateUser = async (e: any) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
            setError('All fields are required');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        try {
            await authAPI.register({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            });

            setSuccess(`User ${formData.fullName} created successfully!`);
            setFormData({ fullName: '', email: '', password: '', role: 'developer' });
            setShowCreateForm(false);
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create user');
        }
    }

    const handleUpdateUser = async (userId: string, updates: any) => {
        try {
            await userAPI.updateUser(userId, updates);
      
            setSuccess('User updated successfully!');
        
            setEditingUser(null);
            
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update user');
        }
    }

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!window.confirm(`Are you sure you want to deactivate ${userName}?`)) {
            return;
        }

        try {
            await userAPI.deleteUser(userId);
            
            setSuccess(`User ${userName} deactivated successfully!`);
            
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete user');
        }
    }

    const handleGoBack = () => {
        navigate('/dashboard');
    }

    const getRoleColor = (role: 'admin' | 'project-lead' | 'developer') => {
        switch (role) {
            case 'admin':
                return '#e74c3c';
            case 'project-lead':
                return '#f39c12';
            case 'developer':
                return '#3498db';
            default:
                return '#95a5a6';
        }
    }

    const getRoleLabel = (role: 'admin' | 'project-lead' | 'developer') => {
        return role.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <div className='user-management-container'>
            <div className='management-card'>
                <div className='management-header'>
                    <button className='back-button' onClick={handleGoBack}>
                        ← Back to Dashboard
                    </button>
                    <h1>User Management</h1>
                    <button className='btn btn-primary' onClick={() => setShowCreateForm(!showCreateForm)}>
                        {showCreateForm ? '✕ Cancel' : '+ Create User'}
                    </button>
                </div>

                {error && <div className='alert alert-error'>{error}</div>}
                {success && <div className='alert alert-success'>{success}</div>}

                {/* Create User Form */}
                {showCreateForm && (
                    <div className='create-user-form'>
                        <h2>Create New User</h2>
                        <form onSubmit={handleCreateUser}>
                            <div className='form-row'>
                                <div className='form-group'>
                                    <label htmlFor='fullName'>Full Name</label>
                                    <input type='text' id='fullName' name='fullName' value={formData.fullName} onChange={handleInputChange} placeholder='Enter full name' required/>
                                </div>

                                <div className='form-group'>
                                    <label htmlFor='email'>Email</label>
                                    <input type='email' id='email' name='email' value={formData.email} onChange={handleInputChange} placeholder='Enter email' required/>
                                </div>
                            </div>

                            <div className='form-row'>
                                <div className='form-group'>
                                    <label htmlFor='password'>Password</label>
                                    <input type='password' id='password' name='password' value={formData.password} onChange={handleInputChange} placeholder='Enter password (min 8 chars)' required/>
                                </div>

                                <div className='form-group'>
                                    <label htmlFor='role'>Role</label>
                                    <select id='role' name='role' value={formData.role} onChange={handleInputChange}>
                                        <option value='developer'>Developer</option>
                                        <option value='project-lead'>Project Lead</option>
                                        <option value='admin'>Admin</option>
                                    </select>
                                </div>
                            </div>

                            <button type='submit' className='btn btn-success'>
                                Create User
                            </button>
                        </form>
                    </div>
                )}

                {/* Users Table */}
                <div className='users-section'>
                    <h2>All Users</h2>

                    {loading ? (
                        <div className='loading'>Loading users...</div>
                    ) : users.length === 0 ? (
                        <div className='no-data'>No users found</div>
                    ) : (
                        <div className='users-table-wrapper'>
                            <table className='users-table'>
                                <thead>
                                  <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id} className={!user.isActive ? 'inactive' : ''}>
                                            <td className='user-name'>{user.fullName}</td>
                                            <td className='user-email'>{user.email}</td>
                                            <td>
                                                <span className='role-badge' style={{ backgroundColor: getRoleColor(user.role) }}>
                                                    {getRoleLabel(user.role)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className='actions'>
                                                {user.isActive && (
                                                    <>
                                                        <button className='action-btn edit' onClick={() => setEditingUser(user._id)} title='Edit user'>📝</button>
                                                        <button className='action-btn delete' onClick={() => handleDeleteUser(user._id, user.fullName)} title='Deactivate user'>🗑️</button>
                                                    </>
                                                )}
                                                
                                                {!user.isActive && (
                                                    <span className='text-muted'>Deactivated</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserManagement;