import Activity from "../modules/activity/activity.model.js";
import {io} from "./../server.js"

export const logActivity = async ({ userId, type, meta = {}, color ="" }) => {
  console.log(`Logging activity for user ${userId}: ${type}`, meta);
  try {
    await Activity.create({
      user: userId,
      type,
      meta,
      color
    });

    io.emit("activity_updated");
  } catch (err) {
    console.error("Activity log error:", err.message);
  }
};