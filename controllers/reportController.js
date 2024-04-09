import Report from "../models/report.js";
import User from "../models/User.js"
import Reel from "../models/reel.js";



export const createReport = async (req, res) => {
  const { userId, videoId, reportType } = req.body;

  try {
    // Fetch the reporter and reported video from the database
    const reporter = await User.findById(userId);
    const reportedVideo = await Reel.findById(videoId);

    // Check if reporter and reported video exist
    if (!reporter || !reportedVideo) {
      return res.status(404).json({ error: 'Reporter or reported video not found' });
    }

    // Create a new report object
    const newReport = new Report({
      username: reporter.username,
      email: reporter.email,
      image: reporter.image,
      reportedVideo: reportedVideo.url, // Assuming 'url' is the field containing the video URL
      userNameReel: reportedVideo.userName, // Assuming 'userName' is the field containing the user name
      reelDescription: reportedVideo.reelDescription, // Assuming 'reelDescription' is the field containing the reel description
      reportType: reportType,
    });

    // Save the new report to the database
    await newReport.save();
    res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// Delete report by ID
export const deleteReportById = async (req, res) => {
  const reportId = req.params.id; // Extract the report ID from URL parameters
  try {
    const deletedReport = await Report.findByIdAndDelete(reportId);
    if (!deletedReport) {
      return res.status(404).json({ error: 'Report not found' });
    }
    return res.status(200).json({ message: 'Report deleted successfully', deletedReport });
  } catch (error) {
    console.error('Error deleting report by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

  // Get all reports

  export const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find();
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
  
  // Get report by ID
  export const getReportById = async (reportId) => {
    try {
      const report = await Report.findById(reportId);
      return report;
    } catch (error) {
      console.error('Error fetching report by ID:', error);
      throw error;
    }
  };
  