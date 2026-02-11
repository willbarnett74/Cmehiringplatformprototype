import { useState, useEffect } from 'react';
import { Brain, Clock, ChevronRight, CheckCircle2, TrendingUp, X, Eye, RotateCcw } from 'lucide-react';
import { DSSurfaceCard } from './ds/DSComponents';

interface Question {
  id: number;
  category: 'pattern' | 'logic' | 'processing' | 'learning';
  type: 'visual-pattern' | 'text-logic' | 'sequence' | 'scenario';
  question: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number; // in seconds
  explanation: string;
}

// Expanded question bank - will randomly select 14 questions (4 pattern, 4 logic, 3 processing, 3 learning)
const questionBank: Question[] = [
  // Pattern Recognition Questions (12 total, pick 4)
  {
    id: 1,
    category: 'pattern',
    type: 'visual-pattern',
    question: 'What comes next in this sequence? 2, 4, 8, 16, __',
    options: ['24', '32', '20', '28'],
    correctAnswer: 1,
    timeLimit: 30,
    explanation: 'This is a geometric sequence where each number is doubled. 2×2=4, 4×2=8, 8×2=16, 16×2=32.',
  },
  {
    id: 2,
    category: 'pattern',
    type: 'sequence',
    question: 'Complete the pattern: A1, C3, E5, G7, __',
    options: ['H8', 'I9', 'I8', 'H9'],
    correctAnswer: 1,
    timeLimit: 30,
    explanation: 'The pattern alternates letters (A, C, E, G, I - every other letter) with odd numbers (1, 3, 5, 7, 9). So I9 is correct.',
  },
  {
    id: 3,
    category: 'pattern',
    type: 'visual-pattern',
    question: 'Which number should replace the question mark? 3, 9, 27, 81, ?',
    options: ['162', '243', '324', '405'],
    correctAnswer: 1,
    timeLimit: 30,
    explanation: 'Each number is multiplied by 3. The sequence is 3¹, 3², 3³, 3⁴, 3⁵. So 81×3 = 243.',
  },
  {
    id: 4,
    category: 'pattern',
    type: 'sequence',
    question: 'If the pattern is: ◯ △ ◯ △ △ ◯ △ △ △, what shape comes next?',
    options: ['Circle (◯)', 'Triangle (△)', 'Square (◻)', 'Cannot determine'],
    correctAnswer: 0,
    timeLimit: 35,
    explanation: 'The pattern shows one circle, then one triangle, then one circle, then two triangles, then one circle, then three triangles. Next would be one circle.',
  },
  {
    id: 5,
    category: 'pattern',
    type: 'visual-pattern',
    question: 'What is the next number in the sequence? 1, 1, 2, 3, 5, 8, __',
    options: ['11', '13', '15', '16'],
    correctAnswer: 1,
    timeLimit: 35,
    explanation: 'This is the Fibonacci sequence where each number is the sum of the previous two: 1+1=2, 1+2=3, 2+3=5, 3+5=8, 5+8=13.',
  },
  {
    id: 6,
    category: 'pattern',
    type: 'sequence',
    question: 'Find the pattern: 100, 96, 88, 76, __',
    options: ['60', '64', '68', '72'],
    correctAnswer: 0,
    timeLimit: 35,
    explanation: 'The differences between numbers are -4, -8, -12, -16 (decreasing by 4 each time). So 76-16=60.',
  },
  {
    id: 7,
    category: 'pattern',
    type: 'visual-pattern',
    question: 'Complete the series: 5, 10, 20, 35, 55, __',
    options: ['75', '80', '85', '90'],
    correctAnswer: 1,
    timeLimit: 40,
    explanation: 'The differences are +5, +10, +15, +20, +25. Adding 25 to 55 gives 80.',
  },
  {
    id: 8,
    category: 'pattern',
    type: 'sequence',
    question: 'What number comes next? 2, 6, 12, 20, 30, __',
    options: ['38', '40', '42', '44'],
    correctAnswer: 2,
    timeLimit: 35,
    explanation: 'These are products of consecutive numbers: 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42.',
  },
  {
    id: 9,
    category: 'pattern',
    type: 'visual-pattern',
    question: 'Find the missing number: 4, 9, 16, 25, 36, __',
    options: ['45', '49', '54', '64'],
    correctAnswer: 1,
    timeLimit: 30,
    explanation: 'These are perfect squares: 2²=4, 3²=9, 4²=16, 5²=25, 6²=36, 7²=49.',
  },
  {
    id: 10,
    category: 'pattern',
    type: 'sequence',
    question: 'Complete this pattern: Z1, Y2, X3, W4, __',
    options: ['V5', 'V6', 'U5', 'U6'],
    correctAnswer: 0,
    timeLimit: 35,
    explanation: 'The letters go backwards in the alphabet (Z, Y, X, W, V) while numbers increase sequentially (1, 2, 3, 4, 5).',
  },
  {
    id: 11,
    category: 'pattern',
    type: 'visual-pattern',
    question: 'What comes next? 1, 4, 9, 16, 25, 36, __',
    options: ['42', '45', '49', '64'],
    correctAnswer: 2,
    timeLimit: 30,
    explanation: 'Perfect squares continue: 1²=1, 2²=4, 3²=9, 4²=16, 5²=25, 6²=36, 7²=49.',
  },
  {
    id: 12,
    category: 'pattern',
    type: 'sequence',
    question: 'Find the pattern: 3, 7, 15, 31, 63, __',
    options: ['95', '115', '127', '135'],
    correctAnswer: 2,
    timeLimit: 40,
    explanation: 'Each number is double the previous number plus 1: 3×2+1=7, 7×2+1=15, 15×2+1=31, 31×2+1=63, 63×2+1=127.',
  },

  // Logical Deduction Questions (12 total, pick 4)
  {
    id: 13,
    category: 'logic',
    type: 'text-logic',
    question: 'All managers are leaders. Some leaders are visionaries. Therefore:',
    options: [
      'All managers are visionaries',
      'Some managers might be visionaries',
      'No managers are visionaries',
      'All visionaries are managers'
    ],
    correctAnswer: 1,
    timeLimit: 40,
    explanation: 'Since some leaders are visionaries and all managers are leaders, it\'s possible that some managers fall into the visionary category, but it\'s not certain.',
  },
  {
    id: 14,
    category: 'logic',
    type: 'text-logic',
    question: 'If A > B and B > C, and C = D, which statement is definitely true?',
    options: ['A > D', 'A = D', 'D > A', 'B = D'],
    correctAnswer: 0,
    timeLimit: 35,
    explanation: 'Since A > B > C and C = D, we can substitute to get A > B > D, therefore A > D is definitely true.',
  },
  {
    id: 15,
    category: 'logic',
    type: 'scenario',
    question: 'Team A finishes before Team B. Team C finishes after Team B but before Team D. Which team finishes last?',
    options: ['Team A', 'Team B', 'Team C', 'Team D'],
    correctAnswer: 3,
    timeLimit: 40,
    explanation: 'The order is: Team A, then Team B, then Team C, then Team D. Team D finishes last.',
  },
  {
    id: 16,
    category: 'logic',
    type: 'text-logic',
    question: 'If it rains, the ground gets wet. The ground is wet. What can we conclude?',
    options: [
      'It definitely rained',
      'It might have rained',
      'It did not rain',
      'The ground was already wet'
    ],
    correctAnswer: 1,
    timeLimit: 35,
    explanation: 'This is affirming the consequent fallacy. Rain causes wet ground, but wet ground doesn\'t prove it rained (could be sprinklers, etc.). So it might have rained.',
  },
  {
    id: 17,
    category: 'logic',
    type: 'text-logic',
    question: 'No cats are dogs. Some pets are dogs. Therefore:',
    options: [
      'Some pets are not cats',
      'No pets are cats',
      'All pets are dogs',
      'Some cats are pets'
    ],
    correctAnswer: 0,
    timeLimit: 40,
    explanation: 'If some pets are dogs and no cats are dogs, then those dog-pets cannot be cats, so some pets are definitely not cats.',
  },
  {
    id: 18,
    category: 'logic',
    type: 'scenario',
    question: 'Alice is taller than Bob. Charlie is shorter than Bob. Who is tallest?',
    options: ['Alice', 'Bob', 'Charlie', 'Cannot determine'],
    correctAnswer: 0,
    timeLimit: 30,
    explanation: 'Alice > Bob > Charlie. Alice is the tallest.',
  },
  {
    id: 19,
    category: 'logic',
    type: 'text-logic',
    question: 'If all birds can fly, and penguins are birds, what can we conclude about penguins?',
    options: [
      'Penguins can fly',
      'The premise is flawed',
      'Penguins are not birds',
      'Some birds cannot fly'
    ],
    correctAnswer: 1,
    timeLimit: 35,
    explanation: 'The logical conclusion would be "penguins can fly," but we know that\'s false. This reveals the first premise is flawed - not all birds can fly.',
  },
  {
    id: 20,
    category: 'logic',
    type: 'scenario',
    question: 'Meeting A starts at 2pm and lasts 1 hour. Meeting B starts at 2:30pm. Can you attend both?',
    options: ['Yes', 'No', 'Only if Meeting A is cancelled', 'Only the first 30 minutes of each'],
    correctAnswer: 1,
    timeLimit: 30,
    explanation: 'Meeting A runs from 2:00-3:00pm. Meeting B starts at 2:30pm, which overlaps with Meeting A. You cannot attend both.',
  },
  {
    id: 21,
    category: 'logic',
    type: 'text-logic',
    question: 'All squares are rectangles. Some rectangles are blue. Therefore:',
    options: [
      'All squares are blue',
      'Some squares might be blue',
      'No squares are blue',
      'All blue shapes are squares'
    ],
    correctAnswer: 1,
    timeLimit: 40,
    explanation: 'Since all squares are rectangles and some rectangles are blue, it\'s possible that some squares fall into the blue rectangle category.',
  },
  {
    id: 22,
    category: 'logic',
    type: 'scenario',
    question: 'If you study, you will pass. You passed. What can we conclude?',
    options: [
      'You definitely studied',
      'You might have studied',
      'You did not study',
      'Studying guarantees passing'
    ],
    correctAnswer: 1,
    timeLimit: 35,
    explanation: 'Passing doesn\'t prove you studied (could have gotten lucky, already knew the material, etc.). You might have studied, but it\'s not certain.',
  },
  {
    id: 23,
    category: 'logic',
    type: 'text-logic',
    question: 'Either John is home or at work. John is not at work. Where is John?',
    options: ['Home', 'Somewhere else', 'At work', 'Cannot determine'],
    correctAnswer: 0,
    timeLimit: 25,
    explanation: 'This is a valid disjunctive syllogism. If the options are home OR work, and he\'s not at work, he must be home.',
  },
  {
    id: 24,
    category: 'logic',
    type: 'scenario',
    question: 'Red tasks have priority 1. Blue tasks have priority 2. You see tasks: Red-A, Blue-B, Red-C. What order?',
    options: ['A, B, C', 'A, C, B', 'B, A, C', 'C, B, A'],
    correctAnswer: 1,
    timeLimit: 35,
    explanation: 'Priority 1 comes before Priority 2. Red tasks (A and C) come before Blue task (B). Order: A, C, B.',
  },

  // Information Processing Questions (9 total, pick 3)
  {
    id: 25,
    category: 'processing',
    type: 'scenario',
    question: 'You receive 5 emails: 2 urgent client requests, 1 team update, 1 invoice approval, 1 meeting invite. What should you prioritize first?',
    options: [
      'Team update',
      'Meeting invite',
      'Urgent client requests',
      'Invoice approval'
    ],
    correctAnswer: 2,
    timeLimit: 30,
    explanation: 'Urgent client requests have the highest priority as they likely have immediate business impact and time sensitivity.',
  },
  {
    id: 26,
    category: 'processing',
    type: 'scenario',
    question: 'A report shows: Q1: +15%, Q2: -8%, Q3: +22%, Q4: -5%. Which quarter had the strongest performance?',
    options: ['Q1', 'Q2', 'Q3', 'Q4'],
    correctAnswer: 2,
    timeLimit: 25,
    explanation: 'Q3 had +22% growth, which is the highest positive performance among all quarters.',
  },
  {
    id: 27,
    category: 'processing',
    type: 'scenario',
    question: 'Three tasks: Design (4 hrs), Development (6 hrs), Testing (2 hrs). You have 8 hours today. Which approach is most efficient?',
    options: [
      'Complete Design + Development',
      'Complete Design + Testing, start Development',
      'Complete Development + Testing',
      'Start all three tasks'
    ],
    correctAnswer: 1,
    timeLimit: 35,
    explanation: 'Design (4h) + Testing (2h) = 6h, leaving 2h to start Development. This completes the most tasks and makes progress on the longest remaining task.',
  },
  {
    id: 28,
    category: 'processing',
    type: 'scenario',
    question: 'You have 3 meetings today: 10am (30min), 2pm (1hr), 4pm (45min). When can you schedule a 2-hour deep work block?',
    options: [
      '11am - 1pm',
      '12pm - 2pm',
      '3pm - 5pm',
      'Not possible today'
    ],
    correctAnswer: 0,
    timeLimit: 35,
    explanation: '10am meeting ends at 10:30am, next meeting is at 2pm. That gives 11am-1pm (2 hours) for deep work.',
  },
  {
    id: 29,
    category: 'processing',
    type: 'scenario',
    question: 'Data shows: Product A (100 sales, $50 each), Product B (50 sales, $150 each). Which generated more revenue?',
    options: [
      'Product A',
      'Product B',
      'Equal revenue',
      'Cannot determine'
    ],
    correctAnswer: 1,
    timeLimit: 30,
    explanation: 'Product A: 100×$50 = $5,000. Product B: 50×$150 = $7,500. Product B generated more revenue.',
  },
  {
    id: 30,
    category: 'processing',
    type: 'scenario',
    question: 'You need to send a status update to: your manager (critical), team (helpful), stakeholders (important). Email order?',
    options: [
      'Team, Manager, Stakeholders',
      'Manager, Stakeholders, Team',
      'Stakeholders, Team, Manager',
      'Send all simultaneously'
    ],
    correctAnswer: 1,
    timeLimit: 30,
    explanation: 'Manager (critical) comes first, then Stakeholders (important), then Team (helpful). Or send all at once if content is the same.',
  },
  {
    id: 31,
    category: 'processing',
    type: 'scenario',
    question: '4 bugs reported: Crash (P0), UI glitch (P2), Slow load (P1), Typo (P3). What order to fix?',
    options: [
      'P0, P1, P2, P3',
      'P3, P2, P1, P0',
      'P1, P0, P2, P3',
      'Fix all simultaneously'
    ],
    correctAnswer: 0,
    timeLimit: 30,
    explanation: 'Priority 0 (Crash) is most critical, then P1 (Slow load), P2 (UI glitch), P3 (Typo). Fix in P0→P1→P2→P3 order.',
  },
  {
    id: 32,
    category: 'processing',
    type: 'scenario',
    question: 'Budget: $10,000. Options: Tool A ($3k, high impact), Tool B ($8k, medium impact), Tool C ($2k, low impact). Best choice?',
    options: [
      'Tool A + Tool C',
      'Tool B only',
      'Tool A only',
      'Tool C and save $8k'
    ],
    correctAnswer: 0,
    timeLimit: 35,
    explanation: 'Tool A ($3k) + Tool C ($2k) = $5k total, staying under budget while maximizing impact (high + low beats medium alone).',
  },
  {
    id: 33,
    category: 'processing',
    type: 'scenario',
    question: 'Customer feedback: 20 positive, 5 negative, 3 neutral. What\'s the satisfaction rate?',
    options: ['71%', '80%', '85%', '93%'],
    correctAnswer: 0,
    timeLimit: 35,
    explanation: 'Total responses: 20+5+3=28. Positive: 20. Satisfaction rate: 20/28 = 71.4% ≈ 71%.',
  },

  // Learning Simulation Questions (9 total, pick 3)
  {
    id: 34,
    category: 'learning',
    type: 'scenario',
    question: 'New rule: In this company, "Alpha tasks" must be done before "Beta tasks." You have Alpha-3 and Beta-1. Which do you start?',
    options: ['Beta-1 (lower number)', 'Alpha-3 (follows rule)', 'Either one', 'Cannot determine'],
    correctAnswer: 1,
    timeLimit: 30,
    explanation: 'The rule states Alpha tasks must come before Beta tasks, regardless of numbers. Start with Alpha-3.',
  },
  {
    id: 35,
    category: 'learning',
    type: 'scenario',
    question: 'You just learned: Red items = urgent, Blue items = standard. You see a Red report and Blue email. What do you handle first?',
    options: ['Blue email', 'Red report', 'Both simultaneously', 'Check timestamps first'],
    correctAnswer: 1,
    timeLimit: 25,
    explanation: 'Applying the new rule: Red = urgent, so the Red report takes priority over the Blue (standard) email.',
  },
  {
    id: 36,
    category: 'learning',
    type: 'scenario',
    question: 'New system: Priority = (Urgency × 2) + Impact. Task A: Urgency=3, Impact=4. Task B: Urgency=5, Impact=2. Which has higher priority?',
    options: ['Task A (10)', 'Task B (12)', 'Equal priority', 'Cannot calculate'],
    correctAnswer: 1,
    timeLimit: 40,
    explanation: 'Task A: (3×2)+4=10. Task B: (5×2)+2=12. Task B has higher priority.',
  },
  {
    id: 37,
    category: 'learning',
    type: 'scenario',
    question: 'New protocol: Green=Approved, Yellow=Review, Red=Blocked. You see Yellow status. What does this mean?',
    options: [
      'Ready to proceed',
      'Needs review before proceeding',
      'Cannot proceed',
      'Optional review'
    ],
    correctAnswer: 1,
    timeLimit: 25,
    explanation: 'Yellow status means "Review" - the item needs to be reviewed before you can proceed.',
  },
  {
    id: 38,
    category: 'learning',
    type: 'scenario',
    question: 'New rule: Star items expire in 24h, Diamond items expire in 7 days. A Star item created yesterday - status?',
    options: [
      'Still valid',
      'Expired',
      'Expires today',
      'Cannot determine'
    ],
    correctAnswer: 2,
    timeLimit: 30,
    explanation: 'Star items expire in 24 hours. Created yesterday means ~24 hours have passed, so it expires today (approaching deadline).',
  },
  {
    id: 39,
    category: 'learning',
    type: 'scenario',
    question: 'You learn: Circle symbols = individual work, Square symbols = team work. You see ⬜ Task-5. What does this require?',
    options: [
      'Individual work',
      'Team work',
      'Either approach',
      'Cannot determine'
    ],
    correctAnswer: 1,
    timeLimit: 25,
    explanation: 'The square symbol (⬜) indicates team work according to the newly learned system.',
  },
  {
    id: 40,
    category: 'learning',
    type: 'scenario',
    question: 'New scoring: A=4 points, B=3 points, C=2 points. You got: 2 A\'s, 1 B, 1 C. What\'s your total score?',
    options: ['9', '11', '13', '15'],
    correctAnswer: 2,
    timeLimit: 30,
    explanation: 'Applying the new scoring system: (2×4) + (1×3) + (1×2) = 8 + 3 + 2 = 13 points.',
  },
  {
    id: 41,
    category: 'learning',
    type: 'scenario',
    question: 'System update: "Quick" tasks = <30min, "Standard" = 30-120min, "Extended" = >120min. A 45-minute task is?',
    options: ['Quick', 'Standard', 'Extended', 'Between Quick and Standard'],
    correctAnswer: 1,
    timeLimit: 30,
    explanation: '45 minutes falls in the 30-120 minute range, making it a "Standard" task.',
  },
  {
    id: 42,
    category: 'learning',
    type: 'scenario',
    question: 'New tagging system: #now (today), #soon (this week), #later (this month). Task tagged #soon and it\'s Monday. Deadline?',
    options: [
      'Today',
      'By Sunday',
      'By end of month',
      'No specific deadline'
    ],
    correctAnswer: 1,
    timeLimit: 30,
    explanation: '#soon means "this week". If today is Monday, the deadline is by Sunday (end of current week).',
  },
];

// Function to randomly select questions ensuring category distribution
function selectRandomQuestions(): Question[] {
  const selected: Question[] = [];
  
  const patternQuestions = questionBank.filter(q => q.category === 'pattern');
  const logicQuestions = questionBank.filter(q => q.category === 'logic');
  const processingQuestions = questionBank.filter(q => q.category === 'processing');
  const learningQuestions = questionBank.filter(q => q.category === 'learning');
  
  // Helper to get random items from array
  const getRandomItems = <T,>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };
  
  // Select 4 pattern, 4 logic, 3 processing, 3 learning
  selected.push(...getRandomItems(patternQuestions, 4));
  selected.push(...getRandomItems(logicQuestions, 4));
  selected.push(...getRandomItems(processingQuestions, 3));
  selected.push(...getRandomItems(learningQuestions, 3));
  
  // Shuffle the final selection
  return selected.sort(() => Math.random() - 0.5);
}

interface CognitiveAgilityAssessmentProps {
  onComplete?: (score: number) => void;
}

export function CognitiveAgilityAssessment({ onComplete }: CognitiveAgilityAssessmentProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stage, setStage] = useState<'intro' | 'testing' | 'results' | 'review'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  // Timer effect
  useEffect(() => {
    if (stage === 'testing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (stage === 'testing' && timeLeft === 0 && currentQuestion) {
      // Time's up - move to next question
      handleNext();
    }
  }, [timeLeft, stage]);

  // Set timer when question changes
  useEffect(() => {
    if (stage === 'testing' && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit);
      setSelectedOption(answers[currentQuestionIndex]);
    }
  }, [currentQuestionIndex, stage]);

  const handleStart = () => {
    const selectedQuestions = selectRandomQuestions();
    setQuestions(selectedQuestions);
    setAnswers(new Array(selectedQuestions.length).fill(null));
    setStage('testing');
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
  };

  const handleSelectOption = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      // Test complete
      setStage('results');
      const finalScore = calculateScore();
      if (onComplete) {
        onComplete(finalScore.overall);
      }
    }
  };

  const calculateScore = () => {
    let correctByCategory = {
      pattern: { correct: 0, total: 0 },
      logic: { correct: 0, total: 0 },
      processing: { correct: 0, total: 0 },
      learning: { correct: 0, total: 0 },
    };

    questions.forEach((question, index) => {
      correctByCategory[question.category].total += 1;
      if (answers[index] === question.correctAnswer) {
        correctByCategory[question.category].correct += 1;
      }
    });

    const categoryScores = {
      pattern: Math.round((correctByCategory.pattern.correct / correctByCategory.pattern.total) * 100),
      logic: Math.round((correctByCategory.logic.correct / correctByCategory.logic.total) * 100),
      processing: Math.round((correctByCategory.processing.correct / correctByCategory.processing.total) * 100),
      learning: Math.round((correctByCategory.learning.correct / correctByCategory.learning.total) * 100),
    };

    const overall = Math.round(
      (categoryScores.pattern + categoryScores.logic + categoryScores.processing + categoryScores.learning) / 4
    );

    return { overall, categoryScores, correctByCategory };
  };

  // Intro Stage
  if (stage === 'intro') {
    return (
      <DSSurfaceCard className="p-8">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-[#7DBBFF]/10 border border-[#7DBBFF]/20" style={{ borderRadius: '16px' }}>
            <Brain className="w-8 h-8 text-[#7DBBFF]" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl text-[#111827] mb-2">Cognitive Agility Assessment</h3>
            <p className="text-[#6B7280] mb-6 leading-relaxed">
              This brief assessment measures your ability to recognize patterns, apply logic, process information, 
              and learn new systems quickly — core skills valued by modern employers.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-[#F9F9FA] border border-black/[0.08]" style={{ borderRadius: '12px' }}>
                <div className="text-sm text-[#6B7280] mb-1">Duration</div>
                <div className="text-[#111827] font-medium">~8 minutes</div>
              </div>
              <div className="p-4 bg-[#F9F9FA] border border-black/[0.08]" style={{ borderRadius: '12px' }}>
                <div className="text-sm text-[#6B7280] mb-1">Questions</div>
                <div className="text-[#111827] font-medium">14 timed questions</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-sm text-[#6B7280] mb-3">Assessment Categories</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Pattern Recognition',
                  'Logical Deduction',
                  'Information Processing',
                  'Learning Simulation'
                ].map((category) => (
                  <div key={category} className="flex items-center gap-2 text-sm text-[#111827]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7DBBFF]" />
                    {category}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-3 bg-[#7DBBFF] hover:bg-[#6aabef] text-white font-medium shadow-sm transition-colors"
              style={{ borderRadius: '12px' }}
            >
              <span>Start Assessment</span>
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </DSSurfaceCard>
    );
  }

  // Testing Stage
  if (stage === 'testing' && currentQuestion) {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const categoryLabels = {
      pattern: 'Pattern Recognition',
      logic: 'Logical Deduction',
      processing: 'Information Processing',
      learning: 'Learning Simulation',
    };

    return (
      <DSSurfaceCard className="p-8">
        {/* Header with progress and timer */}
        <div className="mb-6 pb-6 border-b border-black/[0.08]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-[#6B7280] mb-1">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className="text-xs text-[#7DBBFF] font-medium">
                {categoryLabels[currentQuestion.category]}
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#F9F9FA] border border-black/[0.08]" style={{ borderRadius: '10px' }}>
              <Clock className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
              <span className={`font-medium ${timeLeft <= 10 ? 'text-red-500' : 'text-[#111827]'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-[#F8FAFC] border border-black/[0.04]" style={{ borderRadius: '4px', overflow: 'hidden' }}>
            <div
              className="h-full bg-gradient-to-r from-[#7DBBFF] to-[#6aabef] transition-all duration-300"
              style={{ width: `${progress}%`, borderRadius: '4px' }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-lg text-[#111827] mb-6 leading-relaxed">
            {currentQuestion.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectOption(index)}
                className={`
                  w-full text-left p-4 border transition-all
                  ${
                    selectedOption === index
                      ? 'bg-[#7DBBFF]/10 border-[#7DBBFF] text-[#111827]'
                      : 'bg-white border-black/[0.08] text-[#6B7280] hover:border-[#7DBBFF]/40 hover:bg-[#7DBBFF]/5'
                  }
                `}
                style={{ borderRadius: '12px' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      w-6 h-6 border-2 flex items-center justify-center transition-all
                      ${
                        selectedOption === index
                          ? 'border-[#7DBBFF] bg-[#7DBBFF]'
                          : 'border-black/[0.2]'
                      }
                    `}
                    style={{ borderRadius: '50%' }}
                  >
                    {selectedOption === index && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="flex-1">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#6B7280]">
            {selectedOption === null ? 'Select an answer to continue' : 'Answer selected'}
          </div>
          <button
            onClick={handleNext}
            disabled={selectedOption === null}
            className={`
              flex items-center gap-2 px-6 py-3 font-medium shadow-sm transition-all
              ${
                selectedOption === null
                  ? 'bg-[#F9F9FA] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-[#7DBBFF] hover:bg-[#6aabef] text-white'
              }
            `}
            style={{ borderRadius: '12px' }}
          >
            <span>{currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </DSSurfaceCard>
    );
  }

  // Review Stage
  if (stage === 'review') {
    const categoryLabels = {
      pattern: 'Pattern Recognition',
      logic: 'Logical Deduction',
      processing: 'Information Processing',
      learning: 'Learning Simulation',
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl text-[#111827]">Review Your Answers</h3>
          <button
            onClick={() => setStage('results')}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white hover:bg-[#F9F9FA] border border-black/[0.08] text-[#111827] font-medium transition-colors"
            style={{ borderRadius: '10px' }}
          >
            <X className="w-4 h-4" strokeWidth={2} />
            <span>Close Review</span>
          </button>
        </div>

        {questions.map((question, index) => {
          const userAnswer = answers[index];
          const isCorrect = userAnswer === question.correctAnswer;
          
          return (
            <DSSurfaceCard key={question.id} className="p-6">
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-[#7DBBFF] font-medium">
                        {categoryLabels[question.category]}
                      </span>
                      <span className="text-xs text-[#6B7280]">Question {index + 1}</span>
                    </div>
                    <h4 className="text-[#111827] mb-4">{question.question}</h4>
                  </div>
                  <div className={`px-3 py-1 text-xs font-medium ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`} style={{ borderRadius: '8px' }}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                </div>

                {/* Options with user answer highlighted */}
                <div className="space-y-2 mb-4">
                  {question.options.map((option, optIndex) => {
                    const isUserAnswer = userAnswer === optIndex;
                    const isCorrectAnswer = question.correctAnswer === optIndex;
                    
                    let bgColor = 'bg-[#F9F9FA]';
                    let borderColor = 'border-black/[0.08]';
                    let textColor = 'text-[#6B7280]';
                    
                    if (isCorrectAnswer) {
                      bgColor = 'bg-green-50';
                      borderColor = 'border-green-200';
                      textColor = 'text-green-900';
                    } else if (isUserAnswer && !isCorrect) {
                      bgColor = 'bg-red-50';
                      borderColor = 'border-red-200';
                      textColor = 'text-red-900';
                    }
                    
                    return (
                      <div
                        key={optIndex}
                        className={`p-3 border ${bgColor} ${borderColor}`}
                        style={{ borderRadius: '10px' }}
                      >
                        <div className="flex items-center justify-between">
                          <span className={textColor}>{option}</span>
                          {isCorrectAnswer && (
                            <CheckCircle2 className="w-4 h-4 text-green-600" strokeWidth={2} />
                          )}
                          {isUserAnswer && !isCorrect && (
                            <X className="w-4 h-4 text-red-600" strokeWidth={2} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="p-4 bg-[#7DBBFF]/5 border border-[#7DBBFF]/20" style={{ borderRadius: '10px' }}>
                  <div className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-[#7DBBFF] mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div>
                      <div className="text-xs text-[#7DBBFF] font-medium mb-1">Explanation</div>
                      <p className="text-sm text-[#6B7280] leading-relaxed">{question.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </DSSurfaceCard>
          );
        })}
      </div>
    );
  }

  // Results Stage
  if (stage === 'results') {
    const scores = calculateScore();
    const categories = [
      { name: 'Pattern Recognition', key: 'pattern' as const, description: 'Identifying trends and sequences' },
      { name: 'Logical Deduction', key: 'logic' as const, description: 'Reasoning and inference' },
      { name: 'Information Processing', key: 'processing' as const, description: 'Prioritization and decision-making' },
      { name: 'Learning Simulation', key: 'learning' as const, description: 'Adapting to new rules and systems' },
    ];

    const getInsightText = (score: number) => {
      if (score >= 80) {
        return "You learn new skills rapidly and identify logic patterns efficiently. You excel at processing complex information and adapting to new systems with minimal guidance.";
      } else if (score >= 60) {
        return "You demonstrate solid cognitive agility with strong pattern recognition and logical reasoning. You process information effectively and adapt well to new frameworks.";
      } else {
        return "You show emerging cognitive skills with room to develop pattern recognition and logical reasoning. Continued practice with structured problem-solving will strengthen these abilities.";
      }
    };

    const getScoreLabel = (score: number) => {
      if (score >= 90) return 'Exceptional';
      if (score >= 80) return 'Strong';
      if (score >= 70) return 'Above Average';
      if (score >= 60) return 'Solid';
      return 'Developing';
    };

    return (
      <div className="space-y-6">
        {/* Overall Score Card */}
        <DSSurfaceCard className="p-8 bg-gradient-to-br from-[#7DBBFF]/5 to-white border-[#7DBBFF]/20">
          <div className="flex items-start gap-6 mb-6">
            <div className="p-4 bg-white border border-[#7DBBFF]/30" style={{ borderRadius: '16px' }}>
              <TrendingUp className="w-8 h-8 text-[#7DBBFF]" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl text-[#111827] mb-2">Assessment Complete</h3>
              <p className="text-[#6B7280]">
                Here's how you performed across the four cognitive agility categories.
              </p>
            </div>
          </div>

          <div className="flex items-end gap-4 mb-4">
            <div className="text-5xl font-bold text-[#7DBBFF]">{scores.overall}</div>
            <div className="mb-2">
              <div className="text-sm text-[#6B7280]">Cognitive Agility Score</div>
              <div className="text-[#111827] font-medium">{getScoreLabel(scores.overall)}</div>
            </div>
          </div>

          <div className="h-3 bg-white border border-black/[0.08] mb-6" style={{ borderRadius: '6px', overflow: 'hidden' }}>
            <div
              className="h-full bg-gradient-to-r from-[#7DBBFF] to-[#6aabef]"
              style={{ width: `${scores.overall}%`, borderRadius: '6px' }}
            />
          </div>

          <div className="p-4 bg-white border border-[#7DBBFF]/20 mb-4" style={{ borderRadius: '12px' }}>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#7DBBFF] mt-0.5 shrink-0" strokeWidth={1.5} />
              <p className="text-[#6B7280] leading-relaxed">
                {getInsightText(scores.overall)}
              </p>
            </div>
          </div>

          {/* Review Answers Button */}
          <button
            onClick={() => setStage('review')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-[#F9F9FA] border border-black/[0.08] hover:border-[#7DBBFF]/40 text-[#111827] font-medium transition-colors"
            style={{ borderRadius: '10px' }}
          >
            <Eye className="w-4 h-4" strokeWidth={2} />
            <span>Review Answers & Explanations</span>
          </button>
        </DSSurfaceCard>

        {/* Category Breakdown */}
        <DSSurfaceCard className="p-8">
          <h4 className="text-lg text-[#111827] mb-6">Category Breakdown</h4>
          <div className="space-y-5">
            {categories.map((category) => {
              const score = scores.categoryScores[category.key];
              const correctCount = scores.correctByCategory[category.key].correct;
              const totalCount = scores.correctByCategory[category.key].total;
              
              return (
                <div key={category.key}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-[#111827] font-medium">{category.name}</div>
                      <div className="text-sm text-[#6B7280]">
                        {category.description} • {correctCount}/{totalCount} correct
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#7DBBFF]">{score}</div>
                      <div className="text-xs text-[#6B7280]">out of 100</div>
                    </div>
                  </div>
                  <div className="h-2.5 bg-[#F8FAFC] border border-black/[0.04]" style={{ borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      className="h-full bg-gradient-to-r from-[#7DBBFF] to-[#6aabef] transition-all"
                      style={{ width: `${score}%`, borderRadius: '4px' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </DSSurfaceCard>

        {/* Next Steps */}
        <DSSurfaceCard className="p-6 bg-[#F8FAFC] border-[#7DBBFF]/20">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white border border-[#7DBBFF]/30" style={{ borderRadius: '8px' }}>
              <CheckCircle2 className="w-4 h-4 text-[#7DBBFF]" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="text-[#111827] mb-1">Score added to your profile</h4>
              <p className="text-sm text-[#6B7280]">
                This assessment demonstrates your cognitive abilities to potential employers. 
                Your results have been saved and will be visible in your Signature Traits summary.
              </p>
            </div>
          </div>
        </DSSurfaceCard>

        {/* Retake Option */}
        <div className="flex justify-end">
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#F9F9FA] border border-black/[0.08] hover:border-black/[0.12] text-[#111827] font-medium transition-colors"
            style={{ borderRadius: '12px' }}
          >
            <RotateCcw className="w-4 h-4" strokeWidth={2} />
            <span>Retake Assessment</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}
