import '../styles/team-management.css';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { projectAPI, userAPI } from '../services/api';

interface TeamMember {
    userId: {
        _id: string;
        fullName: string;
        email: string;
    };
    role: 'lead' | 'developer';
}

interface User {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    isActive: boolean;
}

interface Project {
    _id: string;
    name: string;
    description: string;
    status: string;
    teamMembers?: TeamMember[];
}

const TeamManagement = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [allUsers, setAllUsers] = React.useState<User[]>([]);
    const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
    const [success, setSuccess] = React.useState('');

    const { loading, setLoading, error, setError } = React.useContext(AuthContext);

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const projectsResponse = await projectAPI.getMyProjects();
            const usersResponse = await userAPI.getAllUsers();
      
            setProjects(projectsResponse.data.data);
            setAllUsers(usersResponse.data.data.filter((u: any) => u.role === 'developer'));
            setError('');
        } catch (err) {
            setError('Failed to load data');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleAssignDeveloper = async (projectId: string, developerId: string) => {
        try {
            setError('');
            setSuccess('');
            
            await projectAPI.assignTeamMember(projectId as string, {
                userId: developerId,
                role: 'developer',
            });

            setSuccess('Developer assigned successfully!');
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to assign developer');
        }
    }

    const handleRemoveDeveloper = async (projectId: string, developerId: string) => {
        if (!window.confirm('Are you sure you want to remove this developer from the project?')) {
            return;
        }

        try {
            setError('');
            setSuccess('');
      
            await projectAPI.removeTeamMember(projectId, developerId);

            setSuccess('Developer removed successfully!');
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to remove developer');
        }
    }

    const handleGoBack = () => {
        navigate('/dashboard');
    }

    const getAssignedDeveloperIds = () => {
        if (!selectedProject || !selectedProject.teamMembers) return [];
        return selectedProject.teamMembers.filter((m: any) => m.role === 'developer').map((m: any) => m.userId._id);
    }

    const getAvailableDevelopers = () => {
        const assignedIds = getAssignedDeveloperIds();
        return allUsers.filter(u => !assignedIds.includes(u._id) && u.isActive);
    }

    if (loading) {
        return <div className='loading-container'>Loading...</div>;
    }

    return (
        <div className='team-management-container'>
            <div className='team-card'>
                <div className='team-header'>
                    <button className='back-button' onClick={handleGoBack}>
                        ← Back to Dashboard
                    </button>
                    <h1>Team Management</h1>
                </div>

                {error && <div className='alert alert-error'>{error}</div>}
                {success && <div className='alert alert-success'>{success}</div>}

                <div className='team-content'>
                    {/* Project Selection */}
                    <section className='projects-section'>
                        <h2>Select Project</h2>
                        {projects.length === 0 ? (
                            <div className='no-data'>No projects found</div>
                        ) : (
                            <div className='projects-list'>
                                {projects.map(project => (
                                    <div key={project._id} className={`project-item ${selectedProject?._id === project._id ? 'selected' : ''}`} onClick={() => setSelectedProject(project)}>
                                        <div className='project-info'>
                                            <h3>{project.name}</h3>
                                            <p>{project.description.substring(0, 80)}...</p>
                                            <span className={`status ${project.status}`}>
                                                {project.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Team Members Section */}
                    {selectedProject && (
                        <section className='team-members-section'>
                            <h2>Team Members - {selectedProject.name}</h2>

                            {/* Current Members */}
                            <div className='members-subsection'>
                                <h3>Current Team ({selectedProject.teamMembers?.length || 0})</h3>
                                {selectedProject.teamMembers && selectedProject.teamMembers.length > 0 ? (
                                    <div className='members-list'>
                                        {selectedProject.teamMembers.map(member => (
                                            <div key={member.userId._id} className='member-card'>
                                                <div className='member-info'>
                                                    <h4>{member.userId.fullName}</h4>
                                                    <p className='member-email'>{member.userId.email}</p>
                                                    <span className='member-role'>{member.role === 'lead' ? 'Project Lead' : 'Developer'}</span>
                                                </div>
                                                {member.role === 'developer' && (
                                                    <button className='btn btn-danger btn-sm' onClick={() => handleRemoveDeveloper(selectedProject._id, member.userId._id)}>
                                                        Remove
                                                    </button>
                                                )}
                                                {member.role === 'lead' && (
                                                    <span className='badge-lead'>Lead</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className='no-data'>No team members assigned</div>
                                )}
                            </div>

                            {/* Available Developers */}
                            {getAvailableDevelopers().length > 0 && (
                                <div className='members-subsection'>
                                    <h3>Available Developers ({getAvailableDevelopers().length})</h3>
                                    <div className='members-list'>
                                        {getAvailableDevelopers().map(dev => (
                                            <div key={dev._id} className='member-card available'>
                                                <div className='member-info'>
                                                    <h4>{dev.fullName}</h4>
                                                    <p className='member-email'>{dev.email}</p>
                                                    <span className='member-role'>Developer</span>
                                                </div>
                                                <button className='btn btn-success btn-sm' onClick={() => handleAssignDeveloper(selectedProject._id, dev._id)}>
                                                    Assign
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {getAvailableDevelopers().length === 0 && (selectedProject?.teamMembers?.length ?? 0) > 0 && (
                                <div className='no-data'>All available developers are already assigned</div>
                            )}
                        </section>
                    )}

                    {!selectedProject && projects.length > 0 && (
                        <div className='placeholder'>
                            <p>👈 Select a project to manage its team members</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TeamManagement;