import { createContext, useContext, useState } from 'react';

const QuizContext = createContext(null);

export function QuizProvider({ children }) {
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);

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
