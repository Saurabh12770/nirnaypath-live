import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const __dirname = path.resolve();
const SYLLABUS_DIR = path.join(__dirname, 'data', 'syllabus');

// Helper metadata to format the main page selector
const EXAM_METADATA = {
  'upsc': { name: 'UPSC Civil Services', icon: '🏛️', color: 'indigo', description: 'Union Public Service Commission - IAS/IPS/IFS' },
  'bpsc': { name: 'BPSC Civil Services', icon: '🏢', color: 'purple', description: 'Bihar Public Service Commission' },
  'ssc-cgl': { name: 'SSC CGL', icon: '📋', color: 'orange', description: 'Staff Selection Commission - Combined Graduate Level' },
  'ssc-chsl': { name: 'SSC CHSL', icon: '📝', color: 'teal', description: 'Staff Selection Commission - Combined Higher Secondary Level' },
  'railway': { name: 'Railway RRB', icon: '🚂', color: 'green', description: 'Railway Recruitment Board - NTPC / Group D' },
  'banking': { name: 'Banking Exams', icon: '🏦', color: 'blue', description: 'IBPS/SBI PO & Clerk Exams' },
  'state-pcs': { name: 'State PCS', icon: '🗺️', color: 'pink', description: 'State Public Service Commissions' }
};

// @desc    Get list of all supported exams
// @route   GET /api/syllabus
// @access  Public
router.get('/', (req, res, next) => {
  try {
    const files = fs.readdirSync(SYLLABUS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
    const exams = files.map(file => {
      const id = file.replace('.json', '');
      const meta = EXAM_METADATA[id] || { name: id.toUpperCase(), icon: '📚', color: 'blue', description: '' };
      return {
        id: id.toUpperCase(),
        ...meta
      };
    });
    res.status(200).json({ success: true, exams });
  } catch (error) {
    next(error);
  }
});

// @desc    Get detailed syllabus for a specific exam
// @route   GET /api/syllabus/:exam
// @access  Public
router.get('/:exam', (req, res, next) => {
  const examId = req.params.exam.toLowerCase();
  const filePath = path.join(SYLLABUS_DIR, `${examId}.json`);

  try {
    if (!fs.existsSync(filePath)) {
      res.status(404);
      throw new Error(`Syllabus not found for exam: ${req.params.exam}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Attach styling metadata
    const meta = EXAM_METADATA[examId] || { name: examId.toUpperCase(), icon: '📚', color: 'blue', description: '' };

    res.status(200).json({
      success: true,
      syllabus: {
        id: examId.toUpperCase(),
        ...meta,
        subjects: data.subjects
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
