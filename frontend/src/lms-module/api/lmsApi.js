import axios from "axios";

// ─── Axios instance ──────────────────────────────────────────────────────────
// Reads token from your existing auth system (localStorage key: "accessToken")
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data || err)
);

// ─── Courses ─────────────────────────────────────────────────────────────────
export const courseApi = {
  getAll: () => api.get("/courses"),
  getOne: (courseId) => api.get(`/courses/marketing`),
  getInfo: async () => { 
    const res = await api.get("/courses/marketing-interface")
    return res.infos
  },
};

// ─── Lessons ─────────────────────────────────────────────────────────────────
export const lessonApi = {
  getByCourse: (courseId) => api.get(`/lessons/course/${courseId}`),
  getOneByOrder: (order) => api.get(`/lessons/order/${order}`),
  getOneById: (id) => api.get(`/lessons/id/${id}`),
  complete: (order) => api.post(`/lessons/${order}/complete`),
  getTitles: () => api.get("/lessons/titles"),
};

// ─── Progress & Enrollment ────────────────────────────────────────────────────
export const progressApi = {
  enroll: (courseId) => api.post("/progress/enroll", { courseId }),
  getProgress: (courseId) => api.get(`/progress/${courseId}`),
};

// ─── Quiz ─────────────────────────────────────────────────────────────────────
export const quizApi = {
  getByCourse: (order) => api.get(`/quiz/order/${order}`),
  submitAttempt: (quizId, answers) =>
    api.post("/quiz/attempts", { quizId, answers }),
};

// ─── Payment ──────────────────────────────────────────────────────────────────
export const paymentApi = {
  createCheckout: (courseId) =>
    api.post("/payments/create", { courseId }),
};

export default api;
