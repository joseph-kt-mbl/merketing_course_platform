import User from './user.model.js';
import RefreshToken from './../refreshToken/refresh-token.model.js'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { nanoid } from "nanoid";
import sendEmail from "./../../utils/emailing.js"
import redis from '../../config/redis.js';
import crypto from "crypto"
import Quiz from '../quiz/quiz.model.js';
import { logActivity } from '../../utils/activityLogger.js';
import Progress from "../progress/progress.model.js";
import Lesson from "../lesson/lesson.model.js";



export const getStudents = async (req, res) => {
  try {
    console.log("📦 get all premium students");

    const users = await User.find({ role: "user" });

    const students = await Promise.all(
      users
        // .filter((u) => u.hasPaid)
        .map(async (u) => {
          // get progress for this user (assuming 1 active progress per user)
          const progress = await Progress.findOne({ userId: u._id });

          const completedLessonsRaw = progress?.completedLessons || [];

          // convert ObjectIds -> [0,1,2,...]
          const completedLessons = completedLessonsRaw.map((_, idx) => idx);

          return {
            id: u._id.toString(),
            name: `${u.firstname} ${u.lastname}`,
            email: u.email,
            phone: u.phone || "—",
            age: u.age || "—",

            plan: u.plan || "standard",
            paid: Boolean(u.hasPaid),

            // now coming from Progress
            completedLessons,

            enrolledAt: u.createdAt,
          };
        })
    );

    return res.status(200).json(students);
  } catch (error) {
    console.error("❌ getStudents error:", error);
    return res.status(500).json({
      message: "Failed to fetch students",
    });
  }
};



export const getUsers = async (req, res) => {
  console.log("get all premium students !");

  const users = await User.find({ role: "user", hasPaid: true });

  const students = await Promise.all(
    users.map(async (u) => {
      const progress = await Progress.findOne({ userId: u._id });

      let completedLessons = [];

      if (progress && progress.completedLessons.length) {
        const lessons = await Lesson.find({
          _id: { $in: progress.completedLessons }
        }).sort({ order: 1 });

        completedLessons = lessons.map(l => l.order);
      }

      return {
        id: u._id,
        name: `${u.firstname || ""} ${u.lastname || ""}`.trim(),
        email: u.email,
        phone: u.phone,

        age: u.age || null,

        plan: "standard",

        paid: u.hasPaid,

        completedLessons,

        enrolledAt: u.createdAt
      };
    })
  );

  res.json(students);
};

// Generate OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
};

// Main requestOtp function
export const requestOtp = async (req, res) => {

  try {
    let { email } = req.body;

    // Input validation
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }

    // Sanitize email
    email = email.trim().toLowerCase();

    // Check if user exists in database
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Generate OTP
    const otp = generateOtp();
    const redisKey = `otp:${email}`;

    // Store OTP in Redis with 60 seconds expiration
    await redis.setEx(redisKey, 60, otp);

    const html = `<h1>${otp}</h1>`
    await sendEmail(email, `Your OTP`,html);
    
    // For development, log OTP (remove in production)
    console.log(`OTP for ${email}: ${otp} - Expires in 60 seconds`);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 60,
      // Only include OTP in development/testing
      ...(process.env.NODE_ENV !== 'production' && { otp })
    });

  } catch (error) {
    console.error('Error in requestOtp:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const validateOtp = async (req, res) => {
  try {
    const { email, otp } = req.query;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    // Validate OTP format (should be numeric, typically 6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be a 6-digit number"
      });
    }

    const redisKey = `otp:${email}`;
    const storedOtp = await redis.get(redisKey);

    // Check if OTP exists in Redis (expired or not sent)
    if (!storedOtp) {
      return res.status(401).json({
        success: false,
        message: "OTP has expired or was never sent. Please request a new OTP."
      });
    }

    // Compare OTP (case-insensitive, trim whitespace)
    const isValidOtp = storedOtp.trim() === otp.trim();

    if (!isValidOtp) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP. Please check and try again."
      });
    }

    // OTP is valid - delete it from Redis to prevent reuse
    await redis.del(redisKey);

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate JWT token (adjust payload as needed)
    const accessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email
      },
      process.env.ACCESS_SECRET,
      { expiresIn: '150m' }
    );

    // Update last login
    // user.lastLogin = new Date();
    // await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name || null
      }
    });
  } catch (error) {
    console.error("OTP Validation Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while validating OTP",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const login = async (req, res) => {
  // const { phone, password } = req.body;
  const { email, password } = req.body;


  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Wrong password" });

  // ACCESS TOKEN (short)
  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  // REFRESH TOKEN (long)
  const refreshToken = nanoid(64);
  const ip =
  req.headers["x-forwarded-for"]?.split(",")[0] ||
  req.socket.remoteAddress;

  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  // send refresh token as HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // true in production (HTTPS)
    sameSite: "strict"
  });

  res.json({ accessToken });
};

export const register = async (req,res) => {
  if (!process.env.ACCESS_SECRET) {
     return res.status(500).json({
    message: "Server misconfigured: ACCESS_SECRET missing"
  });
  }
  const { firstname,lastname,phone, password ,email,age} = req.body;
  let message = "";
  
  if (!firstname || !lastname || !phone || !password || !email || !age) {
    message = "All fields are required"
    return res.status(400).json({message});
  }
  
  // const userByPhone = await User.findOne({phone});
  // if(userByPhone){
  //   message = "phone number is in use ! try with another one"
  //   return res.status(409).json({message});
  // }

  const userByEmail = await User.findOne({email});
  if(userByEmail){
    message = "Email is in use ! try with another one"
    return res.status(409).json({message});
  }
  
  let regex = /^\+?\d{7,15}$/;
    if (!regex.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }
  
  // regex = /^[\p{L}]+(?:-[\p{L}]+)*$/u;
  // if(!regex.test(firstname) || !regex.test(lastname)){
  //   message = "Invalid name format. Only letters are allowed.";
  //   return res.status(400).json({message});
  // }

  /** Password
   * 
   *  ✔ At least 8 characters
      ✔ 1 uppercase
      ✔ 1 lowercase
      ✔ 1 number
      ✔ 1 special character
   */
  // regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$+!%*?&]{8,}$/;
  regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
  if(!regex.test(password)){
    message = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
    return res.status(400).json({message});
  }


  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstname,
    lastname,
    phone,
    password : hashed,
    email,
    age
  })

  // ACCESS TOKEN (short)
  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_SECRET ,
    { expiresIn: "15m" }
  );

  const ip =
  req.headers["x-forwarded-for"]?.split(",")[0] ||
  req.socket.remoteAddress;

  // REFRESH TOKEN (long)
  const refreshToken = nanoid(64)
  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  await logActivity({
    userId: user._id,
    type: "REGISTER",
    color: "var(--amber)"
  });

  // send refresh token as HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // true in production (HTTPS)
    sameSite: "strict"
  });

  res.json({ accessToken });
}

export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) return res.status(401).json({ message: "No token" });

  const storedToken = await RefreshToken.findOne({ token });

  if (!storedToken) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  if (storedToken.expiresAt < new Date()) {
    return res.status(403).json({ message: "Refresh token expired" });
  }

  // create new access token
  const newAccessToken = jwt.sign(
    { userId: storedToken.userId },
    process.env.ACCESS_SECRET,
    { expiresIn: "150m" }
  );

  res.json({ accessToken: newAccessToken });
};

export const logout = async(req,res) => {
  const token = req.cookies.refreshToken;
  console.log(token);

  await RefreshToken.deleteOne({ token });

  res.clearCookie("refreshToken");

  res.json({ message: "Logged out" });
}

export const checkEmailExistence = async (req,res) => {
  const {email} = req.query

 try{
    // Prevent MongoDB operator injection
    if (email.startsWith('$') || email.includes('$')) {
      return res.status(400).json({ error: 'Invalid characters' });
    }

    const user = await User.findOne({email})

      return res.status(200).json({ 
        exists: !!user
      });
  }catch(error) {
    console.error('Error checking email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
export const sendUrl = async (req, res) => {
  const { receiver } = req.body;

  if (!receiver) {
    return res.status(401).json({
      message: "fields are required receiver",
    });
  }



  try {
     const token = nanoid(64);
     const html = `<html><body><a href='http://localhost:5173/verify?token=${token}'>GO!</a></body></html>`
    
     const info = await sendEmail(receiver,"validating email!", html)
    

    console.log("Message sent:", info.messageId);

    const result = await redis.set(`verify:${token}`, receiver, {
      EX: 240,
    });

    if (result === "OK") {
      console.log("✅ Token saved in Redis");
      console.log("Token = ",token)
    } else {
      console.log("❌ Failed to save token");
    }
    
    return res.json({
      message: `Message sent: ${info.messageId}`,
    });
    console.log("\nToken => ",token);

  } catch (err) {
    console.error("Error while sending mail:", err);
    return res.status(500).json({
      message: "Error while sending mail",
    });
  }
};

export const verify = async (req,res) => {
  const {token } = req.query
  console.log("getting the token => ",token)

  
  const email = await redis.get(`verify:${token}`)
  if(email === "OK"){
    console.log("email gotttttt~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  }
  

    if (!email) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // delete after use
  await redis.del(`verify:${token}`);

  return res.json({
    message: "Email verified successfully",
    email,
  });
}

export const profile = async(req,res) => {
   res.json({ user: req.user });
}

