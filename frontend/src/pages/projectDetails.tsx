import '../styles/project-details.css';

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { projectAPI, documentAPI } from '../services/api';

interface ProjectLead {
  _id: string;
  fullName: string;
  email: string;
}

interface TeamMember {
  userId: {
    _id: string;
    fullName: string;
  };
  role: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  deadline: string;
  status: string;
  projectLead: ProjectLead;
  teamMembers: TeamMember[];
}

interface Document {
  _id: string;
  fileName: string;
  description: string;
  uploadedBy: {
    _id: string;
    fullName: string;
  };
  uploadedAt: string;
  fileSize: number;
}

function ProjectDetails() {
    const { id: projectId } = useParams();
    const navigate = useNavigate();
    const { user, loading,setLoading, error, setError } = React.useContext(AuthContext);
    const [project, setProject] = React.useState<Project | null>(null);
    const [documents, setDocuments] = React.useState<Document[]>([]);
    const [uploadError, setUploadError] = React.useState('');
    const [file, setFile] = React.useState(null);
    const [description, setDescription] = React.useState('');

    React.useEffect(() => {
        fetchProjectDetails();
        fetchDocuments();
    }, [projectId]);

    const fetchProjectDetails = async () => {
        try {
          const response = await projectAPI.getProjectById(projectId as string);
          setProject(response.data.data);
        } catch (err) {
          setError('Failed to load project details');
        }
    }

    const fetchDocuments = async () => {
        try {
          const response = await documentAPI.getProjectDocuments(projectId as string);
          setDocuments(response.data.data);
          setLoading(false);
        } catch (err) {
          setError('Failed to load documents');
          setLoading(false);
        }
    }

    const handleFileChange = (e: any) => {
        setFile(e.target.files[0]);
    }

    const handleUpload = async (e: any) => {
        e.preventDefault();

        if (!file) {
          setUploadError('Please select a file');
          return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('description', description);

            await documentAPI.uploadDocument(projectId as string, formData);
            
            setFile(null);
            setDescription('');
            setUploadError('');
            
            // Refresh documents
            fetchDocuments();
        } catch (err: any) {
            setUploadError(err.response?.data?.message || 'Upload failed');
        }
    }

    const handleDownload = async (documentId: string, fileName: string) => {
        try {
            const response = await documentAPI.downloadDocument(documentId as string);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link?.parentElement?.removeChild(link);
        } catch (err) {
            setError('Failed to download document');
        }
    }

    const handleDeleteDocument = async (documentId: string) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                await documentAPI.deleteDocument(documentId as string);
                fetchDocuments();
            } catch (err) {
                setError('Failed to delete document');
            }
        }
    }

    if (loading) return <div className='loading'>Loading...</div>;
    if (error) return <div className='error-message'>{error}</div>;
    if (!project) return <div>Project not found</div>;

    const isProjectLead = user?.id === project.projectLead._id || user?.role === 'admin';

    return (
        <div className='project-details-container'>
            <button onClick={() => navigate('/dashboard')} className='back-button'>
                ← Back to Dashboard
            </button>

            <div className='project-details'>
                <div className='project-header-section'>
                    <h1>{project.name}</h1>
                    <span className={`status ${project.status}`}>{project.status}</span>
                </div>

                <div className='project-info-grid'>
                    <div className='info-card'>
                        <h3>Description</h3>
                        <p>{project.description}</p>
                    </div>

                    <div className='info-card'>
                        <h3>Deadline</h3>
                        <p>{new Date(project.deadline).toLocaleDateString()}</p>
                    </div>

                    <div className='info-card'>
                        <h3>Project Lead</h3>
                        <p>{project.projectLead.fullName}</p>
                        <small>{project.projectLead.email}</small>
                    </div>

                    <div className='info-card'>
                        <h3>Team Members</h3>
                        <div className='team-members'>
                            {project.teamMembers?.map((member) => (
                                <div key={member.userId._id} className='member'>
                                    <strong>{member.userId.fullName}</strong>
                                    <small>{member.role}</small>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => navigate('/team-management')} className='btn btn-primary'>
                            Manage Team
                        </button>
                    </div>
                </div>

                {isProjectLead && (
                    <section className='upload-section'>
                        <h2>Upload Document</h2>
                        {uploadError && <div className='error-message'>{uploadError}</div>}

                        <form onSubmit={handleUpload} className='upload-form'>
                            <input type='file' onChange={handleFileChange} required className='file-input'/>
                            <textarea placeholder='Document description (optional)' value={description} onChange={(e) => setDescription(e.target.value)} className='description-input'/>
                            <button type='submit' className='btn btn-primary'>
                                Upload
                            </button>
                        </form>
                    </section>
                )}

                <section className='documents-section'>
                    <h2>Project Documents</h2>

                    {documents.length === 0 ? (
                        <div className='no-data'>No documents uploaded yet</div>
                    ) : (
                        <div className='documents-list'>
                            {documents.map((doc) => (
                                <div key={doc._id} className='document-item'>
                                    <div className='document-info'>
                                        <h3>{doc.fileName}</h3>
                                        <p className='description'>{doc.description}</p>
                                        <div className='meta'>
                                            <span>Uploaded by: {doc.uploadedBy.fullName}</span>
                                            <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                            <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                    </div>

                                    <div className='document-actions'>
                                        <button onClick={() => handleDownload(doc._id, doc.fileName)} className='btn btn-secondary'>
                                            Download
                                        </button>
                                        {(isProjectLead || doc.uploadedBy._id === user?.id) && (
                                            <button onClick={() => handleDeleteDocument(doc._id)} className='btn btn-danger'>
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default ProjectDetails;