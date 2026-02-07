import User from '../models/userModel.js';

import type { Request, Response } from 'express';

const register = async (req: Request, res: Response) => {
    try {
        const { fullName, email, password, role } = req.body;

        if(!fullName || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide fullname, email, password' });
        }

        const user = await User.findOne({ email });

        if(user) {
            return res.status(400).json({ success: false, message: 'user with this email already exists' });
        }

        if(password.length < 8) {
            return res.status(400).json({ success: false, message: 'The password must be at least 8 characters long' });
        }

        const newUser = await User.create({ fullName, email, password, role: role || 'developer' });

        const token = await newUser.createJWT();

        res.status(201).json({ success: true, message: 'User registered succesfully', token, user: { id: newUser._id, fullName: newUser.fullName, email: newUser.email, role: newUser.role }});
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

const login = async (req: Request, res: Response) => {
    try {
        const { email, password }: { email: string, password: string} = req.body;

        if(!email || !password) {
            res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if(!user) {
           return res.status(400).json({ success: false, message: 'No user with this email exists' });
        }

        if(!user.isActive) {
            return res.status(401).json({ success: false, message: 'User account is inactive' });
        }

        const isPasswordCorrect = await user.comparePassword(password);

        if(!isPasswordCorrect) {
            return res.status(400).json({ success: false, message: 'Invalid credentials could not login' });
        }

        const token = await user.createJWT();

        res.status(200).json({ success: true, message: 'Login succesfull', token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, mfaEnabled: user.mfaEnabled }});
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

const getUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({ success: true, data: { id: user?._id, fullName: user?.fullName, email: user?.email, role: user?.role, mfaEnabled: user?.mfaEnabled }});
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

const updateProfile = async (req: Request, res: Response) => {
    try {
        const { fullName } = req.body;

        if(!fullName) {
            return res.status(400).json({ success: false, message: 'Please provide your full name' });
        }

        const user = await User.findByIdAndUpdate(req.user.id, { fullName }, { new: true, runValidators: true });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

const updatePassword = async (req: Request, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if(!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide the current and new password' });
        }

        if(newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'The new password must be at least 8 characters long' });
        }

        const user = await User.findById(req.user.id).select('+password');

        const isPasswordCorrect = await user?.comparePassword(currentPassword);

        if(!isPasswordCorrect) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        user!.password = newPassword;

        await user?.save();

        res.status(200).json({ success: true, message: 'Updated password succesfully' });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

export { login, register, getUser, updateProfile, updatePassword }