import Lesson from "./lesson.model.js";
import UserProgress from "../progress/progress.model.js";

export const completeLesson = async (req, res) => {
  const userId = req.user.id;
  const { lessonId } = req.params;

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: "Lesson not found"
    });
  }

  const progress = await UserProgress.findOne({
    userId,
    courseId: lesson.courseId,
  });

  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
    progress.points += lesson.points;
  }

  progress.currentLesson = lessonId;

  await progress.save();

  res.json({ success: true, progress });
};

export const addLesson = async (req, res) => {
  const { title, content, courseId, order, points } = req.body;
  if (!title || !content || !courseId || order === undefined || points === undefined) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: title, content, courseId, order, points"
    });
  }
  const L = await Lesson.findOne({ courseId, order });
  const H = await Lesson.findOne({ courseId, title });
  if (L) {
    return res.status(400).json({
      success: false,
      message: "Lesson with this order already exists in the course"
    });
  }
  if (H) {
    return res.status(400).json({
      success: false,
      message: "Lesson with this title already exists in the course"
    });
  }

  const newLesson = await Lesson.create({
    title,
    content,
    courseId,
    order,
    points,
  });
  res.json({ success: true, lesson: newLesson });

}

export const editLesson = async (req, res) => {
  const { lessonId } = req.params;
  // not all fields are required, only the ones that need to be updated
  // but at least one field must be provided
  const { title, content, order, points } = req.body;
  if (title === undefined && content === undefined && order === undefined && points === undefined) {
    return res.status(400).json({
      success: false,
      message: "At least one field must be provided to update the lesson"
    });
  }
  if(lessonId === undefined){
    return res.status(400).json({
      success: false,
      message: "Lesson ID is required"
    });
  }

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: "Lesson not found"
    });
  }

  if (title !== undefined) 
    lesson.title = title;
  if (content !== undefined) 
    lesson.content = content;
  if (order !== undefined) 
    lesson.order = order;
  if (points !== undefined) 
    lesson.points = points;

  await lesson.save();
  res.json({ success: true, lesson });
};

export const getLessons = async (req, res) => {
  const { courseId } = req.params;
  if(courseId === undefined){
    return res.status(400).json({
      success: false,
      message: "Course ID is required"
    });
  }

  const lessons = await Lesson.find({ courseId });
  res.json({ success: true, lessons });
};

export const deleteLesson = async (req, res) => {
  const { lessonId } = req.params;
  if(lessonId === undefined){
    return res.status(400).json({
      success: false,
      message: "Lesson ID is required"
    });
  }

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: "Lesson not found"
    });
  }
  await lesson.deleteOne();
  res.json({ success: true, message: "Lesson deleted successfully" });
};

export const getLessonByOrder = async (req, res) => {
  const { order } = req.params;
  if(order === undefined){
    return res.status(400).json({
      success: false,
      message: "Lesson order is required"
    });
  }

  const lesson = await Lesson.findOne({ order });
  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: "Lesson not found"
    });
  }
  res.json({ success: true, lesson });
};

export const getLessonById = async (req, res) => {
  const { lessonId } = req.params;
  if(lessonId === undefined){
    return res.status(400).json({
      success: false,
      message: "Lesson ID is required"
    });
  }

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: "Lesson not found"
    });
  }
  res.json({ success: true, lesson });
};


export const getTitles = async (req, res) => {
  const lessons = await Lesson.find({}, { title: 1});
  res.json({ success: true, lessons });
};