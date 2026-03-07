export default function QuestionCard({ question, answer, onAnswer }) {
  const { question_type, question_text, options } = question;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-indigo-100 text-indigo-700">
          {question_type.replace('_', ' ').toUpperCase()}
        </span>
        <span className="text-xs text-gray-500">Difficulty: {question.difficulty}/5</span>
      </div>
      <p className="text-lg font-medium text-gray-800 mb-4">{question_text}</p>

      {question_type === 'mcq' && (
        <MCQInput options={options} answer={answer} onAnswer={onAnswer} />
      )}
      {question_type === 'true_false' && (
        <TrueFalseInput answer={answer} onAnswer={onAnswer} />
      )}
      {question_type === 'short_answer' && (
        <ShortAnswerInput answer={answer} onAnswer={onAnswer} />
      )}
      {question_type === 'fill_blank' && (
        <FillBlankInput answer={answer} onAnswer={onAnswer} />
      )}
      {question_type === 'essay' && (
        <EssayInput answer={answer} onAnswer={onAnswer} />
      )}
    </div>
  );
}

function MCQInput({ options, answer, onAnswer }) {
  if (!options) return null;
  return (
    <div className="space-y-2">
      {options.map((opt, i) => (
        <label
          key={i}
          className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors
            ${answer === opt ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
        >
          <input
            type="radio"
            name="mcq"
            className="mr-3"
            checked={answer === opt}
            onChange={() => onAnswer(opt)}
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );
}

function TrueFalseInput({ answer, onAnswer }) {
  return (
    <div className="flex gap-4">
      {['True', 'False'].map(val => (
        <button
          key={val}
          onClick={() => onAnswer(val)}
          className={`flex-1 py-3 rounded-lg border-2 font-medium transition-colors
            ${answer === val ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'}`}
        >
          {val}
        </button>
      ))}
    </div>
  );
}

function ShortAnswerInput({ answer, onAnswer }) {
  return (
    <input
      type="text"
      value={answer || ''}
      onChange={e => onAnswer(e.target.value)}
      placeholder="Type your answer..."
      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
    />
  );
}

function FillBlankInput({ answer, onAnswer }) {
  return (
    <input
      type="text"
      value={answer || ''}
      onChange={e => onAnswer(e.target.value)}
      placeholder="Fill in the blank..."
      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
    />
  );
}

function EssayInput({ answer, onAnswer }) {
  return (
    <textarea
      value={answer || ''}
      onChange={e => onAnswer(e.target.value)}
      placeholder="Write your essay response..."
      rows={6}
      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-y"
    />
  );
}
