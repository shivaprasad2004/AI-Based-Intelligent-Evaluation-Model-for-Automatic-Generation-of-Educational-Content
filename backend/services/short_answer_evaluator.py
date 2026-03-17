import re
import logging
from services.ai_service import get_ai_response, parse_json_response

logger = logging.getLogger(__name__)

STOP_WORDS = {
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'is', 'it', 'as', 'was', 'are', 'be', 'been', 'being', 'have', 'has',
    'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'shall', 'can', 'this', 'that', 'these', 'those', 'there', 'their', 'they', 'them',
    'which', 'what', 'who', 'whom', 'whose', 'where', 'when', 'how', 'why', 'not',
    'no', 'nor', 'so', 'if', 'then', 'than', 'too', 'very', 'just', 'about', 'also',
    'into', 'over', 'after', 'before', 'between', 'under', 'above', 'such', 'each',
    'some', 'any', 'all', 'both', 'few', 'more', 'most', 'other', 'only', 'same',
    'own', 'its', 'our', 'your', 'his', 'her', 'out', 'up', 'one', 'two', 'three',
    'first', 'new', 'now', 'way', 'use', 'used', 'using', 'many', 'well', 'back',
    'even', 'still', 'while', 'here', 'much', 'through', 'during', 'however', 'often'
}


def _simple_stem(word):
    """Basic suffix stripping for matching."""
    word = word.lower()
    for suffix in ['ation', 'tion', 'sion', 'ment', 'ness', 'ity', 'ies', 'ing', 'ous', 'ive', 'able', 'ible', 'ally', 'ful', 'less', 'ed', 'er', 'ly', 'al', 'es', 's']:
        if word.endswith(suffix) and len(word) - len(suffix) >= 3:
            return word[:-len(suffix)]
    return word


def _extract_keywords(text):
    """Extract significant keywords from text."""
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
    return [w for w in words if w not in STOP_WORDS]


def _keyword_match(student_keywords, correct_keywords):
    """Match student keywords against correct answer keywords using exact + stem matching."""
    matched = []
    missed = []

    student_stems = {_simple_stem(w): w for w in student_keywords}
    student_lower = set(w.lower() for w in student_keywords)

    for kw in correct_keywords:
        kw_lower = kw.lower()
        kw_stem = _simple_stem(kw_lower)

        if kw_lower in student_lower:
            matched.append(kw)
        elif kw_stem in student_stems:
            matched.append(kw)
        else:
            missed.append(kw)

    return matched, missed


def generate_short_answer_questions(topic_name, count=5, difficulty=3):
    """Generate short answer questions using AI. Each question expects a 10-15 word answer."""
    prompt = f"""You are an expert educator creating short-answer questions for undergraduate students about "{topic_name}".

Generate exactly {count} short-answer questions at difficulty level {difficulty}/5.

IMPORTANT RULES:
- Each question should require a concise answer of 10-15 words
- Questions should test understanding, not just recall
- Each question must have a clear, specific correct answer
- Extract 3-5 keywords from the correct answer that are essential for scoring
- Questions should cover different aspects of the topic
- All content must be factually accurate

Difficulty guide:
1 = Basic definitions and recall
2 = Understanding concepts
3 = Application of knowledge
4 = Analysis and comparison
5 = Evaluation and synthesis

Return ONLY a JSON array where each item has:
- "question_text": the question
- "correct_answer": the ideal answer in 10-15 words
- "keywords": array of 3-5 essential keywords/phrases from the correct answer that must be present for full credit
- "difficulty": {difficulty}
- "explanation": brief explanation of why this is the correct answer

No markdown, no extra text. ONLY the JSON array."""

    try:
        raw = get_ai_response(prompt)
        questions = parse_json_response(raw)
        if isinstance(questions, list) and len(questions) > 0:
            # Validate and clean
            cleaned = []
            for q in questions[:count]:
                if not q.get('question_text') or not q.get('correct_answer'):
                    continue
                # Ensure keywords exist
                if not q.get('keywords') or len(q['keywords']) == 0:
                    q['keywords'] = _extract_keywords(q['correct_answer'])[:5]
                cleaned.append({
                    'question_text': q['question_text'],
                    'correct_answer': q['correct_answer'],
                    'keywords': q['keywords'][:5],
                    'difficulty': q.get('difficulty', difficulty),
                    'explanation': q.get('explanation', '')
                })
            return cleaned
    except Exception as e:
        logger.error(f"Short answer question generation failed for '{topic_name}': {e}")

    return []


def evaluate_short_answer(student_answer, correct_answer, keywords):
    """Evaluate a short answer against correct answer and keywords.

    Uses a combination of:
    1. Keyword matching (primary scoring)
    2. AI semantic evaluation (when available)
    3. Word overlap fallback

    Returns dict with score (0-1), matched_keywords, missed_keywords, feedback.
    """
    if not student_answer or not student_answer.strip():
        return {
            'score': 0.0,
            'is_correct': False,
            'matched_keywords': [],
            'missed_keywords': keywords,
            'feedback': 'No answer provided.'
        }

    student_answer = student_answer.strip()
    student_keywords = _extract_keywords(student_answer)

    # Step 1: Keyword matching
    matched_kw, missed_kw = _keyword_match(student_keywords, keywords)
    keyword_score = len(matched_kw) / max(len(keywords), 1)

    # Step 2: Word overlap with correct answer
    correct_keywords = _extract_keywords(correct_answer)
    overlap_matched, _ = _keyword_match(student_keywords, correct_keywords)
    overlap_score = len(overlap_matched) / max(len(correct_keywords), 1)

    # Step 3: Try AI semantic evaluation for more accuracy
    ai_score = None
    ai_feedback = None
    try:
        ai_result = _ai_evaluate_short_answer(student_answer, correct_answer, keywords)
        if ai_result:
            ai_score = ai_result.get('score', None)
            ai_feedback = ai_result.get('feedback', '')
            # AI may detect additional keyword matches
            ai_matched = ai_result.get('matched_keywords', [])
            for kw in ai_matched:
                if kw in missed_kw:
                    missed_kw.remove(kw)
                    matched_kw.append(kw)
            keyword_score = len(matched_kw) / max(len(keywords), 1)
    except Exception as e:
        logger.warning(f"AI short answer evaluation failed: {e}")

    # Combine scores
    if ai_score is not None:
        # Blend: 40% keyword, 20% overlap, 40% AI
        final_score = keyword_score * 0.4 + overlap_score * 0.2 + ai_score * 0.4
    else:
        # No AI: 60% keyword, 40% overlap
        final_score = keyword_score * 0.6 + overlap_score * 0.4

    final_score = round(min(final_score, 1.0), 2)
    is_correct = final_score >= 0.6

    # Generate feedback
    if ai_feedback:
        feedback = ai_feedback
    elif final_score >= 0.9:
        feedback = 'Excellent! Your answer covers all the key concepts accurately.'
    elif final_score >= 0.7:
        feedback = f'Good answer! You covered most key points. Missing: {", ".join(missed_kw[:3])}.' if missed_kw else 'Good answer!'
    elif final_score >= 0.5:
        feedback = f'Partial credit. Key concepts missing: {", ".join(missed_kw[:3])}. The correct answer includes: {correct_answer}'
    else:
        feedback = f'Incorrect. The expected answer is: {correct_answer}. Key concepts: {", ".join(keywords[:4])}'

    return {
        'score': final_score,
        'is_correct': is_correct,
        'matched_keywords': matched_kw,
        'missed_keywords': missed_kw,
        'feedback': feedback
    }


def _ai_evaluate_short_answer(student_answer, correct_answer, keywords):
    """Use AI for semantic evaluation of short answer."""
    keywords_str = ', '.join(keywords)
    prompt = f"""You are an expert evaluator. Evaluate this student's short answer.

CORRECT ANSWER: {correct_answer}
ESSENTIAL KEYWORDS: {keywords_str}
STUDENT'S ANSWER: {student_answer}

Evaluate semantically - the student doesn't need exact wording but must demonstrate understanding.
Accept synonyms, paraphrases, and equivalent terminology.

Return ONLY a JSON object with:
- "score": float 0.0-1.0 (0=wrong, 0.5=partial, 1.0=correct)
- "is_correct": boolean (true if score >= 0.6)
- "feedback": specific feedback about what was right/wrong (1-2 sentences)
- "matched_keywords": array of keywords from the essential list that the student effectively covered (including via synonyms)

No markdown, no extra text."""

    raw = get_ai_response(prompt)
    result = parse_json_response(raw)
    if isinstance(result, dict) and 'score' in result:
        result['score'] = max(0.0, min(1.0, float(result['score'])))
        return result
    return None
