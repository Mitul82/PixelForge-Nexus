import { crossOriginResourcePolicy } from 'helmet';
import Project from '../models/projectModel.js';
import User from '../models/userModel.js';

import type { Request, Response } from 'express';

const createProject = async (req: Request, res: Response) => {
    try {
        const { name, description, deadline, projectLeadId } = req.body;

        if(!name || !description || !deadline) {
            return res.status(400).json({ success: false, message: 'Please provide name, description, and deadline' });
        }

        const projectLead = await User.findById(projectLeadId).select('-password');

        if(!projectLead) {
            return res.status(404).json({ success: false, message: 'Project lead not found' });
        }

        const project = await Project.create({
            name,
            description,
            deadline: new Date(deadline),
            createdBy: req.user.id,
            projectLead: projectLeadId,
            teamMembers: [{
                userId: projectLeadId,
                role: 'lead',
                assignedAt: new Date()
            }]
        });

        await project.populate('projectLead', 'fullName email role');
        await project.populate('teamMembers.userId', 'fullName email role');

        res.status(201).json({ success: true, message: 'Project created succesfully', data: project });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

const getAllProjects = async (req: Request, res: Response) => {
    try {
        const projects = await Project.find({ status: 'active' }).populate('projectLead', 'fullName email').populate('teamMembers.userId', 'fullName email role');

        res.status(200).json({ success: true, count: projects.length, data: projects });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

const getMyProjects = async (req: Request, res: Response) => {
    try {
        const projects = await Project.find({
            $or: [
                { 'teamMembers.userId': req.user.id },
                { projectLead: req.user.id },
                { createdBy: req.user.id }
            ]
        }).populate('projectLead', 'fullName email').populate('teamMembers.userId', 'fullName email role');

        res.status(200).json({ success: true, count: projects.length, data: projects });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

const getProjectById = async (req: Request, res: Response) => {
    try {
        const project = await Project.findById(req.params.id).populate('projectLead', 'fullName email').populate('createdBy', 'fullName email').populate('teamMembers.userId', 'fullName email role');

        if(!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const isAssigned = project.teamMembers.some(tm => {
            if(tm.userId._id.toString() === req.user._id.toString()) {
                return true;
            }
        });
        const isProjectLead = project.projectLead._id.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        console.log(isAssigned);

        if(!isAssigned && !isProjectLead && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this project' });
        }

        res.status(200).json({ success: true, data: project });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

const updateProject = async (req: Request, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);
       
        if(!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const isProjectLead = project.projectLead.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if(!isProjectLead && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this project' });
        }

        const { name, description, deadline, status } = req.body;

        if(name) project.name = name;
        if(description) project.description = description;
        if(deadline) project.deadline = new Date(deadline);
        if(status) project.status =  status;

        await project.save();

        await project.populate('projectLead', 'fullName email');
        await project.populate('teamMembers.userId', 'fullName email role');

        res.status(200).json({ success: true, message: 'Project updates succecfully', data: project });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

const assignTeamMember = async (req: Request, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);

        if(!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const isProjectLead = project.projectLead.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if(!isProjectLead && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to assign team members to this project' });
        }

        const { userId } = req.body;

        const user = await User.findById(userId);

        if(!user)  {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isAlreadyAssigned = project.teamMembers.some(tm =>  tm.userId.toString() === userId);

        if(isAlreadyAssigned) {
            return res.status(400).json({ success: false, message: 'User is already assigned to this project' });
        }

        project.teamMembers.push({
            userId: userId,
            role: 'developer',
            assignedAt: new Date()
        });

        await project.save();
        await project.populate('teamMembers.userId', 'fullName email role');

        res.status(200).json({ success: true, message: 'Team member assigend succesfully', data: project });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

const removeTeamMember = async (req: Request, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);

        if(!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const isProjectLead = project.projectLead.toString() === req.user.role;
        const isAdmin = req.user.role === 'admin';

        if(!isProjectLead && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to remove team members' });
        }

        project.teamMembers = project.teamMembers.filter(
            tm => tm.userId.toString() !== req.params.userId
        );

        await project.save();
        await project.populate('teamMembers.userId', 'fullName, email, role');

        res.status(200).json({ success: true, message: 'Team member removed succesfully', data: project });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
}

export { createProject, getAllProjects, getMyProjects, getProjectById, updateProject, assignTeamMember, removeTeamMember }