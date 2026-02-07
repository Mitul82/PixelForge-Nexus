import '../styles/dashboard.css';

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { projectAPI } from '../services/api';

type Project = {
    _id: number,
    name: string,
    status: 'active' | 'on-hold' | 'completed',
    description: string,
    projectLead?: any,
    teamMembers?: any[],
    deadline: string
}

function Dashboard() {
  const { user, logout, loading, setLoading, error, setError } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = React.useState<Project[] | undefined>();

  React.useEffect(() => {
    if(user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getMyProjects();
      setProjects(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  const getRoleColor = (role: 'admin'| 'project-lead' | 'developer') => {
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
  }

  return (
    <div className='dashboard-container'>
      {/* Header */}
      <header className='dashboard-header'>
        <div className='header-left'>
          <h1>PixelForge Nexus</h1>
          <span className='subtitle'>Project Management System</span>
        </div>
        <div className='header-right'>
          <div className='user-info'>
            <span className='user-name'>{user?.fullName}</span>
            <span className='user-role' style={{ backgroundColor: getRoleColor(user?.role) }}>
              {getRoleLabel(user?.role)}
            </span>
          </div>
          <Link to='/account-settings' className='btn btn-secondary'>
            Settings
          </Link>
          <button onClick={handleLogout} className='btn btn-danger'>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className='dashboard-main'>
        {/* Admin Panel */}
        {user?.role === 'admin' && (
          <section className='admin-panel'>
            <h2>Administration</h2>
            <div className='admin-actions'>
              <Link to='/users' className='action-card'>
                <h3>Manage Users</h3>
                <p>Create, edit, and manage user accounts</p>
              </Link>
              <Link to='/create-project' className='action-card'>
                <h3>Create Project</h3>
                <p>Create new game development projects</p>
              </Link>
            </div>
          </section>
        )}
        {/* Project Lead Panel */}
        {user?.role === 'project-lead' && (
          <section className='lead-panel'>
            <h2>Project Lead Actions</h2>
            <div className='lead-actions'>
              <Link to='/create-project' className='action-card'>
                <h3>Create Project</h3>
                <p>Create a new project</p>
              </Link>
              <Link to='/team-management' className='action-card'>
                <h3>Manage Team</h3>
                <p>Assign developers to projects</p>
              </Link>
            </div>
          </section>
        )}
        {/* Projects Section */}
        <section className='projects-section'>
          <div className='section-header'>
            <h2 className='dash-head'> {user?.role === 'admin' ? 'All Projects' : 'Your Projects'}</h2>
            {user?.role !== 'developer' && (
              <Link to='/create-project' className='btn btn-primary'>
                + New Project
              </Link>
            )}
          </div>
          {error && <div className='error-message'>{error}</div>}
          {loading ? (
            <div className='loading'>Loading projects...</div>
          ) : projects?.length === 0 ? (
            <div className='no-data'>
              <p>No projects found</p>
            </div>
          ) : (
            <div className='projects-grid'>
              {projects?.map((project) => (
                <Link key={project._id} to={`/project/${project._id}`} className='project-card'>
                  <div className='project-header'>
                    <h3>{project.name}</h3>
                    <span className={`status ${project.status}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className='project-description'>
                    {project.description.substring(0, 100)}...
                  </p>
                  <div className='project-meta'>
                    <span>Lead: {project.projectLead?.fullName}</span>
                    <span>Team: {project.teamMembers?.length || 0} members</span>
                  </div>
                  <div className='project-deadline'>
                    <strong>Deadline:</strong>{' '}
                    {new Date(project.deadline).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;