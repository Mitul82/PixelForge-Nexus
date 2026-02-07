import 'dotenv/config';

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import User from './models/userModel.js';
import Project from './models/projectModel.js';
import Document from './models/documentModel.js';

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data to ensure a clean demo environment
    await User.deleteMany({});
    await Project.deleteMany({});
    await Document.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.insertMany([
      { fullName: 'Admin User', email: 'admin@pixelforge.com', password: hashedPassword, role: 'admin' },
      { fullName: 'Project Lead User', email: 'lead@pixelforge.com', password: hashedPassword, role: 'project-lead' },
      { fullName: 'Developer User', email: 'dev@pixelforge.com', password: hashedPassword, role: 'developer' }
    ]);

    const adminId = users[0]._id;
    const leadId = users[1]._id;
    const devId = users[2]._id;

    const sampleProject = await Project.create({
      name: 'Nexus Alpha Build',
      description: 'The primary development phase for the PixelForge Nexus prototype.',
      deadline: new Date('2025-12-31'),
      status: 'active',
      createdBy: adminId,
      projectLead: leadId,
      teamMembers: [
        { userId: leadId, role: 'lead' },
        { userId: devId, role: 'developer' }
      ]
    });

    if(!sampleProject) {
      console.error('peoject not created');
      return;
    }

    await Document.create({
      projectId: sampleProject._id,
      fileName: 'Nexus_Design_Spec.pdf',
      fileType: 'application/pdf',
      fileSize: 1024576, // ~1MB
      filePath: './uploads/Nexus_Design_Spec.pdf',
      uploadedBy: adminId,
      description: 'Initial system architecture and security design document.',
      version: 1
    });

    console.log("Database Seeded Successfully!");
    console.log("----------------------------");
    console.log("Admin: admin@pixelforge.com / password123");
    console.log("Lead:  lead@pixelforge.com / password123");
    console.log("Dev:   dev@pixelforge.com / password123");
    
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedDatabase();