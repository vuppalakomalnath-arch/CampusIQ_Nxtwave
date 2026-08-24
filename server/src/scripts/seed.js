const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
const fs = require('fs');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const env = require('../config/env');
const User = require('../models/User');
const KnowledgeBase = require('../models/KnowledgeBase');
const Document = require('../models/Document');
const ingestionService = require('../rag/ingestionService');

const sampleDocumentsDir = path.resolve(__dirname, '../../uploads/seed-docs');

const sampleCollections = [
  {
    name: 'Admissions & Scholarships',
    slug: 'admissions-scholarships',
    description: 'Undergraduate and postgraduate admission procedures, criteria, fees, and scholarship guidelines.',
    type: 'global',
    department: 'Admissions',
    allowedRoles: ['student', 'faculty', 'admin'],
    suggestedQuestions: [
      'What are the eligibility criteria for B.Tech admissions?',
      'What is the annual tuition fee for engineering programs?',
      'Are merit scholarships available for top rankers?',
    ],
    docTitle: 'College Admission Regulations & Fee Schedule 2026',
    docContent: `COLLEGE ADMISSION REGULATIONS & TUITION SCHEDULE (ACADEMIC YEAR 2026-2027)

1. ELIGIBILITY CRITERIA:
- Undergraduate Engineering (B.Tech): Candidates must have completed 10+2 with Physics, Mathematics, and Chemistry with a minimum aggregate of 60%. Admission is granted through State CET and National Entrance Examination scores.
- Postgraduate (M.Tech): Bachelor's degree in relevant branch of engineering with at least 55% marks and valid GATE score.
- Application Deadline: The last date for online registration and document submission is July 15, 2026.

2. ANNUAL FEE STRUCTURE:
- B.Tech Tuition Fee: $4,500 (or INR 1,50,000) per academic year, payable in two equal semester installments.
- Development & Laboratory Fee: $600 (INR 20,000) per annum.
- Refund Policy: If a candidate withdraws admission before July 31, 2026, 90% of tuition fee is refunded. After classes commence on August 10, 2026, only caution deposit is refundable.

3. MERIT & MERIT-CUM-MEANS SCHOLARSHIPS:
- Dean's Merit Scholarship: 100% tuition waiver for students in top 1% entrance rank.
- Sibling Scholarship: 20% discount on tuition fee for younger sibling concurrently enrolled.
- Contact: Admissions Office, Admin Block Ground Floor. Email: admissions@campusiq.edu. Phone: +1-800-555-0199.`,
  },
  {
    name: 'Academic Regulations & Examination Cell',
    slug: 'academics-examination',
    description: 'Attendance rules, grading scales, GPA calculation, mid-term & end-term exam policies, and re-evaluation.',
    type: 'global',
    department: 'Examination Cell',
    allowedRoles: ['student', 'faculty', 'admin'],
    suggestedQuestions: [
      'What is the minimum attendance required to appear for final exams?',
      'How does the 10-point GPA grading system work?',
      'What is the procedure for answer script re-evaluation?',
    ],
    docTitle: 'Academic Regulations, Grading Norms & Examination Guidelines',
    docContent: `OFFICE OF THE CONTROLLER OF EXAMINATIONS: ACADEMIC REGULATIONS 2026

1. MANDATORY ATTENDANCE REQUIREMENTS:
- Minimum Attendance: Every student must maintain at least 75% attendance in each registered theory and laboratory course to be eligible for end-semester examinations.
- Medical Condonation: Attendance between 65% and 74% may be condoned by the Dean of Academic Affairs strictly on valid medical grounds with hospital certificate submitted within 5 days of illness.
- Students below 65% attendance will be detained (Grade 'FA' - Failed due to Attendance) and must repeat the course.

2. GRADING SYSTEM:
- 10-Point Scale: O (Outstanding, 90-100%, 10 pts), A+ (Excellent, 80-89%, 9 pts), A (Very Good, 70-79%, 8 pts), B+ (Good, 60-69%, 7 pts), B (Above Average, 50-59%, 6 pts), C (Pass, 40-49%, 5 pts), F (Fail, <40%, 0 pts).
- Passing Criterion: Minimum 40% in End-Semester Exam and 40% aggregate in continuous internal assessments.

3. RE-EVALUATION & RE-TOTALLING:
- Students may apply for answer script review within 7 working days of grade declaration through the Student Portal.
- Re-evaluation Fee: $25 (INR 1,000) per subject, fully refundable if grade improves by one letter grade or more.
- Examination Cell Office: Room 204, Central Academic Wing.`,
  },
  {
    name: 'Computer Science & Engineering',
    slug: 'computer-science-dept',
    description: 'CSE course curriculum, lab guidelines, electives, final year capstone projects, and faculty contacts.',
    type: 'department',
    department: 'Computer Science',
    allowedRoles: ['student', 'faculty', 'admin'],
    suggestedQuestions: [
      'What are the core subjects in CSE 5th semester?',
      'What are the prerequisites for AI and Deep Learning electives?',
      'How is the final year capstone project evaluated?',
    ],
    docTitle: 'Computer Science Department Handbook & Lab Protocols',
    docContent: `DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING: CURRICULUM & LAB GUIDE

1. CURRICULUM HIGHLIGHTS:
- 3rd Year Core Courses: Data Structures & Algorithms, Operating Systems, Database Management Systems, Computer Networks, and Theory of Computation.
- Professional Electives: Artificial Intelligence, Distributed Cloud Computing, Blockchain Technologies, Cybersecurity, Natural Language Processing.
- Capstone Project: Completed in two phases (Phase 1: Project formulation & literature survey in Semester 7; Phase 2: Implementation & thesis defense in Semester 8).

2. ADVANCED COMPUTING & AI LAB REGULATIONS:
- Lab Timings: Open Monday to Friday 8:30 AM to 8:00 PM; Saturday 9:00 AM to 4:00 PM.
- High-Performance GPU Cluster: Accessible via SSH using campus VPN credentials for approved research students and final-year project teams.
- Lab Coordinators: Prof. Dr. A. Sharma (Head of Department), Dr. R. Iyer (AI Lab Incharge).
- Location: Turing Complex, 3rd Floor. Contact: cse-dept@campusiq.edu.`,
  },
  {
    name: 'Hostel, Dining & Campus Life',
    slug: 'hostel-campus-life',
    description: 'Hostel room allotment, mess menu timings, gate curfew rules, gym facilities, and student council activities.',
    type: 'global',
    department: 'Hostel & Student Affairs',
    allowedRoles: ['student', 'faculty', 'admin'],
    suggestedQuestions: [
      'What is the hostel night curfew timing?',
      'What are the mess meal timings on weekdays and weekends?',
      'How can a student apply for night out pass?',
    ],
    docTitle: 'Hostel Code of Conduct, Facilities & Dining Guidelines',
    docContent: `CAMPUS RESIDENCE & HOSTEL REGULATIONS 2026

1. HOSTEL ENTRY & CURFEW TIMINGS:
- Campus Gate Curfew: 10:00 PM on weekdays (Sunday to Thursday) and 10:30 PM on Friday and Saturday.
- Late Entry: Permitted only with prior approval of Hostel Warden and biometric verification at the security desk.
- Night Out Pass: Must be applied 24 hours in advance through the CampusIQ Resident App and approved by registered parent/guardian.

2. DINING HALL & MESS SCHEDULE:
- Breakfast: 7:30 AM - 9:30 AM
- Lunch: 12:15 PM - 2:15 PM
- Evening Snacks: 5:00 PM - 6:30 PM
- Dinner: 7:45 PM - 9:45 PM
- Special Diet: Vegetarian and Non-Vegetarian counters are segregated. Dietary special requests can be logged with the Mess Committee.

3. MEDICAL & EMERGENCY SUPPORT:
- 24/7 Campus Health Clinic: Resident Medical Officer available at Ground Floor, Block C.
- Emergency Ambulance Contact: Extension 108 or +1-800-555-0911.`,
  },
  {
    name: 'Training, Placements & Internships',
    slug: 'placements-career',
    description: 'Campus recruitment guidelines, placement eligibility criteria, internship credits, resume formats, and company visits.',
    type: 'global',
    department: 'Placements',
    allowedRoles: ['student', 'faculty', 'admin'],
    suggestedQuestions: [
      'What is the minimum CGPA required to register for campus placements?',
      'How does the Dream Company placement policy work?',
      'Can pre-final year students take 6-month internships?',
    ],
    docTitle: 'Campus Placement Manual & Career Development Policy',
    docContent: `CAREER DEVELOPMENT & PLACEMENT CELL: PLACEMENT GUIDELINES 2026

1. REGISTRATION & ELIGIBILITY:
- Eligibility Benchmark: Minimum 6.5 CGPA with no active backlogs at the start of Semester 7.
- Mandatory Training: 80% attendance in Pre-Placement Soft Skills, Aptitude, and Mock Coding Bootcamps is mandatory to appear for Day 1 recruitment drives.

2. ONE-STUDENT-ONE-OFFER & DREAM JOB POLICY:
- Base Offer: Once a student receives an offer with CTC up to $8,000 (INR 7 LPA), they are eligible to apply only for "Dream Offers" (CTC >= $15,000 / INR 14 LPA) or "Super Dream Offers" (CTC >= $25,000 / INR 24 LPA).
- Internship Conversion: 8th semester students may pursue full-time corporate internships with academic credit transfer upon departmental approval.

3. CONTACT & INTERVIEW DESK:
- Placement Officer: Dr. V. Verma, Placement Cell, 1st Floor, Innovation Tower.
- Email: placements@campusiq.edu. Official Portal: placements.campusiq.edu.`,
  },
];

async function seedData() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    if (!fs.existsSync(sampleDocumentsDir)) {
      fs.mkdirSync(sampleDocumentsDir, { recursive: true });
    }

    // 1. Seed Users
    console.log('Seeding Default Users...');
    await User.deleteMany({ email: { $in: ['admin@campusiq.edu', 'faculty@campusiq.edu', 'student@campusiq.edu'] } });

    const admin = await User.create({
      name: 'Dr. Sarah Connor (Admin)',
      email: 'admin@campusiq.edu',
      password: 'Password123!',
      role: 'admin',
      department: 'Administration',
    });

    const faculty = await User.create({
      name: 'Prof. Alan Turing (Faculty)',
      email: 'faculty@campusiq.edu',
      password: 'Password123!',
      role: 'faculty',
      department: 'Computer Science',
    });

    const student = await User.create({
      name: 'Alex Johnson (Student)',
      email: 'student@campusiq.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Computer Science',
    });

    console.log('Default users created:');
    console.log('  Admin:   admin@campusiq.edu / Password123!');
    console.log('  Faculty: faculty@campusiq.edu / Password123!');
    console.log('  Student: student@campusiq.edu / Password123!');

    // 2. Seed Knowledge Bases & Documents
    console.log('\nSeeding Knowledge Bases & Processing College Documents...');
    for (const item of sampleCollections) {
      let kb = await KnowledgeBase.findOne({ slug: item.slug });
      if (!kb) {
        kb = await KnowledgeBase.create({
          name: item.name,
          slug: item.slug,
          description: item.description,
          type: item.type,
          department: item.department,
          allowedRoles: item.allowedRoles,
          suggestedQuestions: item.suggestedQuestions,
          createdBy: admin._id,
        });
      }

      // Write sample document file
      const filename = `${item.slug}.txt`;
      const filePath = path.join(sampleDocumentsDir, filename);
      fs.writeFileSync(filePath, item.docContent, 'utf8');

      // Create Document
      const doc = await Document.create({
        title: item.docTitle,
        originalFilename: filename,
        storageLocation: filePath,
        mimeType: 'text/plain',
        fileSizeBytes: Buffer.byteLength(item.docContent),
        knowledgeBase: kb._id,
        department: item.department,
        status: 'UPLOADED',
        currentVersion: 1,
        createdBy: admin._id,
      });

      // Run Ingestion & Vector Indexing synchronously for seed
      console.log(`Processing & Indexing: "${item.docTitle}"...`);
      await ingestionService.processDocument(doc._id, 1);
    }

    console.log('\n✅ CampusIQ Database Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
}

seedData();
