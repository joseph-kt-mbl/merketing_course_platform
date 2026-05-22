import Activity from "./activity.model.js";

export const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 }).populate("user", "firstname lastname");
    if (activities.length === 0) {
      return res.status(404).json({ message: "No activities found" });
    }
    res.json(activities);
  } catch (err) {
    console.error("Get activities error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};