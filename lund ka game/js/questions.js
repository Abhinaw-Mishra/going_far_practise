// ============================================
//  CODECLASH — Question Bank
// ============================================

const questions = {
  coding: [
    {
      text: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(n log n)"],
      correct: 1,
      category: "coding"
    },
    {
      text: "Which data structure uses LIFO ordering?",
      options: ["Queue", "Array", "Stack", "Linked List"],
      correct: 2,
      category: "coding"
    },
    {
      text: "What does 'DOM' stand for in web development?",
      options: ["Document Object Model", "Data Object Management", "Digital Ordinal Map", "Document Oriented Middleware"],
      correct: 0,
      category: "coding"
    },
    {
      text: "Which sorting algorithm has O(n log n) average-case complexity?",
      options: ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"],
      correct: 2,
      category: "coding"
    },
    {
      text: "What is a closure in JavaScript?",
      options: ["A way to close browser tabs", "A function with access to its outer scope", "A type of loop structure", "An error handling mechanism"],
      correct: 1,
      category: "coding"
    },
    {
      text: "Which keyword declares a block-scoped variable in JS?",
      options: ["var", "let", "function", "define"],
      correct: 1,
      category: "coding"
    },
    {
      text: "What is the output of typeof null in JavaScript?",
      options: ["'null'", "'undefined'", "'object'", "'boolean'"],
      correct: 2,
      category: "coding"
    },
    {
      text: "Which HTTP method is idempotent?",
      options: ["POST", "PATCH", "GET", "CONNECT"],
      correct: 2,
      category: "coding"
    }
  ],
  math: [
    {
      text: "What is 17 × 23?",
      options: ["381", "391", "401", "371"],
      correct: 1,
      category: "math"
    },
    {
      text: "What is the square root of 144?",
      options: ["11", "12", "13", "14"],
      correct: 1,
      category: "math"
    },
    {
      text: "If x² = 169, what is |x|?",
      options: ["11", "12", "13", "14"],
      correct: 2,
      category: "math"
    },
    {
      text: "What is 15% of 240?",
      options: ["32", "34", "36", "38"],
      correct: 2,
      category: "math"
    },
    {
      text: "What is the next prime after 31?",
      options: ["33", "35", "37", "39"],
      correct: 2,
      category: "math"
    },
    {
      text: "What is log₂(256)?",
      options: ["6", "7", "8", "9"],
      correct: 2,
      category: "math"
    },
    {
      text: "Sum of interior angles of a hexagon?",
      options: ["540°", "600°", "720°", "900°"],
      correct: 2,
      category: "math"
    }
  ],
  aptitude: [
    {
      text: "Complete the pattern: 2, 6, 18, 54, ?",
      options: ["108", "162", "148", "128"],
      correct: 1,
      category: "aptitude"
    },
    {
      text: "If all Zogs are Migs, and some Migs are Pals, which is true?",
      options: ["All Zogs are Pals", "Some Zogs may be Pals", "No Zogs are Pals", "All Pals are Zogs"],
      correct: 1,
      category: "aptitude"
    },
    {
      text: "A train travels 360km in 4 hours. Speed in km/h?",
      options: ["80", "85", "90", "95"],
      correct: 2,
      category: "aptitude"
    },
    {
      text: "Odd one out: 3, 5, 11, 14, 17, 23",
      options: ["5", "11", "14", "23"],
      correct: 2,
      category: "aptitude"
    },
    {
      text: "A clock shows 3:15. Angle between hands?",
      options: ["0°", "7.5°", "15°", "22.5°"],
      correct: 1,
      category: "aptitude"
    },
    {
      text: "If APPLE = 50, GRAPE = ?",
      options: ["50", "52", "47", "55"],
      correct: 0,
      category: "aptitude"
    },
    {
      text: "Find next: J, F, M, A, M, J, ?",
      options: ["A", "J", "S", "O"],
      correct: 1,
      category: "aptitude"
    }
  ]
};

export function getQuestions(category, count = 10) {
  let pool;
  if (category === 'mixed') {
    pool = [...questions.coding, ...questions.math, ...questions.aptitude];
  } else {
    pool = [...(questions[category] || questions.coding)];
  }
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}
