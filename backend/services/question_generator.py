from services.ai_service import get_ai_response, parse_json_response
from models.question import Question
from utils.db import db
from utils.prompts import QUESTION_GENERATION_PROMPT

VALID_TYPES = ['mcq', 'short_answer', 'essay', 'fill_blank', 'true_false']

def generate_questions(topic_name, topic_description, difficulty=1, count=5, types=None):
    if types is None:
        types = VALID_TYPES

    types_str = ', '.join(types)
    prompt = QUESTION_GENERATION_PROMPT.format(
        count=count,
        topic=topic_name,
        difficulty=difficulty,
        types=types_str,
        description=topic_description or topic_name
    )

    raw = get_ai_response(prompt)
    questions_data = parse_json_response(raw)

    if not isinstance(questions_data, list):
        raise ValueError("AI did not return a list of questions")

    generated = []
    for q in questions_data:
        qtype = q.get('question_type', '').lower().strip()
        if qtype not in VALID_TYPES:
            continue

        question = Question(
            question_type=qtype,
            difficulty=q.get('difficulty', difficulty),
            question_text=q.get('question_text', ''),
            correct_answer=str(q.get('correct_answer', '')),
            explanation=q.get('explanation', '')
        )
        if qtype == 'mcq' and q.get('options'):
            question.options = q['options']

        generated.append(question)

    return generated
