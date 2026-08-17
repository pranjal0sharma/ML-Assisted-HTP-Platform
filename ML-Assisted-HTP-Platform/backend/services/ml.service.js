const axios = require('axios');

/**
 * Calls the external ML service to analyze a drawing.
 * @param {string} imageURL - The URL of the image to analyze.
 * @returns {Promise<object>} - The analysis result from the ML service.
 */
exports.analyzeDrawing = async (imageURL) => {
  try {
    console.log(`Sending image URL to local ML Service: ${imageURL}`);
    
    // This is now a real API call to your Python Flask service
    const response = await axios.post(process.env.ML_API_ENDPOINT, {
      imageURL: imageURL,
    });

    console.log('Received analysis from local ML Service:', response.data);
    return response.data;

  } catch (error) {
    console.error('Error calling local ML service:', error.response ? error.response.data : error.message);
    // Fallback response so the main app doesn't crash
    return {
      flaggedForReview: true, // Flag for manual review on error
      flagConfidence: 0.99,
      psychIndicators: [{
        indicator: "Analysis Error",
        evidence: ["The ML/LLM API service failed to process the request."],
        interpretation: error.response ? JSON.stringify(error.response.data) : error.message,
        confidence: 1.0
      }],
      modelVersion: "error-fallback-v1.0"
    };
  }
};