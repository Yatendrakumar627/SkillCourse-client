import { useCallback, useEffect, useState } from 'react';
import {
  getCoursesAPI,
  getCategoriesAPI,
  getAllPaymentsAPI,
  getLiveClassesAPI,
  getAnnouncementsAPI,
  getStudentsAPI,
} from '../services/api';

export default function useAdminData() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [payments, setPayments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [co, ca, pa, cl, an, st] = await Promise.all([
        getCoursesAPI(),
        getCategoriesAPI(),
        getAllPaymentsAPI(),
        getLiveClassesAPI(),
        getAnnouncementsAPI(),
        getStudentsAPI(),
      ]);
      setCourses(co);
      setCategories(ca);
      setPayments(pa);
      setClasses(cl);
      setAnnouncements(an);
      setStudents(st);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data.');
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { courses, categories, payments, classes, announcements, students, loading, error, reload };
}