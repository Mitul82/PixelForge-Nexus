import mongoose from 'mongoose';

interface IDocument extends mongoose.Document {
    projectId: mongoose.Types.ObjectId,
    fileName: String,
    fileType: String,
    fileSize: Number,
    filePath: String,
    uploadedBy: mongoose.Types.ObjectId,
    description: String,
    version: Number,
    uploadedAt: Date
}

const documentSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    filePath: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, default: '' },
    version: {  type: Number, default: 1 },
    uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

documentSchema.index({ projectId: 1, uploadedAt: -1 });

const Document = mongoose.model<IDocument>('Document', documentSchema);

export default Document;