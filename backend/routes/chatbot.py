from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.ai_service import get_ai_response
from models.topic import Topic
from models.performance import PerformanceRecord
from utils.auth_helpers import student_required

chatbot_bp = Blueprint('chatbot', __name__)


@chatbot_bp.route('/ask', methods=['POST'])
@jwt_required()
def ask_tutor():
    """AI Tutor chatbot - answers questions, explains concepts, generates practice questions."""
    data = request.get_json()
    message = data.get('message', '').strip()
    topic_id = data.get('topic_id')
    chat_type = data.get('type', 'general')  # general, explain, practice, doubt

    if not message:
        return jsonify({'error': 'Message is required'}), 400

    topic_context = ''
    if topic_id:
        topic = Topic.query.get(topic_id)
        if topic:
            topic_context = f' about {topic.name} ({topic.description})'

    if chat_type == 'explain':
        prompt = f"""You are an expert tutor. Explain the following concept{topic_context} in a clear,
simple way that a student can understand. Use examples and analogies where helpful.
Break down complex ideas into simple steps.

Student's question: {message}

Provide a structured explanation with:
1. Simple definition
2. Key points (bullet points)
3. A real-world example
4. A quick memory tip"""

    elif chat_type == 'practice':
        prompt = f"""You are an expert tutor. Generate 3 practice questions{topic_context} based on: {message}

For each question provide:
- The question
- 4 options (A, B, C, D)
- The correct answer
- A brief explanation

Format as a numbered list. Make questions progressively harder."""

    elif chat_type == 'doubt':
        prompt = f"""You are a patient, encouraging tutor. A student has a doubt{topic_context}.

Student's doubt: {message}

Address their confusion directly. Be encouraging and supportive.
Provide:
1. A clear answer to their doubt
2. Why students commonly get confused about this
3. A simple trick to remember the correct concept
4. A follow-up question to test understanding"""

    else:
        prompt = f"""You are EvalAI, a friendly and knowledgeable AI tutor. Help the student{topic_context}.

Student: {message}

Respond helpfully and concisely. If they ask about a topic, provide clear explanations.
If they need help with a problem, guide them step by step.
Keep your response focused and educational."""

    try:
        response = get_ai_response(prompt)
    except Exception:
        response = _get_mock_response(message, chat_type, topic_context)

    return jsonify({
        'response': response,
        'type': chat_type
    })


@chatbot_bp.route('/knowledge-gaps', methods=['GET'])
@jwt_required()
@student_required
def get_knowledge_gaps():
    """Analyze student's weak areas and recommend study material."""
    student_id = int(get_jwt_identity())

    records = PerformanceRecord.query.filter_by(student_id=student_id).all()

    gaps = []
    for r in records:
        topic = Topic.query.get(r.topic_id)
        if not topic:
            continue

        severity = 'low'
        if r.average_score < 40:
            severity = 'critical'
        elif r.average_score < 60:
            severity = 'high'
        elif r.average_score < 75:
            severity = 'medium'
        else:
            continue  # No gap if score >= 75

        gaps.append({
            'topic_id': r.topic_id,
            'topic_name': topic.name,
            'topic_description': topic.description,
            'average_score': round(r.average_score, 1),
            'total_quizzes': r.total_quizzes,
            'current_level': r.current_level,
            'severity': severity,
            'recommendation': _get_recommendation(topic.name, r.average_score, r.current_level)
        })

    gaps.sort(key=lambda x: x['average_score'])

    return jsonify({'knowledge_gaps': gaps, 'total_gaps': len(gaps)})


@chatbot_bp.route('/study-material', methods=['POST'])
@jwt_required()
@student_required
def generate_study_material():
    """Generate personalized study material for weak topics."""
    data = request.get_json()
    topic_id = data.get('topic_id')

    if not topic_id:
        return jsonify({'error': 'topic_id is required'}), 400

    topic = Topic.query.get_or_404(topic_id)
    student_id = int(get_jwt_identity())

    record = PerformanceRecord.query.filter_by(
        student_id=student_id, topic_id=topic_id
    ).first()

    level = record.current_level if record else 1
    avg_score = record.average_score if record else 0

    prompt = f"""Create comprehensive study material for a student struggling with {topic.name}.
Student's current level: {level}/5, Average score: {avg_score}%

The study material should include:
1. **Key Concepts** - 5 most important concepts to understand
2. **Common Mistakes** - 3 mistakes students make and how to avoid them
3. **Quick Revision Notes** - Bullet-point summary of the topic
4. **Practice Strategy** - How to improve in this topic
5. **Memory Aids** - Mnemonics or tricks to remember key facts

Keep it concise, clear, and student-friendly. Use simple language."""

    try:
        material = get_ai_response(prompt)
    except Exception:
        material = _get_mock_study_material(topic.name, level)

    return jsonify({
        'topic_id': topic.id,
        'topic_name': topic.name,
        'study_material': material,
        'current_level': level,
        'average_score': round(avg_score, 1)
    })


def _get_recommendation(topic_name, avg_score, level):
    if avg_score < 40:
        return f"Start with basics of {topic_name}. Review fundamental concepts and take practice quizzes at easy difficulty."
    elif avg_score < 60:
        return f"Review key concepts in {topic_name}. Focus on understanding 'why' not just 'what'. Practice with medium difficulty."
    else:
        return f"You're close! Review specific weak areas in {topic_name}. Try harder questions to push to the next level."


def _get_mock_response(message, chat_type, topic_context):
    if chat_type == 'explain':
        return f"""Here's an explanation{topic_context}:

**Simple Definition:** This is a fundamental concept that involves understanding core principles and their applications.

**Key Points:**
- Start with the basics and build your understanding step by step
- Practice with real examples to reinforce learning
- Connect new concepts to what you already know

**Real-world Example:** Think of it like building a house - you need a strong foundation (basics) before adding walls (intermediate concepts) and a roof (advanced applications).

**Memory Tip:** Break complex topics into smaller chunks and review them regularly using spaced repetition."""

    elif chat_type == 'practice':
        return f"""Here are 3 practice questions{topic_context}:

**1. (Easy)** What is the most fundamental concept related to this topic?
A) Theory only  B) Practice only  C) Both theory and practice  D) Neither
**Correct: C** - Mastering any subject requires both theoretical understanding and practical application.

**2. (Medium)** Which approach is most effective for deep understanding?
A) Memorization  B) Understanding principles  C) Skipping basics  D) Random study
**Correct: B** - Understanding underlying principles leads to better retention and application.

**3. (Hard)** How would you apply this concept to solve a novel problem?
A) Use memorized formulas  B) Analyze, break down, apply principles  C) Guess  D) Skip it
**Correct: B** - Breaking down problems and applying core principles is the key to solving new challenges."""

    else:
        return f"""Great question! Let me help you{topic_context}.

The key thing to understand here is that learning is a process. Here are some tips:

1. **Break it down** - Don't try to understand everything at once
2. **Practice regularly** - Consistent practice beats cramming
3. **Ask questions** - There are no silly questions in learning
4. **Review mistakes** - Your errors are your best teachers

Would you like me to explain any specific concept in more detail?"""


def _get_mock_study_material(topic_name, level):
    return f"""# Study Material: {topic_name}

## Key Concepts
1. **Fundamentals** - Understand the basic definitions and principles
2. **Core Theories** - Learn the main theories and frameworks
3. **Applications** - See how concepts apply in real scenarios
4. **Problem Solving** - Practice solving different types of problems
5. **Connections** - Link this topic to related subjects

## Common Mistakes
1. **Skipping basics** - Always ensure your foundation is strong before moving ahead
2. **Memorizing without understanding** - Focus on 'why' not just 'what'
3. **Not practicing enough** - Regular practice is essential for mastery

## Quick Revision Notes
- Start with definitions and key terms
- Understand the main principles and their relationships
- Practice with examples from easy to hard
- Review your mistakes and learn from them
- Test yourself regularly with quizzes

## Practice Strategy
- Take quizzes at Level {level} difficulty regularly
- Review incorrect answers thoroughly
- Spend 20-30 minutes daily on this topic
- Use the AI tutor to clarify doubts immediately

## Memory Aids
- Create mind maps connecting key concepts
- Use flashcards for important definitions
- Teach concepts to someone else (or explain to yourself)
- Associate new concepts with familiar ideas"""
