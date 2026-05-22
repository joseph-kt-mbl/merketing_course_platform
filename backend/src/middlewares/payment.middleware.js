import jwt from "jsonwebtoken"
import User from "./../modules/user/user.model.js";

export default async (req, res, next) =>  {

    const user = req.user;
    if (!user) return res.sendStatus(401);

    if(!user.hasPaid){
        return res.status(403).json({
            message: "Payment required to access this resource"
        });
    }
    next();
};
