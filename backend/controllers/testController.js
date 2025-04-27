import Test from "../models/Test.js";
import UserTest from "../models/UserTest.js";

export const getTestDetails = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.status(200).json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { testId } = req.params;

    const leaderboard = await UserTest.find({ testId })
      .sort({ score: -1 })
      .limit(10)
      .populate('userId', 'name email');

    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const { testId } = req.params;

    const analytics = await UserTest.aggregate([
      { $match: { testId } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: "$score" },
          maxScore: { $max: "$score" },
          minScore: { $min: "$score" },
          totalAttempts: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json(analytics[0] || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add more: analytics, leaderboard etc.
