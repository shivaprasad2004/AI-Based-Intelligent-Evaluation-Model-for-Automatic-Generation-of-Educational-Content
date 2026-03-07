from services.ai_service import get_ai_response, parse_json_response
from utils.prompts import EVALUATION_PROMPT

def evaluate_response(question, student_answer):
    """Evaluate a student's answer. Uses exact match for MCQ/true_false, AI for others."""
    if not student_answer or not student_answer.strip():
        return {'score': 0.0, 'is_correct': False, 'feedback': 'No answer provided.'}

    qtype = question.question_type

    if qtype in ('mcq', 'true_false'):
        return _exact_match(question, student_answer)
    else:
        return _semantic_eval(question, student_answer)

def _exact_match(question, student_answer):
    correct = question.correct_answer.strip().lower()
    answer = student_answer.strip().lower()
    is_correct = correct == answer

    return {
        'score': 1.0 if is_correct else 0.0,
        'is_correct': is_correct,
        'feedback': 'Correct!' if is_correct else f'Incorrect. The correct answer is: {question.correct_answer}'
    }

def _semantic_eval(question, student_answer):
    prompt = EVALUATION_PROMPT.format(
        question=question.question_text,
        question_type=question.question_type,
        correct_answer=question.correct_answer,
        student_answer=student_answer
    )

    try:
        raw = get_ai_response(prompt)
        result = parse_json_response(raw)
        return {
            'score': float(result.get('score', 0)),
            'is_correct': bool(result.get('is_correct', False)),
            'feedback': result.get('feedback', 'Unable to provide feedback.')
        }
    except Exception:
        # Fallback: simple string containment check
        correct_words = set(question.correct_answer.lower().split())
        answer_words = set(student_answer.lower().split())
        overlap = len(correct_words & answer_words) / max(len(correct_words), 1)
        is_correct = overlap >= 0.5

        return {
            'score': round(overlap, 2),
            'is_correct': is_correct,
            'feedback': 'AI evaluation unavailable. Score based on keyword matching.'
        }
