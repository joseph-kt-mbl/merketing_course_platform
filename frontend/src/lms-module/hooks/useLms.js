import { useState, useEffect, useCallback } from "react";
import { courseApi, lessonApi, progressApi, quizApi } from "../api/lmsApi";

// ─── Generic fetch hook ───────────────────────────────────────────────────────
function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
}

// ─── Courses ──────────────────────────────────────────────────────────────────
export function useCourses() {
  return useFetch(() => courseApi.getAll());
}

export function useCourse(courseId) {
  return useFetch(() => courseApi.getOne(courseId), [courseId]);
}

export function useCourseInterface() {
  return useFetch(() => courseApi.getInfo());
}

// ─── Lessons ──────────────────────────────────────────────────────────────────
// export function useCourseLessons(courseId) {
//   return useFetch(() => lessonApi.getByCourse(courseId), [courseId]);
// }

export function useCourseLessons(courseId) {
  return useFetch(async () => {
    const res = await lessonApi.getByCourse(courseId);
    return res.lessons; // return only array
  }, [courseId]);
}

export function useLessonById(lessonId) {
  return useFetch(async () => { 
    const res = await lessonApi.getOneById(lessonId)
    return res.lesson
      }, [lessonId]);
}

export function useLessonByOrder(order) {
  return useFetch(async () => { 
    const res = await lessonApi.getOneByOrder(order)
    return res.lesson
      }, [order]);
}

// ─── Progress ─────────────────────────────────────────────────────────────────
export function useProgress(courseId) {
  return useFetch(async () => { 
    const res = await progressApi.getProgress(courseId); 
    return res.progress; 
  }, [courseId]);
}


// ─── Quiz ─────────────────────────────────────────────────────────────────────
export function useCourseQuiz(order) {
  return useFetch(async () => { 
    const res = await quizApi.getByCourse(order); 
    return res.quiz; 
  }, [order]);
}
