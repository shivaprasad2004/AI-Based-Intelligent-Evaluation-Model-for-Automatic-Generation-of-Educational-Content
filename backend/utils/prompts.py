QUESTION_GENERATION_PROMPT = """You are an expert educator creating quiz questions for undergraduate students.

Generate {count} questions about the topic "{topic}" at difficulty level {difficulty}/5.

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

CRITICAL RULES:
- All questions must be factually accurate
- MCQ wrong options must be plausible, not obviously wrong
- Each question should test a different aspect of the topic
- Do NOT invent statistics, dates, or names you're unsure about

Topic context: {description}
"""

EVALUATION_PROMPT = """You are an expert evaluator. Evaluate the student's answer to the following question.

Question: {question}
Question Type: {question_type}
Correct Answer: {correct_answer}
Student's Answer: {student_answer}

Evaluate semantically - the student doesn't need to match word-for-word, but must demonstrate understanding of the key concepts.

EVALUATION GUIDELINES:
- If the student's answer is technically correct but uses different terminology, give partial or full credit
- If the answer is ambiguous but shows understanding, default to giving the student the benefit of the doubt
- For MCQ and true_false: exact match required (case-insensitive)
- For short_answer/fill_blank: accept synonyms and close variations
- For essay: evaluate depth, accuracy, and relevance

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

Topic: {topic}
Question: {question}
Correct Answer: {correct_answer}
Student's Answer: {student_answer}

Provide a clear explanation of:
1. Why the correct answer is right
2. Where the student's understanding went wrong
3. A helpful tip or related concept to remember

Keep it concise (2-4 sentences) and encouraging. Mention a related concept they could study to strengthen understanding.
Return ONLY the explanation text, no JSON.
"""

TOPIC_CONTENT_PROMPT = """You are an expert university-level educator creating a comprehensive study resource about "{topic}".

CRITICAL RULES:
- Only state facts you are confident about
- If you are unsure about something, say "according to available sources" rather than stating it as definitive
- Do not invent statistics, dates, or names
- Target undergraduate students
- Write like a great textbook — informative, engaging, and accurate

Return ONLY a valid JSON object with these fields:
- "overview": A detailed 3-5 paragraph explanation (minimum 300 words). Cover: definition, history/background, how it works, importance, and current applications.
- "key_concepts": An array of 8-10 key concepts, each with "title" (string) and "description" (string, 2-3 sentences each)
- "examples": An array of 4-5 real-world examples, each with "title" (string), "description" (string), and "code" (string, optional — only for programming topics)
- "study_material": A comprehensive study guide with ## headings, bullet points, key definitions, important facts, and study tips (use markdown formatting, minimum 200 words)

No markdown code blocks around the JSON. No extra text. ONLY the JSON object.
"""

DYNAMIC_QUIZ_PROMPT = """You are an expert educator creating a quiz for undergraduate students about "{topic}" at difficulty level {difficulty}/5.

Generate exactly {count} quiz questions. Questions must be factually accurate and based on verifiable information.

You MUST generate questions of ALL these types:
- 2 MCQ (multiple choice with 4 plausible options — wrong options should sound realistic)
- 1 fill_blank (remove a KEY term from a factual sentence)
- 1 true_false (mix of true and false statements — make false ones subtle)
- 1 short_answer (require 1-2 sentence explanations)

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

CRITICAL RULES:
- Every question must be based on REAL, verifiable facts
- Each question should cover a DIFFERENT aspect of the topic
- Questions should test UNDERSTANDING, not just memorization

Return ONLY a JSON array of question objects. No markdown, no extra text.
"""

ANSWER_EVALUATION_PROMPT = """You are an expert evaluator assessing student answers about "{topic}".

Evaluate each student answer below. Be fair but thorough:
- For MCQ and true_false: exact match required, but accept minor typos
- For fill_blank: accept the exact term or very close synonyms
- For short_answer: evaluate semantically — student doesn't need exact wording but must show understanding
- If an answer is technically correct but uses different terminology, give partial or full credit

Questions and answers:
{qa_pairs}

For EACH answer, return a JSON object with:
- "question_id": the question ID
- "score": float 0.0-1.0 (0=wrong, 0.5=partial, 1.0=correct)
- "is_correct": boolean (true if score >= 0.7)
- "feedback": specific, helpful feedback — what was right, what was wrong, and the key point to remember
- "correct_answer": the actual correct answer

Return ONLY a JSON array of evaluation objects.
"""
