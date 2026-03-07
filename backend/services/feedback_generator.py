from services.ai_service import get_ai_response
from utils.prompts import FEEDBACK_PROMPT

def generate_feedback(question, student_answer):
    """Generate AI-powered feedback for an incorrect answer."""
    prompt = FEEDBACK_PROMPT.format(
        question=question.question_text,
        correct_answer=question.correct_answer,
        student_answer=student_answer or '(no answer)'
    )

    try:
        feedback = get_ai_response(prompt)
        return feedback.strip()
    except Exception:
        return f"The correct answer is: {question.correct_answer}. {question.explanation or ''}"
