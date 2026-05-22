import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./AuthSlice";
import paymentReducer from "./PaymentSlice";
import uiReducer from "./UiSlice";
import studentsReducer from "./StudentsSlice"
import logsReducer from "./ActivitySlice"
import lessonsReducer from "./LessonsSlice"


const store = configureStore({
  reducer: {
    auth: authReducer,
    payment: paymentReducer,
    ui: uiReducer,
    students:studentsReducer,
    activity:logsReducer,
    lessons:lessonsReducer
  },
});

export default store;