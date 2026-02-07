import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import type { Request } from 'express';
import type { FileFilterCallback } from 'multer';

const router = express.Router();

import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadDocument, getProjectDocuments, downloadDocument, deleteDocument, getDocumentInfo } from '../controllers/documentControllers.js';

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads';

        // create uploads directory if it dosent exist
        if(!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const random = Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);

        cb(null, `${name}-${timestamp}-${random}${ext}`);
    }
});

const fileFilter = (req: Request, file: any, cb: FileFilterCallback) => {
    // allowed file types
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
    ];

    if(allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, Word, Excel, text and image files are allowed' ));
    }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// Upload document - Admin and Project Lead only
router.post('/:projectId', protect, await authorize('admin', 'project-lead'), upload.single('file'), uploadDocument);

// Get project documents - Only for assigned users
router.get('/:projectId', protect, getProjectDocuments);

// Download document - Only for assigned users
router.get('/download/:documentId', protect, downloadDocument);

// Get document info - Only for assigned users
router.get('/info/:documentId', protect, getDocumentInfo);

// Delete document - Uploader or Admin only
router.delete('/:documentId', protect, deleteDocument);

export default router;