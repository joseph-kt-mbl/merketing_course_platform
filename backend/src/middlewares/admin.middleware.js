import jwt from "jsonwebtoken"
import User from "./../modules/user/user.model.js";

const isAdmin = async (req, res, next) =>  {
    const user = req.user;
    if (!user) return res.sendStatus(401);

    if(user.role !== "admin"){
        return res.status(403).json({
            message: "Admin access required to access this resource"
        });
    }
    const howManyAdmins = await User.countDocuments({ role: "admin" });
    if(howManyAdmins === 1){
        next();
    }else{
        return res.status(403).json({
            message: "not unique admin found, contact support"
        });
    }
};

export default isAdmin;
