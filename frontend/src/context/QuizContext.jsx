import { createContext, useContext, useState, useEffect } from 'react';

const QuizContext = createContext(null);

function loadFromSession(key, fallback) {
  try {
    const saved = sessionStorage.getItem(`quiz_${key}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch { return fallback; }
}

function saveToSession(key, value) {
  try {
    sessionStorage.setItem(`quiz_${key}`, JSON.stringify(value));
  } catch { /* ignore */ }
}

function clearSession() {
  ['session', 'questions', 'currentIndex', 'answers', 'results'].forEach(k => {
    sessionStorage.removeItem(`quiz_${k}`);
  });
}

export function QuizProvider({ children }) {
  const [session, setSession] = useState(() => loadFromSession('session', null));
  const [questions, setQuestions] = useState(() => loadFromSession('questions', []));
  const [currentIndex, setCurrentIndex] = useState(() => loadFromSession('currentIndex', 0));
  const [answers, setAnswers] = useState(() => loadFromSession('answers', {}));
  const [results, setResults] = useState(() => loadFromSession('results', null));

  // Persist to sessionStorage on changes
  useEffect(() => { saveToSession('session', session); }, [session]);
  useEffect(() => { saveToSession('questions', questions); }, [questions]);
  useEffect(() => { saveToSession('currentIndex', currentIndex); }, [currentIndex]);
  useEffect(() => { saveToSession('answers', answers); }, [answers]);
  useEffect(() => { saveToSession('results', results); }, [results]);

  const startQuiz = (sessionData) => {
    setSession({ id: sessionData.session_id, difficulty: sessionData.difficulty_level, topic_name: sessionData.topic_name });
    setQuestions(sessionData.questions);
    setCurrentIndex(0);
    setAnswers({});
    setResults(null);
  };

  const setAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const resetQuiz = () => {
    setSession(null);
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setResults(null);
    clearSession();
  };

  return (
    <QuizContext.Provider value={{
      session, questions, currentIndex, answers, results,
      setCurrentIndex, setAnswer, startQuiz, setResults, resetQuiz
    }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be inside QuizProvider');
  return ctx;
}
