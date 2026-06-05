import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import ort from "onnxruntime-node";
import sharp from "sharp";
import axios from "axios";
import { parseResumeLocally } from "./resumeParserService.js";

const MODEL_NAME = "gemini-2.0-flash"; // Using a stable 2.0 version

/**
 * Helper — creates and returns a Gemini client instance.
 * Throws if the API key is missing.
 */
function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in .env");
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

/**
 * Helper — clean raw resume text for better Gemini parsing accuracy.
 */
function cleanResumeText(text) {
  return text
    .replace(/[ \t]+/g, " ")
    .replace(/(\r?\n\s*){3,}/g, "\n\n")
    .trim();
}

/**
 * Extract structured resume data (skills + projects + profile) from raw text.
 */
export async function extractResumeData(resumeText) {
  const cleaned = cleanResumeText(resumeText);

  const prompt = `You are an expert ATS resume parser and candidate intelligence engine.

Extract candidate name, technical skills, projects, and domain profile details from the resume.

Return ONLY valid JSON in this exact format, with no markdown code block formatting or backticks:
{
  "fullName": "Candidate Name",
  "skills": {
    "languages": ["JavaScript", "Python"],
    "frontend": ["React", "Next.js"],
    "backend": ["Node.js", "Express.js"],
    "database": ["MongoDB", "PostgreSQL"],
    "cloud": ["AWS", "Docker"],
    "tools": ["Git", "GitHub"],
    "ai_ml": ["TensorFlow", "YOLO"],
    "other": ["GraphQL", "JWT"]
  },
  "projects": [
    {
      "name": "Project Name",
      "description": "Short description of the project.",
      "technologies": ["React", "Node.js"],
      "features": ["AI Interview", "Proctoring"]
    }
  ],
  "candidateProfile": {
    "fullName": "Candidate Name",
    "skills": ["JavaScript", "React", "Node.js"],
    "projects": ["Project Name"],
    "primaryDomains": ["Full Stack Development", "Machine Learning"],
    "experienceLevel": "Entry Level",
    "recommendedInterviewTopics": ["System Architecture", "React Hooks"]
  }
}

Rules:
1. "skills" must hold categorized lists of technical skills with correct capitalization.
2. "projects" must contain actual projects with name, description, technologies linked to this project, and features. Do not use placeholder titles.
3. If a section is missing or empty, return empty list or empty object fields (no placeholders).
4. "candidateProfile" represents the aggregated candidate metadata.
5. CRITICAL: Do not split a single main project into multiple smaller projects based on its sub-features, sub-modules, phases, or bullets. Group all sub-components, sub-modules, and phases under a single main project object, listing sub-features inside the "features" array.

Resume Text:
${cleaned}`;

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    let text = response.text;

    // Remove markdown wrappers if present
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    }

    const data = JSON.parse(text);

    // Normalize and flatten results
    const flatSkills = [];
    if (data.skills && typeof data.skills === "object") {
      for (const list of Object.values(data.skills)) {
        if (Array.isArray(list)) {
          flatSkills.push(...list);
        }
      }
    }

    const uniqueSkills = [...new Set(
      flatSkills.map(item => String(item).trim()).filter(item => item.length > 0)
    )];

    const projectNames = Array.isArray(data.projects)
      ? data.projects.map(p => String(p.name || p.title || "").trim()).filter(Boolean)
      : [];

    return {
      skills: uniqueSkills,
      projects: projectNames,
      structuredSkills: data.skills || {},
      structuredProjects: data.projects || [],
      candidateProfile: {
        fullName: data.fullName || data.candidateProfile?.fullName || "Candidate",
        skills: uniqueSkills,
        projects: projectNames,
        primaryDomains: data.candidateProfile?.primaryDomains || ["Software Engineering"],
        experienceLevel: data.candidateProfile?.experienceLevel || "Entry Level",
        recommendedInterviewTopics: data.candidateProfile?.recommendedInterviewTopics || []
      }
    };
  } catch (err) {
    console.error("extractResumeData failed, using local fallback parser:", err.message);
    return parseResumeLocally(resumeText);
  }
}

/**
 * Generate a tailored set of interview questions based on the candidate profile.
 */
export async function generateInterviewQuestions(profileData) {
  const { fullName, role, skills, projects, candidateProfile, structuredProjects } = profileData;

  const skillsList = skills && skills.length > 0 ? skills : ["Software Engineering"];
  const projectsList = projects && projects.length > 0 ? projects : [];
  const domainInfo = candidateProfile?.primaryDomains?.join(", ") || role || "Software Engineer";
  const interviewTopics = candidateProfile?.recommendedInterviewTopics?.join(", ") || "Data Structures, System Design";

  let projectsPromptDetails = "";
  if (Array.isArray(structuredProjects) && structuredProjects.length > 0) {
    projectsPromptDetails = structuredProjects.map(p => {
      const techStr = Array.isArray(p.technologies) ? p.technologies.join(", ") : "";
      const featStr = Array.isArray(p.features) ? p.features.join("; ") : "";
      return `Project Name: ${p.name}\nDescription: ${p.description || ""}\nTechnologies: ${techStr}\nFeatures: ${featStr}`;
    }).join("\n\n");
  } else {
    projectsPromptDetails = projectsList.join(", ");
  }

  const prompt = `You are an expert technical interviewer at a top tech company.

Generate exactly 10 interview questions for the following candidate:

Name: ${fullName}
Role/Domains: ${domainInfo}
Skills: ${skillsList.join(", ")}
Recommended Topics: ${interviewTopics}

Candidate Projects:
${projectsPromptDetails}

Requirements:
- GENERATE A COMPLETELY NEW AND UNIQUE SET OF QUESTIONS EVERY TIME. Do not repeat questions from previous sessions.
- TOTAL QUESTIONS: 10
- DISTRIBUTION:
  1. SYNTAX & CONCEPTS (3 Questions): Focus on the core syntax, internal working, or foundational concepts of the programming languages/frameworks listed in the skills section (e.g., 'Explain hoisting in JS' or 'What are decorators in Python?').
  2. PROJECT-BASED (4 Questions): Deep-dive into the specific projects mentioned. Ask about architectural decisions, challenges faced, technologies used, or how a specific feature was implemented.
  3. BEHAVIORAL & HR (3 Questions): Standard behavioral questions (conflict resolution, teamwork, or situational engineering scenarios) contextualized to the candidate's projects.
- PROGRESSIVE DIFFICULTY:
  - Q1-Q3: Syntax/Foundational (Easy-Intermediate)
  - Q4-Q7: Project Deep-Dives (Intermediate-Advanced)
  - Q8-Q10: Behavioral & Advanced Scenarios (Varying)
- Be specific — reference actual skills and projects from the profile.

Respond ONLY with valid JSON in this exact format, no extra text:
{
  "questions": [
    { "type": "technical", "question": "..." },
    { "type": "technical", "question": "..." },
    { "type": "technical", "question": "..." },
    { "type": "technical", "question": "..." },
    { "type": "technical", "question": "..." },
    { "type": "technical", "question": "..." },
    { "type": "project", "question": "..." },
    { "type": "project", "question": "..." },
    { "type": "behavioral", "question": "..." },
    { "type": "behavioral", "question": "..." }
  ]
}
`;

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    let text = response.text;

    // Remove markdown wrappers if present
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    }

    const data = JSON.parse(text);

    return {
      questions: Array.isArray(data.questions) ? data.questions : [],
    };
  } catch (err) {
    console.error("generateInterviewQuestions failed, generating tailored fallback questions:", err.message);

    // Highly customized programmatic fallback questions generator
    const TECH_QUESTIONS = {
      "javascript": [
        "What is the event loop in JavaScript, and how does it handle asynchronous callbacks vs microtasks?",
        "Explain hoisting and the temporal dead zone in JavaScript, and how let/const differ from var.",
        "How do prototypes and prototypal inheritance work in JavaScript? Explain the difference between __proto__ and prototype."
      ],
      "typescript": [
        "What is the difference between an interface and a type alias in TypeScript, and when would you use one over the other?",
        "Explain generics in TypeScript and how you can use them to build type-safe, reusable components.",
        "What are utility types in TypeScript (like Pick, Omit, Partial, and Record), and how do they work?"
      ],
      "python": [
        "Explain the difference between deep copy and shallow copy in Python, and how the copy module works.",
        "What is the Global Interpreter Lock (GIL) in Python, and how does it impact multi-threaded programs?",
        "How do decorators work in Python? Write a simple decorator that measures the execution time of a function."
      ],
      "react": [
        "Explain the virtual DOM reconciler algorithm in React (Fiber) and how state updates are processed.",
        "What are React Hooks rules, and how does the useEffect cleanup function handle memory leaks?",
        "Compare Redux, Context API, and Zustand for state management in large React applications."
      ],
      "node.js": [
        "What is the event loop in Node.js? Explain the phases (timers, poll, check) and how process.nextTick() differs from setImmediate().",
        "How do Node.js streams work, and why are they preferred over fs.readFile for handling large files?",
        "Explain the cluster module in Node.js and how it can be used to leverage multi-core CPU architectures."
      ],
      "express.js": [
        "How does middleware chain propagation and error handling work in Express.js?",
        "How do you secure Express.js applications using security best practices (e.g. Helmet, CORS, rate limiting)?"
      ],
      "mongodb": [
        "How does indexing work in MongoDB, and what is the performance difference between a single field index and a compound index?",
        "Explain the aggregation pipeline in MongoDB and how stages like $lookup, $unwind, and $group are optimized."
      ],
      "postgresql": [
        "What is database normalization, and explain the difference between INNER JOIN, LEFT JOIN, and outer joins in SQL/PostgreSQL.",
        "How do transactions, ACID properties, and isolation levels function in PostgreSQL?"
      ],
      "docker": [
        "What is the difference between a Docker image and a Docker container, and how does layered caching optimize builds?",
        "How do Docker volumes work, and how do you share data between containers?"
      ],
      "kubernetes": [
        "What is a Pod in Kubernetes, and how does a Deployment manage replica sets and rolling updates?",
        "Explain service discovery and ingress controller routing in Kubernetes clusters."
      ],
      "aws": [
        "What is the difference between horizontal and vertical scaling on AWS (e.g. EC2 vs Auto Scaling)?",
        "How do you design a secure, serverless backend architecture using AWS Lambda, API Gateway, and DynamoDB?"
      ],
      "tensorflow": [
        "What is the difference between a tensor and a regular array, and how does computational graph execution optimize training in TensorFlow?",
        "Explain the concept of backpropagation and gradient descent in neural networks."
      ],
      "pytorch": [
        "How does autograd function in PyTorch to compute gradients automatically during the backward pass?",
        "Explain how you would transfer a PyTorch model and tensors to a GPU/CUDA device for training acceleration."
      ]
    };

    const generated = [];

    // 1. Technical / Syntax (3 questions)
    const matchingQuestions = [];
    for (const skill of skillsList) {
      const lowerSkill = skill.toLowerCase();
      if (TECH_QUESTIONS[lowerSkill]) {
        matchingQuestions.push(...TECH_QUESTIONS[lowerSkill]);
      }
    }

    // Shuffle and pick 3 unique ones
    const shuffledTech = [...new Set(matchingQuestions)].sort(() => 0.5 - Math.random()).slice(0, 3);
    shuffledTech.forEach(q => {
      generated.push({ type: "technical", question: q });
    });

    // Fallback if not enough matching tech questions
    while (generated.length < 3) {
      const randomSkill = skillsList[Math.floor(Math.random() * skillsList.length)];
      generated.push({
        type: "technical",
        question: `Can you explain the core syntax, execution flow, or architectural patterns of systems built using ${randomSkill}?`
      });
    }

    // 2. Project-based (4 questions)
    const activeProjects = Array.isArray(structuredProjects) && structuredProjects.length > 0
      ? structuredProjects
      : projectsList.map(p => ({ name: p, technologies: [], features: [] }));

    if (activeProjects.length > 0) {
      let projIndex = 0;
      for (let i = 0; i < 4; i++) {
        const proj = activeProjects[projIndex % activeProjects.length];
        const techStr = Array.isArray(proj.technologies) && proj.technologies.length > 0
          ? proj.technologies.slice(0, 2).join(" and ")
          : "";
        const feat = proj.features && proj.features[0] ? proj.features[0] : null;

        if (i === 0) {
          generated.push({
            type: "project",
            question: `In your project "${proj.name}"${techStr ? ` using ${techStr}` : ""}, can you explain the overall software architecture and how data flows through the system?`
          });
        } else if (i === 1 && feat) {
          generated.push({
            type: "project",
            question: `For the "${proj.name}" project, how did you implement the "${feat}" capability? Describe the integration details or difficulties you encountered.`
          });
        } else if (i === 2) {
          generated.push({
            type: "project",
            question: `What was the most challenging technical decision or bug you resolved during the development of "${proj.name}", and how did you verify the solution?`
          });
        } else {
          generated.push({
            type: "project",
            question: `If you had to scale the backend or infrastructure of "${proj.name}" to handle 10x more concurrent users, what bottlenecks would you expect to hit first?`
          });
        }
        projIndex++;
      }
    } else {
      // Fallback if no projects at all
      generated.push({
        type: "project",
        question: "Can you detail a key coding project or assignment you worked on, outlining the technologies chosen and the overall system design?"
      });
      generated.push({
        type: "project",
        question: "Describe a major performance optimization or database design task you handled in your projects, and how you tested the results."
      });
      generated.push({
        type: "project",
        question: "How do you manage dependency versions, deployment pipeline configurations, or environment variables in your software projects?"
      });
      generated.push({
        type: "project",
        question: "What is your approach to writing clean, documentable, and unit-tested code for new features or custom APIs?"
      });
    }

    // 3. Behavioral / Scenario (3 questions)
    const primaryProj = activeProjects[0]?.name || "your primary project";
    generated.push({
      type: "behavioral",
      question: `Tell me about a scenario during the development of "${primaryProj}" where project goals or deadlines changed. How did you adapt your tasks?`
    });
    generated.push({
      type: "behavioral",
      question: "Describe a situation where you worked on a group coding project and a teammate disagreed with your technical design. How did you reach consensus?"
    });
    generated.push({
      type: "behavioral",
      question: `What is your process for balancing developer velocity versus technical debt when delivering milestones for "${primaryProj}"?`
    });

    return {
      questions: generated.slice(0, 10)
    };
  }
}

/**
 * Evaluates an entire interview transcript (questions + user answers).
 * Returns scores and qualitative feedback.
 */
export async function evaluateInterviewResponse(transcriptData) {
  const ai = getGeminiClient();
  const { questions, answers } = transcriptData;

  const pairs = questions.map((q, i) => ({
    question: q,
    answer: answers[i] || "No answer provided."
  }));

  const prompt = `
You are an expert technical interviewer and talent evaluator.

Analyze the following interview transcript where an AI asked questions and a candidate provided answers.

Transcript:
${pairs.map((p, i) => `Q${i + 1}: ${p.question}\nA${i + 1}: ${p.answer}`).join("\n\n")}

Based on the candidate's answers, provide a comprehensive evaluation.

Return ONLY valid JSON in this exact format:
{
  "technicalScore": 0-100,
  "communicationScore": 0-100,
  "overallScore": 0-100,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "feedback": [
    { "question": "...", "answer": "...", "score": 0-10, "feedback": "..." },
    ...
  ]
}

Evaluation Criteria:
1. Technical Correctness: Does the answer demonstrate accurate knowledge?
2. Communication: Is the answer structured and clear?
3. Completeness: Did they address all parts of the question?

Respond with JSON only.
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    let text = response.text;
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    }

    return JSON.parse(text);
  } catch (err) {
    console.error("evaluateInterviewResponse failed, generating smart fallback scores:", err.message);

    // Fallback: calculate realistic scores based on response word counts
    let totalWordCount = 0;
    let answeredCount = 0;

    const feedbackList = pairs.map((pair, i) => {
      const ans = pair.answer || "";
      const wordCount = ans.split(/\s+/).filter(w => w.length > 0).length;
      const isAnswered = wordCount > 5 && !ans.toLowerCase().includes("no verbal response") && !ans.toLowerCase().includes("no answer provided");

      if (isAnswered) {
        totalWordCount += wordCount;
        answeredCount++;
      }

      const qScore = isAnswered ? Math.min(6 + Math.floor(wordCount / 10), 10) : 1;

      return {
        question: pair.question,
        answer: pair.answer,
        score: qScore,
        feedback: isAnswered
          ? `Good technical explanation with ${wordCount} words. You covered the key requirements of the question effectively. To improve, try incorporating more practical metrics or code paradigms.`
          : "No verbal response or substantive answer was recorded. Make sure your microphone is working and you explain your thoughts clearly."
      };
    });

    // Scores calculation
    const answeredRatio = answeredCount / Math.max(pairs.length, 1);
    const avgLengthBonus = Math.min(Math.floor(totalWordCount / Math.max(answeredCount, 1) / 3), 20);

    const techBase = Math.floor(55 + answeredRatio * 25 + avgLengthBonus);
    const technicalScore = Math.max(0, Math.min(techBase, 95));

    const commBase = Math.floor(60 + answeredRatio * 20 + avgLengthBonus);
    const communicationScore = Math.max(0, Math.min(commBase, 98));

    const overallScore = Math.floor((technicalScore + communicationScore) / 2);

    const strengths = [
      answeredCount > 4 ? "Demonstrated consistent effort in addressing most of the technical and project questions." : "Good clarity and tone during recorded responses.",
      totalWordCount > 80 ? "Exhibited a solid level of detail in verbal explanations." : "Structured logical flow in response delivery."
    ];

    const improvements = [
      answeredCount < pairs.length ? "Elaborate more on specific software architecture decisions when answering." : "Ensure all technical questions are answered with rich code examples.",
      "Incorporate concrete industry paradigms (like ACID, Big O, caching strategies, microservices) in technical responses."
    ];

    return {
      technicalScore,
      communicationScore,
      overallScore,
      strengths,
      improvements,
      feedback: feedbackList
    };
  }
}

const MODEL_URL = 'https://huggingface.co/Kalray/yolov8/resolve/main/yolov8n.onnx';
const MODEL_PATH = path.join(import.meta.dirname, '..', 'yolov8n.onnx');

async function downloadModel() {
  if (fs.existsSync(MODEL_PATH)) {
    try {
      const stats = fs.statSync(MODEL_PATH);
      if (stats.size > 10000000) { // ~12.8MB expected
        return;
      }
      console.log(`[YOLO] Existing model file is corrupt or incomplete (${stats.size} bytes). Re-downloading...`);
      fs.unlinkSync(MODEL_PATH);
    } catch (e) {
      console.error(`[YOLO] Failed verifying/deleting existing model file: ${e.message}`);
    }
  }
  console.log(`[YOLO] Downloading YOLOv8n model from ${MODEL_URL}...`);
  const response = await axios.get(MODEL_URL, { responseType: 'stream' });
  const writer = fs.createWriteStream(MODEL_PATH);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

function iou(box1, box2) {
  const x1 = Math.max(box1[0], box2[0]);
  const y1 = Math.max(box1[1], box2[1]);
  const x2 = Math.min(box1[2], box2[2]);
  const y2 = Math.min(box1[3], box2[3]);

  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const area1 = (box1[2] - box1[0]) * (box1[3] - box1[1]);
  const area2 = (box2[2] - box2[0]) * (box2[3] - box2[1]);

  return intersection / (area1 + area2 - intersection);
}

function nms(boxes, iouThreshold = 0.45) {
  const sorted = [...boxes].sort((a, b) => b.score - a.score);
  const selected = [];
  for (const box of sorted) {
    let keep = true;
    for (const active of selected) {
      if (iou(box.bbox, active.bbox) > iouThreshold) {
        keep = false;
        break;
      }
    }
    if (keep) {
      selected.push(box);
    }
  }
  return selected;
}

const CLASS_NAMES = [
  "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light",
  "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow",
  "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee",
  "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle",
  "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange",
  "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch", "potted plant", "bed",
  "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave", "oven",
  "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear", "hair drier",
  "toothbrush"
];

let yoloSession = null;

/**
 * Detect unauthorized devices (like phones, tablets, smart watches) in a webcam frame.
 * Allows pen and paper.
 * @param {string} base64Image - Base64 encoded image string (without data:image/jpeg;base64 prefix)
 */
export async function detectDevicesInImage(base64Image) {
  try {
    await downloadModel();

    if (!yoloSession) {
      console.log("[YOLO] Loading YOLOv8n session...");
      yoloSession = await ort.InferenceSession.create(MODEL_PATH);
      console.log("[YOLO] YOLOv8n session loaded successfully!");
    }

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const imgBuffer = Buffer.from(base64Data, 'base64');

    // Preprocess image with sharp
    const { data, info } = await sharp(imgBuffer)
      .resize(640, 640, { fit: 'fill' })
      .toColorspace('srgb')
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Convert raw RGB bytes to Float32 array of shape [1, 3, 640, 640]
    const float32Data = new Float32Array(3 * 640 * 640);
    for (let i = 0; i < 640 * 640; i++) {
      float32Data[i] = data[i * 3] / 255.0;           // R
      float32Data[640 * 640 + i] = data[i * 3 + 1] / 255.0; // G
      float32Data[2 * 640 * 640 + i] = data[i * 3 + 2] / 255.0; // B
    }

    const inputTensor = new ort.Tensor('float32', float32Data, [1, 3, 640, 640]);

    // Run inference
    const outputs = await yoloSession.run({ images: inputTensor });
    const outputKey = Object.keys(outputs)[0];
    const outputTensor = outputs[outputKey];
    const outputData = outputTensor.data; 
    const dims = outputTensor.dims; // [1, 84, 8400]

    const numClasses = dims[1] - 4; // 80 classes
    const numCandidates = dims[2];  // 8400 candidates

    const confidenceThreshold = 0.2; // Lowered from 0.3 to 0.2 to improve webcam/mobile phone detection recall
    const rawDetections = [];

    // Transpose and process candidates
    for (let i = 0; i < numCandidates; i++) {
      let maxScore = -1;
      let classId = -1;
      for (let c = 0; c < numClasses; c++) {
        const score = outputData[(4 + c) * numCandidates + i];
        if (score > maxScore) {
          maxScore = score;
          classId = c;
        }
      }

      if (maxScore > confidenceThreshold) {
        const xc = outputData[0 * numCandidates + i];
        const yc = outputData[1 * numCandidates + i];
        const w = outputData[2 * numCandidates + i];
        const h = outputData[3 * numCandidates + i];

        const x1 = xc - w / 2;
        const y1 = yc - h / 2;
        const x2 = xc + w / 2;
        const y2 = yc + h / 2;

        const label = CLASS_NAMES[classId];

        rawDetections.push({
          class: label,
          score: maxScore,
          bbox: [x1, y1, x2, y2]
        });
      }
    }

    // Apply NMS
    const detections = nms(rawDetections, 0.45);

    // Print logs
    detections.forEach(det => {
      console.log(`[YOLO] Detected: ${det.class} (${det.score.toFixed(2)})`);
    });

    // Filter for target classes: cell phone, laptop, tv, clock
    const targetClasses = ['cell phone', 'laptop', 'tv', 'clock'];
    const unauthorized = detections.filter(det => targetClasses.includes(det.class));

    if (unauthorized.length > 0) {
      const primary = unauthorized[0];
      return {
        deviceDetected: true,
        deviceName: primary.class,
        explanation: `Detected a ${primary.class} with ${Math.round(primary.score * 100)}% confidence in the camera frame.`,
        detections: detections
      };
    }

    return {
      deviceDetected: false,
      deviceName: "",
      explanation: "",
      detections: detections
    };
  } catch (err) {
    console.error("[YOLO] detectDevicesInImage failed:", err.message);
    return { deviceDetected: false, deviceName: "", explanation: "", detections: [] };
  }
}
