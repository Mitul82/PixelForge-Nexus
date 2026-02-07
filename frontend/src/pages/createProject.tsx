import '../styles/create-project.css';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { projectAPI } from '../services/api';

function CreateProject() {
  const { user, loading, setLoading } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = React.useState<string | ''>('');
  const [successMessage, setSuccessMessage] = React.useState<string | ''>('');

  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    deadline: '',
    status: 'active',
  })

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Project name is required');
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setErrorMessage('Project description is required');
      setLoading(false);
      return;
    }

    if (!formData.deadline) {
      setErrorMessage('Project deadline is required');
      setLoading(false);
      return;
    }

    const selectedDate = new Date(formData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setErrorMessage('Deadline must be in the future');
      setLoading(false);
      return;
    }

    try {
      const response = await projectAPI.createProject({
        name: formData.name,
        description: formData.description,
        deadline: formData.deadline,
        status: formData.status,
        projectLeadId: user.id
      });

      setSuccessMessage('Project created successfully!');
      setTimeout(() => {
        navigate(`/project/${response.data.data._id}`);
      }, 1500);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  }

  const handleCancel = () => {
    navigate('/dashboard');
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className='create-project-container'>
      <div className='create-project-card'>
        <div className='create-header'>
          <h1>Create New Project</h1>
          <p className='subtitle'>Start a new game development project</p>
        </div>

        {successMessage && <div className='alert alert-success'>{successMessage}</div>}
        {errorMessage && <div className='alert alert-error'>{errorMessage}</div>}

        <form onSubmit={handleSubmit} className='create-form'>
          <div className='form-group'>
            <label htmlFor='name'>Project Name *</label>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              placeholder='e.g., Fantasy Quest RPG, Space Survival Game'
              maxLength={100}
              required
            />
            <small>{formData.name.length}/100 characters</small>
          </div>

          <div className='form-group'>
            <label htmlFor='description'>Description *</label>
            <textarea
              id='description'
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              placeholder='Describe your game project, features, and goals...'
              rows={5}
              maxLength={500}
              required
            />
            <small>{formData.description.length}/500 characters</small>
          </div>

          <div className='form-row'>
            <div className='form-group'>
              <label htmlFor='deadline'>Deadline *</label>
              <input
                type='date'
                id='deadline'
                name='deadline'
                value={formData.deadline}
                onChange={handleInputChange}
                min={today}
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor='status'>Status</label>
              <select
                id='status'
                name='status'
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value='active'>Active</option>
                <option value='on-hold'>On Hold</option>
                <option value='completed'>Completed</option>
              </select>
            </div>
          </div>

          <div className='form-info'>
            <p>📝 <strong>Note:</strong> You will be assigned as the project lead. You can add team members after project creation.</p>
          </div>

          <div className='form-actions'>
            <button
              type='submit'
              className='btn btn-primary'
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
            <button
              type='button'
              className='btn btn-secondary'
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProject;