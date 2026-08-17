const Case = require('../models/Case.model');
const mlService = require('./ml.service');
const { getNextAssessor } = require('./assignment.service');
const { createLog } = require('./log.service');
const User = require('../models/User.model');


// This is our simple in-memory queue. In production, this would be Redis or RabbitMQ.
const jobQueue = [];
let isProcessing = false;

/**
 * Adds a job to the queue for ML analysis.
 * @param {string} caseId - The ID of the case to be analyzed.
 * @param {string} drawingId - The ID of the drawing.
 * @param {string} imageURL - The URL of the image to analyze.
 * @param {string} childId - The Child ID for logging.
 */
const addJobToQueue = (caseId, drawingId, imageURL, childId) => {
    jobQueue.push({ caseId, drawingId, imageURL, childId });
    console.log(`[Queue] Job added for Case ${caseId}. Queue size: ${jobQueue.length}`);
    // If the worker is not already running, start it.
    if (!isProcessing) {
        processQueue();
    }
};

/**
 * The "worker" process that picks up jobs from the queue.
 */
const processQueue = async () => {
    if (jobQueue.length === 0) {
        isProcessing = false;
        console.log('[Queue] Worker sleeping, queue is empty.');
        return;
    }

    isProcessing = true;
    const job = jobQueue.shift(); // Get the next job
    console.log(`[Queue] Worker processing job for Case ${job.caseId}`);

    try {
        // 1. Call the ML Service (this is the long part)
        const mlOutput = await mlService.analyzeDrawing(job.imageURL);
        const isFlagged = mlOutput.flaggedForReview;
        
        let assignedAssessorId = null;
        if (isFlagged) {
            assignedAssessorId = await getNextAssessor();
        }

        // 2. Find the case and update it with the results
        await Case.findByIdAndUpdate(job.caseId, {
            mlOutput,
            assessor: assignedAssessorId,
            status: isFlagged ? 'Flagged for Review' : 'Completed - No Concerns',
            flaggedAt: isFlagged ? new Date() : null,
            completedAt: !isFlagged ? new Date() : null,
        });

        console.log(`[Queue] Job for Case ${job.caseId} completed successfully. New status: ${isFlagged ? 'Flagged' : 'Completed'}`);

        // 3. Create logs for the background actions
        if (isFlagged) {
            createLog(`Case for child '${job.childId}' was automatically flagged by ML engine.`, null, job.caseId);
            if (assignedAssessorId) {
                const assignedUser = await User.findById(assignedAssessorId).select('username');
                createLog(`Case automatically assigned to '${assignedUser.username}'.`, null, job.caseId);
            } else {
                createLog(`Case requires manual assignment (no active assessors available).`, null, job.caseId);
            }
        }

    } catch (error) {
        console.error(`[Queue] Worker failed to process job for Case ${job.caseId}:`, error);
        // Optionally, update the case to an 'Error' status
        await Case.findByIdAndUpdate(job.caseId, { status: 'Error in Processing' });
    }

    // Process the next job in the queue recursively
    processQueue();
};

module.exports = { addJobToQueue };