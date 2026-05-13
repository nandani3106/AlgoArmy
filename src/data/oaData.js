export const MOCK_OA = [
  {
    id: 'amazon-sde',
    company: 'Amazon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg',
    title: 'SDE-1 Online Assessment',
    deadline: 'May 20, 2026',
    duration: '90 mins',
    questions: 15,
    status: 'Available',
    description: 'This assessment evaluates your problem-solving, data structures, and algorithmic skills. It includes multiple-choice questions on CS fundamentals and two coding problems.',
    sections: [
      { name: 'CS Fundamentals', type: 'MCQ', count: 10 },
      { name: 'Coding', type: 'Programming', count: 2 },
      { name: 'Work Simulation', type: 'Behavioral', count: 3 }
    ],
    rules: [
      'Total duration is 90 minutes.',
      'Camera and Microphone must remain ON at all times.',
      'Screen sharing is mandatory.',
      'Do not leave the browser tab or minimize the window.',
      'Results will be shared within 48 hours.'
    ]
  },
  {
    id: 'google-swe',
    company: 'Google',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
    title: 'SWE Screening Test',
    deadline: 'May 22, 2026',
    duration: '60 mins',
    questions: 3,
    status: 'Available',
    description: 'A focused coding assessment targeting advanced algorithms and system design concepts.',
    sections: [
      { name: 'Algorithms', type: 'Programming', count: 2 },
      { name: 'System Design', type: 'MCQ', count: 1 }
    ],
    rules: [
      'Proctored environment enabled.',
      'No external calculators or IDEs allowed.',
      'Plagiarism check is active.'
    ]
  },
  {
    id: 'microsoft-coding',
    company: 'Microsoft',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    title: 'Software Engineering Intern OA',
    deadline: 'May 25, 2026',
    duration: '120 mins',
    questions: 20,
    status: 'Upcoming',
    description: 'Assessment for the summer internship program. Covers basic programming and aptitude.',
    sections: [
      { name: 'Aptitude', type: 'MCQ', count: 10 },
      { name: 'Logic', type: 'MCQ', count: 8 },
      { name: 'Coding', type: 'Programming', count: 2 }
    ],
    rules: [
      'Only one attempt allowed.',
      'Stable internet connection required.'
    ]
  }
];
