export const MOCK_INTERVIEWS = [
  {
    id: 'google-frontend',
    company: 'Google',
    role: 'Frontend Developer',
    type: 'Scheduled',
    date: 'May 24, 2026',
    time: '2:00 PM',
    duration: '45 mins',
    skills: ['React', 'JavaScript', 'CSS Architecture', 'Web Performance'],
    status: 'Upcoming',
    description: 'A deep dive into frontend engineering, focusing on your ability to build scalable and performant user interfaces.'
  },
  {
    id: 'amazon-mock',
    company: 'Amazon',
    role: 'Software Engineer',
    type: 'Mock',
    date: 'Anytime',
    time: 'Flexible',
    duration: '60 mins',
    skills: ['Data Structures', 'Algorithms', 'Leadership Principles'],
    status: 'Practice',
    description: 'Practice the famous Amazon SDE interview with focus on algorithmic problem solving and behavioral questions.'
  },
  {
    id: 'uber-backend',
    company: 'Uber',
    role: 'Backend Engineer',
    type: 'Scheduled',
    date: 'May 28, 2026',
    time: '11:00 AM',
    duration: '60 mins',
    skills: ['System Design', 'Node.js', 'Distributed Systems', 'SQL'],
    status: 'Upcoming',
    description: 'Technical interview focusing on high-scale backend systems and architectural decision making.'
  }
];

export const MOCK_QUESTIONS = [
  "Tell me about yourself and your background in software engineering.",
  "Describe a challenging technical project you've worked on recently. What were the main hurdles?",
  "What is the difference between var, let, and const in JavaScript, and when would you use each?",
  "How does React's virtual DOM work, and how does it optimize rendering performance?",
  "Can you explain the concept of Closures in JavaScript with an example?",
  "How do you handle state management in large-scale applications?",
  "What is your approach to testing your code?",
  "Do you have any questions for me about the role or the company?"
];

export const MOCK_RESUME_DATA = {
  skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'MongoDB', 'Tailwind CSS', 'Next.js'],
  projects: [
    { name: 'AlgoArmy', description: 'Recruitment platform for coding contests and AI interviews.' },
    { name: 'Traveloop', description: 'Personalized travel planning platform with itinerary generation.' },
    { name: 'Expense Manager', description: 'A sleek dashboard for tracking personal finances and budgets.' }
  ]
};
