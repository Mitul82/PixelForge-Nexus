import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface IUser extends mongoose.Document {
    fullName: string,
    email: string,
    password: string,
    role: 'admin' | 'project-lead' | 'developer',
    mfaEnabled: boolean,
    mfaSecret: string | null,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
    comparePassword(candidatePassword: string): Promise<boolean>,
    createJWT(): Promise<string>
}

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'] },
    password: { type: String, required: true, minLength: 8, select: false },
    role:  { type: String, enum: ['admin', 'project-lead', 'developer'], default: 'developer', required: true },
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: {type: Date, default: Date.now }
}, { timestamps: true });


userSchema.pre('save', async function() {
    if(!this.isModified('password')) {
        return;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        return;
    } catch (err) {
        throw new Error('Error in hashing password');
    }
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
    return await bcrypt.compare(candidatePassword, this.password);
}

userSchema.methods.createJWT = async function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_LIFETIME as any });
}

const User = mongoose.model<IUser>('User', userSchema);

export default User;