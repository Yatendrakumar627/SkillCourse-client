import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getCoursesAPI,
  getCategoriesAPI,
  getAllPaymentsAPI,
  getLiveClassesAPI,
  getAnnouncementsAPI,
  getStudentsAPI,
  getContactMessagesAPI,
} from '../services/api';

export default function useAdminData() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [payments, setPayments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [students, setStudents] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const hasLoadedRef = useRef(false);

  const reload = useCallback(async () => {
    if (!hasLoadedRef.current) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError('');
    try {
      const [co, ca, pa, cl, an, st, iq] = await Promise.all([
        getCoursesAPI(),
        getCategoriesAPI(),
        getAllPaymentsAPI(),
        getLiveClassesAPI(),
        getAnnouncementsAPI(),
        getStudentsAPI(),
        getContactMessagesAPI(),
      ]);
      setCourses(co);
      setCategories(ca);
      setPayments(pa);
      setClasses(cl);
      setAnnouncements(an);
      setStudents(st);
      setInquiries(iq);
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data.');
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    courses, categories, payments, classes, announcements, students, inquiries,
    loading, refreshing, error, reload,
  };
}