import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import * as analysisController from '../controllers/analysisController';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = `${uuidv4()}-${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// API routes
router.post('/url', analysisController.analyzeUrl);
router.post('/text', analysisController.analyzeText);
router.post('/image', upload.single('image'), analysisController.analyzeImage);
router.post('/video', upload.single('video'), analysisController.analyzeVideo);

export default router;