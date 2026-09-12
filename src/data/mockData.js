/**
 * mockData.js — UI scenario reference data
 *
 * Every export below is designed to exercise a specific rendering state in the
 * app (dashboards, catalog, course detail, marketing pages). Dates are derived
 * from Date.now() so "upcoming/past classes", the revenue trend chart, and
 * unread notification timestamps always look correct whenever the data is used.
 *
 * Shape reference (from backend contracts, see src/services/api.js + hooks):
 *   course      { _id, title, shortDescription?, description?, thumbnail?,
 *                 instructor?, level?, duration?, language?, category?{_id,name},
 *                 price, discountedPrice?, isPublished, slug, createdAt, updatedAt }
 *   module      { _id, title, description?, order }
 *   assignment  { _id, title, description?, dueDate?, filePath? }
 *   submission  { _id, assignment(id|obj), student?{name,email}, submissionText?,
 *                 filePath?, grade?, feedback? }
 *   payment     { _id, user{name,email}, course{title}, amount, transactionId,
 *                 screenshotUrl?, status, createdAt, rejectionReason? }
 *   enrollment  { _id, course, paymentId|null, accessGranted, createdAt }
 *   liveClass   { _id, course(obj|id|absent), topic, date?, startTime?, meetLink,
 *                 notesUrl? }
 *   announcement{ _id, title, message, createdAt, course|null }
 *   student     { _id, name, email, phone?, status }
 *   notification{ _id, title, message, createdAt, isRead }
 */

// ---------------------------------------------------------------- date helpers
export const daysFromNow = (days, hour = 12) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const hoursFromNow = (hours) =>
  new Date(Date.now() + hours * 3.6e6).toISOString();

// ------------------------------------------------------------- people
export const STUDENT_A = {
  _id: 'u-stu-1',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@example.com',
  phone: '+91 98765 43210',
  role: 'student',
};

export const STUDENT_B = {
  _id: 'u-stu-2',
  name: 'Priya Patel',
  email: 'priya.patel@example.com',
  role: 'student',
};

export const ADMIN = {
  _id: 'u-adm-1',
  name: 'Admin User',
  email: 'admin@skillcourse.dev',
  phone: '+91 90000 00000',
  role: 'admin',
};

export const mockStudent = STUDENT_A;
export const mockAdmin = ADMIN;

export const authResponses = {
  student: { token: 'mock-token-student', role: 'student' },
  admin: { token: 'mock-token-admin', role: 'admin' },
};

// ------------------------------------------------------------- categories
export const CAT_WEB = { _id: 'cat-web', name: 'Web Development' };
export const CAT_DATA = { _id: 'cat-data', name: 'Data Science' };
export const CAT_MARKETING = { _id: 'cat-marketing', name: 'Digital Marketing' };

export const categories = [
  { ...CAT_WEB, slug: 'web-development' },
  { ...CAT_DATA, slug: 'data-science' },
  { ...CAT_MARKETING, slug: 'digital-marketing' },
];

// ------------------------------------------------------------- courses
const THUMB = (id) => `https://images.unsplash.com/photo-${id}?w=600`;

// Full live cohort: published, discounted, category + thumbnail present.
export const COURSE_1 = {
  _id: 'crs-1',
  title: 'React Mastery Live Cohort',
  shortDescription:
    'Build production-grade React apps with live instructor-led sessions.',
  description:
    'A hands-on 8-week live cohort covering React fundamentals, hooks, context, routing, performance and deployment. Every week includes a live Google Meet session, assignments and mentor feedback.',
  thumbnail: THUMB('1516321318423-f06f85e504b3'),
  instructor: 'Rohan Mehta',
  level: 'Beginner',
  duration: '8 Weeks',
  language: 'English',
  category: CAT_WEB,
  price: 99,
  discountedPrice: 49,
  isPublished: true,
  slug: 'react-mastery-live',
  createdAt: daysFromNow(-30),
  updatedAt: daysFromNow(-2),
};

// No discount: full price only, no discountedPrice field.
export const COURSE_2 = {
  _id: 'crs-2',
  title: 'Python for Data Science',
  shortDescription:
    'Learn pandas, numpy and visualisation through real datasets.',
  description:
    'A 6-week live course that takes you from Python basics to practical data analysis. Includes live labs, notebooks and a capstone project.',
  thumbnail: THUMB('1515879218367-8466d910aaa4'),
  instructor: 'Kavita Rao',
  level: 'Intermediate',
  duration: '6 Weeks',
  language: 'English',
  category: CAT_DATA,
  price: 79,
  isPublished: true,
  slug: 'python-data-science-live',
  createdAt: daysFromNow(-45),
  updatedAt: daysFromNow(-5),
};

// Draft + no category + no thumbnail: tests fallbacks and draft badge.
export const COURSE_3 = {
  _id: 'crs-3',
  title: 'UI/UX Design Fundamentals',
  shortDescription: 'Design user-centred interfaces from first principles.',
  description:
    'A 5-week live course on UX research, wireframing, prototyping and design systems with Figma.',
  instructor: 'Sana Kapoor',
  level: 'Beginner',
  duration: '5 Weeks',
  language: 'Hindi + English',
  price: 59,
  isPublished: false,
  slug: 'ui-ux-design-fundamentals',
  createdAt: daysFromNow(-10),
  updatedAt: daysFromNow(-1),
};

// No shortDescription: components fall back to description.
export const COURSE_4 = {
  _id: 'crs-4',
  title: 'Advanced JavaScript Patterns',
  description:
    'Deep dive into closures, prototypal inheritance, async patterns, and performance optimisation for senior-level interviews and production code.',
  thumbnail: THUMB('1579403124614-197f3ae7564e'),
  instructor: 'Arjun Nair',
  level: 'Advanced',
  duration: '4 Weeks',
  language: 'English',
  category: CAT_WEB,
  price: 120,
  discountedPrice: 95,
  isPublished: true,
  slug: 'advanced-js-patterns',
  createdAt: daysFromNow(-60),
  updatedAt: daysFromNow(-7),
};

// No modules/assignments: demonstrates per-course empty states.
export const COURSE_5 = {
  _id: 'crs-5',
  title: 'SEO & Growth Marketing',
  shortDescription: 'Grow organic traffic with measurable, repeatable playbooks.',
  description:
    'A 4-week live workshop covering keyword research, on-page SEO, analytics setup and growth experiments.',
  instructor: 'Neha Iyer',
  level: 'Beginner',
  duration: '4 Weeks',
  language: 'English',
  category: CAT_MARKETING,
  price: 75,
  isPublished: true,
  slug: 'seo-growth-marketing',
  createdAt: daysFromNow(-15),
  updatedAt: daysFromNow(-3),
};

export const courses = [COURSE_1, COURSE_2, COURSE_3, COURSE_4, COURSE_5];
export const featuredCourses = [COURSE_1, COURSE_2, COURSE_3];

// ------------------------------------------------------------- syllabus
export const modulesByCourse = {
  [COURSE_1._id]: [
    { _id: 'mod-1-1', title: 'React Fundamentals', description: 'JSX, components, props and state.', order: 1 },
    { _id: 'mod-1-2', title: 'Hooks in Depth', description: 'useState, useEffect, custom hooks.', order: 2 },
    { _id: 'mod-1-3', title: 'Routing with React Router', order: 3 },
  ],
  [COURSE_2._id]: [
    { _id: 'mod-2-1', title: 'Python Basics', description: 'Syntax, data types and control flow.', order: 1 },
    { _id: 'mod-2-2', title: 'Pandas & NumPy', description: 'Data wrangling and vectorised operations.', order: 2 },
  ],
  [COURSE_3._id]: [],
  [COURSE_4._id]: [
    { _id: 'mod-4-1', title: 'Closures & Scope', order: 1 },
  ],
};

// ------------------------------------------------------------- curriculum
export const assignmentsByCourse = {
  // With dueDate + filePath, and one without either.
  [COURSE_1._id]: [
    {
      _id: 'ass-1-1',
      title: 'Build a Todo App with Hooks',
      description: 'Create a functional todo list using useState and useEffect.',
      dueDate: daysFromNow(3),
      filePath: '/uploads/mock-assignment-1-1.pdf',
    },
    {
      _id: 'ass-1-2',
      title: 'Refactor to Custom Hooks',
      description: 'Extract reusable logic into a custom hook.',
    },
  ],
  [COURSE_2._id]: [
    {
      _id: 'ass-2-1',
      title: 'Data Cleaning Exercise',
      description: 'Clean the provided dataset and summarise findings.',
      dueDate: daysFromNow(6),
    },
  ],
  [COURSE_3._id]: [],
};

export const submissionsByCourse = {
  [COURSE_1._id]: [
    // Graded with feedback + file attachment.
    {
      _id: 'sub-1-1',
      assignment: 'ass-1-1',
      student: STUDENT_A,
      submissionText: 'Submitted my todo app with localStorage persistence.',
      filePath: '/uploads/mock-submission-1-1.zip',
      grade: 'A',
      feedback: 'Clean code and great persistence handling.',
    },
    // Graded, no feedback, no attachment.
    {
      _id: 'sub-1-2',
      assignment: 'ass-1-2',
      student: STUDENT_B,
      submissionText: 'Custom hook extraction completed.',
      grade: 'B+',
    },
    // Ungraded, file only, no submissionText.
    {
      _id: 'sub-1-3',
      assignment: 'ass-1-1',
      student: STUDENT_A,
      filePath: '/uploads/mock-submission-1-3.zip',
    },
    // Missing student object: exercises optional chaining.
    {
      _id: 'sub-1-4',
      assignment: 'ass-1-2',
      submissionText: 'Attached file only submission.',
      grade: 'A-',
    },
  ],
  [COURSE_2._id]: [],
};

// ------------------------------------------------------------- payments
export const PAY_1 = {
  _id: 'pay-1',
  user: STUDENT_A,
  course: { _id: COURSE_1._id, title: COURSE_1.title },
  amount: 49,
  transactionId: 'TX-2026-0001',
  screenshotUrl: '/uploads/mock-receipt-1.jpg',
  status: 'approved',
  createdAt: daysFromNow(-1),
};

export const PAY_2 = {
  _id: 'pay-2',
  user: STUDENT_B,
  course: { _id: COURSE_2._id, title: COURSE_2.title },
  amount: 79,
  transactionId: 'TX-2026-0002',
  screenshotUrl: '/uploads/mock-receipt-2.jpg',
  status: 'pending',
  createdAt: hoursFromNow(-2),
};

export const PAY_3 = {
  _id: 'pay-3',
  user: STUDENT_A,
  course: { _id: COURSE_3._id, title: COURSE_3.title },
  amount: 59,
  transactionId: 'TX-2026-0003',
  screenshotUrl: '/uploads/mock-receipt-3.jpg',
  status: 'rejected',
  rejectionReason: 'Screenshot is blurry, please re-upload a clear copy.',
  createdAt: daysFromNow(-3),
};

// Approved but missing screenshotUrl.
export const PAY_4 = {
  _id: 'pay-4',
  user: STUDENT_B,
  course: { _id: COURSE_4._id, title: COURSE_4.title },
  amount: 95,
  transactionId: 'TX-2026-0004',
  status: 'approved',
  createdAt: daysFromNow(-5),
};

export const PAY_5 = {
  _id: 'pay-5',
  user: STUDENT_A,
  course: { _id: COURSE_5._id, title: COURSE_5.title },
  amount: 75,
  transactionId: 'TX-2026-0005',
  screenshotUrl: '/uploads/mock-receipt-5.jpg',
  status: 'approved',
  createdAt: daysFromNow(-6),
};

export const payments = [PAY_1, PAY_2, PAY_3, PAY_4, PAY_5];

// ------------------------------------------------------------- enrollments
export const enrollments = [
  // Approved + access granted.
  {
    _id: 'enr-1',
    course: { _id: COURSE_1._id, title: COURSE_1.title },
    paymentId: PAY_1,
    accessGranted: true,
    createdAt: daysFromNow(-1),
  },
  // Pending + access not granted.
  {
    _id: 'enr-2',
    course: { _id: COURSE_2._id, title: COURSE_2.title },
    paymentId: PAY_2,
    accessGranted: false,
    createdAt: hoursFromNow(-2),
  },
  // Rejected (shows rejectionReason in purchases).
  {
    _id: 'enr-3',
    course: { _id: COURSE_3._id, title: COURSE_3.title },
    paymentId: PAY_3,
    accessGranted: false,
    createdAt: daysFromNow(-3),
  },
  // No paymentId at all.
  {
    _id: 'enr-4',
    course: { _id: COURSE_5._id, title: COURSE_5.title },
    paymentId: null,
    accessGranted: false,
    createdAt: daysFromNow(-4),
  },
];

// ------------------------------------------------------------- live classes
export const liveClasses = [
  {
    _id: 'lv-1',
    course: { _id: COURSE_1._id, title: COURSE_1.title },
    topic: 'React Hooks Deep Dive',
    date: daysFromNow(2, 18),
    meetLink: 'https://meet.google.com/abc-defg-hij',
    notesUrl: '/uploads/mock-notes-1.pdf',
  },
  {
    // Future class without notes (no download button).
    _id: 'lv-2',
    course: { _id: COURSE_2._id, title: COURSE_2.title },
    topic: 'Python Pandas Lab',
    date: daysFromNow(5, 10),
    meetLink: 'https://meet.google.com/klm-nopq-rst',
  },
  {
    // Past class with notes.
    _id: 'lv-3',
    course: { _id: COURSE_1._id, title: COURSE_1.title },
    topic: 'State Management Patterns',
    date: daysFromNow(-3, 9),
    meetLink: 'https://meet.google.com/uvw-xyza-bcd',
    notesUrl: '/uploads/mock-notes-2.pdf',
  },
  {
    // course as id-string.
    _id: 'lv-4',
    course: COURSE_4._id,
    topic: 'Wireframing Workshop',
    date: daysFromNow(-7, 15),
    meetLink: 'https://meet.google.com/efg-hijk-lmn',
  },
  {
    // Missing course + missing date (legacy startTime alias).
    _id: 'lv-5',
    topic: 'Orientation Session',
    startTime: daysFromNow(4, 11),
    meetLink: 'https://meet.google.com/opq-rstu-vwx',
    notesUrl: '/uploads/mock-notes-3.pdf',
  },
];

// ------------------------------------------------------------- announcements
export const announcements = [
  {
    // Course-scoped.
    _id: 'ann-1',
    course: { _id: COURSE_1._id, title: COURSE_1.title },
    title: 'Week 3 materials now available',
    message: 'Slides and recorded notes for the Hooks in Depth session are live.',
    createdAt: daysFromNow(-1),
  },
  {
    // Global.
    _id: 'ann-2',
    course: null,
    title: 'New courses added',
    message: 'Two new live programs have been added to the catalog.',
    createdAt: hoursFromNow(-3),
  },
  {
    _id: 'ann-3',
    course: { _id: COURSE_2._id, title: COURSE_2.title },
    title: 'Assignment deadline extended',
    message: 'The Data Cleaning Exercise deadline has been pushed by 2 days.',
    createdAt: daysFromNow(-2),
  },
];

// ------------------------------------------------------------- students
export const students = [
  { ...STUDENT_A, status: 'active' },
  { ...STUDENT_B, status: 'inactive' },
];

// ------------------------------------------------------------- notifications
export const notifications = [
  {
    _id: 'ntf-1',
    title: 'Payment approved',
    message: 'Your enrollment for React Mastery Live Cohort is active.',
    createdAt: hoursFromNow(-1),
    isRead: false,
  },
  {
    _id: 'ntf-2',
    title: 'New assignment',
    message: 'Build a Todo App with Hooks is due soon.',
    createdAt: daysFromNow(-2),
    isRead: true,
  },
  {
    _id: 'ntf-3',
    title: 'Live class scheduled',
    message: 'React Hooks Deep Dive starts tomorrow at 6 PM.',
    createdAt: hoursFromNow(-5),
    isRead: false,
  },
];

// ------------------------------------------------------------- student activity
export const studentActivity = {
  student: { ...STUDENT_A, status: 'active' },
  enrollments: [
    {
      // Assignment field is an object in this view.
      _id: 'enr-1',
      course: { _id: COURSE_1._id, title: COURSE_1.title },
      paymentId: { ...PAY_1, transactionId: 'TX-2026-0001' },
      accessGranted: true,
      createdAt: daysFromNow(-1),
    },
    {
      _id: 'enr-3',
      course: { _id: COURSE_3._id, title: COURSE_3.title },
      paymentId: { ...PAY_3, transactionId: 'TX-2026-0003' },
      accessGranted: false,
      createdAt: daysFromNow(-3),
    },
  ],
  submissions: [
    {
      _id: 'sub-1-1',
      assignment: { _id: 'ass-1-1', title: 'Build a Todo App with Hooks' },
      submissionText: 'Submitted my todo app with localStorage persistence.',
      grade: 'A',
      feedback: 'Clean code and great persistence handling.',
    },
    {
      _id: 'sub-1-3',
      assignment: { _id: 'ass-1-1', title: 'Build a Todo App with Hooks' },
      submissionText: 'Attached File Only',
    },
  ],
};

// ------------------------------------------------------------- empty states
export const emptyCourses = [];
export const emptyCategories = [];
export const emptyPayments = [];
export const emptyClasses = [];
export const emptyAnnouncements = [];
export const emptyStudents = [];
export const emptyEnrollments = [];
export const emptyNotifications = [];
export const emptyModulesByCourse = {};
export const emptyAssignmentsByCourse = {};
export const emptySubmissionsByCourse = {};
export const emptyStudentActivity = { student: null, enrollments: [], submissions: [] };