/**
 * Tutoriaa - Modern Interactive Web App Logic
 * Enhanced with Live Tuition Job Board (Location Radius, Advanced Filters, Detailed Job Drawer)
 */

// ==========================================================================
// CombinedTuition - Premium Site Loading Animation System Controller
// ==========================================================================
(function initSitePreloader() {
  function startPreloader() {
    const preloader = document.getElementById("sitePreloader");
    if (!preloader) return;

    const bar = document.getElementById("preloaderBar");
    const pctText = document.getElementById("preloaderPct");
    const statusText = document.getElementById("preloaderStatusText");

    let currentPct = 0;
    let isDone = false;
    const startTime = Date.now();

    const statusMessages = [
      "Connecting to academic network...",
      "Verifying top educator credentials...",
      "Synchronizing tuition requirements...",
      "Welcome to CombinedTuition!"
    ];

    function setProgress(val) {
      currentPct = Math.min(100, Math.max(currentPct, Math.round(val)));
      if (bar) bar.style.width = currentPct + "%";
      if (pctText) pctText.textContent = currentPct + "%";

      if (statusText) {
        if (currentPct < 35) {
          statusText.textContent = statusMessages[0];
        } else if (currentPct < 70) {
          statusText.textContent = statusMessages[1];
        } else if (currentPct < 95) {
          statusText.textContent = statusMessages[2];
        } else {
          statusText.textContent = statusMessages[3];
        }
      }
    }

    // Smooth simulated progression while page resources load
    const timer = setInterval(() => {
      if (isDone) return;
      if (currentPct < 35) {
        setProgress(currentPct + Math.random() * 12 + 6);
      } else if (currentPct < 75) {
        setProgress(currentPct + Math.random() * 8 + 3);
      } else if (currentPct < 90) {
        setProgress(currentPct + Math.random() * 3 + 1);
      }
    }, 60);

    function finishLoading() {
      if (isDone) return;
      isDone = true;
      clearInterval(timer);

      setProgress(100);

      const elapsed = Date.now() - startTime;
      const minDisplayTime = 750; // ensure smooth visible presentation
      const delay = Math.max(0, minDisplayTime - elapsed);

      setTimeout(() => {
        preloader.classList.add("preloader-hidden");
        setTimeout(() => {
          preloader.style.display = "none";
        }, 550);
      }, delay);
    }

    if (document.readyState === "complete") {
      setTimeout(finishLoading, 400);
    } else {
      window.addEventListener("load", finishLoading);
      // Failsafe timeout so it never hangs
      setTimeout(finishLoading, 2000);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startPreloader);
  } else {
    startPreloader();
  }
})();

// ==========================================================================
// Mock Database: Tutors, Jobs & Testimonials
// ==========================================================================
const TUTORS_DATA = [
  {
    id: 1,
    name: "Tanvir Hasan",
    institution: "BUET (Computer Science & Engineering)",
    rating: "4.95",
    reviewsCount: 38,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250",
    location: "Dhanmondi, Dhaka",
    subjects: ["Higher Math", "Physics", "ICT"],
    classes: ["SSC", "HSC", "English Medium"],
    rate: "৳ 8,000",
    rateType: "/ month (3 days/wk)",
    bio: "Passionate educator with 4+ years tutoring experience. Specialized in calculus, mechanics, and making complex math intuitive."
  },
  {
    id: 2,
    name: "Nusrat Jahan",
    institution: "Dhaka Medical College (MBBS)",
    rating: "4.92",
    reviewsCount: 42,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=250",
    location: "Gulshan / Banani, Dhaka",
    subjects: ["Biology", "Chemistry"],
    classes: ["HSC", "English Medium", "Admission"],
    rate: "৳ 10,000",
    rateType: "/ month (4 days/wk)",
    bio: "Top medical student focusing on concept clearance for Botany, Zoology, and Organic Chemistry with comprehensive chapter-wise notes."
  },
  {
    id: 3,
    name: "Abrar Chowdhury",
    institution: "IBA, University of Dhaka",
    rating: "4.88",
    reviewsCount: 29,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250",
    location: "Uttara, Dhaka",
    subjects: ["English", "Accounting"],
    classes: ["Class 6-8", "SSC", "English Medium"],
    rate: "৳ 7,500",
    rateType: "/ month (3 days/wk)",
    bio: "Expert mentor for O/A Level English Language & Literature, Business Studies, and communication fundamentals."
  },
  {
    id: 4,
    name: "Sabrina Rahman",
    institution: "University of Dhaka (Applied Chemistry)",
    rating: "4.90",
    reviewsCount: 31,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=250",
    location: "Mirpur, Dhaka",
    subjects: ["Chemistry", "General Science"],
    classes: ["Class 6-8", "SSC", "HSC"],
    rate: "৳ 6,500",
    rateType: "/ month (3 days/wk)",
    bio: "Patient and encouraging teaching approach. Helped over 40+ secondary students achieve GPA-5 in Science disciplines."
  },
  {
    id: 5,
    name: "Fahim Shahriar",
    institution: "CUET (Mechanical Engineering)",
    rating: "4.85",
    reviewsCount: 22,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250",
    location: "Chattogram",
    subjects: ["Math", "Physics"],
    classes: ["SSC", "HSC"],
    rate: "৳ 6,000",
    rateType: "/ month (3 days/wk)",
    bio: "Engineering graduate with real-world problem solving approach for academic physics equations and mathematical reasoning."
  },
  {
    id: 6,
    name: "Tahmina Akhter",
    institution: "North South University (BBA)",
    rating: "4.97",
    reviewsCount: 54,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=250",
    location: "Bashundhara R/A, Dhaka",
    subjects: ["All Subjects (Primary)", "English"],
    classes: ["Class 1-5", "Class 6-8"],
    rate: "৳ 8,500",
    rateType: "/ month (4 days/wk)",
    bio: "Specialized in early childhood care and primary education (Class 1-5). Creates fun, engaging worksheets and daily routine plans."
  },
  {
    id: 7,
    name: "Dr. Sadman Hafiz",
    institution: "Dhaka Medical College (MBBS)",
    rating: "4.98",
    reviewsCount: 46,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=250",
    location: "Dhanmondi, Dhaka",
    subjects: ["Biology", "Chemistry", "Medical Admission"],
    classes: ["HSC", "Admission", "SSC"],
    rate: "৳ 12,000",
    rateType: "/ month (4 days/wk)",
    bio: "Medical graduate preparing students for National Medical entrance exams with chapter-wise MCQs and quick memory techniques."
  },
  {
    id: 8,
    name: "Anika Tabassum",
    institution: "BRAC University (CSE)",
    rating: "4.91",
    reviewsCount: 35,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250",
    location: "Mohakhali / Banani, Dhaka",
    subjects: ["ICT", "Physics", "General Science"],
    classes: ["Class 6-8", "SSC", "HSC"],
    rate: "৳ 8,500",
    rateType: "/ month (3 days/wk)",
    bio: "Specialized in HSC ICT C-programming, HTML, database logic, and English Medium junior science."
  },
  {
    id: 9,
    name: "Zawad Al Mahi",
    institution: "BUET (Civil Engineering)",
    rating: "4.96",
    reviewsCount: 52,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=250",
    location: "Palashi / Dhanmondi, Dhaka",
    subjects: ["Higher Math", "Physics", "Mechanics"],
    classes: ["SSC", "HSC", "Admission"],
    rate: "৳ 11,000",
    rateType: "/ month (4 days/wk)",
    bio: "BUET top ranker passionate about conceptual clarity for HSC and Engineering Admission Physics & Higher Math."
  },
  {
    id: 10,
    name: "Noshin Sharmily",
    institution: "Independent University Bangladesh (Pharmacy)",
    rating: "4.95",
    reviewsCount: 39,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=250",
    location: "Bashundhara R/A, Dhaka",
    subjects: ["Chemistry", "Biology", "General Science"],
    classes: ["Class 6-8", "O Level", "HSC"],
    rate: "৳ 9,000",
    rateType: "/ month (3 days/wk)",
    bio: "Experienced tutor for Cambridge O-Level Chemistry & Biology. Interactive worksheets and weekly revision sessions."
  },
  {
    id: 11,
    name: "Mahmudul Hasan",
    institution: "IUT (Electrical Engineering)",
    rating: "4.94",
    reviewsCount: 40,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250",
    location: "Uttara / Gazipur, Dhaka",
    subjects: ["Higher Math", "Physics", "Electronics"],
    classes: ["SSC", "HSC", "A Level"],
    rate: "৳ 9,500",
    rateType: "/ month (3 days/wk)",
    bio: "Engineering scholar dedicated to building strong mathematical foundation and problem solving speed for exams."
  },
  {
    id: 12,
    name: "Fariha Tasnim",
    institution: "Jahangirnagar University (Biotechnology)",
    rating: "4.93",
    reviewsCount: 33,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=250",
    location: "Mirpur, Dhaka",
    subjects: ["Biology", "Chemistry", "General Science"],
    classes: ["Class 6-8", "SSC", "HSC"],
    rate: "৳ 7,500",
    rateType: "/ month (3 days/wk)",
    bio: "Focuses on diagrammatic representation, botany taxonomy, and organic chemical reaction mechanisms."
  }
];

// Rich Tuition Jobs Database (Modeled closely on Tutoriaa Tuitions Search Feed)
const JOBS_DATABASE = [
  {
    id: "TJ-8921",
    title: "Tutor needed for Class 9 student (English Version)",
    type: "Home Tuition",
    area: "Dhanmondi",
    location: "Road 15/A, Dhanmondi, Dhaka",
    distanceKm: 1.2,
    curriculum: "English Version",
    classGrade: "Class 9-10",
    subjects: "Higher Math, Physics & Chemistry",
    days: "3 days/week",
    salaryAmount: 8500,
    salaryFormatted: "৳ 8,500 / month",
    gender: "Male Preferred",
    numStudents: "1 Student (Male)",
    isUrgent: true,
    postedTime: "2 hours ago",
    requirements: [
      "BUET, DU or reputable engineering university background preferred",
      "Must have strong command over NCTB English Version syllabus",
      "Ability to conduct weekly chapter-end tests and provide feedback"
    ],
    notes: "Student is preparing for upcoming Mid-term examinations. Punctuality and clear communication with guardian required."
  },
  {
    id: "TJ-8922",
    title: "Cambridge O-Level Physics & Chemistry Tutor needed",
    type: "Home Tuition",
    area: "Uttara",
    location: "Sector 4, Uttara, Dhaka",
    distanceKm: 3.8,
    curriculum: "English Medium",
    classGrade: "O Level",
    subjects: "Physics (5054) & Chemistry (5070)",
    days: "4 days/week",
    salaryAmount: 13000,
    salaryFormatted: "৳ 13,000 / month",
    gender: "Female Preferred",
    numStudents: "1 Student (Female)",
    isUrgent: true,
    postedTime: "3 hours ago",
    requirements: [
      "Prior experience teaching Cambridge or Edexcel curriculum required",
      "Complete past paper solution guidance (minimum 5 years)",
      "Good accent and fluent English communication skills"
    ],
    notes: "Appearing for May/June examination series. Looking for an experienced mentor for dedicated revision."
  },
  {
    id: "TJ-8923",
    title: "HSC 1st Year Higher Mathematics & ICT Instructor",
    type: "Home Tuition",
    area: "Mirpur",
    location: "Mirpur 10 (Near Metro Pillar 240), Dhaka",
    distanceKm: 2.4,
    curriculum: "Bangla Medium",
    classGrade: "HSC",
    subjects: "Higher Math & ICT",
    days: "3 days/week",
    salaryAmount: 7500,
    salaryFormatted: "৳ 7,500 / month",
    gender: "Any",
    numStudents: "1 Student (Male)",
    isUrgent: false,
    postedTime: "5 hours ago",
    requirements: [
      "Science background from Public University (DU, BUET, Jahangirnagar)",
      "Focus on Calculus, Matrix, and Vector fundamentals",
      "Regular doubt clearing sessions before college term tests"
    ],
    notes: "Student is studying at Dhaka City College. Home is right beside the metro station."
  },
  {
    id: "TJ-8924",
    title: "Class 4 English Medium (All Subjects) Comprehensive Tutor",
    type: "Home Tuition",
    area: "Gulshan",
    location: "Gulshan 2 (Near Lake Park), Dhaka",
    distanceKm: 4.1,
    curriculum: "English Medium",
    classGrade: "Class 1-5",
    subjects: "English, Math, Science & Social Studies",
    days: "5 days/week",
    salaryAmount: 11000,
    salaryFormatted: "৳ 11,000 / month",
    gender: "Female Preferred",
    numStudents: "1 Student (Girl)",
    isUrgent: false,
    postedTime: "1 day ago",
    requirements: [
      "Patient, caring tutor with experience in junior grades",
      "Help with daily school homework and reading fluency",
      "Creative activities and handwriting improvement"
    ],
    notes: "Student studies at Scholastica. Family prefers an NSU/IUB/DU female tutor."
  },
  {
    id: "TJ-8925",
    title: "University Medical Admission Test (Biology & Chemistry)",
    type: "Home Tuition",
    area: "Mohammadpur",
    location: "Salimullah Road, Mohammadpur, Dhaka",
    distanceKm: 1.8,
    curriculum: "Bangla Medium",
    classGrade: "Admission",
    subjects: "Biology (Botany/Zoology) & Chemistry",
    days: "4 days/week",
    salaryAmount: 12000,
    salaryFormatted: "৳ 12,000 / month",
    gender: "Any",
    numStudents: "1 Student",
    isUrgent: true,
    postedTime: "1 day ago",
    requirements: [
      "Currently studying at DMC, SSMC or top public Medical College",
      "Mastery in GK, Medical question patterns, and memorization hacks",
      "Strict routine and daily MCQ evaluation tests"
    ],
    notes: "Aiming for National Medical Admission. 3 months intensive crash preparation."
  },
  {
    id: "TJ-8926",
    title: "Class 7 English Version General Science & Mathematics",
    type: "Home Tuition",
    area: "Bashundhara",
    location: "Block D, Bashundhara R/A, Dhaka",
    distanceKm: 5.2,
    curriculum: "English Version",
    classGrade: "Class 6-8",
    subjects: "General Math & Science",
    days: "3 days/week",
    salaryAmount: 7000,
    salaryFormatted: "৳ 7,000 / month",
    gender: "Male Preferred",
    numStudents: "1 Student (Boy)",
    isUrgent: false,
    postedTime: "2 days ago",
    requirements: [
      "NSU / AIUB / IUB Science or Engineering student preferred",
      "Friendly guidance to build confidence in math basics"
    ],
    notes: "Safe residential location, 2 minutes from North South University gate."
  },
  {
    id: "TJ-8927",
    title: "Edexcel A-Level Pure Mathematics (P1, P2, P3, M1) Mentor",
    type: "Online",
    area: "Dhanmondi",
    location: "Online / Remote (Zoom & Digital Tablet)",
    distanceKm: 0.5,
    curriculum: "English Medium",
    classGrade: "A Level",
    subjects: "Pure Math & Mechanics",
    days: "3 days/week",
    salaryAmount: 15000,
    salaryFormatted: "৳ 15,000 / month",
    gender: "Any",
    numStudents: "1 Candidate",
    isUrgent: true,
    postedTime: "2 days ago",
    requirements: [
      "Must have obtained grade A* in A-Level Mathematics",
      "Equipped with digital writing tablet for smooth online teaching",
      "Extensive past paper review with examiner tips"
    ],
    notes: "High salary for certified top-tier mentor. Flexible evening time slots available."
  },
  {
    id: "TJ-8928",
    title: "Part-time Physics Teacher for Reputed Coaching Center",
    type: "Institutional",
    area: "Lalmatia",
    location: "Block B, Lalmatia, Dhaka",
    distanceKm: 1.5,
    curriculum: "Bangla Medium",
    classGrade: "Class 9-10",
    subjects: "Physics (SSC Batches)",
    days: "3 days/week (Afternoon)",
    salaryAmount: 16000,
    salaryFormatted: "৳ 16,000 / month",
    gender: "Any",
    numStudents: "Batch (15 students)",
    isUrgent: false,
    postedTime: "3 days ago",
    requirements: [
      "Experienced batch lecturer with dynamic whiteboard presentation",
      "Ability to engage students and maintain disciplinary standards",
      "Graduates from BUET or DU Physics department preferred"
    ],
    notes: "Institutional role with opportunity for extension to HSC batches."
  },
  {
    id: "TJ-8929",
    title: "Cambridge A-Level Chemistry (Unit 4 & 5) Tutor needed",
    type: "Home Tuition",
    area: "Gulshan",
    location: "Road 71, Gulshan 2, Dhaka",
    distanceKm: 3.2,
    curriculum: "English Medium",
    classGrade: "A Level",
    subjects: "Chemistry (9701)",
    days: "4 days/week",
    salaryAmount: 16000,
    salaryFormatted: "৳ 16,000 / month",
    gender: "Female Preferred",
    numStudents: "1 Candidate (Female)",
    isUrgent: true,
    postedTime: "1 hour ago",
    requirements: [
      "Top grade in A-Level Chemistry (Edexcel / Cambridge)",
      "Focus on Organic synthesis and Electrochemistry numericals",
      "Regular exam style topic questions practice"
    ],
    notes: "Candidate aims for A* in upcoming A2 exams. Family provides comfortable study environment."
  },
  {
    id: "TJ-8930",
    title: "Class 8 English Version General Science & ICT Tutor",
    type: "Home Tuition",
    area: "Dhanmondi",
    location: "Road 27 (Old), Dhanmondi, Dhaka",
    distanceKm: 0.8,
    curriculum: "English Version",
    classGrade: "Class 6-8",
    subjects: "General Science, ICT & Mathematics",
    days: "3 days/week",
    salaryAmount: 7500,
    salaryFormatted: "৳ 7,500 / month",
    gender: "Male Preferred",
    numStudents: "1 Student",
    isUrgent: false,
    postedTime: "4 hours ago",
    requirements: [
      "BUET, DU or NSU student preferred",
      "Must ensure thorough practice of NCTB textbook exercises"
    ],
    notes: "Convenient location near Dhanmondi 27 bridge."
  },
  {
    id: "TJ-8931",
    title: "HSC 2nd Year Higher Math & Physics Crash Course",
    type: "Home Tuition",
    area: "Mohammadpur",
    location: "Tajmahal Road, Mohammadpur, Dhaka",
    distanceKm: 1.6,
    curriculum: "Bangla Medium",
    classGrade: "HSC",
    subjects: "Higher Math (Integral Calculus) & Physics 2nd Paper",
    days: "4 days/week",
    salaryAmount: 9500,
    salaryFormatted: "৳ 9,500 / month",
    gender: "Any",
    numStudents: "1 Student (Male)",
    isUrgent: true,
    postedTime: "5 hours ago",
    requirements: [
      "Strong command over HSC Physics & Math CQ / MCQ short techniques",
      "Daily 15-minute evaluation test before lecture"
    ],
    notes: "Preparing for college pre-test exams. Immediate start required."
  },
  {
    id: "TJ-8932",
    title: "Class 3 English Medium All Subjects & Reading Tutor",
    type: "Home Tuition",
    area: "Bashundhara",
    location: "Block C, Bashundhara R/A, Dhaka",
    distanceKm: 4.8,
    curriculum: "English Medium",
    classGrade: "Class 1-5",
    subjects: "English, Math, Science & Reading Fluency",
    days: "5 days/week",
    salaryAmount: 10000,
    salaryFormatted: "৳ 10,000 / month",
    gender: "Female Preferred",
    numStudents: "1 Student (Girl)",
    isUrgent: false,
    postedTime: "6 hours ago",
    requirements: [
      "Patient female tutor from NSU / IUB / DU",
      "Focus on phonics, spelling, and basic arithmetic"
    ],
    notes: "Student attends International School Dhaka (ISD)."
  },
  {
    id: "TJ-8933",
    title: "BUET & Public Engineering University Admission Mentor",
    type: "Home Tuition",
    area: "Lalmatia",
    location: "Block D, Lalmatia, Dhaka",
    distanceKm: 1.1,
    curriculum: "Bangla Medium",
    classGrade: "Admission",
    subjects: "Physics, Chemistry & Higher Mathematics (Written)",
    days: "4 days/week",
    salaryAmount: 14000,
    salaryFormatted: "৳ 14,000 / month",
    gender: "Male Preferred",
    numStudents: "1 Aspirant",
    isUrgent: true,
    postedTime: "12 hours ago",
    requirements: [
      "Currently studying at BUET (Top 500 merit rank)",
      "Proven track record of mentoring engineering aspirants",
      "In-depth breakdown of past 15 years BUET written questions"
    ],
    notes: "Intensive 2.5 months preparation for upcoming BUET preliminary & written exams."
  },
  {
    id: "TJ-8934",
    title: "O-Level Edexcel Economics & Accounting Tutor needed",
    type: "Online",
    area: "Uttara",
    location: "Online / Remote Class (Zoom)",
    distanceKm: 0.2,
    curriculum: "English Medium",
    classGrade: "O Level",
    subjects: "Economics (4EC1) & Accounting (4AC1)",
    days: "3 days/week",
    salaryAmount: 12500,
    salaryFormatted: "৳ 12,500 / month",
    gender: "Any",
    numStudents: "1 Candidate",
    isUrgent: false,
    postedTime: "1 day ago",
    requirements: [
      "Grade A* achieved in Edexcel IGCSE Economics & Accounting",
      "Structured notes and specimen paper solved examples"
    ],
    notes: "Remote online tuition with flexible evening timings."
  },
  {
    id: "TJ-8935",
    title: "Class 10 SSC Bangla Medium Physics & Chemistry Tutor",
    type: "Home Tuition",
    area: "Mirpur",
    location: "Mirpur 2 (Near Stadium), Dhaka",
    distanceKm: 2.1,
    curriculum: "Bangla Medium",
    classGrade: "Class 9-10",
    subjects: "Physics & Chemistry",
    days: "3 days/week",
    salaryAmount: 8000,
    salaryFormatted: "৳ 8,000 / month",
    gender: "Any",
    numStudents: "1 Student",
    isUrgent: false,
    postedTime: "1 day ago",
    requirements: [
      "Graduate or undergraduate student from Science discipline",
      "Focus on board question solving and practical concepts"
    ],
    notes: "Student is preparing for SSC Test Examinations."
  },
  {
    id: "TJ-8936",
    title: "Holy Quran Recitation & Tajweed Home Tutor",
    type: "Home Tuition",
    area: "Lalmatia",
    location: "Block E, Lalmatia, Dhaka",
    distanceKm: 0.9,
    curriculum: "Madrasa",
    classGrade: "Class 1-5",
    subjects: "Quran Recitation with Tajweed & Basic Ampara",
    days: "4 days/week",
    salaryAmount: 6000,
    salaryFormatted: "৳ 6,000 / month",
    gender: "Female Preferred",
    numStudents: "2 Children (Girl & Boy)",
    isUrgent: false,
    postedTime: "2 days ago",
    requirements: [
      "Certified Qaria or Hafeza with proper Tajweed pronunciation",
      "Gentle and polite teaching demeanor for young learners"
    ],
    notes: "Morning or early afternoon time slot after school hours."
  }
];

const TESTIMONIALS_DATA = [
  {
    text: "A very good platform to get tuition jobs since it's hard to find genuine guardians on your own. People working here are supportive and polite.",
    name: "Bipasha Khan",
    role: "Tutor",
    avatarBg: "#8b5cf6",
    initials: "BK"
  },
  {
    text: "আমার ছেলের জন্য টিউটোরিয়া থেকে খুব সহজেই একজন ভালো টিউটর পেয়েছি। পুরো প্রক্রিয়াটি ছিল দ্রুত, সহজ এবং ঝামেলামুক্ত—মাত্র কয়েকটি ক্লিকেই উপযুক্ত টিউটর পেয়েছি।",
    name: "Mobarok Hossain",
    role: "Parent",
    avatarBg: "#10b981",
    initials: "MH"
  },
  {
    text: "Reliable, safe, polite, friendly and most importantly matches the perfect pairs of teacher and student.",
    name: "Ismail Ahmmed Chisty",
    role: "Tutor",
    avatarBg: "#3b82f6",
    initials: "IC"
  },
  {
    text: "জাপানে বসেই আমার ছোট বোনের জন্য Tutoriaa-এর মাধ্যমে টিউটর পেয়েছি। আলহামদুলিল্লাহ, সেবায় আমি খুবই সন্তুষ্ট।",
    name: "Iftekhar I Asif",
    role: "Guardian (Abroad)",
    avatarBg: "#ec4899",
    initials: "IA"
  },
  {
    text: "Tutoria is currently one of the finest platforms to find tuitions. Policy is both transparent and fair for both parties.",
    name: "Qazi Fahad Ahmed",
    role: "Tutor",
    avatarBg: "#f97316",
    initials: "QF"
  },
  {
    text: "Great arrangement. Thank you for the smooth service—I'm really satisfied with the BUET tutor assigned for my daughter.",
    name: "Sohel Farid",
    role: "Parent",
    avatarBg: "#6366f1",
    initials: "SF"
  },
  {
    text: "It is always hard for university freshmen to find tuition from reliable sources, but TUTORIAA is the place where you can put your trust.",
    name: "Abdullah Al Mamun",
    role: "Tutor",
    avatarBg: "#14b8a6",
    initials: "AM"
  },
  {
    text: "আমি আমার আত্মীয়-স্বজনদের জন্য টিউটোরিয়া থেকে একাধিকবার টিউটর নিয়েছি। আলহামদুলিল্লাহ, তাদের সেবায় আমি অত্যন্ত সন্তুষ্ট !",
    name: "Hasan Shariful Islam",
    role: "Parent",
    avatarBg: "#06b6d4",
    initials: "HI"
  }
];

// ==========================================================================
// Job Board Filter State
// ==========================================================================
let currentJobFilters = {
  keyword: "",
  area: "all",
  radius: "3", // default 3 km (matches tutoriaa search default)
  sort: "newest",
  jobType: "all",
  medium: "all",
  classGrade: "all",
  gender: "all",
  salary: "all"
};

let currentTutorRequest = {
  phone: "",
  name: "",
  location: "",
  requirement: ""
};

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Render Core Data
  renderTutors(TUTORS_DATA);
  renderJobBoard();
  renderSpotlightJobs();
  renderTestimonialMarquee();

  // Setup Listeners
  setupNavigation();
  setupSearchFilter();
  setupJobBoardFilters();
  setupTutorRequestModal();
  setupHeroButtonsWithLoading();
  setupLoginModal();
  setupAllPasswordToggles();
  setupJobDetailModal();
  setupCounterAnimations();

  const yearEl = document.getElementById("currentYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// Export SPA Lifecycle Hooks
window.renderJobBoard = renderJobBoard;
window.setupJobBoard = function () {
  renderJobBoard();
  setupJobBoardFilters();
};
window.setupJobDetailModal = setupJobDetailModal;
window.setupHowItWorksPage = setupHowItWorksPage;
window.setupBecomeTutorPage = setupBecomeTutorPage;
window.setupCounterAnimations = setupCounterAnimations;
window.renderTutors = renderTutors;
window.renderSpotlightJobs = renderSpotlightJobs;


// ==========================================================================
// Job Board Engine (Search, Radius, Multi-Filter)
// ==========================================================================
function renderJobBoard() {
  const container = document.getElementById("jobCardsStream");
  const countBadge = document.getElementById("jobResultsCount");
  if (!container) return;

  // Filter Jobs
  const filtered = JOBS_DATABASE.filter(job => {
    // 1. Keyword search (title, subjects, notes)
    if (currentJobFilters.keyword) {
      const q = currentJobFilters.keyword.toLowerCase();
      const matchText = (job.title + " " + job.subjects + " " + job.notes + " " + job.location).toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    // 2. Area chip
    if (currentJobFilters.area !== "all") {
      if (!job.area.toLowerCase().includes(currentJobFilters.area.toLowerCase()) &&
        !job.location.toLowerCase().includes(currentJobFilters.area.toLowerCase())) {
        return false;
      }
    }

    // 3. Distance Radius
    if (currentJobFilters.radius !== "all") {
      const maxRadius = parseFloat(currentJobFilters.radius);
      if (job.distanceKm > maxRadius) return false;
    }

    // 4. Job Type
    if (currentJobFilters.jobType !== "all") {
      if (job.type !== currentJobFilters.jobType) return false;
    }

    // 5. Curriculum / Medium
    if (currentJobFilters.medium !== "all") {
      if (!job.curriculum.toLowerCase().includes(currentJobFilters.medium.toLowerCase())) return false;
    }

    // 6. Class / Grade
    if (currentJobFilters.classGrade !== "all") {
      if (!job.classGrade.toLowerCase().includes(currentJobFilters.classGrade.toLowerCase())) return false;
    }

    // 7. Tutor Gender
    if (currentJobFilters.gender !== "all") {
      if (!job.gender.toLowerCase().includes(currentJobFilters.gender.toLowerCase()) && job.gender !== "Any") {
        return false;
      }
    }

    // 8. Salary Range
    if (currentJobFilters.salary !== "all") {
      if (currentJobFilters.salary === "under-6000" && job.salaryAmount > 6000) return false;
      if (currentJobFilters.salary === "6000-9000" && (job.salaryAmount < 6000 || job.salaryAmount > 9000)) return false;
      if (currentJobFilters.salary === "9000-12000" && (job.salaryAmount < 9000 || job.salaryAmount > 12000)) return false;
      if (currentJobFilters.salary === "12000-plus" && job.salaryAmount < 12000) return false;
    }

    return true;
  });

  // Sort Jobs
  if (currentJobFilters.sort === "salary-high") {
    filtered.sort((a, b) => b.salaryAmount - a.salaryAmount);
  } else if (currentJobFilters.sort === "nearest") {
    filtered.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  // Update Status Text
  if (countBadge) {
    countBadge.textContent = `${filtered.length} Tuition Jobs found matching your radius and criteria`;
  }

  // Handle Empty State
  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="background: var(--white); border-radius: var(--radius-xl); border: 1px dashed var(--slate-300); padding: 3.5rem 1.5rem; text-align: center;">
        <div style="width: 3.5rem; height: 3.5rem; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">
          <i data-lucide="compass" style="width: 1.75rem; height: 1.75rem;"></i>
        </div>
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--slate-800); margin-bottom: 0.5rem;">No tuition posts found in this distance radius</h3>
        <p style="color: var(--slate-500); max-width: 420px; margin: 0 auto 1.5rem; font-size: 0.9rem;">Try increasing your distance radius to 5 km or 10 km, or clear some filter options.</p>
        <button class="btn btn-primary" onclick="resetJobBoardFilters()">Reset Filters to Default</button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // Render Job Stream Cards
  container.innerHTML = filtered.map(job => `
    <article class="job-stream-card">
      <div class="job-card-top-bar">
        <div class="job-badges-group">
          <span class="job-id-pill">${job.id}</span>
          ${job.isUrgent ? `<span class="badge-urgent"><i data-lucide="zap"></i> Urgent</span>` : ''}
          <span class="spec-chip highlight-indigo">${job.type}</span>
        </div>
        <span class="job-posted-time">Posted ${job.postedTime}</span>
      </div>

      <h3 class="job-stream-title" onclick="openJobDetailModal('${job.id}')">${job.title}</h3>

      <div class="job-location-distance">
        <i data-lucide="map-pin"></i>
        <span>${job.location}</span>
        <span class="distance-tag">${job.distanceKm} km away</span>
      </div>

      <div class="job-specs-chips">
        <span class="spec-chip"><i data-lucide="book-open"></i> ${job.curriculum}</span>
        <span class="spec-chip"><i data-lucide="calendar"></i> ${job.days}</span>
        <span class="spec-chip"><i data-lucide="user-check"></i> ${job.gender}</span>
        <span class="spec-chip highlight-emerald"><i data-lucide="banknote"></i> ${job.salaryFormatted}</span>
      </div>

      <p class="job-requirement-text">
        <strong>Requirement:</strong> ${job.requirements.join(' • ')}
      </p>

      <div class="job-card-bottom">
        <div class="job-salary-container">
          <span class="salary-label">Monthly Remuneration</span>
          <span class="salary-value">${job.salaryFormatted}</span>
        </div>
        <div class="job-card-actions">
          <button class="btn btn-secondary" onclick="openJobDetailModal('${job.id}')">
            <span>View Details</span>
          </button>
          <button class="btn btn-primary" onclick="quickApplyJob('${job.id}', '${escapeQuotes(job.title)}')">
            <span>Apply Now</span>
            <i data-lucide="arrow-right" class="btn-icon"></i>
          </button>
        </div>
      </div>
    </article>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

function renderSpotlightJobs() {
  const container = document.getElementById("spotlightJobsGrid");
  if (!container) return;

  const topJobs = JOBS_DATABASE.slice(0, 3);
  container.innerHTML = topJobs.map(job => `
    <article class="job-stream-card">
      <div class="job-card-top-bar">
        <div class="job-badges-group">
          <span class="job-id-pill">${job.id}</span>
          ${job.isUrgent ? `<span class="badge-urgent"><i data-lucide="zap"></i> Urgent</span>` : ''}
          <span class="spec-chip highlight-indigo">${job.type}</span>
        </div>
        <span class="job-posted-time">${job.postedTime}</span>
      </div>

      <h3 class="job-stream-title" onclick="if(window.spaNavigate){window.spaNavigate('jobs.html');}else{window.location.href='jobs.html';}">${job.title}</h3>

      <div class="job-location-distance">
        <i data-lucide="map-pin"></i>
        <span>${job.location}</span>
        <span class="distance-tag">${job.distanceKm} km</span>
      </div>

      <div class="job-specs-chips">
        <span class="spec-chip"><i data-lucide="book-open"></i> ${job.curriculum}</span>
        <span class="spec-chip"><i data-lucide="calendar"></i> ${job.days}</span>
        <span class="spec-chip highlight-emerald"><i data-lucide="banknote"></i> ${job.salaryFormatted}</span>
      </div>

      <div class="job-card-bottom">
        <div class="job-salary-container">
          <span class="salary-label">Remuneration</span>
          <span class="salary-value">${job.salaryFormatted}</span>
        </div>
        <div class="job-card-actions">
          <a href="jobs.html" class="btn btn-secondary">
            <span>View on Job Board</span>
            <i data-lucide="arrow-right" class="btn-icon"></i>
          </a>
        </div>
      </div>
    </article>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

function setupJobBoardFilters() {
  // Area Chips
  const chipButtons = document.querySelectorAll(".chip-btn");
  chipButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      chipButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentJobFilters.area = btn.getAttribute("data-area");
      window.applyJobBoardSearchAndFilters();
    });
  });

  // Keyword Search
  const searchInput = document.getElementById("jobSearchInput");
  const clearBtn = document.getElementById("clearJobSearchBtn");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentJobFilters.keyword = e.target.value.trim();
      if (clearBtn) {
        clearBtn.classList.toggle("hidden", !currentJobFilters.keyword);
      }
      window.applyJobBoardSearchAndFilters();
    });
  }
  if (clearBtn && searchInput) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      currentJobFilters.keyword = "";
      clearBtn.classList.add("hidden");
      window.applyJobBoardSearchAndFilters();
    });
  }

  // Radius Select
  const radiusSelect = document.getElementById("distanceRadiusSelect");
  if (radiusSelect) {
    radiusSelect.addEventListener("change", (e) => {
      currentJobFilters.radius = e.target.value;
      window.applyJobBoardSearchAndFilters();
      showToast(`Filter set to within ${e.target.value === 'all' ? 'any distance' : e.target.value + ' km'}`);
    });
  }

  // Sort Select
  const sortSelect = document.getElementById("jobSortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentJobFilters.sort = e.target.value;
      window.applyJobBoardSearchAndFilters();
    });
  }

  // Job Type Radio
  const radioJobTypes = document.querySelectorAll("input[name='filterJobType']");
  radioJobTypes.forEach(radio => {
    radio.addEventListener("change", (e) => {
      currentJobFilters.jobType = e.target.value;
      window.applyJobBoardSearchAndFilters();
    });
  });

  // Medium Select
  const mediumSelect = document.getElementById("filterMediumSelect");
  if (mediumSelect) {
    mediumSelect.addEventListener("change", (e) => {
      currentJobFilters.medium = e.target.value;
      window.applyJobBoardSearchAndFilters();
    });
  }

  // Class Select
  const classSelect = document.getElementById("filterClassSelect");
  if (classSelect) {
    classSelect.addEventListener("change", (e) => {
      currentJobFilters.classGrade = e.target.value;
      window.applyJobBoardSearchAndFilters();
    });
  }

  // Gender Select
  const genderSelect = document.getElementById("filterGenderSelect");
  if (genderSelect) {
    genderSelect.addEventListener("change", (e) => {
      currentJobFilters.gender = e.target.value;
      window.applyJobBoardSearchAndFilters();
    });
  }

  // Salary Chips
  const salaryChips = document.querySelectorAll(".salary-chip");
  salaryChips.forEach(chip => {
    chip.addEventListener("click", () => {
      salaryChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentJobFilters.salary = chip.getAttribute("data-salary");
      window.applyJobBoardSearchAndFilters();
    });
  });

  // Reset Filters Button
  const resetBtn = document.getElementById("jobResetFiltersBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetJobBoardFilters);
  }

  // Post Tuition Request Button
  const postBtn = document.getElementById("postTuitionJobBtn");
  if (postBtn) {
    postBtn.addEventListener("click", () => {
      openTutorModal("Guardian Tuition Posting: Need a tutor");
    });
  }

  // Instant Alerts Button
  const alertsBtn = document.getElementById("subscribeAlertsBtn");
  if (alertsBtn) {
    alertsBtn.addEventListener("click", () => {
      openTutorModal("Instant Tuition Alert Subscription for Dhaka area");
    });
  }
}

window.resetJobBoardFilters = function () {
  currentJobFilters = {
    keyword: "",
    area: "all",
    radius: "all",
    sort: "newest",
    jobType: "all",
    medium: "all",
    classGrade: "all",
    gender: "all",
    salary: "all"
  };

  const searchInput = document.getElementById("jobSearchInput");
  if (searchInput) searchInput.value = "";

  const radiusSelect = document.getElementById("distanceRadiusSelect");
  if (radiusSelect) radiusSelect.value = "all";

  const sortSelect = document.getElementById("jobSortSelect");
  if (sortSelect) sortSelect.value = "newest";

  const mediumSelect = document.getElementById("filterMediumSelect");
  if (mediumSelect) mediumSelect.value = "all";

  const classSelect = document.getElementById("filterClassSelect");
  if (classSelect) classSelect.value = "all";

  const genderSelect = document.getElementById("filterGenderSelect");
  if (genderSelect) genderSelect.value = "all";

  document.querySelectorAll(".chip-btn").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-area") === "all");
  });

  document.querySelectorAll("input[name='filterJobType']").forEach(r => {
    r.checked = r.value === "all";
  });

  document.querySelectorAll(".salary-chip").forEach(c => {
    c.classList.toggle("active", c.getAttribute("data-salary") === "all");
  });

  renderJobBoard();
  showToast("Tuition filters reset.");
};

// ==========================================================================
// Job Detail Modal Logic
// ==========================================================================
function setupJobDetailModal() {
  const modal = document.getElementById("jobDetailModal");
  const backdrop = document.getElementById("jobDetailBackdrop");
  const closeBtn = document.getElementById("jobDetailCloseBtn");

  function closeJobModal() {
    if (modal) modal.classList.add("hidden");
  }

  if (backdrop) backdrop.addEventListener("click", closeJobModal);
  if (closeBtn) closeBtn.addEventListener("click", closeJobModal);
}

window.openJobDetailModal = function (jobId) {
  const job = JOBS_DATABASE.find(j => j.id === jobId);
  if (!job) return;

  const modal = document.getElementById("jobDetailModal");
  const titleEl = document.getElementById("modalJobTitle");
  const idEl = document.getElementById("modalJobId");
  const bodyEl = document.getElementById("jobDetailBody");

  if (!modal || !bodyEl) return;

  if (titleEl) titleEl.textContent = job.title;
  if (idEl) idEl.textContent = job.id;

  bodyEl.innerHTML = `
    <!-- Key Specifications Grid -->
    <div class="detail-specs-grid">
      <div class="detail-spec-item">
        <h5>Salary Remuneration</h5>
        <p style="color: var(--primary); font-size: 1.15rem;">${job.salaryFormatted}</p>
      </div>
      <div class="detail-spec-item">
        <h5>Location & Distance</h5>
        <p>${job.location} (${job.distanceKm} km away)</p>
      </div>
      <div class="detail-spec-item">
        <h5>Schedule / Days</h5>
        <p>${job.days}</p>
      </div>
      <div class="detail-spec-item">
        <h5>Curriculum / Medium</h5>
        <p>${job.curriculum}</p>
      </div>
      <div class="detail-spec-item">
        <h5>Class & Grade</h5>
        <p>${job.classGrade}</p>
      </div>
      <div class="detail-spec-item">
        <h5>Tutor Preference</h5>
        <p>${job.gender}</p>
      </div>
    </div>

    <!-- Subjects & Topics -->
    <div class="detail-section-block">
      <h4>Subjects & Focus Areas</h4>
      <p><strong>${job.subjects}</strong></p>
    </div>

    <!-- Requirements List -->
    <div class="detail-section-block">
      <h4>Requirements & Qualifications</h4>
      <ul>
        ${job.requirements.map(req => `<li>${req}</li>`).join('')}
      </ul>
    </div>

    <!-- Special Notes from Guardian -->
    <div class="detail-section-block">
      <h4>Special Notes from Guardian</h4>
      <p style="background: var(--slate-50); padding: 0.85rem 1rem; border-radius: var(--radius-md); border-left: 3px solid var(--primary);">${job.notes}</p>
    </div>

    <!-- Coordinator Direct Help -->
    <div class="detail-coordinator-box">
      <div class="coordinator-left">
        <div class="coordinator-icon"><i data-lucide="phone-call"></i></div>
        <div>
          <span style="font-size: 0.75rem; color: var(--slate-500); font-weight: 700; text-transform: uppercase;">Coordinator Direct Line</span>
          <div class="coordinator-phone">+88 01711 032847</div>
        </div>
      </div>
      <a href="tel:01711032847" class="btn btn-secondary btn-sm">
        <i data-lucide="phone"></i>
        <span>Call Now</span>
      </a>
    </div>

    <!-- Action Buttons -->
    <div class="detail-modal-actions">
      <button class="btn btn-secondary flex-1" onclick="shareJob('${job.id}', '${escapeQuotes(job.title)}')">
        <i data-lucide="share-2"></i>
        <span>Share Job</span>
      </button>
      <button class="btn btn-primary flex-1" onclick="applyFromDetail('${job.id}', '${escapeQuotes(job.title)}')">
        <i data-lucide="check-circle-2"></i>
        <span>Apply for this Job</span>
      </button>
    </div>
  `;

  modal.classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();
};

window.quickApplyJob = function (jobId, jobTitle) {
  openTutorModal(`Direct Application for Tuition Job ${jobId}: ${jobTitle}`);
};

window.applyFromDetail = function (jobId, jobTitle) {
  const detailModal = document.getElementById("jobDetailModal");
  if (detailModal) detailModal.classList.add("hidden");
  openTutorModal(`Application for Tuition Job ${jobId}: ${jobTitle}`);
};

window.shareJob = function (jobId, jobTitle) {
  const url = window.location.origin + "#job-" + jobId;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
    showToast(`Tuition job link copied to clipboard!`);
  } else {
    showToast(`Share Job ${jobId}: ${jobTitle}`);
  }
};

function escapeQuotes(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ==========================================================================
// Tutors Rendering
// ==========================================================================
function renderTutors(tutors) {
  const container = document.getElementById("tutorsGrid");
  if (!container) return;

  container.innerHTML = tutors.map(tutor => `
    <div class="tutor-card">
      <div class="tutor-card-top">
        <div class="tutor-avatar-wrap">
          <img src="${tutor.avatar}" alt="${tutor.name}" class="tutor-avatar" />
          <span class="tutor-badge-verified" title="Identity & Academics Verified">
            <i data-lucide="check"></i>
          </span>
        </div>
        <div class="tutor-info">
          <h3>${tutor.name}</h3>
          <p class="tutor-institution">${tutor.institution}</p>
          <div class="tutor-meta-row">
            <span class="tutor-rating">
              <i data-lucide="star"></i>
              <span>${tutor.rating}</span>
            </span>
            <span>•</span>
            <span>${tutor.reviewsCount} reviews</span>
            <span>•</span>
            <span>${tutor.location}</span>
          </div>
        </div>
      </div>

      <div class="tutor-tags">
        ${tutor.subjects.map(sub => `<span class="tag-pill">${sub}</span>`).join('')}
        ${tutor.classes.map(cls => `<span class="tag-pill" style="background: var(--primary-light); color: var(--primary);">${cls}</span>`).join('')}
      </div>

      <p class="tutor-bio">${tutor.bio}</p>

      <div class="tutor-card-footer">
        <div class="tutor-price-box">
          <div class="price-amount">${tutor.rate}</div>
          <div class="price-unit">${tutor.rateType}</div>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-primary request-direct-tutor-btn" onclick="openDirectTutorModal(${tutor.id}, '${tutor.name.replace(/'/g, "\\'")}', '${tutor.institution.replace(/'/g, "\\'")}', '${tutor.avatar}')" style="box-shadow: 0 2px 8px rgba(37,99,235,0.25);">
            <i data-lucide="send" class="btn-icon" style="width: 14px; height: 14px;"></i>
            <span>Direct Request</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

// ==========================================================================
// Navigation & Mobile Drawer
// ==========================================================================
function setupNavigation() {
  const toggleBtn = document.getElementById("mobileMenuToggle");
  const drawer = document.getElementById("mobileDrawer");

  if (toggleBtn && drawer) {
    const handleToggle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = drawer.classList.toggle("active");
      toggleBtn.classList.toggle("active", isOpen);
      toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");

      const openIcon = document.getElementById("menuOpenIcon");
      const closeIcon = document.getElementById("menuCloseIcon");
      if (openIcon && closeIcon) {
        openIcon.classList.toggle("hidden", isOpen);
        closeIcon.classList.toggle("hidden", !isOpen);
      }
    };

    toggleBtn.addEventListener("click", handleToggle);

    // Auto-close mobile drawer when clicking any nav item
    drawer.querySelectorAll(".mobile-nav-item, .btn").forEach(item => {
      item.addEventListener("click", () => {
        drawer.classList.remove("active");
        toggleBtn.classList.remove("active");
        toggleBtn.setAttribute("aria-expanded", "false");
        const openIcon = document.getElementById("menuOpenIcon");
        const closeIcon = document.getElementById("menuCloseIcon");
        if (openIcon && closeIcon) {
          openIcon.classList.remove("hidden");
          closeIcon.classList.add("hidden");
        }
      });
    });

    // Close drawer when clicking outside
    document.addEventListener("click", (e) => {
      if (drawer.classList.contains("active") && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
        drawer.classList.remove("active");
        toggleBtn.classList.remove("active");
        toggleBtn.setAttribute("aria-expanded", "false");
        const openIcon = document.getElementById("menuOpenIcon");
        const closeIcon = document.getElementById("menuCloseIcon");
        if (openIcon && closeIcon) {
          openIcon.classList.remove("hidden");
          closeIcon.classList.add("hidden");
        }
      }
    });

    // Close drawer on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("active")) {
        drawer.classList.remove("active");
        toggleBtn.classList.remove("active");
        toggleBtn.setAttribute("aria-expanded", "false");
        const openIcon = document.getElementById("menuOpenIcon");
        const closeIcon = document.getElementById("menuCloseIcon");
        if (openIcon && closeIcon) {
          openIcon.classList.remove("hidden");
          closeIcon.classList.add("hidden");
        }
        toggleBtn.focus();
      }
    });
  }

  const tutorBtns = [
    document.getElementById("openTutorRegisterBtn"),
    document.getElementById("footerTutorLink")
  ];

  tutorBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openTutorModal();
      });
    }
  });
}

// ==========================================================================
// Hero Search & Filter
// ==========================================================================
function setupSearchFilter() {
  const filterBtn = document.getElementById("filterSubmitBtn");
  const subjectSelect = document.getElementById("subjectSelect");
  const classSelect = document.getElementById("classSelect");
  const locationSelect = document.getElementById("locationSelect");

  if (!filterBtn) return;

  filterBtn.addEventListener("click", () => {
    const subject = subjectSelect ? subjectSelect.value : "all";
    const grade = classSelect ? classSelect.value : "all";
    const loc = locationSelect ? locationSelect.value : "all";

    const currentTutors = (window.TUTORS_DATA && window.TUTORS_DATA.length > 0) ? window.TUTORS_DATA : TUTORS_DATA;
    const filtered = currentTutors.filter(tutor => {
      const matchSubject = subject === "all" || tutor.subjects.some(s => s.toLowerCase().includes(subject.toLowerCase()));
      const matchGrade = grade === "all" || tutor.classes.includes(grade);
      const matchLoc = loc === "all" || tutor.location.toLowerCase().includes(loc.toLowerCase()) || loc === "Online";
      return matchSubject && matchGrade && matchLoc;
    });

    renderTutors(filtered);

    const section = document.getElementById("tutors-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }

    showToast(`Found ${filtered.length} matching tutor profiles.`);
  });
}

// ==========================================================================
// Testimonials Marquee
// ==========================================================================
function renderTestimonialMarquee() {
  const track1 = document.getElementById("marqueeTrack1");
  const track2 = document.getElementById("marqueeTrack2");
  if (!track1 || !track2) return;

  const cardHtml = (item) => `
    <div class="review-card">
      <div class="review-stars">
        <i data-lucide="star"></i>
        <i data-lucide="star"></i>
        <i data-lucide="star"></i>
        <i data-lucide="star"></i>
        <i data-lucide="star"></i>
      </div>
      <p class="review-quote">"${item.text}"</p>
      <div class="review-author">
        <div class="author-avatar" style="background-color: ${item.avatarBg}">
          ${item.initials}
        </div>
        <div>
          <h4 class="author-name">${item.name}</h4>
          <p class="author-role">${item.role}</p>
        </div>
      </div>
    </div>
  `;

  const row1Data = [...TESTIMONIALS_DATA.slice(0, 4), ...TESTIMONIALS_DATA.slice(0, 4), ...TESTIMONIALS_DATA.slice(0, 4)];
  const row2Data = [...TESTIMONIALS_DATA.slice(4, 8), ...TESTIMONIALS_DATA.slice(4, 8), ...TESTIMONIALS_DATA.slice(4, 8)];

  track1.innerHTML = row1Data.map(cardHtml).join('');
  track2.innerHTML = row2Data.map(cardHtml).join('');

  if (window.lucide) window.lucide.createIcons();
}

// ==========================================================================
// 2-Step Tutor Request Modal (Tutoriaa Style)
// ==========================================================================
function setupTutorRequestModal() {
  const modal = document.getElementById("tutorRequestModal");
  const backdrop = document.getElementById("modalBackdrop");
  const closeBtn = document.getElementById("modalCloseBtn");
  const successCloseBtn = document.getElementById("successCloseBtn");

  const step1Form = document.getElementById("step1Form");
  const step2Form = document.getElementById("step2Form");
  const successScreen = document.getElementById("modalSuccessScreen");

  const phoneInput = document.getElementById("phoneInput");
  const phoneError = document.getElementById("phoneError");

  const nameInput = document.getElementById("nameInput");
  const locInput = document.getElementById("modalLocationInput");
  const reqInput = document.getElementById("requirementInput");
  const step2BackBtn = document.getElementById("step2BackBtn");

  const pill1 = document.getElementById("stepPill1");
  const pill2 = document.getElementById("stepPill2");
  const stepIndicator = document.getElementById("stepIndicator");

  const openButtons = [
    document.getElementById("processFindTutorBtn"),
    document.getElementById("dualFindTutorBtn"),
    document.getElementById("bannerCtaBtn"),
    document.getElementById("postTuitionNavBtn"),
    document.getElementById("bottomPostTuitionBtn")
  ];

  openButtons.forEach(btn => {
    if (btn) {
      btn.addEventListener("click", () => openTutorModal());
    }
  });

  const dualBecomeTutorBtn = document.getElementById("dualBecomeTutorBtn");
  if (dualBecomeTutorBtn) {
    dualBecomeTutorBtn.addEventListener("click", () => {
      if (typeof window.spaNavigate === 'function') {
        window.spaNavigate("become-a-tutor.html");
      } else {
        window.location.href = "become-a-tutor.html";
      }
    });
  }

  window.openTutorModal = function (prefillRequirement = "") {
    if (!modal) return;
    modal.classList.remove("hidden");
    resetModalForms();
    // Default text deleted per user instruction: all textfields remain empty
    setTimeout(() => {
      if (phoneInput) phoneInput.focus();
    }, 100);
  };

  function closeModal() {
    if (modal) modal.classList.add("hidden");
  }

  if (backdrop) backdrop.addEventListener("click", closeModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (successCloseBtn) successCloseBtn.addEventListener("click", closeModal);

  if (step1Form) {
    step1Form.addEventListener("submit", (e) => {
      e.preventDefault();
      const phoneVal = phoneInput ? phoneInput.value.trim() : "";

      if (phoneVal.length < 8) {
        if (phoneError) phoneError.classList.remove("hidden");
        return;
      }
      if (phoneError) phoneError.classList.add("hidden");

      currentTutorRequest.phone = phoneVal;

      step1Form.classList.add("hidden");
      step2Form.classList.remove("hidden");
      if (pill2) pill2.classList.add("active");
      if (pill1) pill1.classList.remove("active");

      setTimeout(() => {
        if (nameInput) nameInput.focus();
      }, 100);
    });
  }

  if (step2BackBtn) {
    step2BackBtn.addEventListener("click", () => {
      step2Form.classList.add("hidden");
      step1Form.classList.remove("hidden");
      if (pill1) pill1.classList.add("active");
      if (pill2) pill2.classList.remove("active");
    });
  }

  // Direct tutor targeting helpers
  window.targetTutor = null;
  window.openDirectTutorModal = function (tutorId, tutorName, institution, avatar) {
    window.targetTutor = { id: tutorId, name: tutorName, institution: institution, avatar: avatar };
    const banner = document.getElementById("targetTutorDirectAlert");
    const nameEl = document.getElementById("targetTutorNameTitle");
    const instEl = document.getElementById("targetTutorInstSub");
    const avatarEl = document.getElementById("targetTutorAvatar");

    if (banner) banner.classList.remove("hidden");
    if (nameEl) nameEl.textContent = `Direct Request: ${tutorName}`;
    if (instEl) instEl.textContent = `Routed automatically to ${tutorName} (${institution})`;
    if (avatarEl && avatar) avatarEl.src = avatar;

    openTutorModal();
  };

  const clearTargetBtn = document.getElementById("clearTargetTutorBtn");
  if (clearTargetBtn) {
    clearTargetBtn.addEventListener("click", () => {
      window.targetTutor = null;
      const banner = document.getElementById("targetTutorDirectAlert");
      if (banner) banner.classList.add("hidden");
    });
  }

  if (step2Form) {
    step2Form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nameVal = nameInput ? nameInput.value.trim() : "";
      const locVal = locInput ? locInput.value.trim() : "";
      const reqVal = reqInput ? reqInput.value.trim() : "";
      const classVal = document.getElementById("modalClassInput") ? document.getElementById("modalClassInput").value.trim() : "Class 9-10";
      const mediumVal = document.getElementById("modalMediumInput") ? document.getElementById("modalMediumInput").value : "English Medium";
      const budgetVal = document.getElementById("modalBudgetInput") ? document.getElementById("modalBudgetInput").value.trim() : "৳ 8,000 - 10,000";

      if (!nameVal || !locVal || !reqVal) return;

      const submitBtn = document.getElementById("step2SubmitBtn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i data-lucide="loader-2" class="animate-spin btn-icon"></i> Routing Request...`;
        if (window.lucide) window.lucide.createIcons();
      }

      const token = localStorage.getItem("auth_token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const payload = {
        guardian_name: nameVal,
        guardian_phone: currentTutorRequest.phone || (phoneInput ? phoneInput.value.trim() : ""),
        guardian_email: (getStoredUser() && getStoredUser().email) || "",
        student_class: classVal || "Class 9-10",
        medium: mediumVal,
        subjects: reqVal,
        location: locVal,
        budget: budgetVal || "৳ 8,000 - 10,000",
        target_tutor_id: window.targetTutor ? window.targetTutor.id : null,
        notes: reqVal
      };

      try {
        const response = await fetch("/api/applications/submit", {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.success) {
          step2Form.classList.add("hidden");
          if (stepIndicator) stepIndicator.classList.add("hidden");
          if (successScreen) successScreen.classList.remove("hidden");

          const successNameEl = document.getElementById("successName");
          const successPhoneEl = document.getElementById("successPhone");
          if (successNameEl) successNameEl.textContent = nameVal;
          if (successPhoneEl) successPhoneEl.textContent = payload.guardian_phone;

          const successSubEl = successScreen.querySelector(".success-sub");
          if (successSubEl && result.application) {
            const isDirect = result.route && result.route.routed_to === 'tutor';
            const targetName = window.targetTutor ? window.targetTutor.name : "Assigned Tutor";
            successSubEl.innerHTML = isDirect
              ? `<span style="color:#059669; font-weight:700;">Directly routed to ${targetName}'s dashboard!</span><br/>Tracking ID: <strong>${result.application.application_code}</strong>. Real-time alert dispatched to tutor & admin.`
              : `<span style="color:#2563eb; font-weight:700;">Routed to CombinedTution Central Admin Desk!</span><br/>Tracking ID: <strong>${result.application.application_code}</strong>. Academic coordinators will match the best mentor.`;
          }

          showToast(result.message || "Application routed successfully!");
          window.targetTutor = null;
          const banner = document.getElementById("targetTutorDirectAlert");
          if (banner) banner.classList.add("hidden");

          // Auto refresh dashboard if open
          if (typeof window.loadTutorDashboard === 'function') window.loadTutorDashboard();
          if (typeof window.loadAdminDashboard === 'function') window.loadAdminDashboard();
        } else {
          alert(result.error || "Failed to submit application");
        }
      } catch (err) {
        console.error("Submission failed:", err);
        showToast("Error routing application. Please check connection.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Submit Request</span><i data-lucide="check" class="btn-icon"></i>`;
          if (window.lucide) window.lucide.createIcons();
        }
      }
    });
  }

  function resetModalForms() {
    if (step1Form) step1Form.classList.remove("hidden");
    if (step2Form) step2Form.classList.add("hidden");
    if (successScreen) successScreen.classList.add("hidden");
    if (stepIndicator) stepIndicator.classList.remove("hidden");
    if (pill1) pill1.classList.add("active");
    if (pill2) pill2.classList.remove("active");
    if (phoneInput) phoneInput.value = "";
    if (nameInput) nameInput.value = "";
    if (locInput) locInput.value = "";
    if (reqInput) reqInput.value = "";
    if (phoneError) phoneError.classList.add("hidden");
  }
}

// ==========================================================================
// Hero Section Interactive Button Loading & Random Matching System
// ==========================================================================
function setupHeroButtonsWithLoading() {
  const findTutorBtn = document.getElementById("heroFindTutorBtn");
  const browseTutorsBtn = document.getElementById("heroBrowseTutorsBtn");
  const randomTutorBtn = document.getElementById("heroRandomTutorBtn");

  function triggerButtonLoading(btn, loadingText, duration, callback) {
    if (!btn || btn.classList.contains("is-loading")) return;
    const originalHTML = btn.innerHTML;
    btn.classList.add("is-loading");
    btn.innerHTML = `<span class="btn-spinner"></span><span>${loadingText}</span>`;

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove("is-loading");
      if (window.lucide) window.lucide.createIcons();
      if (typeof callback === "function") callback();
    }, duration);
  }

  // 1. "Find a Tutor" button with loading option
  if (findTutorBtn) {
    findTutorBtn.addEventListener("click", (e) => {
      e.preventDefault();
      triggerButtonLoading(findTutorBtn, "Connecting with mentors...", 650, () => {
        if (typeof window.openTutorModal === "function") {
          window.openTutorModal();
        }
      });
    });
  }

  // 2. "Browse Tutors" button with loading option
  if (browseTutorsBtn) {
    browseTutorsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      triggerButtonLoading(browseTutorsBtn, "Loading Verified Tutors...", 500, () => {
        const target = document.getElementById("tutors-section");
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  }

  // 3. "Random Tutor Match" button with loading option
  if (randomTutorBtn) {
    randomTutorBtn.addEventListener("click", (e) => {
      e.preventDefault();
      triggerButtonLoading(randomTutorBtn, "Matching Top Verified Mentor...", 750, () => {
        if (Array.isArray(TUTORS_DATA) && TUTORS_DATA.length > 0) {
          const randomIndex = Math.floor(Math.random() * TUTORS_DATA.length);
          const chosenTutor = TUTORS_DATA[randomIndex];

          showToast(`🎯 Random Match: ${chosenTutor.name} (${chosenTutor.institution})`);

          // Scroll smoothly to tutors section
          const tutorsSec = document.getElementById("tutors-section");
          if (tutorsSec) {
            tutorsSec.scrollIntoView({ behavior: "smooth" });
          }

          // Open the tutor detail modal
          setTimeout(() => {
            if (typeof openTutorDetailModal === "function") {
              openTutorDetailModal(chosenTutor);
            }
          }, 450);
        }
      });
    });
  }
}

// ==========================================================================
// Dedicated Login Modal Handler
// ==========================================================================
function setupLoginModal() {
  const modal = document.getElementById("loginModal");
  if (!modal) return;

  const closeBtn = document.getElementById("loginModalCloseBtn");
  const backdrop = document.getElementById("loginModalBackdrop");
  const form = document.getElementById("modalLoginForm");
  const identifierInput = document.getElementById("modalLoginIdentifier");
  const passwordInput = document.getElementById("modalLoginPassword");
  const togglePasswordBtn = document.getElementById("toggleModalPasswordBtn");
  const rememberCheckbox = document.getElementById("modalLoginRemember");
  const submitBtn = document.getElementById("modalLoginSubmitBtn");
  const errorBox = document.getElementById("modalLoginError");
  const errorText = document.getElementById("modalLoginErrorText");
  const googleBtn = document.getElementById("modalGoogleLoginBtn");

  window.openLoginModal = function () {
    modal.classList.remove("hidden");
    if (errorBox) errorBox.classList.add("hidden");
    setTimeout(() => {
      if (identifierInput) identifierInput.focus();
    }, 100);
    if (window.lucide) window.lucide.createIcons();
  };

  window.closeLoginModal = function () {
    modal.classList.add("hidden");
    if (form) form.reset();
    if (errorBox) errorBox.classList.add("hidden");
    if (passwordInput && passwordInput.type !== "password") {
      passwordInput.type = "password";
      if (togglePasswordBtn) {
        const eyeIcon = togglePasswordBtn.querySelector(".eye-icon");
        const eyeOffIcon = togglePasswordBtn.querySelector(".eye-off-icon");
        if (eyeIcon) eyeIcon.classList.remove("hidden");
        if (eyeOffIcon) eyeOffIcon.classList.add("hidden");
        togglePasswordBtn.setAttribute("aria-label", "Show password");
        togglePasswordBtn.setAttribute("title", "Show password");
      }
    }
  };

  if (closeBtn) closeBtn.addEventListener("click", window.closeLoginModal);
  if (backdrop) backdrop.addEventListener("click", window.closeLoginModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      window.closeLoginModal();
    }
  });

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (errorBox) errorBox.classList.add("hidden");

      const identifier = identifierInput ? identifierInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value.trim() : "";
      const remember = rememberCheckbox ? rememberCheckbox.checked : true;

      if (!identifier || !password) {
        if (errorBox && errorText) {
          errorText.textContent = "Please enter both Email/Phone number and Password.";
          errorBox.classList.remove("hidden");
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Signing in...</span>`;
      }

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, email: identifier, password, remember })
        });

        const data = await res.json();

        if (!res.ok) {
          if (errorBox && errorText) {
            errorText.textContent = data.error || "Invalid credentials. Please try again.";
            errorBox.classList.remove("hidden");
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>LOGIN</span>`;
          }
          return;
        }

        if (data.token) {
          localStorage.setItem("auth_token", data.token);
        }
        if (data.user) {
          localStorage.setItem("tutoriaa_user", JSON.stringify(data.user));
          localStorage.setItem("combine_currentUser", JSON.stringify(data.user));
        }

        showToast(`Welcome back, ${data.user.name}!`);
        window.closeLoginModal();
        updateAuthNavbar();
        if (data.user && data.user.role === 'tutor' && typeof window.spaNavigate === 'function') {
          window.spaNavigate('tutor-dashboard.html');
        } else if (data.user && data.user.role === 'admin' && typeof window.spaNavigate === 'function') {
          window.spaNavigate('admin-dashboard.html');
        }

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>LOGIN</span>`;
        }
      } catch (err) {
        if (errorBox && errorText) {
          errorText.textContent = "Network error: Unable to reach authentication server.";
          errorBox.classList.remove("hidden");
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>LOGIN</span>`;
        }
      }
    });
  }

  if (googleBtn) {
    googleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof window.openGoogleAuthModal === "function") {
        window.openGoogleAuthModal({ role: "guardian" });
      }
    });
  }
}

// ==========================================================================
// Universal Password Visibility Toggle Handler
// ==========================================================================
function setupAllPasswordToggles() {
  document.querySelectorAll(".password-toggle-btn").forEach((btn) => {
    if (btn.dataset.toggleBound === "true") return;
    btn.dataset.toggleBound = "true";

    const targetId = btn.getAttribute("data-target");
    let input = targetId ? document.getElementById(targetId) : null;
    if (!input) {
      const container = btn.closest(".password-input-wrap") || btn.parentElement;
      if (container) {
        input = container.querySelector('input[type="password"], input[type="text"]');
      }
    }
    if (!input) return;

    const eyeIcon = btn.querySelector(".eye-icon");
    const eyeOffIcon = btn.querySelector(".eye-off-icon");

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isVisible = input.type === "text";
      input.type = isVisible ? "password" : "text";

      if (eyeIcon && eyeOffIcon) {
        if (isVisible) {
          eyeIcon.classList.remove("hidden");
          eyeOffIcon.classList.add("hidden");
        } else {
          eyeIcon.classList.add("hidden");
          eyeOffIcon.classList.remove("hidden");
        }
      }
      btn.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
      btn.setAttribute("title", isVisible ? "Show password" : "Hide password");
      input.focus();
    });
  });
}
window.setupAllPasswordToggles = setupAllPasswordToggles;

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupAllPasswordToggles);
  } else {
    setupAllPasswordToggles();
  }
}

// ==========================================================================
// Guardian & Student Account Registration & Verification System
// ==========================================================================
function getStoredUser() {
  try {
    const data = localStorage.getItem("tutoriaa_user") || localStorage.getItem("combine_currentUser");
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

function setStoredUser(user) {
  try {
    localStorage.setItem("tutoriaa_user", JSON.stringify(user));
    localStorage.setItem("combine_currentUser", JSON.stringify(user));
  } catch (e) { }
}

function clearStoredUser() {
  try {
    localStorage.removeItem("tutoriaa_user");
    localStorage.removeItem("combine_currentUser");
    localStorage.removeItem("auth_token");
  } catch (e) { }
}

async function syncSessionWithBackend() {
  try {
    const token = localStorage.getItem("auth_token");
    const headers = token ? { "Authorization": `Bearer ${token}` } : {};
    const res = await fetch("/api/auth/me", { headers });
    const data = await res.json();
    if (data.authenticated && data.user) {
      setStoredUser(data.user);
    } else if (token) {
      clearStoredUser();
    }
    updateAuthNavbar();
  } catch (err) {
    // Network or static mode fallback
    updateAuthNavbar();
  }
}

function getInquiriesHistory() {
  try {
    const data = localStorage.getItem("combine_inquiries");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveInquiry(inquiry) {
  const list = getInquiriesHistory();
  list.unshift(inquiry);
  try {
    localStorage.setItem("combine_inquiries", JSON.stringify(list));
  } catch (e) { }
}

window.pendingTutorContact = null;

function ensureGuardianModals() {
  if (document.getElementById("tutorDirectContactModal")) return;

  const modalContainer = document.createElement("div");
  modalContainer.id = "guardianModalsWrapper";
  modalContainer.innerHTML = `
    <!-- Direct Tutor Contact Modal (For Verified/Registered Users) -->
    <div class="modal-overlay hidden" id="tutorDirectContactModal" style="z-index: 10002;">
      <div class="modal-backdrop" id="directContactBackdrop"></div>
      <div class="modal-container">
        <div class="modal-header">
          <div>
            <h3 class="modal-title" id="directContactModalTitle">Contact Tutor</h3>
            <p class="modal-subtitle">Send a direct tuition request to this educator</p>
          </div>
          <button class="modal-close-btn" id="directContactCloseBtn" aria-label="Close modal">
            <i data-lucide="x"></i>
          </button>
        </div>

        <div class="modal-body" style="padding: 1.5rem 1.75rem;">
          <!-- Registered User Verification Pill -->
          <div class="verified-guardian-banner">
            <div class="verified-guardian-info">
              <div class="verified-guardian-avatar" id="directUserInitials">G</div>
              <div>
                <div class="verified-guardian-name" id="directUserDisplayName">Registered Guardian</div>
                <div class="verified-guardian-meta" id="directUserPhoneDisplay">017XXXXXXXX • Verified Account</div>
              </div>
            </div>
            <span class="tutor-badge-verified" title="Registered User" style="position: static; width: 1.5rem; height: 1.5rem;">
              <i data-lucide="check"></i>
            </span>
          </div>

          <!-- Tutor Target Snapshot -->
          <div class="target-tutor-preview">
            <div class="tutor-avatar-wrap" style="width: 2.75rem; height: 2.75rem; flex-shrink: 0; background: var(--primary-light); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <i data-lucide="graduation-cap" style="width: 1.6rem; height: 1.6rem; color: var(--primary);"></i>
            </div>
            <div>
              <h4 id="directTargetTutorName">Tutor Name</h4>
              <p id="directTargetTutorInst">Institution</p>
            </div>
          </div>

          <!-- Contact Form -->
          <form class="modal-form" id="directContactForm">
            <div class="form-group">
              <label for="contactClassSelect" class="form-label">CLASS / CURRICULUM <span class="required-star">*</span></label>
              <select id="contactClassSelect" class="form-input" required>
                <option value="Class 1-5">Primary (Class 1 - 5)</option>
                <option value="Class 6-8">Junior (Class 6 - 8)</option>
                <option value="SSC / Class 9-10" selected>SSC / Class 9-10</option>
                <option value="HSC / College">HSC / College (11-12)</option>
                <option value="O / A Level">O / A Level (Cambridge / Edexcel)</option>
                <option value="University Admission">University Admission Test</option>
              </select>
            </div>

            <div class="form-group">
              <label for="contactSubjectsInput" class="form-label">SUBJECTS NEEDED <span class="required-star">*</span></label>
              <input type="text" id="contactSubjectsInput" class="form-input" placeholder="" required />
            </div>

            <div class="form-group">
              <label for="contactDaysSelect" class="form-label">DAYS PER WEEK <span class="required-star">*</span></label>
              <select id="contactDaysSelect" class="form-input" required>
                <option value="2 days / week">2 days / week</option>
                <option value="3 days / week" selected>3 days / week</option>
                <option value="4 days / week">4 days / week</option>
                <option value="5 days / week">5 days / week</option>
              </select>
            </div>

            <div class="form-group">
              <label for="contactNotesInput" class="form-label">MESSAGE / LEARNING GOALS FOR TUTOR</label>
              <textarea id="contactNotesInput" class="form-textarea" rows="2" placeholder=""></textarea>
            </div>

            <button type="submit" class="btn btn-primary w-full btn-lg" id="directContactSubmitBtn">
              <i data-lucide="send" class="btn-icon"></i>
              <span>Send Contact Request</span>
            </button>
          </form>

          <!-- Success Screen inside Direct Contact Modal -->
          <div class="modal-success hidden" id="directContactSuccess">
            <div class="success-icon-badge">
              <i data-lucide="check"></i>
            </div>
            <h3 class="success-title">Inquiry Sent to Tutor!</h3>
            <p class="success-msg" id="directContactSuccessMsg">
              Your request has been dispatched to the tutor and recorded under your registered account.
            </p>
            <p class="success-sub" id="directContactSuccessSub">
              The tutor and academic support coordinator will reach out to you directly.
            </p>
            <button type="button" class="btn btn-dark w-full mt-6" id="directSuccessCloseBtn">Done</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalContainer);
  setupDirectContactEvents();
  if (window.lucide) window.lucide.createIcons();
}

function setupDirectContactEvents() {
  const closeDirect = () => {
    const m = document.getElementById("tutorDirectContactModal");
    if (m) m.classList.add("hidden");
  };

  const directBackdrop = document.getElementById("directContactBackdrop");
  const directClose = document.getElementById("directContactCloseBtn");
  const directSuccessClose = document.getElementById("directSuccessCloseBtn");
  if (directBackdrop) directBackdrop.addEventListener("click", closeDirect);
  if (directClose) directClose.addEventListener("click", closeDirect);
  if (directSuccessClose) directSuccessClose.addEventListener("click", closeDirect);

  // Handle Direct Contact Form Submit
  const directForm = document.getElementById("directContactForm");
  const directSuccess = document.getElementById("directContactSuccess");
  if (directForm) {
    directForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = getStoredUser();
      const tutorName = document.getElementById("directTargetTutorName")?.textContent || "Tutor";
      const tutorInst = document.getElementById("directTargetTutorInst")?.textContent || "";
      const classGrade = document.getElementById("contactClassSelect")?.value || "SSC";
      const subjects = document.getElementById("contactSubjectsInput")?.value || "All Subjects";
      const days = document.getElementById("contactDaysSelect")?.value || "3 days/week";
      const notes = document.getElementById("contactNotesInput")?.value || "";

      const inquiry = {
        id: "INQ-" + Date.now().toString().slice(-4),
        tutorName,
        tutorInst,
        userName: user ? user.name : "Guardian",
        userPhone: user ? user.phone : "N/A",
        classGrade,
        subjects,
        days,
        notes,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      };

      saveInquiry(inquiry);

      directForm.classList.add("hidden");
      if (directSuccess) {
        directSuccess.classList.remove("hidden");
        const msgEl = document.getElementById("directContactSuccessMsg");
        if (msgEl) {
          msgEl.textContent = `Your request has been dispatched to ${tutorName} and recorded under your registered account (${user ? user.name : ''}).`;
        }
      }

      showToast(`Tuition inquiry sent to ${tutorName}!`);
    });
  }
}

function openDirectContactModal(tutorName, institution, user) {
  ensureGuardianModals();
  const modal = document.getElementById("tutorDirectContactModal");
  if (!modal) return;

  const titleEl = document.getElementById("directContactModalTitle");
  const tutorNameEl = document.getElementById("directTargetTutorName");
  const tutorInstEl = document.getElementById("directTargetTutorInst");
  const nameEl = document.getElementById("directUserDisplayName");
  const phoneEl = document.getElementById("directUserPhoneDisplay");
  const initialEl = document.getElementById("directUserInitials");

  if (titleEl) titleEl.textContent = `Contact ${tutorName}`;
  if (tutorNameEl) tutorNameEl.textContent = tutorName;
  if (tutorInstEl) tutorInstEl.textContent = institution;

  if (user) {
    if (nameEl) nameEl.textContent = user.name;
    const roleText = user.role === "student" ? "Student" : "Guardian";
    if (phoneEl) phoneEl.textContent = `${user.phone} • Verified ${roleText}`;
    if (initialEl) initialEl.textContent = user.name.charAt(0).toUpperCase();
  }

  const directForm = document.getElementById("directContactForm");
  const directSuccess = document.getElementById("directContactSuccess");
  if (directForm) directForm.classList.remove("hidden");
  if (directSuccess) directSuccess.classList.add("hidden");

  modal.classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();
}


function updateAuthNavbar() {
  const user = getStoredUser();
  const loginBtns = [
    document.getElementById("openLoginModalBtn"),
    document.getElementById("mobileLoginBtn")
  ];

  const tutorDashBtn = document.getElementById("navTutorDashBtn");
  const adminDashBtn = document.getElementById("navAdminDashBtn");
  const dashDropdownWrap = document.getElementById("navDashDropdownWrap");
  const mobileTutorDashBtn = document.getElementById("mobileTutorDashBtn");
  const mobileAdminDashBtn = document.getElementById("mobileAdminDashBtn");
  const navProfileBtn = document.getElementById("navProfileBtn");
  const notifWrap = document.getElementById("navNotificationWrap");

  // Helper functions to show or hide navigation items safely
  const showNavEl = (el, displayStyle = "") => {
    if (!el) return;
    el.classList.remove("hidden");
    if (displayStyle) {
      el.style.setProperty("display", displayStyle, "important");
    } else {
      el.style.removeProperty("display");
    }
  };

  const hideNavEl = (el) => {
    if (!el) return;
    el.classList.add("hidden");
    el.style.setProperty("display", "none", "important");
  };

  loginBtns.forEach(btn => {
    if (!btn) return;
    if (user) {
      const firstName = user.name ? user.name.split(" ")[0] : "Account";
      let roleText = "Member";
      const uRole = (user.role || "").toLowerCase().trim();
      if (uRole === "tutor") roleText = "Tutor";
      else if (uRole === "admin") roleText = "Admin";
      else if (uRole === "student") roleText = "Student";
      else if (uRole === "guardian") roleText = "Guardian";

      btn.innerHTML = `
        <i data-lucide="user-check" class="btn-icon"></i>
        <span>${firstName} (${roleText})</span>
      `;
      btn.onclick = (e) => {
        e.preventDefault();
        if (typeof window.openUserProfileModal === "function") {
          window.openUserProfileModal();
        } else {
          window.location.href = "login.html";
        }
      };
    } else {
      btn.innerHTML = `
        <i data-lucide="log-in" class="btn-icon"></i>
        <span>Login</span>
      `;
      btn.onclick = (e) => {
        const loginModal = document.getElementById("loginModal");
        if (loginModal) {
          e.preventDefault();
          if (typeof window.openLoginModal === "function") {
            window.openLoginModal();
          } else {
            loginModal.classList.remove("hidden");
          }
        } else {
          window.location.href = "login.html";
        }
      };
    }
  });

  if (user) {
    if (notifWrap) notifWrap.classList.remove("hidden");
    if (navProfileBtn) navProfileBtn.classList.remove("hidden");

    const currentRole = (user.role || "").toLowerCase().trim();

    if (currentRole === "admin") {
      // When logged in as Admin: desktop shows dropdown system
      hideNavEl(tutorDashBtn);
      hideNavEl(adminDashBtn);
      showNavEl(dashDropdownWrap, "inline-flex");
    } else if (currentRole === "tutor") {
      if (dashDropdownWrap) hideNavEl(dashDropdownWrap);
      showNavEl(tutorDashBtn, "inline-flex");
      hideNavEl(adminDashBtn);
    } else {
      if (dashDropdownWrap) hideNavEl(dashDropdownWrap);
      hideNavEl(tutorDashBtn);
      hideNavEl(adminDashBtn);
    }

    // Always keep Tutor Desk and Admin Hub available on mobile navigation
    showNavEl(mobileTutorDashBtn, "flex");
    showNavEl(mobileAdminDashBtn, "flex");

    setupNotificationSystem();
  } else {
    // Unauthenticated visitors
    if (notifWrap) notifWrap.classList.add("hidden");
    if (navProfileBtn) navProfileBtn.classList.add("hidden");
    if (dashDropdownWrap) hideNavEl(dashDropdownWrap);
    hideNavEl(tutorDashBtn);
    hideNavEl(adminDashBtn);

    // Keep Tutor Desk and Admin Hub easily accessible on mobile devices
    showNavEl(mobileTutorDashBtn, "flex");
    showNavEl(mobileAdminDashBtn, "flex");

    if (window.notificationEventSource) {
      window.notificationEventSource.close();
      window.notificationEventSource = null;
    }
  }

  const regBtn = document.getElementById("mobileRegisterBtn");
  if (regBtn) {
    regBtn.onclick = (e) => {
      e.preventDefault();
      window.location.href = "register.html";
    };
  }

  if (window.lucide) window.lucide.createIcons();
}

window.updateAuthNavbar = updateAuthNavbar;

// Dropdown Toggle and Outside-Click Handler for Admin & Tutor Desks Dropdown
window.toggleNavDashDropdown = function (e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  const wrap = document.getElementById("navDashDropdownWrap");
  if (!wrap) return;
  const isOpen = wrap.classList.contains("open");
  if (isOpen) {
    wrap.classList.remove("open");
    const btn = document.getElementById("navDashDropdownBtn");
    if (btn) btn.setAttribute("aria-expanded", "false");
  } else {
    wrap.classList.add("open");
    const btn = document.getElementById("navDashDropdownBtn");
    if (btn) btn.setAttribute("aria-expanded", "true");
  }
};

document.addEventListener("click", (e) => {
  const wrap = document.getElementById("navDashDropdownWrap");
  if (wrap && wrap.classList.contains("open")) {
    if (!wrap.contains(e.target)) {
      wrap.classList.remove("open");
      const btn = document.getElementById("navDashDropdownBtn");
      if (btn) btn.setAttribute("aria-expanded", "false");
    }
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const wrap = document.getElementById("navDashDropdownWrap");
    if (wrap && wrap.classList.contains("open")) {
      wrap.classList.remove("open");
      const btn = document.getElementById("navDashDropdownBtn");
      if (btn) btn.setAttribute("aria-expanded", "false");
    }
  }
});

window.openContactTutor = function (name, institution) {
  const user = getStoredUser();
  if (!user) {
    window.location.href = "login.html";
  } else {
    openDirectContactModal(name, institution, user);
  }
};

// ==========================================================================
// Counter Animation
// ==========================================================================
function setupCounterAnimations() {
  const statNumbers = document.querySelectorAll(".stat-number");
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach(stat => {
          const target = parseInt(stat.getAttribute("data-target"), 10);
          if (isNaN(target)) return;

          let start = 0;
          const duration = 1600;
          const step = Math.ceil(target / (duration / 25));

          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              start = target;
              clearInterval(timer);
            }
            if (target >= 1000) {
              stat.textContent = `${Math.floor(start / 1000)}k+`;
            } else {
              stat.textContent = start;
            }
          }, 25);
        });
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector(".hero-stats");
  if (statsSection) observer.observe(statsSection);
}

// ==========================================================================
// Toast Notification Utility
// ==========================================================================
function showToast(message) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <i data-lucide="check-circle" style="color: var(--emerald); width: 1.15rem; height: 1.15rem;"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================================================
// How It Works Page Logic
// ==========================================================================
function setupHowItWorksPage() {
  const tabParents = document.getElementById("tabParentsBtn");
  const tabTutors = document.getElementById("tabTutorsBtn");
  const parentsContent = document.getElementById("parentsFlowContent");
  const tutorsContent = document.getElementById("tutorsFlowContent");

  if (tabParents && tabTutors && parentsContent && tutorsContent) {
    tabParents.addEventListener("click", () => {
      tabParents.classList.add("active");
      tabTutors.classList.remove("active");
      tabParents.setAttribute("aria-selected", "true");
      tabTutors.setAttribute("aria-selected", "false");
      parentsContent.classList.remove("hidden");
      tutorsContent.classList.add("hidden");
    });

    tabTutors.addEventListener("click", () => {
      tabTutors.classList.add("active");
      tabParents.classList.remove("active");
      tabTutors.setAttribute("aria-selected", "true");
      tabParents.setAttribute("aria-selected", "false");
      tutorsContent.classList.remove("hidden");
      parentsContent.classList.add("hidden");
    });
  }

  // Setup Accordions
  setupAccordionGroup("faqAccordion");

  const guardianActionBtn = document.getElementById("guardianHireTutorActionBtn");
  if (guardianActionBtn) {
    guardianActionBtn.addEventListener("click", () => {
      openTutorModal("Guardian Request: Need a Tutor Match");
    });
  }

  const ctaPostBtn = document.getElementById("ctaPostTuitionBtn");
  if (ctaPostBtn) {
    ctaPostBtn.addEventListener("click", () => {
      openTutorModal("Guardian / Student: Post Tuition Requirement");
    });
  }
}

// ==========================================================================
// Become a Tutor Page Logic (Earnings Calculator & Quick Application)
// ==========================================================================
function setupBecomeTutorPage() {
  let baseRate = 8000;
  let daysMultiplier = 1.0;
  let daysCount = 3;
  let tuitionCount = 3;

  const levelChips = document.querySelectorAll("#calcLevelChips .calc-chip");
  const daysChips = document.querySelectorAll("#calcDaysChips .calc-chip");
  const rangeInput = document.getElementById("tuitionRangeInput");
  const countDisplay = document.getElementById("tuitionCountVal");
  const earningsDisplay = document.getElementById("calculatedEarningsDisplay");
  const rateDisplay = document.getElementById("ratePerTuitionDisplay");
  const hoursDisplay = document.getElementById("hoursPerWeekDisplay");

  function updateCalculator() {
    const singleTuitionRate = Math.round(baseRate * daysMultiplier);
    const totalEarnings = singleTuitionRate * tuitionCount;
    const weeklyHours = Math.round(daysCount * 1.5 * tuitionCount);

    if (earningsDisplay) {
      earningsDisplay.textContent = `৳ ${totalEarnings.toLocaleString()}`;
    }
    if (rateDisplay) {
      rateDisplay.textContent = `৳ ${singleTuitionRate.toLocaleString()} / mo`;
    }
    if (hoursDisplay) {
      hoursDisplay.textContent = `${weeklyHours} Hours / wk`;
    }
    if (countDisplay) {
      countDisplay.textContent = `${tuitionCount} Tuition${tuitionCount > 1 ? 's' : ''}`;
    }
  }

  if (levelChips.length > 0) {
    levelChips.forEach(chip => {
      chip.addEventListener("click", () => {
        levelChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        baseRate = parseInt(chip.getAttribute("data-rate"), 10) || 8000;
        updateCalculator();
      });
    });
  }

  if (daysChips.length > 0) {
    daysChips.forEach(chip => {
      chip.addEventListener("click", () => {
        daysChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        daysMultiplier = parseFloat(chip.getAttribute("data-multiplier")) || 1.0;
        const text = chip.textContent.trim();
        if (text.includes("2")) daysCount = 2;
        else if (text.includes("3")) daysCount = 3;
        else if (text.includes("4")) daysCount = 4;
        else if (text.includes("5")) daysCount = 5;
        updateCalculator();
      });
    });
  }

  if (rangeInput) {
    rangeInput.addEventListener("input", (e) => {
      tuitionCount = parseInt(e.target.value, 10) || 1;
      updateCalculator();
    });
  }

  // Quick Hero Application Form
  const quickForm = document.getElementById("heroTutorQuickForm");
  if (quickForm) {
    quickForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const phone = document.getElementById("quickTutorPhone") ? document.getElementById("quickTutorPhone").value.trim() : "";
      const univ = document.getElementById("quickTutorUniversity") ? document.getElementById("quickTutorUniversity").value : "";
      const area = document.getElementById("quickTutorArea") ? document.getElementById("quickTutorArea").value.trim() : "";

      if (phone.length < 8) {
        showToast("Please enter a valid 11-digit phone number");
        return;
      }

      openTutorModal(`Tutor Application: ${univ} | Area: ${area} | Phone: ${phone}`);
      showToast("Application submitted! Verify your details in the modal.");
    });
  }

  // Apply buttons on become-a-tutor.html
  const applyButtons = [
    document.getElementById("heroApplyTutorBtn"),
    document.getElementById("calcClaimIncomeBtn"),
    document.getElementById("journeyApplyBtn"),
    document.getElementById("ctaApplyTutorBottomBtn")
  ];

  applyButtons.forEach(btn => {
    if (btn) {
      btn.addEventListener("click", () => {
        openTutorModal("Tutor Application: Joining CombinedTution Verified Network");
      });
    }
  });

  // Setup Accordion for Tutors
  setupAccordionGroup("tutorFaqAccordion");
}

// Utility: Setup Accordion Group
function setupAccordionGroup(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const items = container.querySelectorAll(".accordion-item");
  items.forEach(item => {
    const trigger = item.querySelector(".accordion-trigger");
    if (trigger) {
      trigger.addEventListener("click", () => {
        const isActive = item.classList.contains("active");
        items.forEach(other => {
          other.classList.remove("active");
          const otherTrig = other.querySelector(".accordion-trigger");
          if (otherTrig) otherTrig.setAttribute("aria-expanded", "false");
        });

        if (!isActive) {
          item.classList.add("active");
          trigger.setAttribute("aria-expanded", "true");
        }
      });
    }
  });
}

// ==========================================================================
// Top-Left Brand Logo, 4 Nav Items & Top-Right Navbar Colorful Interactive Particles
// ==========================================================================
function setupBrandLogoAnimations() {
  const interactiveElements = document.querySelectorAll(
    ".brand-logo, .tutoriaa-logo-link, .nav-menu .nav-link, .nav-right #openLoginModalBtn, .nav-right .btn-primary"
  );
  if (!interactiveElements.length) return;

  const sparkleColors = [
    "#ec4899", // Vivid pink
    "#a855f7", // Purple
    "#3b82f6", // Electric blue
    "#06b6d4", // Cyan
    "#10b981", // Emerald
    "#f59e0b"  // Golden amber
  ];

  interactiveElements.forEach(el => {
    let lastSparkle = 0;

    el.addEventListener("mousemove", (e) => {
      const now = Date.now();
      if (now - lastSparkle < 75) return;
      lastSparkle = now;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      createSparkle(el, x, y);
    });

    el.addEventListener("mouseenter", () => {
      const rect = el.getBoundingClientRect();
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const rx = 10 + Math.random() * (rect.width - 20);
          const ry = 10 + Math.random() * (rect.height - 20);
          createSparkle(el, rx, ry);
        }, i * 70);
      }
    });
  });

  function createSparkle(parent, x, y) {
    const sparkle = document.createElement("span");
    sparkle.className = "brand-sparkle";
    const size = Math.floor(4 + Math.random() * 6);
    const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
    const dx = (Math.random() - 0.5) * 36;
    const dy = -16 - Math.random() * 24;

    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.backgroundColor = color;
    sparkle.style.boxShadow = `0 0 8px ${color}, 0 0 14px ${color}`;
    sparkle.style.setProperty("--dx", `${dx}px`);
    sparkle.style.setProperty("--dy", `${dy}px`);

    parent.appendChild(sparkle);
    setTimeout(() => {
      if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
    }, 750);
  }
}

// ==========================================================================
// Main Application Lifecycle Initialization
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Setup Shared Navigation & Brand Animation
  setupNavigation();
  setupBrandLogoAnimations();

  // 3. Setup Shared Modal Logic & Account Verification
  setupModalLogic();
  ensureGuardianModals();
  updateAuthNavbar();
  syncSessionWithBackend();

  // 4. Update Dynamic Year in Footers
  const yearSpan = document.getElementById("currentYear");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // 5. Page-specific: Homepage (index.html)
  if (document.getElementById("tutorsGrid")) {
    // When entering the website, always show the first page (top hero section)
    if (!window.location.hash) {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }

    loadPublicTutors();
    setupSearchFilter();
    renderTestimonialMarquee();
    setupCounterAnimations();
  }

  // 6. Page-specific: Tuition Job Board (jobs.html)
  if (document.getElementById("jobStreamCardsContainer")) {
    setupJobBoard();
    setupJobDetailModal();
  }

  // 7. Page-specific: Why Combined Page (why-combined.html)
  const whyJoinBtn = document.getElementById("whyJoinTutorBtn");
  if (whyJoinBtn) {
    whyJoinBtn.addEventListener("click", () => {
      if (typeof window.spaNavigate === 'function') {
        window.spaNavigate("become-a-tutor.html");
      } else {
        window.location.href = "become-a-tutor.html";
      }
    });
  }

  const whyFindBtn = document.getElementById("whyFindTutorBtn");
  if (whyFindBtn) {
    whyFindBtn.addEventListener("click", () => {
      openTutorModal("Guardian / Student: Request a Dedicated Tutor");
    });
  }

  // Handle direct navigation hash (#request-tutor)
  if (window.location.hash === "#request-tutor") {
    setTimeout(() => {
      if (typeof window.openTutorModal === "function") {
        window.openTutorModal("Guardian / Student: Post Tuition Requirement");
      }
    }, 250);
  }

  // 8. Page-specific: How It Works Page (how-it-works.html)
  if (document.getElementById("parentsFlowContent") || document.getElementById("faqAccordion")) {
    setupHowItWorksPage();
  }

  // 9. Page-specific: Become a Tutor Page (become-a-tutor.html)
  if (document.getElementById("calcLevelChips") || document.getElementById("heroTutorQuickForm")) {
    setupBecomeTutorPage();
  }

  // Global login / register anchors
  document.querySelectorAll(".open-login-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const txt = (link.textContent || "").toLowerCase();
      if (txt.includes("register")) {
        window.location.href = "register.html";
      } else {
        window.location.href = "login.html";
      }
    });
  });

  // Re-run lucide icons to capture dynamically populated components
  if (window.lucide) {
    window.lucide.createIcons();
  }
});





// ==========================================================================
// REAL-TIME SERVER-SENT EVENTS (SSE) & NOTIFICATION SYSTEM
// ==========================================================================
window.notificationEventSource = null;

function setupNotificationSystem() {
  const token = localStorage.getItem("auth_token");
  if (!token) return;

  if (window.notificationEventSource && window.notificationEventSource.readyState !== 2) {
    return;
  }

  fetchNotifications();

  try {
    const sseUrl = `/api/notifications/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(sseUrl);
    window.notificationEventSource = es;

    es.addEventListener("open", () => {
      console.log("[SSE] Connected to real-time notification stream.");
    });

    es.addEventListener("notification", (e) => {
      try {
        const notif = JSON.parse(e.data);
        console.log("[SSE] Real-time notification received:", notif);
        showRealtimeNotificationToast(notif);
        fetchNotifications();

        const user = getStoredUser();
        if (user && user.role === 'tutor' && typeof window.loadTutorDashboard === 'function') {
          window.loadTutorDashboard();
        }
        if (user && user.role === 'admin' && typeof window.loadAdminDashboard === 'function') {
          window.loadAdminDashboard();
        }
      } catch (err) {
        console.error("Error processing SSE notification:", err);
      }
    });

    es.addEventListener("error", (err) => {
      console.warn("[SSE] Notification stream error/reconnecting...", err);
    });
  } catch (e) {
    console.error("Failed to initialize SSE EventSource:", e);
  }

  const bellBtn = document.getElementById("navNotificationBtn");
  const notifDropdown = document.getElementById("navNotificationDropdown");
  const markReadBtn = document.getElementById("markAllNotifsReadBtn");

  if (bellBtn && notifDropdown) {
    bellBtn.onclick = (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle("active");
    };

    document.addEventListener("click", (e) => {
      if (!notifDropdown.contains(e.target) && !bellBtn.contains(e.target)) {
        notifDropdown.classList.remove("active");
      }
    });
  }

  if (markReadBtn) {
    markReadBtn.onclick = async (e) => {
      e.stopPropagation();
      try {
        const token = localStorage.getItem("auth_token");
        await fetch("/api/notifications/read", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
        });
        fetchNotifications();
      } catch (err) {
        console.error("Error marking notifications as read:", err);
      }
    };
  }
}

async function fetchNotifications() {
  try {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const res = await fetch("/api/notifications", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    if (!data.success) return;

    const countBadge = document.getElementById("navNotificationCount");
    const listEl = document.getElementById("notifDropdownList");

    if (countBadge) {
      if (data.unreadCount > 0) {
        countBadge.textContent = data.unreadCount > 99 ? "99+" : data.unreadCount;
        countBadge.classList.remove("hidden");
      } else {
        countBadge.classList.add("hidden");
      }
    }

    if (listEl) {
      if (!data.notifications || data.notifications.length === 0) {
        listEl.innerHTML = `<li class="notif-empty"><i data-lucide="bell-off" style="width: 24px; height: 24px; margin-bottom: 0.5rem; display: block; margin: 0 auto 0.5rem; color: #cbd5e1;"></i>No notifications yet</li>`;
      } else {
        listEl.innerHTML = data.notifications.map(n => {
          const isUnread = n.read_at === null;
          const timeAgo = formatTimeAgo(n.created_at);
          let icon = 'bell';
          if (n.type === 'application_submitted') icon = 'file-plus';
          else if (n.type === 'application_routed') icon = 'send';
          else if (n.type === 'application_accepted') icon = 'check-circle';
          else if (n.type === 'application_declined') icon = 'x-circle';

          return `
            <li class="notif-item ${isUnread ? 'unread' : ''}" onclick="handleNotifClick('${n.type}', '${n.data}')">
              <div class="notif-icon-box">
                <i data-lucide="${icon}"></i>
              </div>
              <div class="notif-item-body">
                <div class="notif-title">${n.title}</div>
                <div class="notif-message">${n.message}</div>
                <div class="notif-time">${timeAgo}</div>
              </div>
            </li>
          `;
        }).join('');
      }
      if (window.lucide) window.lucide.createIcons();
    }
  } catch (err) {
    console.warn("Could not fetch notifications:", err);
  }
}

function showRealtimeNotificationToast(notif) {
  let toastContainer = document.getElementById("realtimeToastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "realtimeToastContainer";
    toastContainer.className = "realtime-toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = "realtime-toast";
  toast.innerHTML = `
    <div style="background: rgba(13, 148, 136, 0.2); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #2dd4bf; flex-shrink: 0;">
      <i data-lucide="bell" style="width: 18px; height: 18px;"></i>
    </div>
    <div style="flex: 1;">
      <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 0.2rem;">${notif.title}</div>
      <div style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.3;">${notif.message}</div>
    </div>
  `;

  toastContainer.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

function handleNotifClick(type, dataJson) {
  const dropdown = document.getElementById("navNotificationDropdown");
  if (dropdown) dropdown.classList.remove("active");

  const user = getStoredUser();
  if (user && user.role === 'tutor') {
    if (typeof window.spaNavigate === 'function') window.spaNavigate("tutor-dashboard.html");
  } else if (user && user.role === 'admin') {
    if (typeof window.spaNavigate === 'function') window.spaNavigate("admin-dashboard.html");
  }
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}

// ==========================================================================
// TUTOR DASHBOARD CONTROLLER (Real-Time Inquiries & Response)
// ==========================================================================
window.loadTutorDashboard = async function () {
  const container = document.getElementById("tutorDashAppsList");
  if (!container) return;

  const token = localStorage.getItem("auth_token");
  const user = getStoredUser();

  if (user && document.getElementById("tutorDashWelcomeName")) {
    document.getElementById("tutorDashWelcomeName").textContent = `Welcome, ${user.name}!`;
  }

  try {
    const res = await fetch("/api/tutor/applications", {
      headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });
    const data = await res.json();

    if (!data.success) {
      container.innerHTML = `
        <div class="dash-empty-state">
          <i data-lucide="lock"></i>
          <h4>Authentication Required</h4>
          <p>Please log in as a registered Tutor to access this dashboard.</p>
          <button class="btn btn-primary" onclick="window.location.href='login.html'" style="margin-top: 1rem;">Go to Login</button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const apps = data.applications || [];
    let pendingCount = 0;
    let acceptedCount = 0;
    let directCount = 0;

    apps.forEach(app => {
      if (app.route_status === 'pending') pendingCount++;
      if (app.route_status === 'accepted') acceptedCount++;
      if (app.is_direct_request) directCount++;
    });

    if (document.getElementById("tutorKpiPending")) document.getElementById("tutorKpiPending").textContent = pendingCount;
    if (document.getElementById("tutorKpiAccepted")) document.getElementById("tutorKpiAccepted").textContent = acceptedCount;
    if (document.getElementById("tutorKpiDirect")) document.getElementById("tutorKpiDirect").textContent = directCount;
    if (document.getElementById("tutorAppsCountBadge")) document.getElementById("tutorAppsCountBadge").textContent = `${apps.length} Applications`;

    if (apps.length === 0) {
      container.innerHTML = `
        <div class="dash-empty-state">
          <i data-lucide="inbox"></i>
          <h4>No Tuition Applications Assigned</h4>
          <p>When guardians submit direct requests or admin routes an application, it will appear here instantly in real-time.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = apps.map(app => {
      const isPending = app.route_status === 'pending';
      const isAccepted = app.route_status === 'accepted';

      return `
        <div class="tutor-app-card status-${app.route_status}">
          <div class="tutor-app-header">
            <div>
              <span class="tutor-app-code">${app.application_code}</span>
              ${app.is_direct_request ? '<span style="margin-left: 6px; font-size: 0.72rem; background: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 4px; font-weight: 700;">DIRECT REQUEST</span>' : ''}
            </div>
            <span class="tutor-app-pill ${app.route_status}">${app.route_status}</span>
          </div>

          <div class="tutor-app-body">
            <h4>${app.student_class} • ${app.medium}</h4>
            <ul class="tutor-app-meta">
              <li><i data-lucide="book-open"></i> <strong>Subjects:</strong> ${app.subjects}</li>
              <li><i data-lucide="user"></i> <strong>Guardian:</strong> ${app.guardian_name} (${app.guardian_phone})</li>
              <li><i data-lucide="map-pin"></i> <strong>Location:</strong> ${app.location}</li>
              <li><i data-lucide="credit-card"></i> <strong>Offered Budget:</strong> ${app.budget}</li>
              <li><i data-lucide="calendar"></i> <strong>Days/Wk:</strong> ${app.days_per_week || '3 days/week'}</li>
            </ul>
            ${app.notes ? `<div class="tutor-app-notes">"${app.notes}"</div>` : ''}
          </div>

          ${isPending ? `
            <div class="tutor-app-actions">
              <button class="btn-accept-app" onclick="respondToApplication(${app.route_id}, 'accept')">
                <i data-lucide="check"></i> Accept Tuition
              </button>
              <button class="btn-decline-app" onclick="respondToApplication(${app.route_id}, 'decline')">
                <i data-lucide="x"></i> Decline
              </button>
            </div>
          ` : `
            <div style="text-align: center; padding: 0.5rem; font-size: 0.82rem; font-weight: 600; color: ${isAccepted ? '#059669' : '#64748b'}; background: ${isAccepted ? '#ecfdf5' : '#f8fafc'}; border-radius: 8px;">
              ${isAccepted ? '<i data-lucide="check-circle" style="width: 14px; height: 14px; display: inline-block; vertical-align: -2px;"></i> You accepted this tuition assignment' : '<i data-lucide="x-circle" style="width: 14px; height: 14px; display: inline-block; vertical-align: -2px;"></i> Declined'}
            </div>
          `}
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error("Error loading tutor dashboard:", err);
    container.innerHTML = `<div class="dash-empty-state"><p>Error connecting to dashboard service.</p></div>`;
  }
};

window.respondToApplication = async function (routeId, action) {
  const token = localStorage.getItem("auth_token");
  if (!token) return alert("Please log in to respond.");

  try {
    const res = await fetch(`/api/tutor/applications/${routeId}/respond`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || `Application ${action}ed!`);
      window.loadTutorDashboard();
    } else {
      alert(data.error || "Action could not be processed.");
    }
  } catch (err) {
    console.error("Failed to respond to application:", err);
    showToast("Network error while responding.");
  }
};

// ==========================================================================
// ADMIN DASHBOARD CONTROLLER (Master Application Queue & Routing Engine)
// ==========================================================================
window.adminTutorsList = [];

window.loadAdminDashboard = async function () {
  const tbody = document.getElementById("adminMasterAppsTableBody");
  if (!tbody) return;

  const token = localStorage.getItem("auth_token");

  try {
    const statsRes = await fetch("/api/admin/stats", {
      headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });
    const statsData = await statsRes.json();
    if (statsData.success && statsData.stats) {
      const s = statsData.stats;
      if (document.getElementById("adminKpiTotal")) document.getElementById("adminKpiTotal").textContent = s.total_applications;
      if (document.getElementById("adminKpiDirect")) document.getElementById("adminKpiDirect").textContent = s.direct_tutor_requests;
      if (document.getElementById("adminKpiPool")) document.getElementById("adminKpiPool").textContent = s.central_pool_applications;
      if (document.getElementById("adminKpiAccepted")) document.getElementById("adminKpiAccepted").textContent = s.accepted_tuitions;
    }

    const tutorsRes = await fetch("/api/tutors");
    const tutorsData = await tutorsRes.json();
    if (tutorsData.success) {
      window.adminTutorsList = tutorsData.tutors || [];
    }

    const appsRes = await fetch("/api/admin/applications", {
      headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });
    const appsData = await appsRes.json();
    if (typeof window.loadAdminTutors === 'function') {
      window.loadAdminTutors();
    }

    if (!appsData.success) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="dash-empty-state">
            <i data-lucide="lock"></i>
            <h4>Admin Privileges Required</h4>
            <p>Please log in with an authorized Administrator account.</p>
            <button class="btn btn-primary" onclick="window.location.href='login.html'" style="margin-top: 1rem;">Go to Login</button>
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const apps = appsData.applications || [];
    if (document.getElementById("adminQueueCountBadge")) {
      document.getElementById("adminQueueCountBadge").textContent = `${apps.length} Total Inquiries`;
    }

    if (apps.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="dash-empty-state">
            <i data-lucide="inbox"></i>
            <p>No tuition applications in the system yet.</p>
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    tbody.innerHTML = apps.map(app => {
      const isAssigned = !!app.assigned_tutor_id;
      const routeStatus = app.route_status || 'unrouted';
      const statusPillColor = routeStatus === 'accepted' ? '#10b981' : (routeStatus === 'pending' ? '#d97706' : '#64748b');

      return `
        <tr>
          <td>
            <span class="tutor-app-code">${app.application_code}</span>
          </td>
          <td>
            <strong>${app.guardian_name}</strong>
            ${app.is_direct_request ? '<br/><span style="font-size: 0.7rem; color: #0284c7; font-weight: 700;">[DIRECT REQUEST]</span>' : ''}
          </td>
          <td>
            <div>${app.guardian_phone}</div>
            <small style="color: #64748b;">${app.location}</small>
          </td>
          <td>
            <strong>${app.student_class}</strong>
            <div style="font-size: 0.8rem; color: #475569;">${app.subjects} (${app.medium})</div>
          </td>
          <td>
            <span style="font-weight: 600; color: #0f172a;">${app.budget}</span>
          </td>
          <td>
            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; background: ${statusPillColor}15; color: ${statusPillColor}; border: 1px solid ${statusPillColor}40;">
              ${app.status} (${routeStatus})
            </span>
          </td>
          <td>
            ${isAssigned ? `
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <i data-lucide="user-check" style="width: 14px; height: 14px; color: #10b981;"></i>
                <span style="font-weight: 600;">${app.assigned_tutor_name || 'Tutor #' + app.assigned_tutor_id}</span>
              </div>
            ` : '<span style="color: #94a3b8; font-style: italic;">Unassigned (Central Pool)</span>'}
          </td>
          <td>
            <div class="route-action-box">
              <select class="route-action-select" id="selectTutorForApp_${app.id}">
                <option value="">Select Tutor...</option>
                ${window.adminTutorsList.map(t => `<option value="${t.id}" ${t.id === app.assigned_tutor_id ? 'selected' : ''}>${t.name} (${t.institution})</option>`).join('')}
              </select>
              <button class="btn-assign-tutor" onclick="assignTutorToApp(${app.id})">
                ${isAssigned ? 'Re-Route' : 'Route'}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error("Error loading admin dashboard:", err);
    tbody.innerHTML = `<tr><td colspan="8" class="dash-empty-state"><p>Error connecting to admin service.</p></td></tr>`;
  }
};

window.assignTutorToApp = async function (appId) {
  const select = document.getElementById(`selectTutorForApp_${appId}`);
  if (!select) return;
  const tutorId = select.value;
  if (!tutorId) return alert("Please select a tutor from the dropdown.");

  const token = localStorage.getItem("auth_token");
  try {
    const res = await fetch(`/api/admin/applications/${appId}/route`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ tutor_id: parseInt(tutorId, 10), notes: "Admin manually routed" })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || "Application routed to tutor!");
      window.loadAdminDashboard();
    } else {
      alert(data.error || "Routing failed.");
    }
  } catch (err) {
    console.error("Error routing application:", err);
    showToast("Network error while assigning tutor.");
  }
};

// Hook Refresh Buttons
document.addEventListener("DOMContentLoaded", () => {
  const tutorRefreshBtn = document.getElementById("tutorRefreshBtn");
  if (tutorRefreshBtn) tutorRefreshBtn.addEventListener("click", () => window.loadTutorDashboard());

  const adminRefreshBtn = document.getElementById("adminRefreshBtn");
  if (adminRefreshBtn) adminRefreshBtn.addEventListener("click", () => window.loadAdminDashboard());

  window.addEventListener("spa:viewchanged", (e) => {
    if (e.detail && e.detail.targetViewId === "view-tutor-dashboard") {
      window.loadTutorDashboard();
    } else if (e.detail && e.detail.targetViewId === "view-admin-dashboard") {
      window.loadAdminDashboard();
    }
  });

  syncSessionWithBackend();
});


// ==========================================================================
// DYNAMIC TUTOR MANAGEMENT SYSTEM (Public & Admin)
// ==========================================================================

async function loadPublicTutors() {
  try {
    const res = await fetch('/api/tutors');
    const data = await res.json();
    if (data.success && Array.isArray(data.tutors) && data.tutors.length > 0) {
      window.TUTORS_DATA = data.tutors;
      renderTutors(window.TUTORS_DATA);
      return;
    }
  } catch (err) {
    console.warn("Falling back to local cache for tutors:", err);
  }

  if (!window.TUTORS_DATA || window.TUTORS_DATA.length === 0) {
    window.TUTORS_DATA = TUTORS_DATA;
  }
  renderTutors(window.TUTORS_DATA);
}
window.loadPublicTutors = loadPublicTutors;

window.loadAdminTutors = async function () {
  const tbody = document.getElementById("adminTutorsTableBody");
  if (!tbody) return;

  try {
    const res = await fetch("/api/tutors");
    const data = await res.json();
    const tutors = (data && data.tutors) || [];

    if (document.getElementById("adminTutorsCountBadge")) {
      document.getElementById("adminTutorsCountBadge").textContent = `${tutors.length} Tutors in System`;
    }

    if (tutors.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="dash-empty-state"><i data-lucide="users"></i><p>No tutors in database.</p></td></tr>`;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    tbody.innerHTML = tutors.map(t => {
      const subjectsStr = Array.isArray(t.subjects) ? t.subjects.join(', ') : (t.subjects || '');
      const locationStr = t.location || t.preferred_locations || 'Dhaka';

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <img src="${t.avatar}" alt="${t.name}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 1.5px solid #2563eb;" />
              <div>
                <strong style="color: #0f172a; font-size: 0.9rem;">${t.name}</strong>
                <div style="font-size: 0.75rem; color: #64748b;">${t.email}</div>
              </div>
            </div>
          </td>
          <td>
            <strong style="color: #1e293b;">${t.institution}</strong>
            ${t.department ? `<div style="font-size: 0.75rem; color: #64748b;">${t.department}</div>` : ''}
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.82rem; color: #0f172a; font-weight: 500;">
              <i data-lucide="map-pin" style="width: 14px; height: 14px; color: #0d9488; flex-shrink: 0;"></i>
              <span>${locationStr}</span>
            </div>
          </td>
          <td>
            <span style="font-size: 0.82rem; color: #334155;">${subjectsStr}</span>
          </td>
          <td>
            <strong style="color: #2563eb;">${t.rate}</strong>
          </td>
          <td>
            <span style="display: inline-flex; align-items: center; gap: 0.25rem; font-weight: 700; color: #d97706; font-size: 0.85rem;">
              <i data-lucide="star" style="width: 13px; height: 13px; fill: currentColor;"></i>
              <span>${t.rating}</span>
            </span>
          </td>
          <td>
            <span style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 2px 8px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;">
              <span style="width: 6px; height: 6px; background: #10b981; border-radius: 50%;"></span> Published Live
            </span>
          </td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="window.deleteTutor(${t.id}, '${t.name.replace(/'/g, "\\'")}')" style="color: #ef4444; border-color: #fecaca; padding: 0.35rem 0.65rem; font-size: 0.75rem; border-radius: 8px;" title="Remove tutor profile">
              <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error("Error loading admin tutors:", err);
    tbody.innerHTML = `<tr><td colspan="8" class="dash-empty-state"><p>Error connecting to tutors catalog.</p></td></tr>`;
  }
};

window.deleteTutor = async function (tutorId, tutorName) {
  if (!confirm(`Are you sure you want to remove ${tutorName || 'this tutor'} from CombinedTution?`)) return;
  const token = localStorage.getItem("auth_token");
  try {
    const res = await fetch(`/api/admin/tutors/${tutorId}`, {
      method: "DELETE",
      headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || "Tutor profile removed.");
      window.loadAdminTutors();
      loadPublicTutors();
    } else {
      alert(data.error || "Failed to remove tutor.");
    }
  } catch (err) {
    console.error("Delete tutor error:", err);
    showToast("Network error while deleting tutor.");
  }
};

function setupAdminAddTutorModal() {
  const modal = document.getElementById("adminAddTutorModal");
  const openBtns = [
    document.getElementById("adminOpenAddTutorBtn"),
    document.getElementById("adminQuickAddTutorBtn"),
    document.getElementById("tutorDeskAddTutorBtn")
  ];
  const closeBtn = document.getElementById("adminAddTutorCloseBtn");
  const cancelBtn = document.getElementById("adminAddTutorCancelBtn");
  const backdrop = document.getElementById("adminAddTutorBackdrop");
  const form = document.getElementById("adminAddTutorForm");

  function openModal() {
    if (!modal) return;
    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add("hidden");
  }

  window.openAdminAddTutorModal = openModal;
  window.closeAdminAddTutorModal = closeModal;

  openBtns.forEach(b => { if (b) b.addEventListener("click", openModal); });
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  if (backdrop) backdrop.addEventListener("click", closeModal);

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById("adminAddTutorSubmitBtn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i data-lucide="loader-2" class="animate-spin btn-icon"></i> Publishing...`;
        if (window.lucide) window.lucide.createIcons();
      }

      const token = localStorage.getItem("auth_token");
      const payload = {
        name: document.getElementById("addTutorName")?.value?.trim(),
        email: document.getElementById("addTutorEmail")?.value?.trim(),
        phone: document.getElementById("addTutorPhone")?.value?.trim(),
        password: document.getElementById("addTutorPassword")?.value?.trim() || "TutorPassword123!",
        institution: document.getElementById("addTutorInstitution")?.value?.trim(),
        department: document.getElementById("addTutorDepartment")?.value?.trim(),
        preferred_locations: document.getElementById("addTutorLocations")?.value?.trim(),
        subjects: document.getElementById("addTutorSubjects")?.value?.trim(),
        monthly_rate: document.getElementById("addTutorRate")?.value?.trim() || "৳ 8,000 / month",
        rating: document.getElementById("addTutorRating")?.value || "4.95",
        avatar_url: document.getElementById("addTutorAvatar")?.value?.trim() || "",
        bio: document.getElementById("addTutorBio")?.value?.trim() || ""
      };

      try {
        const res = await fetch("/api/admin/tutors/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.success) {
          showToast(data.message || `Tutor ${payload.name} published to website successfully!`);
          closeModal();
          form.reset();
          window.loadAdminTutors();
          loadPublicTutors();
        } else {
          alert(data.error || "Failed to create tutor.");
        }
      } catch (err) {
        console.error("Error creating tutor:", err);
        showToast("Error creating tutor profile.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<i data-lucide="check" class="btn-icon"></i><span>Publish Tutor Profile</span>`;
          if (window.lucide) window.lucide.createIcons();
        }
      }
    });
  }
}

// Hook Admin Add Tutor modal & Profile Modal on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  setupAdminAddTutorModal();
  setupUserProfileModalEvents();
  loadPublicTutors();
});

// ==========================================================================
// User Profile Update System & Field-Level Inline Editing
// ==========================================================================
window.activeProfileData = { user: null, tutorProfile: null };

window.openUserProfileModal = async function () {
  const user = getStoredUser();
  if (!user) {
    showToast("Please login to view and edit your profile.");
    if (typeof window.openLoginModal === "function") window.openLoginModal();
    return;
  }

  const modal = document.getElementById("userProfileModal");
  if (!modal) return;

  // Render modal with cached local state first for instant UI responsiveness
  window.renderUserProfileData({ user: user, tutorProfile: null });

  modal.classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();

  // Fetch remote live profile data
  try {
    const token = localStorage.getItem("auth_token");
    const headers = token ? { "Authorization": `Bearer ${token}` } : {};
    const res = await fetch("/api/user/profile", { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        window.activeProfileData = { user: data.user, tutorProfile: data.tutorProfile };
        setStoredUser(data.user);
        window.renderUserProfileData(data);
        updateAuthNavbar();
      }
    }
  } catch (err) {
    console.warn("Could not fetch remote profile, using local state fallback.", err);
  }
};

window.closeUserProfileModal = function () {
  const modal = document.getElementById("userProfileModal");
  if (modal) modal.classList.add("hidden");
  const fieldNames = ['name', 'phone', 'avatar_url', 'institution', 'department', 'subjects', 'preferred_locations', 'monthly_rate', 'bio'];
  fieldNames.forEach(fn => window.cancelProfileField(fn));
};

window.switchActiveRole = function (newRole) {
  let user = getStoredUser() || {
    id: 999,
    name: 'Demo User',
    email: 'user@combinetution.com'
  };
  user.role = newRole;
  if (newRole === 'tutor') {
    user.name = 'Tanvir Ahmed';
    user.email = 'tanvir@combinetution.com';
  } else if (newRole === 'admin') {
    user.name = 'System Administrator';
    user.email = 'admin@combinetution.com';
  } else if (newRole === 'student') {
    user.name = 'Zayed Chowdhury';
    user.email = 'student@combinetution.com';
  }
  setStoredUser(user);
  window.renderUserProfileData({ user });
  updateAuthNavbar();
  if (typeof window.showToast === 'function') {
    window.showToast(`Switched active role to: ${newRole.toUpperCase()}`);
  }
  if (window.lucide) window.lucide.createIcons();
};

window.logoutUserSession = async function () {
  try {
    const token = localStorage.getItem("auth_token");
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });
  } catch (e) { }
  clearStoredUser();
  if (typeof window.closeUserProfileModal === 'function') {
    window.closeUserProfileModal();
  }
  updateAuthNavbar();
  if (typeof window.showToast === 'function') {
    window.showToast('You have been logged out successfully.');
  }
  if (window.lucide) window.lucide.createIcons();
};

window.renderUserProfileData = function (data) {
  const user = data.user || {};
  const tutorProf = data.tutorProfile || {};

  window.activeProfileData = { user, tutorProfile: tutorProf };

  // Header summary
  const nameDisp = document.getElementById("modalUserDisplayName");
  const emailDisp = document.getElementById("modalUserDisplayEmail");
  const roleBadge = document.getElementById("modalUserRoleBadge");
  const avatarImg = document.getElementById("modalUserAvatarImg");

  if (nameDisp) nameDisp.textContent = user.name || "User Profile";
  if (emailDisp) emailDisp.textContent = user.email || "";

  if (roleBadge) {
    const roleCapitalized = user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : "User";
    roleBadge.innerHTML = `<i data-lucide="shield"></i> ${roleCapitalized} Account`;
  }

  const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=3b82f6&color=fff&size=150`;
  if (avatarImg) avatarImg.src = avatarUrl;

  // Helper setter
  const setFieldValue = (id, val, placeholder = "Not specified") => {
    const el = document.getElementById(id);
    if (!el) return;
    if (val && String(val).trim()) {
      el.textContent = String(val).trim();
      el.classList.remove("empty");
    } else {
      el.textContent = placeholder;
      el.classList.add("empty");
    }
  };

  setFieldValue("fieldVal_name", user.name);
  setFieldValue("fieldVal_phone", user.phone, "Add phone number");
  setFieldValue("fieldVal_avatar_url", user.avatar_url ? "Custom Avatar Set" : "Default Avatar");
  setFieldValue("fieldVal_email", user.email);

  // Tutor credentials section toggle
  const tutorSec = document.getElementById("tutorProfileSection");
  if (tutorSec) {
    if (user.role === "tutor" || tutorProf.institution) {
      tutorSec.classList.remove("hidden");
      setFieldValue("fieldVal_institution", tutorProf.institution, "Add University / Institution");
      setFieldValue("fieldVal_department", tutorProf.department, "Add Department");
      setFieldValue("fieldVal_subjects", tutorProf.subjects, "Add Subjects (e.g. Math, Physics)");
      setFieldValue("fieldVal_preferred_locations", tutorProf.preferred_locations, "Add Locations");
      setFieldValue("fieldVal_monthly_rate", tutorProf.monthly_rate, "Add Monthly Rate");
      setFieldValue("fieldVal_bio", tutorProf.bio, "Add bio & teaching experience summary");
    } else {
      tutorSec.classList.add("hidden");
    }
  }

  if (window.lucide) window.lucide.createIcons();
};

window.editProfileField = function (fieldName) {
  const valEl = document.getElementById(`fieldVal_${fieldName}`);
  const editWrap = document.getElementById(`fieldEditWrap_${fieldName}`);
  const editBtn = document.getElementById(`fieldEditBtn_${fieldName}`);
  const saveBtn = document.getElementById(`fieldSaveBtn_${fieldName}`);
  const cancelBtn = document.getElementById(`fieldCancelBtn_${fieldName}`);
  const rowEl = document.getElementById(`fieldRow_${fieldName}`);
  const inputEl = document.getElementById(`fieldInput_${fieldName}`);

  if (!editWrap || !inputEl) return;

  const u = window.activeProfileData.user || {};
  const tp = window.activeProfileData.tutorProfile || {};

  let currentRawVal = "";
  if (['name', 'phone', 'avatar_url'].includes(fieldName)) {
    currentRawVal = u[fieldName] || "";
  } else {
    currentRawVal = tp[fieldName] || "";
  }

  inputEl.value = currentRawVal;

  if (valEl) valEl.classList.add("hidden");
  editWrap.classList.remove("hidden");
  if (editBtn) editBtn.classList.add("hidden");
  if (saveBtn) saveBtn.classList.remove("hidden");
  if (cancelBtn) cancelBtn.classList.remove("hidden");
  if (rowEl) rowEl.classList.add("editing");

  inputEl.focus();
};

window.cancelProfileField = function (fieldName) {
  const valEl = document.getElementById(`fieldVal_${fieldName}`);
  const editWrap = document.getElementById(`fieldEditWrap_${fieldName}`);
  const editBtn = document.getElementById(`fieldEditBtn_${fieldName}`);
  const saveBtn = document.getElementById(`fieldSaveBtn_${fieldName}`);
  const cancelBtn = document.getElementById(`fieldCancelBtn_${fieldName}`);
  const rowEl = document.getElementById(`fieldRow_${fieldName}`);

  if (valEl) valEl.classList.remove("hidden");
  if (editWrap) editWrap.classList.add("hidden");
  if (editBtn) editBtn.classList.remove("hidden");
  if (saveBtn) saveBtn.classList.add("hidden");
  if (cancelBtn) cancelBtn.classList.add("hidden");
  if (rowEl) rowEl.classList.remove("editing");
};

window.saveProfileField = async function (fieldName) {
  const inputEl = document.getElementById(`fieldInput_${fieldName}`);
  const saveBtn = document.getElementById(`fieldSaveBtn_${fieldName}`);
  if (!inputEl) return;

  const newValue = inputEl.value.trim();

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Saving...`;
    if (window.lucide) window.lucide.createIcons();
  }

  const payload = { [fieldName]: newValue };
  const token = localStorage.getItem("auth_token");

  try {
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok && data.success) {
      if (data.user) {
        setStoredUser(data.user);
      }
      window.activeProfileData = {
        user: data.user || window.activeProfileData.user,
        tutorProfile: data.tutorProfile || window.activeProfileData.tutorProfile
      };

      window.renderUserProfileData(window.activeProfileData);
      updateAuthNavbar();

      const labelNames = {
        name: "Full Name",
        phone: "Phone Number",
        avatar_url: "Profile Picture",
        institution: "Institution",
        department: "Department",
        subjects: "Teaching Subjects",
        preferred_locations: "Preferred Locations",
        monthly_rate: "Monthly Rate",
        bio: "Bio & Experience"
      };

      showToast(`${labelNames[fieldName] || fieldName} updated successfully!`);
      window.cancelProfileField(fieldName);
    } else {
      showToast(data.error || "Failed to update profile field.");
    }
  } catch (err) {
    console.error("Profile update error:", err);
    // Offline / Local fallback update
    const currentUser = getStoredUser();
    if (currentUser) {
      if (['name', 'phone', 'avatar_url'].includes(fieldName)) {
        currentUser[fieldName] = newValue;
      }
      setStoredUser(currentUser);
      window.renderUserProfileData({ user: currentUser, tutorProfile: window.activeProfileData.tutorProfile });
      updateAuthNavbar();
      showToast("Profile updated locally.");
      window.cancelProfileField(fieldName);
    }
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<i data-lucide="check"></i> Save`;
      if (window.lucide) window.lucide.createIcons();
    }
  }
};

window.selectAvatarPreset = function (url) {
  const inputEl = document.getElementById("fieldInput_avatar_url");
  if (inputEl) {
    inputEl.value = url;
    window.saveProfileField("avatar_url");
  }
};

function setupUserProfileModalEvents() {
  const closeBtn = document.getElementById("userProfileCloseBtn");
  const backdrop = document.getElementById("userProfileBackdrop");

  if (closeBtn) closeBtn.addEventListener("click", window.closeUserProfileModal);
  if (backdrop) backdrop.addEventListener("click", window.closeUserProfileModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.getElementById("userProfileModal");
      if (modal && !modal.classList.contains("hidden")) {
        window.closeUserProfileModal();
      }
    }
  });
}

// ==========================================================================
// Dual Feed Job Board & Tutor Directory System (Tutoriaa Feed Specification)
// Handles ?type=tuitions#tuitions & ?type=tutors#tutors
// ==========================================================================
window.currentJobBoardFeed = "tuitions";

window.switchJobBoardFeed = function (feedType) {
  window.currentJobBoardFeed = feedType;

  const btnTuitions = document.getElementById("feedTabTuitions");
  const btnTutors = document.getElementById("feedTabTutors");
  const streamTuitions = document.getElementById("jobCardsStream");
  const streamTutors = document.getElementById("tutorCardsStream");

  if (feedType === "tutors") {
    if (btnTuitions) btnTuitions.classList.remove("active");
    if (btnTutors) btnTutors.classList.add("active");

    if (streamTuitions) streamTuitions.classList.add("hidden");
    if (streamTutors) streamTutors.classList.remove("hidden");

    if (window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.set("type", "tutors");
      url.hash = "#tutors";
      window.history.replaceState({}, "", url.toString());
    }
  } else {
    if (btnTutors) btnTutors.classList.remove("active");
    if (btnTuitions) btnTuitions.classList.add("active");

    if (streamTutors) streamTutors.classList.add("hidden");
    if (streamTuitions) streamTuitions.classList.remove("hidden");

    if (window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.set("type", "tuitions");
      url.hash = "#tuitions";
      window.history.replaceState({}, "", url.toString());
    }
  }

  window.applyJobBoardSearchAndFilters();
};

window.renderTutorsFeedCards = function (tutorsList) {
  const container = document.getElementById("tutorCardsStream");
  if (!container) return;

  if (!tutorsList || tutorsList.length === 0) {
    container.innerHTML = `
      <div class="dash-empty-state" style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:3.5rem 1.5rem; text-align:center;">
        <i data-lucide="graduation-cap" style="width:2.5rem; height:2.5rem; color:#cbd5e1; margin-bottom:0.75rem;"></i>
        <h4 style="color:#0f172a; margin-bottom:0.35rem; font-size:1.15rem; font-weight:700;">No Matching Verified Tutors Found</h4>
        <p style="color:#64748b; font-size:0.9rem;">Try searching for a different area or subject to see available educators.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = tutorsList.map(t => {
    const subjects = Array.isArray(t.subjects) ? t.subjects : (typeof t.subjects === 'string' ? t.subjects.split(',') : []);
    const classes = Array.isArray(t.classes) ? t.classes : [];
    const location = t.location || t.preferred_locations || 'Dhaka Central';
    const avatar = t.avatar || t.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=3b82f6&color=fff`;
    const inst = t.institution || 'University Graduate';

    return `
      <div class="tutor-feed-card">
        <div class="tutor-feed-header">
          <div class="tutor-feed-avatar-wrap">
            <img src="${avatar}" alt="${t.name}" />
            <span class="tutor-badge-verified" title="100% Verified Credentials" style="position: absolute; bottom: 0; right: 0;">
              <i data-lucide="check"></i>
            </span>
          </div>
          <div class="tutor-feed-info">
            <div class="tutor-feed-title-row">
              <h3 class="tutor-feed-name">
                ${t.name}
                <span style="display:inline-flex; align-items:center; gap:0.2rem; font-size:0.8rem; font-weight:700; color:#d97706; background:#fef3c7; padding:2px 8px; border-radius:12px;">
                  <i data-lucide="star" style="width:12px; height:12px; fill:currentColor;"></i> ${t.rating || 4.9}
                </span>
              </h3>
              <span style="font-size:0.75rem; font-weight:700; color:#059669; background:#ecfdf5; padding:3px 9px; border-radius:20px; border:1px solid #a7f3d0;">
                <i data-lucide="check-circle-2" style="width:12px; height:12px; display:inline;"></i> Verified Candidate
              </span>
            </div>
            <div class="tutor-feed-inst">${inst} ${t.department ? `(${t.department})` : ''}</div>
          </div>
        </div>

        <div class="tutor-feed-meta-grid">
          <div class="tutor-meta-item">
            <i data-lucide="book-open"></i>
            <span><strong>Subjects:</strong> ${subjects.slice(0, 3).join(', ') || 'General Subjects'}</span>
          </div>
          <div class="tutor-meta-item">
            <i data-lucide="map-pin"></i>
            <span><strong>Preferred Areas:</strong> ${location}</span>
          </div>
          <div class="tutor-meta-item">
            <i data-lucide="award"></i>
            <span><strong>Experience:</strong> 3+ Years Tutoring</span>
          </div>
          <div class="tutor-meta-item">
            <i data-lucide="clock"></i>
            <span><strong>Availability:</strong> Immediate Available</span>
          </div>
        </div>

        ${t.bio ? `<p style="font-size:0.875rem; color:#475569; margin:0.5rem 0; line-height:1.5;">${t.bio}</p>` : ''}

        <div class="tutor-feed-tags">
          ${subjects.map(s => `<span class="tutor-tag-pill highlight">${String(s).trim()}</span>`).join('')}
          ${classes.map(c => `<span class="tutor-tag-pill">${c}</span>`).join('')}
        </div>

        <div class="tutor-feed-footer">
          <div class="tutor-rate-display">
            <span class="tutor-rate-label">Expected Remuneration</span>
            <span class="tutor-rate-value">${t.rate || t.monthly_rate || '৳ 8,000 / month'}</span>
          </div>
          <div>
            <button class="btn btn-primary" onclick="openDirectTutorModal(${t.id || 1}, '${t.name.replace(/'/g, "\\'")}', '${inst.replace(/'/g, "\\'")}', '${avatar}')" style="box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
              <i data-lucide="send" class="btn-icon"></i>
              <span>Send Direct Request</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
};

window.applyJobBoardSearchAndFilters = function () {
  const currentFeed = window.currentJobBoardFeed || 'tuitions';

  const tuitionsBadge = document.getElementById("tuitionsCountBadge");
  const tutorsBadge = document.getElementById("tutorsCountBadge");
  if (tuitionsBadge && window.JOBS_DATABASE) tuitionsBadge.textContent = JOBS_DATABASE.length;
  if (tutorsBadge && window.TUTORS_DATA) tutorsBadge.textContent = TUTORS_DATA.length;

  if (currentFeed === 'tutors') {
    const keyword = (currentJobFilters.keyword || '').toLowerCase();
    const area = currentJobFilters.area || 'all';

    let filtered = (window.TUTORS_DATA || TUTORS_DATA || []).filter(t => {
      if (area !== 'all') {
        const areaLower = area.toLowerCase();
        const loc = (t.location || t.preferred_locations || '').toLowerCase();
        if (!loc.includes(areaLower)) return false;
      }
      if (keyword) {
        const name = (t.name || '').toLowerCase();
        const inst = (t.institution || '').toLowerCase();
        const dept = (t.department || '').toLowerCase();
        const subj = (Array.isArray(t.subjects) ? t.subjects.join(' ') : (t.subjects || '')).toLowerCase();

        if (!name.includes(keyword) && !inst.includes(keyword) && !dept.includes(keyword) && !subj.includes(keyword)) {
          return false;
        }
      }
      return true;
    });

    const countText = document.getElementById("jobResultsCount");
    if (countText) {
      countText.textContent = `Showing ${filtered.length} verified educator candidate profiles`;
    }

    renderTutorsFeedCards(filtered);
  } else {
    renderJobBoard();
  }
};

function initJobBoardFeedState() {
  const searchParams = new URLSearchParams(window.location.search);
  const typeParam = searchParams.get("type");
  const hash = window.location.hash;

  if (typeParam === "tutors" || hash === "#tutors") {
    window.switchJobBoardFeed("tutors");
  } else if (typeParam === "tuitions" || hash === "#tuitions") {
    window.switchJobBoardFeed("tuitions");
  } else {
    window.switchJobBoardFeed("tuitions");
  }
}

// Hook initJobBoardFeedState on load
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    initJobBoardFeedState();
  }, 100);
});

// ==========================================================================
// Parent Sign Up & Hire a Tutor Modal Controller (Porao / CombinedTution Style)
// ==========================================================================
(function initParentSignUpModal() {
  const modal = document.getElementById("parentSignUpModal");
  if (!modal) return;

  const backdrop = document.getElementById("parentSignUpBackdrop");
  const backBtn = document.getElementById("parentSignUpBackBtn");
  const form = document.getElementById("parentSignUpForm");
  const nameInput = document.getElementById("parentNameInput");
  const phoneInput = document.getElementById("parentPhoneInput");
  const emailInput = document.getElementById("parentEmailInput");
  const passwordInput = document.getElementById("parentPasswordInput");
  const confirmPwInput = document.getElementById("parentConfirmPwInput");
  const pwToggleBtn = document.getElementById("parentPwToggleBtn");
  const confirmPwToggleBtn = document.getElementById("parentConfirmPwToggleBtn");
  const errorBox = document.getElementById("parentSignUpError");
  const errorText = document.getElementById("parentSignUpErrorText");
  const submitBtn = document.getElementById("parentSignUpSubmitBtn");
  const switchLoginBtn = document.getElementById("psuSwitchLoginBtn");
  const poraoHireCard = document.getElementById("CombinedTutionHireTutorCard") || document.getElementById("poraoHireTutorCard");

  function showError(msg) {
    if (errorBox && errorText) {
      errorText.textContent = msg;
      errorBox.classList.remove("hidden");
    }
  }

  function clearError() {
    if (errorBox) {
      errorBox.classList.add("hidden");
    }
  }

  window.openParentSignUpModal = function () {
    if (!modal) return;
    if (form) form.reset();
    clearError();
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Sign as Guardian</span>`;
    }
    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => {
      if (nameInput) nameInput.focus();
    }, 150);
  };

  window.closeParentSignUpModal = function () {
    if (!modal) return;
    modal.classList.add("hidden");
  };

  if (backdrop) backdrop.addEventListener("click", window.closeParentSignUpModal);
  if (backBtn) backBtn.addEventListener("click", window.closeParentSignUpModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
      window.closeParentSignUpModal();
    }
  });

  // Password visibility toggle helper
  function setupToggle(btn, input, eyeId) {
    if (!btn || !input) return;
    btn.addEventListener("click", () => {
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      btn.innerHTML = `<i data-lucide="${isPassword ? 'eye-off' : 'eye'}"></i>`;
      if (window.lucide) window.lucide.createIcons();
    });
  }

  setupToggle(pwToggleBtn, passwordInput, "parentPwEyeIcon");
  setupToggle(confirmPwToggleBtn, confirmPwInput, "parentConfirmPwEyeIcon");

  // Switch to Log In Modal
  if (switchLoginBtn) {
    switchLoginBtn.addEventListener("click", () => {
      window.closeParentSignUpModal();
      const loginModal = document.getElementById("loginModal");
      if (loginModal) {
        loginModal.classList.remove("hidden");
      } else if (typeof window.openLoginModal === "function") {
        window.openLoginModal();
      }
    });
  }

  // Hook 'Hire a Tutor' Card click
  if (poraoHireCard) {
    poraoHireCard.addEventListener("click", (e) => {
      e.preventDefault();
      // If user is already logged in as guardian, open tuition request directly
      const currentUser = typeof getStoredUser === "function" ? getStoredUser() : null;
      if (currentUser && currentUser.role === "guardian") {
        if (typeof window.openTutorModal === "function") {
          window.openTutorModal();
          return;
        }
      }
      // Otherwise open the Parent Sign Up interface requested by user
      window.openParentSignUpModal();
    });

    poraoHireCard.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.openParentSignUpModal();
      }
    });
  }

  // Form Submit Handler
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearError();

      const name = nameInput ? nameInput.value.trim() : "";
      const phone = phoneInput ? phoneInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";
      const confirmPassword = confirmPwInput ? confirmPwInput.value : "";

      // Validations
      if (!name || name.length < 2) {
        showError("Please enter your full name (minimum 2 characters).");
        if (nameInput) nameInput.focus();
        return;
      }

      if (!phone || phone.length < 8) {
        showError("Please enter a valid contact phone number (e.g. 01xxxxxxxxx).");
        if (phoneInput) phoneInput.focus();
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailPattern.test(email)) {
        showError("Please enter a valid email address.");
        if (emailInput) emailInput.focus();
        return;
      }

      if (!password || password.length < 8) {
        showError("Password length must be at least 8 characters.");
        if (passwordInput) passwordInput.focus();
        return;
      }

      if (password !== confirmPassword) {
        showError("Password and confirm password must match.");
        if (confirmPwInput) confirmPwInput.focus();
        return;
      }

      // Submit
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="btn-spinner"></span><span>Creating Parent Account...</span>`;

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone,
            password,
            role: "guardian"
          })
        });

        const data = await res.json();

        if (!res.ok) {
          showError(data.error || "Registration failed. Please check your inputs.");
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Sign as Guardian</span>`;
          return;
        }

        // Save session
        if (data.token) localStorage.setItem("auth_token", data.token);
        if (data.user) {
          localStorage.setItem("tutoriaa_user", JSON.stringify(data.user));
          localStorage.setItem("combine_currentUser", JSON.stringify(data.user));
        }

        if (typeof window.updateAuthNavbar === "function") {
          window.updateAuthNavbar();
        }

        if (typeof showToast === "function") {
          showToast(`Welcome to CombinedTution, ${data.user.name}!`);
        }

        // Close sign up modal and open tutor request modal prefilled
        window.closeParentSignUpModal();

        setTimeout(() => {
          if (typeof window.openTutorModal === "function") {
            window.openTutorModal();
            const modalPhone = document.getElementById("phoneInput");
            if (modalPhone) modalPhone.value = phone;
          }
        }, 300);

      } catch (err) {
        // Fallback for static environments (e.g., pure client preview)
        console.warn("Backend API not reachable, saving local guardian session:", err);
        const fallbackUser = { id: Date.now(), name, email, phone, role: "guardian" };
        localStorage.setItem("tutoriaa_user", JSON.stringify(fallbackUser));
        localStorage.setItem("combine_currentUser", JSON.stringify(fallbackUser));

        if (typeof window.updateAuthNavbar === "function") {
          window.updateAuthNavbar();
        }

        if (typeof showToast === "function") {
          showToast(`Welcome, ${name}! Now specify your tutor requirements.`);
        }

        window.closeParentSignUpModal();
        setTimeout(() => {
          if (typeof window.openTutorModal === "function") {
            window.openTutorModal();
            const modalPhone = document.getElementById("phoneInput");
            if (modalPhone) modalPhone.value = phone;
          }
        }, 300);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Sign as Guardian</span>`;
        }
      }
    });
  }
})();


