import Course from "./course.model.js";
import Lesson from "../lesson/lesson.model.js";
import Progress from "../progress/progress.model.js";

export const getCourses = async (req, res) => {
  const courses = await Course.find();
  res.json({ success: true, courses });
};

export const getCourse = async (req, res) => {

  const course = await Course.find();
  // get the first only and check that only one course is returned
  if(course.length === 0){
    return res.status(404).json({
      success: false,
      message: "Course not found"
    });
  }
  if(course.length > 1){
    return res.status(500).json({
      success: false,
      message: "Multiple courses found, expected only one"
    });
  }

  const lessons = await Lesson.find({ courseId: course[0]._id }).sort({ order: 1 });

  res.json({
    success: true,
    course: course[0],
    lessons,
  });
};

export const getCourseState = async (req, res) => { 
  const userId = req.user.id;
  const courseId = req.params.courseId;

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found"
    });
  }

  const progress = await Progress.findOne({ userId, courseId });

  res.json({
    success: true,
    courseState: {
      enrolled: !!progress, 
      completed: progress ? progress.courseCompleted : false,
      certificateEarned: progress ? progress.certificateEarned : false,
    }
  });
};

export const createCourse = async (req, res) => {
  const { title, description, price } = req.body;
  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: "Title and description are required"
    });
  }
  if (price !== undefined && (isNaN(price) || price < 0)) {
    return res.status(400).json({
      success: false,
      message: "Invalid price"
    });
  }

  const course = await Course.create({
    title,
    description,
    price: price,
    singleton: true
  });

  res.json({
    success: true,
    course,
  });
};


export const getCourseInterface = async (req, res) => {
  const course = await Course.find();
  // get the first only and check that only one course is returned
  if(course.length === 0){
    return res.status(404).json({
      success: false,
      message: "Course not found"
    });
  }
  if(course.length > 1){
    return res.status(500).json({
      success: false,
      message: "Multiple courses found, expected only one"
    });
  }


  res.status(200).json({
    success: true,
    infos: course[0],
  });
};
