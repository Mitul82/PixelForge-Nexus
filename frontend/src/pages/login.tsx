import '../styles/auth.css';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';

const Login = () => {
  const { login, loading, setLoading, error, setError } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  }

  return (
    <div className='login-container'>
      <div className='login-card'>
        <h1>PixelForge Nexus</h1>
        <h2>Secure Project Management</h2>
        {error && <div className='error-message'>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <input type='email' id='email' name='email' value={formData.email} onChange={handleChange} required placeholder='Enter your email' disabled={loading}/>
          </div>
          <div className='form-group'>
            <label htmlFor='password'>Password</label>
            <input type='password' id='password' name='password' value={formData.password} onChange={handleChange} required placeholder='Enter your password' disabled={loading}/>
          </div>
          <button type='submit' className='btn btn-primary' disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className='login-info'>
            <h3>Demo Credentials:</h3>
            <p><strong>Admin:</strong> admin@pixelforge.com / password123</p>
            <p><strong>Project Lead:</strong> lead@pixelforge.com / password123</p>
            <p><strong>Developer:</strong> dev@pixelforge.com / password123</p>
        </div>
      </div>
    </div>
  );
}

export default Login;