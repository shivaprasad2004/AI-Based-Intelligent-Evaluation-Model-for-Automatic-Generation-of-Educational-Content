QUESTION_GENERATION_PROMPT = """You are an expert educator. Generate {count} questions about the topic "{topic}" at difficulty level {difficulty}/5.

Generate questions of the following types: {types}

For each question, provide a JSON object with these fields:
- "question_type": one of "mcq", "short_answer", "essay", "fill_blank", "true_false"
- "question_text": the question text
- "options": for MCQ only, an array of 4 options (strings). null for other types.
- "correct_answer": the correct answer. For MCQ, the exact text of the correct option. For true_false, "True" or "False".
- "explanation": a brief explanation of why this is the correct answer
- "difficulty": {difficulty}

Return ONLY a JSON array of question objects. No markdown, no extra text.

Difficulty guide:
1 = Basic recall/definitions
2 = Understanding concepts
3 = Application of knowledge
4 = Analysis and comparison
5 = Evaluation and synthesis

Topic context: {description}
"""

EVALUATION_PROMPT = """You are an expert evaluator. Evaluate the student's answer to the following question.

Question: {question}
Question Type: {question_type}
Correct Answer: {correct_answer}
Student's Answer: {student_answer}

Evaluate semantically - the student doesn't need to match word-for-word, but must demonstrate understanding of the key concepts.

Return ONLY a JSON object with:
- "score": a float from 0.0 to 1.0 (0 = completely wrong, 0.5 = partially correct, 1.0 = fully correct)
- "is_correct": boolean (true if score >= 0.7)
- "feedback": a brief explanation of what was right/wrong and the correct answer

For essay questions, evaluate based on:
- Relevance to the question
- Accuracy of information
- Completeness of the answer
- Clarity of expression
"""

FEEDBACK_PROMPT = """The student answered a question incorrectly. Provide a helpful, encouraging explanation.

Question: {question}
Correct Answer: {correct_answer}
Student's Answer: {student_answer}

Provide a clear explanation of:
1. Why the correct answer is right
2. Where the student's understanding went wrong
3. A helpful tip to remember this concept

Keep it concise (2-4 sentences) and encouraging.
Return ONLY the explanation text, no JSON.
"""

TOPIC_CONTENT_PROMPT = """You are an expert educator. Generate comprehensive educational content about "{topic}".

Return ONLY a valid JSON object with these fields:
- "overview": A detailed 3-5 paragraph explanation of the topic suitable for students (string)
- "key_concepts": An array of 6-10 key concepts, each with "title" (string) and "description" (string, 2-3 sentences)
- "examples": An array of 3-5 practical examples, each with "title" (string), "description" (string), and "code" (string, optional, only if programming-related)
- "study_material": A concise study guide with bullet points covering the most important things to remember (string, use markdown formatting)

Make the content educational, accurate, and engaging. Target an undergraduate student level.
"""

DYNAMIC_QUIZ_PROMPT = """You are an expert educator. Generate exactly {count} quiz questions about "{topic}" at difficulty level {difficulty}/5.

You MUST generate questions of ALL these types:
- 2 MCQ (multiple choice with 4 options)
- 1 fill_blank (fill in the blank)
- 1 true_false
- 1 short_answer

If count > 5, distribute extra questions evenly across types.

For each question, provide a JSON object with:
- "question_type": one of "mcq", "short_answer", "essay", "fill_blank", "true_false"
- "question_text": the question text
- "options": for MCQ only, an array of 4 option strings. null for other types.
- "correct_answer": the correct answer
- "explanation": brief explanation of the correct answer
- "difficulty": {difficulty}

Difficulty guide:
1 = Basic recall/definitions
2 = Understanding concepts
3 = Application of knowledge
4 = Analysis and comparison
5 = Evaluation and synthesis

Return ONLY a JSON array of question objects. No markdown, no extra text.
"""

ANSWER_EVALUATION_PROMPT = """You are an expert evaluator. Evaluate each student answer below.

Topic: {topic}

Questions and answers:
{qa_pairs}

For EACH answer, return a JSON object with:
- "question_id": the question ID
- "score": float 0.0-1.0 (0=wrong, 0.5=partial, 1.0=correct)
- "is_correct": boolean (true if score >= 0.7)
- "feedback": 1-2 sentence explanation
- "correct_answer": the actual correct answer

Evaluate semantically - students don't need word-for-word matches but must show understanding.
For MCQ and true_false, use exact match.

Return ONLY a JSON array of evaluation objects.
"""
