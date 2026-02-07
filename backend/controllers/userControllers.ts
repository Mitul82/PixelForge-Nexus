import User from '../models/userModel.js';

import type { Request, Response } from 'express';

const getAllUsers = async ( req: Request, res: Response) => {
    try {
        const users = await User.find({ isActive: true }).select('-password');

        res.status(200).json({ success: true, data: users, count: users.length });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

const getUserById = async ( req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);

        if(!user) {
            return res.status(404).json({ sucess: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

const updateUser = async ( req: Request, res: Response) => {
    try {
        const { fullName, role, isActive } = req.body;

        const user = await User.findById(req.params.id).select('-password');

        if(!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if(fullName) user.fullName = fullName;
        if(role) user.role = role;
        if(typeof isActive === 'boolean') user.isActive = isActive;

        await user.save();

        res.status(200).json({ success: true, message: 'User updated successfully', data: user });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

const deactivateUser = async ( req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);

        if(!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isActive = false;

        await user.save();

        res.status(200).json({ success: true, message: 'User deactivated successfully' });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

export { getAllUsers, getUserById, updateUser, deactivateUser }