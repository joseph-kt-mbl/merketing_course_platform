import jwt from "jsonwebtoken"
import User from "./../modules/user/user.model.js";

export default async (req, res, next) =>  {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    const user = await User.findOne({_id:decoded.userId},
      { password: 0, __v: 0 ,updatedAt:0})
      
    req.user = user
    next();
  } catch {
    return res.status(401).json({
      message: "Access token expired"
    });
  }
};
