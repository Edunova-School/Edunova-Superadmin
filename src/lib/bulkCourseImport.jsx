import { useMemo, useState } from "react";
import {
  getAdminCourses,
  getAdminProgrammes,
  createAdminCourse,
} from "./api";

// Format: [programme code, course code, title, units, semester]
const rawCourses = [
  // ACCOUNTING
 // ACCOUNTING
["ACC", "ACC111", "Introduction to Taxation", 2, 1],
["ACC", "ACC113", "Financial Accounting Fundamentals", 3, 1],
["ACC", "ACC115", "Computer Applications in Accounting", 2, 1],
["ACC", "ACC117", "Introduction to Nigerian Business Law", 2, 1],
["ACC", "ACC119", "Accounting Concepts and Principles", 2, 1],

// ARTIFICIAL INTELLIGENCE
["AI", "AI111", "Introduction to Intelligent Systems", 2, 1],
["AI", "AI113", "Computational Thinking and Problem Solving", 2, 1],
["AI", "AI115", "Linear Algebra for Computing", 3, 1],
["AI", "AI117", "Digital Logic Fundamentals", 2, 1],
["AI", "AI119", "Introduction to Machine Learning Concepts", 2, 1],

// BIOMEDICAL SCIENCES
["BMS", "BMS111", "Introduction to Histology", 2, 1],
["BMS", "BMS113", "Cell Biology", 2, 1],
["BMS", "BMS115", "Scientific Methods and Laboratory Safety", 2, 1],
["BMS", "BMS117", "Introduction to Human Genetics", 2, 1],
["BMS", "BMS119", "Principles of Biomedical Laboratory Practice", 2, 1],

// BUSINESS ADMINISTRATION
["BUS", "BUS111", "Principles of Management", 2, 1],
["BUS", "BUS113", "Introduction to Entrepreneurship", 2, 1],
["BUS", "BUS115", "Business Communication", 2, 1],
["BUS", "BUS117", "Introduction to Nigerian Business Law", 2, 1],
["BUS", "BUS119", "Business Decision-Making Fundamentals", 2, 1],

// CHEMICAL ENGINEERING
["CHE", "CHE111", "Introduction to Process Industries", 2, 1],
["CHE", "CHE113", "Chemical Engineering Workshop Practice", 2, 1],
["CHE", "CHE115", "Engineering Materials Fundamentals", 2, 1],
["CHE", "CHE117", "Process Safety Fundamentals", 2, 1],
["CHE", "CHE119", "Computing for Chemical Engineers", 2, 1],

// CIVIL ENGINEERING
["CVE", "CVE111", "Introduction to Structural Systems", 2, 1],
["CVE", "CVE113", "Construction Materials and Methods", 2, 1],
["CVE", "CVE115", "Engineering Surveying Practice", 2, 1],
["CVE", "CVE117", "Construction Site Safety", 2, 1],
["CVE", "CVE119", "Introduction to Infrastructure Systems", 2, 1],

// COMPUTER SCIENCE
["CSC", "CSC111", "Introduction to Algorithms", 2, 1],
["CSC", "CSC113", "Digital Logic Fundamentals", 2, 1],
["CSC", "CSC115", "Computer Systems Fundamentals", 2, 1],
["CSC", "CSC117", "Problem Solving with Programming", 2, 1],
["CSC", "CSC119", "Introduction to Data Representation", 2, 1],

// CYBERSECURITY
["CYB", "CYB111", "Information Assurance Principles", 2, 1],
["CYB", "CYB113", "Secure Computing Practices", 2, 1],
["CYB", "CYB115", "Introduction to Digital Forensics", 2, 1],
["CYB", "CYB117", "Network Security Fundamentals", 2, 1],
["CYB", "CYB119", "Cyber Ethics and Digital Responsibility", 2, 1],

// ECONOMICS
["ECO", "ECO111", "Nigerian Economic Institutions", 2, 1],
["ECO", "ECO113", "Introduction to Economic History", 2, 1],
["ECO", "ECO115", "Mathematical Economics Fundamentals", 3, 1],
["ECO", "ECO117", "Introduction to Economic Policy", 2, 1],
["ECO", "ECO119", "Economic Data and Computer Applications", 2, 1],

// ELECTRICAL & ELECTRONICS ENGINEERING
["EEE", "EEE111", "Electrical Workshop Practice I", 2, 1],
["EEE", "EEE113", "Introduction to Electronic Devices", 2, 1],
["EEE", "EEE115", "Digital Systems Fundamentals", 2, 1],
["EEE", "EEE117", "Electrical Measurement Fundamentals", 2, 1],
["EEE", "EEE119", "Computing for Electrical Engineers", 2, 1],

// MARKETING
["MKT", "MKT111", "Consumer Behaviour Fundamentals", 2, 1],
["MKT", "MKT113", "Marketing Communication", 2, 1],
["MKT", "MKT115", "Salesmanship and Sales Management", 2, 1],
["MKT", "MKT117", "Market Research Fundamentals", 2, 1],
["MKT", "MKT119", "Digital Tools for Marketing", 2, 1],

// MECHANICAL ENGINEERING
["MEE", "MEE101", "Introduction to Mechanical Engineering", 2, 1],
["MEE", "MEE103", "Engineering Drawing I", 2, 1],
["MEE", "MEE105", "Workshop Technology I", 2, 1],
["MEE", "MEE107", "Engineering Materials", 3, 1],
["MEE", "MEE109", "Introduction to Manufacturing Processes", 2, 1],
["MEE", "MEE111", "Basic Engineering Mechanics", 3, 1],
["MEE", "MEE173", "Engineering Laboratory Practice I", 1, 1],
["MEE", "MEE193", "Introductory Engineering Design", 2, 1],

// MECHATRONICS ENGINEERING
["MTE", "MTE111", "Introduction to Sensors and Actuators", 2, 1],
["MTE", "MTE113", "Digital Logic Fundamentals", 2, 1],
["MTE", "MTE115", "Basic Electrical Systems", 3, 1],
["MTE", "MTE117", "Programming for Engineers I", 3, 1],
["MTE", "MTE119", "Mechatronics Workshop Practice", 2, 1],

// NURSING SCIENCE
["NSC", "NSC111", "Introduction to Nursing Practice", 2, 1],
["NSC", "NSC113", "Health Assessment Fundamentals", 2, 1],
["NSC", "NSC115", "Foundations of Patient Care", 2, 1],
["NSC", "NSC117", "Introduction to Community Health Nursing", 2, 1],
["NSC", "NSC119", "Professional Ethics in Nursing", 2, 1],

// PUBLIC HEALTH
["PHE", "PHE111", "Principles of Epidemiology", 3, 1],
["PHE", "PHE113", "Environmental Health Fundamentals", 2, 1],
["PHE", "PHE115", "Health Promotion Principles", 2, 1],
["PHE", "PHE117", "Introduction to Health Systems", 2, 1],
["PHE", "PHE119", "Community Health Fundamentals", 2, 1],

// SOFTWARE ENGINEERING
["SWE", "SWE111", "Requirements Analysis Fundamentals", 2, 1],
["SWE", "SWE113", "Introduction to Software Design", 2, 1],
["SWE", "SWE115", "Version Control and Development Tools", 2, 1],
["SWE", "SWE117", "Software Testing Fundamentals", 2, 1],
["SWE", "SWE119", "Problem Solving for Software Developers", 2, 1],
 // ACCOUNTING — SECOND SEMESTER
["ACC", "ACC102", "Principles of Accounting II", 3, 2],
["ACC", "ACC104", "Cost Accounting Fundamentals", 3, 2],
["ACC", "ACC106", "Business Mathematics II", 2, 2],
["ACC", "ACC108", "Introduction to Auditing", 2, 2],
["ACC", "ACC110", "Accounting Information Systems", 2, 2],
["ACC", "ACC112", "Financial Accounting Practice", 2, 2],
["ACC", "ACC114", "Public Sector Accounting Fundamentals", 2, 2],
["ACC", "ACC116", "Tax Administration in Nigeria", 2, 2],
["ACC", "ACC118", "Spreadsheet Applications for Accountants", 2, 2],
["ACC", "ACC120", "Accounting Ethics and Professional Conduct", 2, 2],

// ARTIFICIAL INTELLIGENCE
["AI", "AI102", "Foundations of Intelligent Systems", 3, 2],
["AI", "AI104", "Programming Fundamentals II", 3, 2],
["AI", "AI106", "Introduction to Data Structures", 3, 2],
["AI", "AI108", "Probability for Artificial Intelligence", 3, 2],
["AI", "AI110", "Search Algorithms and Problem Solving", 2, 2],
["AI", "AI112", "Introduction to Knowledge Representation", 2, 2],
["AI", "AI114", "Data Handling and Visualisation", 2, 2],
["AI", "AI116", "Introduction to Robotics", 2, 2],
["AI", "AI118", "Ethics in Artificial Intelligence", 2, 2],
["AI", "AI120", "Practical Computing Laboratory", 1, 2],

// BIOMEDICAL SCIENCES
["BMS", "BMS102", "Foundations of Human Biology", 3, 2],
["BMS", "BMS104", "Human Anatomy II", 3, 2],
["BMS", "BMS106", "Human Physiology II", 3, 2],
["BMS", "BMS108", "Medical Biochemistry II", 3, 2],
["BMS", "BMS110", "Basic Immunology", 2, 2],
["BMS", "BMS112", "Introduction to Medical Microbiology", 2, 2],
["BMS", "BMS114", "Histology Laboratory Practice", 2, 2],
["BMS", "BMS116", "Human Genetics Fundamentals", 2, 2],
["BMS", "BMS118", "Biomedical Laboratory Techniques", 2, 2],
["BMS", "BMS120", "Scientific Data Recording and Analysis", 2, 2],

// BUSINESS ADMINISTRATION
["BUS", "BUS102", "Principles of Management", 3, 2],
["BUS", "BUS104", "Introduction to Organisational Behaviour", 2, 2],
["BUS", "BUS106", "Business Mathematics II", 2, 2],
["BUS", "BUS108", "Business Law Fundamentals", 2, 2],
["BUS", "BUS110", "Entrepreneurship and Small Business", 3, 2],
["BUS", "BUS112", "Human Resource Management Fundamentals", 2, 2],
["BUS", "BUS114", "Introduction to Operations Management", 2, 2],
["BUS", "BUS116", "Business Information Systems", 2, 2],
["BUS", "BUS118", "Business Research Fundamentals", 2, 2],
["BUS", "BUS120", "Business Planning and Decision-Making", 2, 2],

// CHEMICAL ENGINEERING
["CHE", "CHE102", "Chemical Engineering Fundamentals II", 2, 2],
["CHE", "CHE104", "Introduction to Process Calculations", 3, 2],
["CHE", "CHE106", "Chemical Engineering Laboratory I", 2, 2],
["CHE", "CHE108", "Fluid Flow Fundamentals", 3, 2],
["CHE", "CHE110", "Introduction to Thermodynamics", 3, 2],
["CHE", "CHE112", "Process Equipment and Safety", 2, 2],
["CHE", "CHE114", "Industrial Chemistry Applications", 2, 2],
["CHE", "CHE116", "Chemical Engineering Materials", 2, 2],
["CHE", "CHE118", "Engineering Computing and Simulation", 2, 2],
["CHE", "CHE120", "Introduction to Environmental Process Engineering", 2, 2],

// CIVIL ENGINEERING
["CVE", "CVE102", "Civil Engineering Materials", 2, 2],
["CVE", "CVE104", "Surveying Fundamentals", 3, 2],
["CVE", "CVE106", "Engineering Mechanics I", 3, 2],
["CVE", "CVE108", "Introduction to Structural Analysis", 2, 2],
["CVE", "CVE110", "Construction Technology I", 2, 2],
["CVE", "CVE112", "Engineering Geology Fundamentals", 2, 2],
["CVE", "CVE114", "Technical Drawing and CAD", 2, 2],
["CVE", "CVE116", "Fluid Mechanics Fundamentals", 3, 2],
["CVE", "CVE118", "Surveying Field Practice", 2, 2],
["CVE", "CVE120", "Construction Safety and Site Management", 2, 2],

// COMPUTER SCIENCE
["CSC", "CSC102", "Computer Systems and Applications", 2, 2],
["CSC", "CSC104", "Programming Fundamentals II", 3, 2],
["CSC", "CSC106", "Data Structures Fundamentals", 3, 2],
["CSC", "CSC108", "Logic and Discrete Structures II", 3, 2],
["CSC", "CSC110", "Computer Organisation", 2, 2],
["CSC", "CSC112", "Introduction to Database Systems", 2, 2],
["CSC", "CSC114", "Web Technologies Fundamentals", 2, 2],
["CSC", "CSC116", "Operating Systems Concepts", 2, 2],
["CSC", "CSC118", "Software Development Laboratory", 2, 2],
["CSC", "CSC120", "Computing Ethics and Professional Practice", 2, 2],

// CYBERSECURITY
["CYB", "CYB102", "Foundations of Information Security", 3, 2],
["CYB", "CYB104", "Network Security Fundamentals", 3, 2],
["CYB", "CYB106", "Secure Programming Fundamentals", 3, 2],
["CYB", "CYB108", "Introduction to Cryptography", 2, 2],
["CYB", "CYB110", "Digital Forensics Laboratory", 2, 2],
["CYB", "CYB112", "Access Control and Identity Management", 2, 2],
["CYB", "CYB114", "Cybersecurity Risk Fundamentals", 2, 2],
["CYB", "CYB116", "Operating Systems Security", 2, 2],
["CYB", "CYB118", "Cyber Law and Digital Ethics", 2, 2],
["CYB", "CYB120", "Security Awareness and Incident Reporting", 2, 2],

// ECONOMICS
["ECO", "ECO102", "Principles of Economics II", 3, 2],
["ECO", "ECO104", "Introduction to Macroeconomics", 3, 2],
["ECO", "ECO106", "Mathematics for Economists II", 3, 2],
["ECO", "ECO108", "Statistical Methods for Economics", 3, 2],
["ECO", "ECO110", "Nigerian Economic Development", 2, 2],
["ECO", "ECO112", "Introduction to Public Finance", 2, 2],
["ECO", "ECO114", "Economic Systems and Institutions", 2, 2],
["ECO", "ECO116", "Introduction to Development Economics", 2, 2],
["ECO", "ECO118", "Economic Data Analysis", 2, 2],
["ECO", "ECO120", "Introduction to Research in Economics", 2, 2],

// ELECTRICAL & ELECTRONICS ENGINEERING
["EEE", "EEE102", "Electrical Engineering Fundamentals", 2, 2],
["EEE", "EEE104", "Basic Electrical Engineering Laboratory", 2, 2],
["EEE", "EEE106", "Circuit Theory II", 3, 2],
["EEE", "EEE108", "Electronic Circuits Fundamentals", 3, 2],
["EEE", "EEE110", "Electrical Measurements and Instrumentation", 2, 2],
["EEE", "EEE112", "Digital Electronics I", 2, 2],
["EEE", "EEE114", "Electrical Machines Fundamentals", 2, 2],
["EEE", "EEE116", "Computer-Aided Electrical Design", 2, 2],
["EEE", "EEE118", "Electrical Installation Practice", 2, 2],
["EEE", "EEE120", "Electrical Safety and Standards", 2, 2],

// MARKETING
["MKT", "MKT102", "Principles of Marketing II", 3, 2],
["MKT", "MKT104", "Consumer Behaviour", 2, 2],
["MKT", "MKT106", "Marketing Research Fundamentals", 2, 2],
["MKT", "MKT108", "Sales Management", 2, 2],
["MKT", "MKT110", "Advertising Principles", 2, 2],
["MKT", "MKT112", "Retail Marketing Fundamentals", 2, 2],
["MKT", "MKT114", "Digital Marketing Fundamentals", 2, 2],
["MKT", "MKT116", "Product and Brand Management", 2, 2],
["MKT", "MKT118", "Marketing Analytics Fundamentals", 2, 2],
["MKT", "MKT120", "Customer Relationship Management", 2, 2],

// MECHANICAL ENGINEERING
["MEE", "MEE102", "Workshop Technology II", 2, 2],
["MEE", "MEE104", "Engineering Mechanics I", 3, 2],
["MEE", "MEE106", "Engineering Drawing II", 2, 2],
["MEE", "MEE108", "Manufacturing Processes I", 2, 2],
["MEE", "MEE110", "Applied Engineering Materials", 2, 2],
["MEE", "MEE112", "Basic Thermodynamics", 3, 2],
["MEE", "MEE174", "Engineering Laboratory Practice II", 1, 2],
["MEE", "MEE194", "Engineering Design Practice I", 2, 2],
["MEE", "MEE116", "Introduction to Fluid Mechanics", 3, 2],
["MEE", "MEE118", "Mechanical Measurement Fundamentals", 2, 2],

// MECHATRONICS ENGINEERING
["MTE", "MTE102", "Fundamentals of Electrical Systems", 2, 2],
["MTE", "MTE104", "Engineering Mechanics I", 3, 2],
["MTE", "MTE106", "Programming for Engineers II", 3, 2],
["MTE", "MTE108", "Introduction to Control Systems", 2, 2],
["MTE", "MTE110", "Sensors and Instrumentation", 2, 2],
["MTE", "MTE112", "Digital Electronics Fundamentals", 2, 2],
["MTE", "MTE114", "Engineering Workshop Practice II", 2, 2],
["MTE", "MTE116", "Computer-Aided Engineering Design", 2, 2],
["MTE", "MTE118", "Actuators and Motion Systems", 2, 2],
["MTE", "MTE120", "Introduction to Embedded Systems", 2, 2],

// NURSING SCIENCE
["NSC", "NSC102", "Fundamentals of Nursing Practice", 3, 2],
["NSC", "NSC104", "Basic Nursing Skills Laboratory", 2, 2],
["NSC", "NSC106", "Human Anatomy II", 3, 2],
["NSC", "NSC108", "Human Physiology II", 3, 2],
["NSC", "NSC110", "Microbiology for Nursing", 2, 2],
["NSC", "NSC112", "Nutrition in Nursing Practice", 2, 2],
["NSC", "NSC114", "Psychology for Nursing", 2, 2],
["NSC", "NSC116", "Community Health Nursing Fundamentals", 2, 2],
["NSC", "NSC118", "Nursing Ethics and Professional Conduct", 2, 2],
["NSC", "NSC120", "Patient Safety and Infection Prevention", 2, 2],

// PUBLIC HEALTH
["PHE", "PHE102", "Principles of Health Promotion", 3, 2],
["PHE", "PHE104", "Introduction to Biostatistics", 3, 2],
["PHE", "PHE106", "Environmental Health II", 2, 2],
["PHE", "PHE108", "Community Health Fundamentals", 2, 2],
["PHE", "PHE110", "Health Systems and Policy", 2, 2],
["PHE", "PHE112", "Introduction to Epidemiological Methods", 3, 2],
["PHE", "PHE114", "Health Communication", 2, 2],
["PHE", "PHE116", "Disease Prevention and Control", 2, 2],
["PHE", "PHE118", "Introduction to Occupational Health", 2, 2],
["PHE", "PHE120", "Public Health Field Practice", 2, 2],

// SOFTWARE ENGINEERING
["SWE", "SWE102", "Software Development Fundamentals", 3, 2],
["SWE", "SWE104", "Programming Fundamentals II", 3, 2],
["SWE", "SWE106", "Data Structures for Software Engineers", 3, 2],
["SWE", "SWE108", "Software Requirements Fundamentals", 2, 2],
["SWE", "SWE110", "Introduction to Software Testing", 2, 2],
["SWE", "SWE112", "Web Development Fundamentals", 2, 2],
["SWE", "SWE114", "Database Fundamentals", 2, 2],
["SWE", "SWE116", "Version Control and Team Development", 2, 2],
["SWE", "SWE118", "Software Design Principles", 2, 2],
["SWE", "SWE120", "Software Engineering Laboratory", 2, 2],
]

const programmeNameByCode = {
  ACC: ["accounting"],
  AI: ["artificial intelligence"],
  BMS: ["biomedical sciences"],
  BUS: ["business administration"],
  CHE: ["chemical engineering"],
  CVE: ["civil engineering"],
  CSC: ["computer science"],
  CYB: ["cybersecurity", "cyber security"],
  ECO: ["economics"],
  EEE: [
    "electrical and electronics engineering",
    "electrical & electronics engineering",
    "electrical and electronic engineering",
  ],
  MKT: ["marketing"],
  MEE: ["mechanical engineering"],
  MTE: ["mechatronics engineering"],
  NSC: ["nursing science"],
  PHE: ["public health"],
  SWE: ["software engineering"],
};

function normalizeName(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/\bb\.?\s*(sc|eng)\.?\s*/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function isInformationSecurity(programme) {
  const code = String(
    programme.code ?? programme.programme_code ?? "",
  ).toUpperCase();

  const name = normalizeName(
    programme.name ??
      programme.programme_name ??
      programme.title ??
      "",
  );

  return (
    code === "INS" ||
    name.includes("informationsecurity")
  );
}

function buildProgrammeMap(programmes) {
  const byCode = new Map();
  const unmatched = [];

  for (const [code, possibleNames] of Object.entries(programmeNameByCode)) {
    const targetNames = possibleNames.map(normalizeName);

    const programme = programmes.find((item) => {
      if (isInformationSecurity(item)) return false;

      const actualCode = String(
        item.code ?? item.programme_code ?? "",
      ).toUpperCase();

      if (actualCode === code) return true;

      const actualName = normalizeName(
        item.name ??
          item.programme_name ??
          item.title ??
          "",
      );

      return targetNames.includes(actualName);
    });

    if (programme?.id) {
      byCode.set(code, programme);
    } else {
      unmatched.push(code);
    }
  }

  return { byCode, unmatched };
}

function asArray(response) {
  if (Array.isArray(response)) return response;

  if (response && typeof response === "object") {
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.results)) return response.results;
    if (Array.isArray(response.programmes)) return response.programmes;
    if (Array.isArray(response.courses)) return response.courses;
  }

  throw new Error(
    "Unexpected API response format. Check the API response in the browser console.",
  );
}

function makeKey(code, programmeId, level, semester) {
  return `${String(code).trim().toUpperCase()}|${programmeId}|${level}|${semester}`;
}

function getErrorMessage(error) {
  if (error instanceof Error) return error.message;
  return "The API request failed.";
}

export default function BulkCourseImport() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const rows = useMemo(
    () =>
      rawCourses.map(
        ([programmeCode, code, title, credit_units, semester]) => ({
          programmeCode,
          code,
          title,
          credit_units,
          level: 100,
          semester,
        }),
      ),
    [],
  );

  async function loadCatalogue() {
    const [programmeResponse, courseResponse] = await Promise.all([
      getAdminProgrammes(),
      getAdminCourses(),
    ]);

    const programmes = asArray(programmeResponse);
    const courses = asArray(courseResponse);

    return {
      programmes,
      courses,
      ...buildProgrammeMap(programmes),
    };
  }

  async function prepareImport() {
    setLoading(true);
    setError("");
    setReport(null);
    setPreview(null);
    setProgress(0);

    try {
      const { programmes, courses, byCode, unmatched } =
        await loadCatalogue();

      // Helpful diagnostic information if the programme structure differs.
      console.log("EduNova programmes returned by API:", programmes);
      console.log(
        "Matched programme codes:",
        [...byCode.keys()],
      );

      const existing = new Set(
        courses.map((course) =>
          makeKey(
            course.code,
            course.programme_id ?? course.programme?.id,
            course.level,
            course.semester,
          ),
        ),
      );

      const seen = new Set();
      const missing = new Set(unmatched);
      let alreadyPresent = 0;
      let eligible = 0;

      for (const row of rows) {
        const programme = byCode.get(row.programmeCode);

        if (!programme) {
          missing.add(row.programmeCode);
          continue;
        }

        const key = makeKey(
          row.code,
          programme.id,
          row.level,
          row.semester,
        );

        if (existing.has(key) || seen.has(key)) {
          alreadyPresent++;
          continue;
        }

        seen.add(key);
        eligible++;
      }

      setPreview({
        total: rows.length,
        existing: alreadyPresent,
        eligible,
        missingProgrammes: [...missing],
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function runImport() {
    if (!preview || preview.eligible === 0) return;

    if (
      !window.confirm(
        `Create up to ${preview.eligible} course records? Existing matching courses will be skipped.`,
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");
    setReport(null);
    setProgress(0);

    const result = {
      created: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    };

    try {
      const { courses, byCode } = await loadCatalogue();

      const existing = new Set(
        courses.map((course) =>
          makeKey(
            course.code,
            course.programme_id ?? course.programme?.id,
            course.level,
            course.semester,
          ),
        ),
      );

      const seen = new Set();
      const importRows = rows.filter((row) => byCode.has(row.programmeCode));

      for (let i = 0; i < importRows.length; i++) {
        const row = importRows[i];

        setProgress(
          Math.round(((i + 1) / Math.max(importRows.length, 1)) * 100),
        );

        const programme = byCode.get(row.programmeCode);

        if (!programme?.id) {
          result.failed++;
          result.errors.push(
            `${row.programmeCode} / ${row.code}: programme ID is missing.`,
          );
          continue;
        }

        const key = makeKey(
          row.code,
          programme.id,
          row.level,
          row.semester,
        );

        if (existing.has(key) || seen.has(key)) {
          result.skipped++;
          continue;
        }

        seen.add(key);

        const payload = {
          code: row.code,
          title: row.title,
          credit_units: row.credit_units,
          level: row.level,
          semester: row.semester,
          programme_id: programme.id,
        };

        try {
          await createAdminCourse(payload);
          result.created++;
          existing.add(key);
        } catch (err) {
          result.failed++;
          result.errors.push(
            `${row.programmeCode} / ${row.code}: ${getErrorMessage(err)}`,
          );
        }
      }

      // Include all rows belonging to programmes that could not be matched.
      for (const row of rows) {
        if (!byCode.has(row.programmeCode)) {
          result.failed++;
          result.errors.push(
            `${row.programmeCode} / ${row.code}: programme not found in the API response.`,
          );
        }
      }

      setReport(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Bulk Course Import
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Import suggested 100-level courses for 16 programmes.
          Information Security (INS) is excluded.
        </p>
      </div>

      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        These are suggested course records, not a verified official
        curriculum. Confirm the academic requirements before using them
        for actual student registration.
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-600">Catalogue size</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">
          {rows.length} course records
        </p>

        <button
          type="button"
          onClick={prepareImport}
          disabled={loading}
          className="mt-5 rounded-lg bg-slate-900 px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Please wait..." : "Check Existing Courses"}
        </button>

        {preview && (
          <div className="mt-5 space-y-3 text-sm">
            <p>Total catalogue records: {preview.total}</p>
            <p>Already present / duplicate rows: {preview.existing}</p>
            <p>Eligible to create: {preview.eligible}</p>

            {preview.missingProgrammes.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
                <p className="font-semibold">Unmatched programmes</p>
                <p className="mt-1">
                  {preview.missingProgrammes.join(", ")}
                </p>
                <p className="mt-2">
                  The importer will not create courses for unmatched
                  programmes. Check the programme records in the browser
                  console before proceeding.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={runImport}
              disabled={loading || preview.eligible === 0}
              className="mt-3 rounded-lg bg-blue-700 px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Importing..." : "Import Eligible Courses"}
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span>Import progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-blue-700 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {report && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Import Report
          </h2>

          <p>Created successfully: {report.created}</p>
          <p>Skipped: {report.skipped}</p>
          <p>Failed: {report.failed}</p>

          {report.errors.length > 0 && (
            <details>
              <summary className="cursor-pointer font-medium text-red-700">
                View errors ({report.errors.length})
              </summary>

              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-red-700">
                {report.errors.map((message, index) => (
                  <li key={`${index}-${message}`}>{message}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}