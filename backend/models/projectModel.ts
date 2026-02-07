import mongoose from 'mongoose';

interface IProject extends mongoose.Document {
    name: String,
    description: String,
    deadline: Date,
    status: 'active' | 'completed' | 'on-hold',
    createdBy: mongoose.Types.ObjectId,
    projectLead: { _id: mongoose.Types.ObjectId, role: 'lead' | 'developer' },
    teamMembers: { userId: { _id: mongoose.Types.ObjectId }, role: 'lead' | 'developer', assignedAt: Date }[],
    createdAt: Date,
    updatedAt: Date
}

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ['active', 'completed', 'on-hold'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    projectLead: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teamMembers: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, role: { type: String, enum:['lead', 'developer'], default: 'developer' }, assignedAt: { type: Date, default: Date.now } }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

projectSchema.index({ createdBy: 1, status: 1 });
projectSchema.index({ 'teamMembers.userId': 1 });

const Project = mongoose.model<IProject>('Project', projectSchema);

export default Project;