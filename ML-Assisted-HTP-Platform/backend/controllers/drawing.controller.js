const Drawing = require('../models/Drawing.model');
const Case = require('../models/Case.model');
const { createLog } = require('../services/log.service');
const { addJobToQueue } = require('../services/jobQueue.service'); // <-- Import the queue service

// @desc    Submit a new drawing
// @route   POST /api/drawings
// @access  Private (Uploader)
// const uploadedId = req.user.id;

exports.submitDrawing = async (req, res) => {
  const { childId, childAge, childName, childClass, teacherNotes } = req.body;
  const uploaderId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a drawing image' });
  }

  try {
    // 1. Create the Drawing record
    const newDrawing = await Drawing.create({
      uploader: uploaderId,
      childId,
      childAge,
      childName,
      childClass,
      teacherNotes,
      imageURL: req.file.path,
      uploadedBy: req.user.id,
    });

    // 2. Create an initial Case record with "Initial Screening" status
    const newCase = await Case.create({
      drawing: newDrawing._id,
      status: 'Initial Screening', // The initial status
    });

    // 3. Add the analysis task to the background job queue.
    // THIS IS THE ASYNCHRONOUS HANDOFF.
    addJobToQueue(newCase._id, newDrawing._id, newDrawing.imageURL, newDrawing.childId);

    // 4. Immediately send a success response to the user.
    // The user does NOT have to wait for the ML analysis.
    createLog(`Uploader '${req.user.username}' submitted drawing for child '${newDrawing.childId}'.`, req.user._id, newCase._id);

    res.status(202).json({ // Use 202 Accepted status code
      message: 'Drawing accepted for processing. Analysis will be performed in the background.',
      drawing: newDrawing,
      case: newCase,
    });
  } catch (error) {
    console.error('Error submitting drawing:', error);
    res.status(500).json({ message: 'Server error during drawing submission.' });
  }
};


// @desc    Get drawings submitted by the logged-in uploader WITH case status
// @route   GET /api/drawings
// @access  Private (Uploader)
exports.getMyDrawings = async (req, res) => {
    try {
        const drawings = await Drawing.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });

        // For each drawing, find its corresponding case
        const drawingsWithCases = await Promise.all(drawings.map(async (drawing) => {
            const caseItem = await Case.findOne({ drawing: drawing._id });
            return {
                ...drawing.toObject(),
                caseStatus: caseItem ? caseItem.status : 'Processing'
            };
        }));
        
        res.status(200).json(drawingsWithCases);
    } catch (error) {
        console.error('Error fetching my drawings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};