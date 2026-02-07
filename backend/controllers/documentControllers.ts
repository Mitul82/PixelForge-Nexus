import fs from 'fs';
import path from 'path';

import Document from '../models/documentModel.js';
import Project from '../models/projectModel.js';

import type { Request, Response } from 'express';

const uploadDocument = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const { description } = req.body;

        if(!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const project = await Project.findById(projectId);

        if(!project) {
            return res.status(404).json({ success: false, mseeage: 'Project not found' });
        }

        const isProjectLead = project.projectLead.toString() === req.user.id;
        const isAdmin = req.user.role === 'Admin';

        if(!isProjectLead && !isAdmin) {
            fs.unlinkSync(req.file.path);

            return res.status(403).json({ success: false, message: 'Not authorized to upload documents for this project' });
        }

        const document = await Document.create({
            projectId,
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            filePath: req.file.path,
            fileSize: req.file.size,
            uploadedBy: req.user.id,
            description: description || ''
        });

        await document.populate('uploadedBy', 'fullName email');

        res.status(201).json({ success: true, message: 'Document uploaded succesfully', data: document });
    } catch (err: any) {
        console.error(err);

        if(req.file) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

const getProjectDocuments = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if(!project) {
            return res.status(404).json({ success: false, message: 'Projectnot found' });
        }

        const isAssigned = project.teamMembers.some(tm => tm.userId.toString() === req.user.id);
        const isProjectLead = project.projectLead.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if(!isProjectLead && !isAssigned && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to view documents for this project' });
        }

        const documents = await Document.find({ projectId }).sort({ createdAt: -1 }).populate('uploadedBy', 'fullname email');

        res.status(200).json({ success: true, count: documents.length, data: documents });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

const downloadDocument = async (req: Request, res: Response) => {
    try {
        const document = await Document.findById(req.params.documentId);

        if(!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        const project = await Project.findById(document.projectId);

        const isAssigned = project?.teamMembers.some(tm => tm.userId.toString() === req.user.id);
        const isProjectLead = project?.projectLead.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if(!isAssigned && !isAdmin && !isProjectLead) {
            return res.status(403).json({ success: false, message: 'Not authorized to dounload this document' });
        }

        if(!fs.existsSync(document.filePath as string)) {
            return res.status(404).json({ success: false, message: 'File not found on server' });
        }

        res.download(document.filePath as string, document.fileName as string);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

const deleteDocument = async (req: Request, res: Response) => {
    try {
        const document = await Document.findById(req.params.documentId);

        if(!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        const isUploader = document.uploadedBy.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if(!isUploader && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized too delete this document' });
        }

        if(fs.existsSync(document.filePath as string)) {
            fs.unlinkSync(document.filePath as string);
        }

        await Document.findByIdAndDelete(req.params.documentId);

        res.status(200).json({ success: true, message: 'Document deleted sucessfully' });
    } catch(err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

const getDocumentInfo = async (req: Request, res: Response) => {
    try {
        const document = await Document.findById(req.params.documentId).populate('uploadedBy', 'fullName email');
        
        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        const project = await Project.findById(document.projectId);
        
        const isAssigned = project?.teamMembers.some(tm => tm.userId.toString() === req.user.id);
        const isProjectLead = project?.projectLead.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isAssigned && !isProjectLead && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to view document info' });
        }

        res.status(200).json({ success: true, data: document });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

export { uploadDocument, getProjectDocuments, downloadDocument, deleteDocument, getDocumentInfo }