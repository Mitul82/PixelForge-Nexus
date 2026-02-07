import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

import type { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        
        req.user = await User.findById(decoded.id);
        
        if(!req.user || !req.user.isActive) {
            return res.status(401).json({ sucess: false, message: 'User not found or account is inactive' });
        }


        next();
    } catch (err: any) {
        console.error(err);
        res.status(401).json({ success: false, message: 'Not authorized to access this router', error: err.message });
    }
}

const authorize = async (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: `User role '${req.user.role}' is not authorized to access this route` });
        }
        next();
    }
}

export { protect, authorize }