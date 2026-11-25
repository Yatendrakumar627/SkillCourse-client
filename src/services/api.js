import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SERVER_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const getUploadUrl = (filePath) => {
  if (!filePath) return '';
  if (/^https?:\/\//i.test(filePath)) return filePath;
  const normalized = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${SERVER_ORIGIN}${normalized}`;
};

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to inject JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Clear stale auth state on 401 responses from protected endpoints
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthAttempt = url.includes('/auth/login') || url.includes('/auth/register');

    if (status === 401 && !isAuthAttempt && localStorage.getItem('token')) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// --- AUTH API ---
export const loginAPI = async (credentials) => {
  const { data } = await API.post('/auth/login', credentials);
  return data;
};

export const registerAPI = async (userData) => {
  const { data } = await API.post('/auth/register', userData);
  return data;
};

export const getMeAPI = async () => {
  const { data } = await API.get('/auth/me');
  return data;
};

// --- COURSES API ---
export const getCoursesAPI = async (categorySlug = '') => {
  const url = categorySlug ? `/courses?category=${categorySlug}` : '/courses';
  const { data } = await API.get(url);
  return data;
};

export const getCategoriesAPI = async () => {
  const { data } = await API.get('/courses/categories');
  return data;
};

export const getCourseDetailsAPI = async (slug) => {
  const { data } = await API.get(`/courses/${slug}`);
  return data;
};

export const createCourseAPI = async (courseData) => {
  const { data } = await API.post('/courses', courseData);
  return data;
};

export const updateCourseAPI = async (id, courseData) => {
  const { data } = await API.put(`/courses/${id}`, courseData);
  return data;
};

export const deleteCourseAPI = async (id) => {
  const { data } = await API.delete(`/courses/${id}`);
  return data;
};

export const createCategoryAPI = async (categoryData) => {
  const { data } = await API.post('/courses/categories', categoryData);
  return data;
};

export const deleteCategoryAPI = async (id) => {
  const { data } = await API.delete(`/courses/categories/${id}`);
  return data;
};

// --- PAYMENTS API ---
export const getPaymentConfigAPI = async () => {
  const { data } = await API.get('/payments/config');
  return data;
};

export const submitPaymentAPI = async (formData) => {
  // formData should be multipart/form-data containing 'course', 'amount', 'screenshot'
  const { data } = await API.post('/payments/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export const getMyPaymentsAPI = async () => {
  const { data } = await API.get('/payments/my');
  return data;
};

export const getAllPaymentsAPI = async () => {
  const { data } = await API.get('/payments/all');
  return data;
};

export const updatePaymentStatusAPI = async (id, statusData) => {
  const { data } = await API.put(`/payments/${id}/status`, statusData);
  return data;
};

// --- LIVE CLASSES API ---
export const getLiveClassesAPI = async () => {
  const { data } = await API.get('/live-classes');
  return data;
};

export const createLiveClassAPI = async (classData) => {
  const { data } = await API.post('/live-classes', classData);
  return data;
};

export const deleteLiveClassAPI = async (id) => {
  const { data } = await API.delete(`/live-classes/${id}`);
  return data;
};

// --- ANNOUNCEMENTS API ---
export const getAnnouncementsAPI = async () => {
  const { data } = await API.get('/announcements');
  return data;
};

export const createAnnouncementAPI = async (announcementData) => {
  const { data } = await API.post('/announcements', announcementData);
  return data;
};

export const deleteAnnouncementAPI = async (id) => {
  const { data } = await API.delete(`/announcements/${id}`);
  return data;
};

// --- STUDENTS/ENROLLMENTS API ---
export const getStudentsAPI = async () => {
  const { data } = await API.get('/students');
  return data;
};

export const updateStudentStatusAPI = async (id, statusData) => {
  const { data } = await API.put(`/students/${id}/status`, statusData);
  return data;
};

export const getMyCoursesAPI = async () => {
  const { data } = await API.get('/students/my-courses');
  return data;
};

export const getMyEnrollmentsAPI = async () => {
  const { data } = await API.get('/students/my-enrollments');
  return data;
};

// --- CURRICULUM (MODULES) API ---
export const getModulesAPI = async (courseId) => {
  const { data } = await API.get(`/courses/${courseId}/modules`);
  return data;
};

export const createModuleAPI = async (courseId, moduleData) => {
  const { data } = await API.post(`/courses/${courseId}/modules`, moduleData);
  return data;
};

export const updateModuleAPI = async (courseId, id, moduleData) => {
  const { data } = await API.put(`/courses/${courseId}/modules/${id}`, moduleData);
  return data;
};

export const deleteModuleAPI = async (courseId, id) => {
  const { data } = await API.delete(`/courses/${courseId}/modules/${id}`);
  return data;
};

// --- ASSIGNMENTS & SUBMISSIONS API ---
export const getAssignmentsAPI = async (courseId) => {
  const { data } = await API.get(`/courses/${courseId}/assignments`);
  return data;
};

export const createAssignmentAPI = async (courseId, formData) => {
  const { data } = await API.post(`/courses/${courseId}/assignments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export const submitAssignmentAPI = async (courseId, assignmentId, formData) => {
  const { data } = await API.post(`/courses/${courseId}/assignments/${assignmentId}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export const getSubmissionsForAdminAPI = async (courseId, assignmentId) => {
  const { data } = await API.get(`/courses/${courseId}/assignments/submissions/${assignmentId}`);
  return data;
};

export const gradeSubmissionAPI = async (courseId, id, gradeData) => {
  const { data } = await API.put(`/courses/${courseId}/assignments/grade/${id}`, gradeData);
  return data;
};

// --- NOTIFICATIONS API ---
export const getNotificationsAPI = async () => {
  const { data } = await API.get('/notifications');
  return data;
};

export const markNotificationReadAPI = async (id) => {
  const { data } = await API.put(`/notifications/${id}/read`);
  return data;
};

export const markAllNotificationsReadAPI = async () => {
  const { data } = await API.put('/notifications/read-all');
  return data;
};

// --- ADDITIONAL STUDENTS API ---
export const updateProfileAPI = async (profileData) => {
  const { data } = await API.put('/students/profile', profileData);
  return data;
};

export const getStudentActivityAPI = async (studentId) => {
  const { data } = await API.get(`/students/activity/${studentId}`);
  return data;
};

// --- CONTACT API ---
export const submitContactAPI = async (contactData) => {
  const { data } = await API.post('/contact', contactData);
  return data;
};

export default API;



