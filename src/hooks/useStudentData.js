import { useCallback, useEffect, useState } from 'react';
import {
  getMyCoursesAPI,
  getMyEnrollmentsAPI,
  getLiveClassesAPI,
  getAnnouncementsAPI,
  getAssignmentsAPI,
  getNotificationsAPI,
} from '../services/api';

export default function useStudentData() {
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [cRes, clRes, aRes, eRes] = await Promise.all([
        getMyCoursesAPI(),
        getLiveClassesAPI(),
        getAnnouncementsAPI(),
        getMyEnrollmentsAPI(),
      ]);
      setCourses(cRes);
      setClasses(clRes);
      setAnnouncements(aRes);
      setEnrollments(eRes);

      const [assignRes, notifRes] = await Promise.allSettled([
        cRes.length
          ? Promise.all(cRes.map((c) => getAssignmentsAPI(c._id)))
          : Promise.resolve([]),
        getNotificationsAPI(),
      ]);

      const perCourse = assignRes.status === 'fulfilled' ? assignRes.value : [];
      setAssignments(
        cRes
          .map((c, i) => (perCourse[i]?.assignments || []).map((a) => ({ ...a, _courseId: c._id })))
          .flat()
      );
      setSubmissions(
        cRes
          .map((c, i) => (perCourse[i]?.submissions || []).map((s) => ({ ...s, _courseId: c._id })))
          .flat()
      );
      setNotifications(notifRes.status === 'fulfilled' ? notifRes.value : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
      console.error('Error fetching student data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { courses, classes, announcements, enrollments, assignments, submissions, notifications, loading, error, reload };
}