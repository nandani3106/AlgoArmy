// Resume Parser Service
// Pure Javascript implementation for Stage 1-5 Resume Intelligence

const SKILLS_TAXONOMY = {
  // Programming Languages
  "javascript": { name: "JavaScript", category: "languages" },
  "typescript": { name: "TypeScript", category: "languages" },
  "python": { name: "Python", category: "languages" },
  "java": { name: "Java", category: "languages" },
  "c++": { name: "C++", category: "languages" },
  "cpp": { name: "C++", category: "languages" },
  "c#": { name: "C#", category: "languages" },
  "csharp": { name: "C#", category: "languages" },
  "c": { name: "C", category: "languages" },
  "golang": { name: "Go", category: "languages" },
  "go": { name: "Go", category: "languages" },
  "rust": { name: "Rust", category: "languages" },
  "ruby": { name: "Ruby", category: "languages" },
  "kotlin": { name: "Kotlin", category: "languages" },
  "swift": { name: "Swift", category: "languages" },
  "php": { name: "PHP", category: "languages" },
  "sql": { name: "SQL", category: "languages" },
  "html": { name: "HTML", category: "languages" },
  "html5": { name: "HTML", category: "languages" },
  "css": { name: "CSS", category: "languages" },
  "css3": { name: "CSS", category: "languages" },
  "dart": { name: "Dart", category: "languages" },
  "scala": { name: "Scala", category: "languages" },
  "bash": { name: "Bash", category: "languages" },
  "shell": { name: "Shell", category: "languages" },

  // Frontend Frameworks/Libraries
  "react": { name: "React", category: "frontend" },
  "reactjs": { name: "React", category: "frontend" },
  "react.js": { name: "React", category: "frontend" },
  "nextjs": { name: "Next.js", category: "frontend" },
  "next.js": { name: "Next.js", category: "frontend" },
  "vue": { name: "Vue", category: "frontend" },
  "vuejs": { name: "Vue", category: "frontend" },
  "vue.js": { name: "Vue", category: "frontend" },
  "angular": { name: "Angular", category: "frontend" },
  "angularjs": { name: "Angular", category: "frontend" },
  "svelte": { name: "Svelte", category: "frontend" },
  "tailwind": { name: "Tailwind CSS", category: "frontend" },
  "tailwindcss": { name: "Tailwind CSS", category: "frontend" },
  "bootstrap": { name: "Bootstrap", category: "frontend" },
  "redux": { name: "Redux", category: "frontend" },
  "jquery": { name: "jQuery", category: "frontend" },
  "materialui": { name: "Material UI", category: "frontend" },
  "mui": { name: "Material UI", category: "frontend" },

  // Backend Frameworks/Libraries
  "nodejs": { name: "Node.js", category: "backend" },
  "node.js": { name: "Node.js", category: "backend" },
  "node": { name: "Node.js", category: "backend" },
  "express": { name: "Express.js", category: "backend" },
  "expressjs": { name: "Express.js", category: "backend" },
  "express.js": { name: "Express.js", category: "backend" },
  "django": { name: "Django", category: "backend" },
  "flask": { name: "Flask", category: "backend" },
  "fastapi": { name: "FastAPI", category: "backend" },
  "spring": { name: "Spring Boot", category: "backend" },
  "springboot": { name: "Spring Boot", category: "backend" },
  "spring boot": { name: "Spring Boot", category: "backend" },
  "nestjs": { name: "NestJS", category: "backend" },
  "rails": { name: "Ruby on Rails", category: "backend" },
  "ruby on rails": { name: "Ruby on Rails", category: "backend" },
  "asp.net": { name: "ASP.NET", category: "backend" },
  "aspnet": { name: "ASP.NET", category: "backend" },

  // Databases
  "mongodb": { name: "MongoDB", category: "database" },
  "mongo": { name: "MongoDB", category: "database" },
  "postgresql": { name: "PostgreSQL", category: "database" },
  "postgres": { name: "PostgreSQL", category: "database" },
  "mysql": { name: "MySQL", category: "database" },
  "redis": { name: "Redis", category: "database" },
  "sqlite": { name: "SQLite", category: "database" },
  "firebase": { name: "Firebase", category: "database" },
  "firestore": { name: "Firestore", category: "database" },
  "dynamodb": { name: "DynamoDB", category: "database" },
  "cassandra": { name: "Cassandra", category: "database" },
  "mariadb": { name: "MariaDB", category: "database" },
  "oracle": { name: "Oracle", category: "database" },

  // Cloud Platforms
  "aws": { name: "AWS", category: "cloud" },
  "amazon web services": { name: "AWS", category: "cloud" },
  "azure": { name: "Azure", category: "cloud" },
  "gcp": { name: "GCP", category: "cloud" },
  "google cloud": { name: "GCP", category: "cloud" },
  "google cloud platform": { name: "GCP", category: "cloud" },
  "heroku": { name: "Heroku", category: "cloud" },
  "vercel": { name: "Vercel", category: "cloud" },
  "netlify": { name: "Netlify", category: "cloud" },
  "digitalocean": { name: "DigitalOcean", category: "cloud" },

  // DevOps / Tools
  "docker": { name: "Docker", category: "tools" },
  "kubernetes": { name: "Kubernetes", category: "tools" },
  "k8s": { name: "Kubernetes", category: "tools" },
  "git": { name: "Git", category: "tools" },
  "github": { name: "GitHub", category: "tools" },
  "gitlab": { name: "GitLab", category: "tools" },
  "jenkins": { name: "Jenkins", category: "tools" },
  "nginx": { name: "Nginx", category: "tools" },
  "linux": { name: "Linux", category: "tools" },
  "pm2": { name: "PM2", category: "tools" },
  "postman": { name: "Postman", category: "tools" },
  "npm": { name: "npm", category: "tools" },
  "yarn": { name: "yarn", category: "tools" },
  "cicd": { name: "CI/CD", category: "tools" },
  "ci/cd": { name: "CI/CD", category: "tools" },

  // AI / ML
  "tensorflow": { name: "TensorFlow", category: "ai_ml" },
  "pytorch": { name: "PyTorch", category: "ai_ml" },
  "keras": { name: "Keras", category: "ai_ml" },
  "opencv": { name: "OpenCV", category: "ai_ml" },
  "mediapipe": { name: "MediaPipe", category: "ai_ml" },
  "yolo": { name: "YOLO", category: "ai_ml" },
  "scikit-learn": { name: "scikit-learn", category: "ai_ml" },
  "sklearn": { name: "scikit-learn", category: "ai_ml" },
  "pandas": { name: "Pandas", category: "ai_ml" },
  "numpy": { name: "NumPy", category: "ai_ml" },
  "nlp": { name: "NLP", category: "ai_ml" },
  "llm": { name: "LLM", category: "ai_ml" },
  "langchain": { name: "LangChain", category: "ai_ml" },
  "huggingface": { name: "HuggingFace", category: "ai_ml" },

  // Other Technologies / APIs / Libraries
  "graphql": { name: "GraphQL", category: "other" },
  "rest api": { name: "REST API", category: "other" },
  "restful api": { name: "REST API", category: "other" },
  "websockets": { name: "WebSockets", category: "other" },
  "socket.io": { name: "Socket.IO", category: "other" },
  "jwt": { name: "JWT", category: "other" },
  "json web token": { name: "JWT", category: "other" },
  "mongoose": { name: "Mongoose", category: "other" },
  "prisma": { name: "Prisma", category: "other" },
  "sequelize": { name: "Sequelize", category: "other" },
  "judge0": { name: "Judge0", category: "other" },
  "monaco editor": { name: "Monaco Editor", category: "other" },
  "oauth": { name: "OAuth", category: "other" },
  "auth0": { name: "Auth0", category: "other" }
};

const SECTION_HEADERS = {
  skills: [
    "technical skills", "skills", "technologies", "tech stack", 
    "programming languages", "frameworks", "tools", "competencies"
  ],
  projects: [
    "projects", "project experience", "academic projects", 
    "personal projects", "notable projects", "academic activities"
  ],
  experience: [
    "work experience", "experience", "employment history", 
    "professional experience", "internships", "experience details"
  ],
  education: [
    "education", "academic background", "academics", "qualifications"
  ],
  certifications: [
    "certifications", "licenses", "courses", "achievements"
  ]
};

function cleanResumeText(text) {
  if (!text) return "";
  return text
    .replace(/[ \t]+/g, " ")
    .replace(/(\r?\n\s*){3,}/g, "\n\n")
    .trim();
}

function getSkillRegex(skill) {
  const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const startBoundary = /^[a-zA-Z0-9]/.test(skill) ? '\\b' : '';
  const endBoundary = /[a-zA-Z0-9]$/.test(skill) ? '\\b' : '';
  
  const isCommonWord = ["Go", "C", "R"].includes(skill);
  return new RegExp(startBoundary + escaped + endBoundary, isCommonWord ? '' : 'i');
}

function extractName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  for (const line of lines.slice(0, 5)) {
    const lower = line.toLowerCase();
    if (lower.includes('@') || lower.includes('phone') || lower.includes('email') || 
        lower.includes('github.com') || lower.includes('linkedin.com') || 
        lower.includes('resume') || lower.includes('curriculum vitae') ||
        lower.includes('portfolio') || /^[+\d\s-]{8,}$/.test(line)) {
      continue;
    }
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && /^[a-zA-Z\s.]+$/.test(line)) {
      return line;
    }
  }
  return "Candidate";
}

function detectSections(text) {
  const lines = text.split('\n');
  const sections = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0 || line.length > 40) continue;
    
    const cleanLine = line.toLowerCase().replace(/[:\-\s\d]/g, '').trim();
    
    let foundSectionType = null;
    for (const [type, headers] of Object.entries(SECTION_HEADERS)) {
      for (const h of headers) {
        const cleanHeader = h.replace(/[:\-\s\d]/g, '');
        if (cleanLine === cleanHeader) {
          foundSectionType = type;
          break;
        }
      }
      if (foundSectionType) break;
    }
    
    if (foundSectionType) {
      sections.push({
        type: foundSectionType,
        title: line,
        lineIndex: i
      });
    }
  }
  
  const result = {};
  if (sections.length === 0) {
    return result;
  }
  
  // Sort sections by line index
  sections.sort((a, b) => a.lineIndex - b.lineIndex);
  
  for (let i = 0; i < sections.length; i++) {
    const current = sections[i];
    const next = sections[i + 1];
    const endLineIndex = next ? next.lineIndex : lines.length;
    
    const sectionContent = lines.slice(current.lineIndex + 1, endLineIndex).join('\n');
    result[current.type] = sectionContent;
  }
  
  return result;
}

function extractSkills(text) {
  const foundSkills = new Set();
  const structuredSkills = {
    languages: [],
    frontend: [],
    backend: [],
    database: [],
    cloud: [],
    tools: [],
    ai_ml: [],
    other: []
  };

  for (const [key, skillInfo] of Object.entries(SKILLS_TAXONOMY)) {
    const regex = getSkillRegex(skillInfo.name);
    if (regex.test(text)) {
      if (!foundSkills.has(skillInfo.name)) {
        foundSkills.add(skillInfo.name);
        structuredSkills[skillInfo.category].push(skillInfo.name);
      }
    }
  }

  return {
    flatSkills: Array.from(foundSkills),
    structuredSkills
  };
}

function extractProjects(sectionText, allText) {
  if (!sectionText) {
    return [];
  }

  const lines = sectionText.split('\n').map(l => l.trim());
  const projectBlocks = [];
  let currentProject = null;

  for (const line of lines) {
    if (line.length === 0) continue;

    const isBullet = /^[\-\*\•\+]\s+/.test(line) || /^\d+\.\s+/.test(line);
    const words = line.split(/\s+/);
    
    const startsWithActionVerb = /^(built|developed|designed|implemented|created|worked|managed|led|optimized|achieved|integrated|leveraged|utilised|utilized|engineered|constructed|wrote|coded|formulated|researched|analyzed|compiled|programmed|deployed|hosted|configured|migrated|refactored|enhanced|increased|reduced|saved|secured|monitored|troubleshot|resolved|debugging|debugged|tested|automated|executed|delivered|authored|established|initiated|launched|coordinated|directed|supervised|mentored|trained|assisted|supported|participated|collaborated|contributed|improved|served|performed|conducted|designed|facilitated|promoted|strengthened|accelerated|maximized|minimized|negotiated|partnered|produced|resolved)/i.test(words[0]);
    
    const containsDescriptionWords = /^(using|with|responsible|role|duration|team|technologies|tech|tools|stack|description|summary|worked|built)/i.test(words[0]);
    const startsWithLowercase = /^[a-z]/.test(line);

    const isProjectTitle = !isBullet && !startsWithActionVerb && !containsDescriptionWords && !startsWithLowercase && line.length > 3 && line.length < 60 && words.length <= 8;

    if (isProjectTitle) {
      if (currentProject) {
        projectBlocks.push(currentProject);
      }
      currentProject = {
        titleLine: line,
        contentLines: []
      };
    } else {
      if (currentProject) {
        currentProject.contentLines.push(line);
      } else {
        currentProject = {
          titleLine: line,
          contentLines: []
        };
      }
    }
  }
  if (currentProject) {
    projectBlocks.push(currentProject);
  }

  const projects = [];

  for (const block of projectBlocks) {
    // 1. Project Name Cleaning
    let name = block.titleLine
      .split('|')[0]
      .split(' - ')[0]
      .split(' – ')[0]
      .split('(')[0]
      .replace(/^[\-\*\•\+]\s+/, '')
      .trim();

    if (name.length < 2) continue;

    // 2. Features extraction
    const features = [];
    const descriptionLines = [];

    for (const line of block.contentLines) {
      const isBullet = /^[\-\*\•\+]\s+/.test(line) || /^\d+\.\s+/.test(line);
      const cleanLine = line.replace(/^[\-\*\•\+]\s+/, '').replace(/^\d+\.\s+/, '').trim();
      
      if (isBullet && cleanLine.length > 10) {
        features.push(cleanLine);
      } else if (cleanLine.length > 0) {
        descriptionLines.push(cleanLine);
      }
    }

    // 3. Description logic
    const description = descriptionLines.join(" ") || features[0] || `Project focusing on web development and software architecture.`;

    // 4. Technologies linked to this specific project
    const projectText = block.titleLine + "\n" + block.contentLines.join("\n");
    const matchedTechs = [];
    
    for (const [key, skillInfo] of Object.entries(SKILLS_TAXONOMY)) {
      const regex = getSkillRegex(skillInfo.name);
      if (regex.test(projectText)) {
        matchedTechs.push(skillInfo.name);
      }
    }

    projects.push({
      name,
      description,
      technologies: [...new Set(matchedTechs)],
      features: features.slice(0, 5)
    });
  }

  return projects;
}

function buildCandidateProfile(text, fullName, skills, projects) {
  const domains = [];
  const skillsLower = skills.map(s => s.toLowerCase());
  
  const hasFrontend = skillsLower.some(s => ["react", "next.js", "vue", "angular", "tailwind css", "bootstrap", "html", "css"].includes(s));
  const hasBackend = skillsLower.some(s => ["node.js", "express.js", "django", "flask", "fastapi", "spring boot", "nestjs"].includes(s));
  const hasML = skillsLower.some(s => ["tensorflow", "pytorch", "keras", "opencv", "mediapipe", "yolo", "scikit-learn", "pandas", "numpy", "nlp", "llm", "langchain"].includes(s));
  const hasCloud = skillsLower.some(s => ["aws", "azure", "gcp", "docker", "kubernetes"].includes(s));
  const hasSecurity = skillsLower.some(s => ["jwt", "oauth", "auth0", "security"].includes(s));
  const hasMobile = skillsLower.some(s => ["kotlin", "swift", "dart", "flutter", "react native"].includes(s));

  if (hasFrontend && hasBackend) domains.push("Full Stack Development");
  else if (hasFrontend) domains.push("Frontend Development");
  else if (hasBackend) domains.push("Backend Development");

  if (hasML) {
    domains.push("Machine Learning");
    domains.push("Data Science");
  }
  if (hasCloud) domains.push("Cloud Computing");
  if (hasSecurity) domains.push("Cybersecurity");
  if (hasMobile) domains.push("Mobile Development");

  if (domains.length === 0) domains.push("Software Engineering");

  let experienceLevel = "Entry Level";
  const textLower = text.toLowerCase();
  
  if (textLower.includes("senior") || textLower.includes("lead") || textLower.includes("architect")) {
    experienceLevel = "Senior Level";
  } else if (textLower.includes("mid") || textLower.includes("associate") || /3\+\s*years/i.test(text)) {
    experienceLevel = "Mid Level";
  } else if (textLower.includes("intern") || textLower.includes("student") || textLower.includes("fresher") || /graduat/i.test(text)) {
    experienceLevel = "Entry Level";
  }

  const topics = [];
  if (domains.includes("Full Stack Development")) {
    topics.push("System Architecture", "State Management", "API Design", "Database Optimization");
  }
  if (domains.includes("Frontend Development")) {
    topics.push("React Lifecycle/Hooks", "CSS layouts & responsiveness", "Virtual DOM & Performance", "Web security basics");
  }
  if (domains.includes("Backend Development")) {
    topics.push("RESTful Services", "Database scaling & Indexing", "Concurrency & Event Loop", "Authentication/Authorization");
  }
  if (domains.includes("Machine Learning") || domains.includes("Data Science")) {
    topics.push("Model Evaluation Metrics", "Feature Engineering", "Neural Network architectures", "Computer Vision / NLP pipelines");
  }
  if (domains.includes("Cloud Computing")) {
    topics.push("Docker Containerization", "Kubernetes Orchestration", "CI/CD pipelines", "Microservices Architecture");
  }
  if (topics.length === 0) {
    topics.push("Object Oriented Programming", "Data Structures & Algorithms", "Git & Version Control");
  }

  return {
    fullName,
    skills,
    projects: projects.map(p => p.name),
    primaryDomains: domains,
    experienceLevel,
    recommendedInterviewTopics: topics
  };
}

export function parseResumeLocally(resumeText) {
  const cleanedText = cleanResumeText(resumeText);
  const fullName = extractName(cleanedText);
  const sections = detectSections(cleanedText);

  // Extract skills from entire text for maximum recall
  const skillsData = extractSkills(cleanedText);
  
  // Extract projects from Projects section (fallback to scanning full text if not found)
  const projects = extractProjects(sections.projects, cleanedText);

  const profile = buildCandidateProfile(cleanedText, fullName, skillsData.flatSkills, projects);

  return {
    skills: skillsData.flatSkills,
    projects: projects.map(p => p.name),
    structuredSkills: skillsData.structuredSkills,
    structuredProjects: projects,
    candidateProfile: profile
  };
}
