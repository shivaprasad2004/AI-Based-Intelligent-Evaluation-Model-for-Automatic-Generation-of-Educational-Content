import json
import re
import random
import requests
from flask import current_app


def get_ai_response(prompt):
    provider = current_app.config.get('AI_PROVIDER', 'mock')
    # Try the configured AI provider first, fall back to mock on any failure
    if provider != 'mock':
        try:
            if provider == 'claude':
                return _call_claude(prompt)
            elif provider == 'openai':
                return _call_openai(prompt)
            elif provider == 'gemini':
                return _call_gemini(prompt)
        except Exception as e:
            print(f"AI provider '{provider}' failed: {e}. Falling back to enhanced mock mode.")
    return _mock_response(prompt)


def _call_claude(prompt):
    import anthropic
    client = anthropic.Anthropic(api_key=current_app.config['ANTHROPIC_API_KEY'])
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content[0].text.strip()


def _call_openai(prompt):
    import openai
    client = openai.OpenAI(api_key=current_app.config['OPENAI_API_KEY'])
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=2000
    )
    return response.choices[0].message.content.strip()


def _call_gemini(prompt):
    import google.generativeai as genai
    genai.configure(api_key=current_app.config['GEMINI_API_KEY'])
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    return response.text.strip()


def _mock_response(prompt):
    """Generate intelligent mock responses using real web data when no AI key is configured."""
    prompt_lower = prompt.lower()

    # Detect topic content generation prompts
    if 'comprehensive educational content' in prompt_lower:
        return _generate_real_topic_content(prompt)

    # Detect question generation prompts
    if 'generate' in prompt_lower and 'questions' in prompt_lower:
        return _generate_real_questions(prompt)

    # Detect bulk evaluation prompts
    if 'evaluate each student answer' in prompt_lower:
        return _smart_bulk_evaluate(prompt)

    # Detect evaluation prompts
    if 'evaluate' in prompt_lower and "student's answer" in prompt_lower:
        return _mock_evaluate(prompt)

    # Detect feedback prompts
    if 'student answered' in prompt_lower and 'incorrectly' in prompt_lower:
        return _mock_feedback()

    # Detect brief educational summary prompts
    if 'brief educational summary' in prompt_lower:
        topic_match = re.search(r'"([^"]+)"', prompt)
        topic = topic_match.group(1) if topic_match else "this topic"
        return _get_brief_summary(topic)

    return '{"result": "mock response"}'


# ─────────────────────────────────────────────────────────────
# REAL WEB DATA FETCHING
# ─────────────────────────────────────────────────────────────

def _fetch_wikipedia(topic):
    """Fetch real Wikipedia content for a topic."""
    try:
        import wikipedia
        wikipedia.set_lang("en")

        # Search for the best matching page
        search_results = wikipedia.search(topic, results=5)
        if not search_results:
            return None

        for candidate in search_results:
            try:
                page = wikipedia.page(candidate, auto_suggest=False)
                summary = wikipedia.summary(candidate, sentences=15, auto_suggest=False)
                return {
                    'summary': summary,
                    'url': page.url,
                    'title': page.title,
                    'content': page.content[:8000],
                    'links': page.links[:20],
                    'categories': list(page.categories)[:10] if hasattr(page, 'categories') else []
                }
            except wikipedia.exceptions.DisambiguationError as e:
                if e.options:
                    try:
                        page = wikipedia.page(e.options[0], auto_suggest=False)
                        summary = wikipedia.summary(e.options[0], sentences=15, auto_suggest=False)
                        return {
                            'summary': summary,
                            'url': page.url,
                            'title': page.title,
                            'content': page.content[:8000],
                            'links': page.links[:20],
                            'categories': []
                        }
                    except Exception:
                        continue
            except wikipedia.exceptions.PageError:
                continue
            except Exception:
                continue
    except Exception as e:
        print(f"Wikipedia fetch error: {e}")
    return None


def _fetch_duckduckgo(topic):
    """Fetch real DuckDuckGo data for a topic."""
    try:
        ddg_url = f'https://api.duckduckgo.com/?q={requests.utils.quote(topic)}&format=json&no_html=1&skip_disambig=1'
        resp = requests.get(ddg_url, timeout=8)
        data = resp.json()
        result = {
            'abstract': data.get('AbstractText', ''),
            'abstract_source': data.get('AbstractSource', ''),
            'abstract_url': data.get('AbstractURL', ''),
            'heading': data.get('Heading', ''),
            'definition': data.get('Definition', ''),
            'related_topics': [],
            'infobox': {}
        }
        for rt in data.get('RelatedTopics', []):
            if isinstance(rt, dict) and 'Text' in rt:
                result['related_topics'].append({
                    'text': rt['Text'],
                    'url': rt.get('FirstURL', '')
                })
            elif isinstance(rt, dict) and 'Topics' in rt:
                for sub in rt.get('Topics', []):
                    if isinstance(sub, dict) and 'Text' in sub:
                        result['related_topics'].append({
                            'text': sub['Text'],
                            'url': sub.get('FirstURL', '')
                        })
        if data.get('Infobox') and isinstance(data['Infobox'], dict):
            for item in data['Infobox'].get('content', []):
                if isinstance(item, dict) and 'label' in item:
                    result['infobox'][item['label']] = item.get('value', '')
        return result
    except Exception as e:
        print(f"DuckDuckGo fetch error: {e}")
    return None


def _extract_key_concepts_from_text(text, topic):
    """Intelligently extract key concepts from real text content."""
    if not text:
        return []
    sentences = re.split(r'(?<=[.!?])\s+', text)
    concepts = []
    seen_titles = set()

    # Strategy 1: Find sentences with key definition patterns
    definition_patterns = [
        r'([\w\s]+)\s+is\s+(a|an|the)\s+',
        r'([\w\s]+)\s+refers?\s+to\s+',
        r'([\w\s]+)\s+involves?\s+',
        r'([\w\s]+)\s+consists?\s+of\s+',
        r'([\w\s]+)\s+can\s+be\s+defined\s+as\s+',
    ]

    for sent in sentences:
        if len(sent) < 30 or len(sent) > 400:
            continue
        sent = sent.strip()
        if not sent:
            continue

        for pattern in definition_patterns:
            match = re.search(pattern, sent, re.IGNORECASE)
            if match:
                title_candidate = match.group(1).strip()
                # Clean title
                title_candidate = re.sub(r'^(the|a|an|in|of|and|or|this|that|these|those|it|its)\s+', '', title_candidate, flags=re.IGNORECASE).strip()
                if len(title_candidate) > 3 and len(title_candidate) < 60 and title_candidate.lower() not in seen_titles:
                    seen_titles.add(title_candidate.lower())
                    concepts.append({
                        'title': title_candidate.title(),
                        'description': sent.strip()
                    })
                break

        if len(concepts) >= 8:
            break

    # Strategy 2: If not enough, split content into logical sections
    if len(concepts) < 4:
        # Use first significant sentences
        for i, sent in enumerate(sentences):
            if len(sent) > 40 and len(sent) < 400 and i < 20:
                words = sent.split()
                title = ' '.join(words[:4]).rstrip('.,;:').title()
                if title.lower() not in seen_titles:
                    seen_titles.add(title.lower())
                    concepts.append({
                        'title': title,
                        'description': sent.strip()
                    })
            if len(concepts) >= 8:
                break

    return concepts[:8]


def _create_examples_from_content(text, topic, related_topics):
    """Generate real examples from content and related topics."""
    examples = []
    sentences = re.split(r'(?<=[.!?])\s+', text) if text else []

    # Find sentences with examples, applications, or specific instances
    example_keywords = ['for example', 'such as', 'instance', 'application', 'used in', 'applied', 'demonstrate']
    for sent in sentences:
        for kw in example_keywords:
            if kw in sent.lower() and 30 < len(sent) < 500:
                title = f"Application in {topic}" if 'appli' in kw else f"Example of {topic}"
                if len(examples) > 0:
                    title = f"Real-World {['Application', 'Usage', 'Case Study', 'Instance'][min(len(examples), 3)]}"
                examples.append({
                    'title': title,
                    'description': sent.strip(),
                    'code': None
                })
                break
        if len(examples) >= 4:
            break

    # Add related topics as exploration examples
    if related_topics:
        for rt in related_topics[:2]:
            if rt.get('text') and len(rt['text']) > 20:
                examples.append({
                    'title': 'Related Concept',
                    'description': rt['text'],
                    'code': None
                })
        if len(examples) > 5:
            examples = examples[:5]

    return examples


# ─────────────────────────────────────────────────────────────
# TOPIC CONTENT GENERATION (REAL DATA)
# ─────────────────────────────────────────────────────────────

def _generate_real_topic_content(prompt):
    """Generate REAL educational content by fetching from Wikipedia + DuckDuckGo + multiple sources."""
    topic_match = re.search(r'"([^"]+)"', prompt)
    topic = topic_match.group(1) if topic_match else "General Topic"

    wiki = _fetch_wikipedia(topic)
    ddg = _fetch_duckduckgo(topic)

    # Also try fetching from additional Wikipedia searches for richer content
    extra_wiki = None
    if wiki and wiki.get('title', '').lower() != topic.lower():
        extra_wiki = _fetch_wikipedia(topic + " programming") if 'programming' not in topic.lower() else _fetch_wikipedia(topic + " tutorial")

    # Build a rich, multi-paragraph overview
    overview_parts = []
    if ddg and ddg.get('definition'):
        overview_parts.append(f"**Definition:** {ddg['definition']}")
    if wiki and wiki.get('summary'):
        # Split summary into paragraphs for better readability
        summary = wiki['summary']
        overview_parts.append(summary)
    if ddg and ddg.get('abstract'):
        abstract = ddg['abstract']
        # Only add if it provides new info
        if not wiki or abstract not in wiki.get('summary', ''):
            overview_parts.append(abstract)

    if not overview_parts:
        # Fallback: try to build from content sections
        if wiki and wiki.get('content'):
            paragraphs = wiki['content'].split('\n\n')
            for p in paragraphs[:3]:
                clean = p.strip()
                if len(clean) > 50 and not clean.startswith('=='):
                    overview_parts.append(clean)

    overview = '\n\n'.join(overview_parts) if overview_parts else f'{topic} is an important field of study with wide-ranging applications.'

    # Extract key concepts from real content — use more text for richer results
    full_text = ''
    if wiki and wiki.get('content'):
        full_text = wiki['content']
    elif wiki and wiki.get('summary'):
        full_text = wiki['summary']

    # Also pull in section headings from Wikipedia content as concept titles
    key_concepts = _extract_key_concepts_from_text(full_text, topic)

    # Extract Wikipedia section headings as additional concepts if we don't have enough
    if len(key_concepts) < 6 and wiki and wiki.get('content'):
        section_concepts = _extract_section_concepts(wiki['content'], topic)
        existing_titles = {c['title'].lower() for c in key_concepts}
        for sc in section_concepts:
            if sc['title'].lower() not in existing_titles and len(key_concepts) < 10:
                key_concepts.append(sc)

    # Build examples from real content
    related = ddg.get('related_topics', []) if ddg else []
    examples = _create_examples_from_content(full_text, topic, related)

    # If we still don't have enough examples, generate from key concepts
    if len(examples) < 3 and key_concepts:
        for kc in key_concepts:
            if len(examples) >= 5:
                break
            if len(kc['description']) > 50:
                examples.append({
                    'title': f"Understanding {kc['title']}",
                    'description': kc['description'],
                    'code': None
                })

    # Build comprehensive study material
    study_sections = [f"## Comprehensive Study Guide: {topic}\n"]

    # Add overview summary
    if overview and len(overview) > 100:
        study_sections.append("### Topic Overview")
        first_para = overview.split('\n\n')[0]
        study_sections.append(first_para[:500] + ('...' if len(first_para) > 500 else ''))
        study_sections.append("")

    if key_concepts:
        study_sections.append("### Key Points to Remember")
        for c in key_concepts[:8]:
            desc = c['description'][:200]
            study_sections.append(f"- **{c['title']}**: {desc}")
        study_sections.append("")

    # Add important facts extracted from content
    if full_text:
        facts = _extract_important_facts(full_text, topic)
        if facts:
            study_sections.append("### Important Facts")
            for fact in facts[:8]:
                study_sections.append(f"- {fact}")
            study_sections.append("")

    study_sections.append("### Recommended Study Approach")
    study_sections.append("1. Read the overview thoroughly to understand the big picture")
    study_sections.append("2. Study each key concept and make your own notes")
    study_sections.append("3. Work through the examples to see real-world applications")
    study_sections.append("4. Take the quiz to test your understanding")
    study_sections.append("5. Review weak areas and retake the quiz at a higher difficulty")

    if wiki and wiki.get('url'):
        study_sections.append(f"\n### Further Reading")
        study_sections.append(f"- [Wikipedia: {wiki.get('title', topic)}]({wiki['url']})")

    if related:
        study_sections.append("\n### Related Topics to Explore")
        for rt in related[:8]:
            name = rt['text'].split(' - ')[0] if ' - ' in rt['text'] else rt['text'][:60]
            study_sections.append(f"- {name}")

    study_material = '\n'.join(study_sections)

    # Build the web_resources
    web_resources = []
    if wiki and wiki.get('url'):
        web_resources.append({
            'title': f"Wikipedia: {wiki.get('title', topic)}",
            'url': wiki['url'],
            'source': 'Wikipedia'
        })
    if ddg and ddg.get('abstract_url'):
        web_resources.append({
            'title': ddg.get('heading') or topic,
            'url': ddg['abstract_url'],
            'source': ddg.get('abstract_source', 'Web')
        })
    if related:
        for rt in related[:6]:
            if rt.get('url'):
                name = rt['text'].split(' - ')[0] if ' - ' in rt['text'] else rt['text'][:80]
                web_resources.append({
                    'title': name,
                    'url': rt['url'],
                    'source': 'DuckDuckGo'
                })

    related_topics_list = []
    if wiki and wiki.get('links'):
        related_topics_list = wiki['links'][:12]
    elif related:
        related_topics_list = [rt['text'].split(' - ')[0].strip() for rt in related[:12] if rt.get('text')]

    content = {
        'overview': overview,
        'key_concepts': key_concepts,
        'examples': examples,
        'study_material': study_material,
        'wikipedia_url': wiki.get('url', '') if wiki else '',
        'wikipedia_title': wiki.get('title', topic) if wiki else topic,
        'web_resources': web_resources,
        'related_topics': related_topics_list,
        'infobox': ddg.get('infobox', {}) if ddg else {}
    }
    return json.dumps(content)


def _extract_section_concepts(content, topic):
    """Extract concepts from Wikipedia section headings and their first sentences."""
    concepts = []
    sections = re.split(r'==\s*([^=]+)\s*==', content)
    skip_sections = {'see also', 'references', 'external links', 'further reading', 'notes', 'bibliography', 'sources'}
    for i in range(1, len(sections) - 1, 2):
        title = sections[i].strip().strip('=').strip()
        body = sections[i + 1].strip() if i + 1 < len(sections) else ''
        if title.lower() in skip_sections or len(title) < 3:
            continue
        # Get first meaningful sentence from section body
        sentences = re.split(r'(?<=[.!?])\s+', body)
        desc = ''
        for s in sentences:
            s = s.strip()
            if len(s) > 30 and not s.startswith('=='):
                desc = s
                break
        if desc:
            concepts.append({'title': title.title(), 'description': desc[:300]})
        if len(concepts) >= 6:
            break
    return concepts


def _extract_important_facts(text, topic):
    """Extract important factual statements from text."""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    facts = []
    fact_indicators = [
        'first', 'invented', 'discovered', 'founded', 'created', 'developed',
        'most', 'largest', 'important', 'significant', 'widely', 'commonly',
        'known as', 'defined as', 'consists of', 'used for', 'designed to',
        'billion', 'million', 'percent', '%', 'year', 'century'
    ]
    for sent in sentences:
        sent = sent.strip()
        if len(sent) < 40 or len(sent) > 300 or sent.startswith('=='):
            continue
        sent_lower = sent.lower()
        if any(indicator in sent_lower for indicator in fact_indicators):
            facts.append(sent)
        if len(facts) >= 10:
            break
    return facts


# ─────────────────────────────────────────────────────────────
# QUIZ GENERATION (REAL TOPIC-SPECIFIC QUESTIONS)
# ─────────────────────────────────────────────────────────────

def _generate_real_questions(prompt):
    """Generate topic-specific quiz questions using real web data."""
    topic_match = re.search(r'topic "([^"]+)"', prompt) or re.search(r'"([^"]+)"', prompt)
    topic = topic_match.group(1) if topic_match else "General Knowledge"

    diff_match = re.search(r'difficulty level (\d)', prompt)
    difficulty = int(diff_match.group(1)) if diff_match else 1

    count_match = re.search(r'exactly (\d+)', prompt) or re.search(r'Generate (\d+)', prompt)
    count = int(count_match.group(1)) if count_match else 5

    # Fetch real data about the topic
    wiki = _fetch_wikipedia(topic)
    ddg = _fetch_duckduckgo(topic)

    full_text = ''
    if wiki and wiki.get('content'):
        full_text = wiki['content']
    elif wiki and wiki.get('summary'):
        full_text = wiki['summary']
    elif ddg and ddg.get('abstract'):
        full_text = ddg['abstract']

    questions = _build_questions_from_text(full_text, topic, difficulty, count)
    return json.dumps(questions)


def _build_questions_from_text(text, topic, difficulty, count):
    """Build real quiz questions from actual text content."""
    sentences = re.split(r'(?<=[.!?])\s+', text) if text else []
    # Filter good sentences
    good_sentences = [s.strip() for s in sentences if 30 < len(s.strip()) < 350 and not s.strip().startswith('==')]
    random.shuffle(good_sentences)

    questions = []
    used_sentences = set()

    # ── MCQ Questions ──
    mcq_count = max(2, count * 2 // 5)
    for sent in good_sentences:
        if len(questions) >= mcq_count:
            break
        if sent in used_sentences:
            continue
        # Extract a fact and create MCQ
        mcq = _create_mcq_from_sentence(sent, topic, difficulty, good_sentences)
        if mcq:
            questions.append(mcq)
            used_sentences.add(sent)

    # ── True/False ──
    tf_count = max(1, count // 5)
    for sent in good_sentences:
        if len([q for q in questions if q['question_type'] == 'true_false']) >= tf_count:
            break
        if sent in used_sentences:
            continue
        tf = _create_tf_from_sentence(sent, topic, difficulty)
        if tf:
            questions.append(tf)
            used_sentences.add(sent)

    # ── Fill in the blank ──
    fib_count = max(1, count // 5)
    for sent in good_sentences:
        if len([q for q in questions if q['question_type'] == 'fill_blank']) >= fib_count:
            break
        if sent in used_sentences:
            continue
        fib = _create_fill_blank_from_sentence(sent, topic, difficulty)
        if fib:
            questions.append(fib)
            used_sentences.add(sent)

    # ── Short Answer ──
    sa_count = max(1, count // 5)
    for sent in good_sentences:
        if len([q for q in questions if q['question_type'] == 'short_answer']) >= sa_count:
            break
        if sent in used_sentences:
            continue
        sa = _create_short_answer_from_sentence(sent, topic, difficulty)
        if sa:
            questions.append(sa)
            used_sentences.add(sent)

    # Pad if not enough
    while len(questions) < count:
        questions.append({
            'question_type': 'short_answer',
            'question_text': f'Explain a key concept related to {topic} and its significance.',
            'options': None,
            'correct_answer': f'A key concept in {topic} involves understanding its fundamental principles and their real-world applications.',
            'explanation': f'{topic} has many important concepts worth understanding.',
            'difficulty': difficulty
        })

    random.shuffle(questions)
    return questions[:count]


def _create_mcq_from_sentence(sentence, topic, difficulty, all_sentences):
    """Create an MCQ from a real sentence."""
    # Find a key term/phrase in the sentence
    words = sentence.split()
    if len(words) < 6:
        return None

    # Find proper nouns or significant terms
    key_terms = []
    for word in words:
        clean = word.strip('.,;:()[]"\'')
        if len(clean) > 3 and clean[0].isupper() and clean.lower() != topic.lower() and clean.lower() not in ('the', 'this', 'that', 'these', 'those', 'with', 'from', 'have', 'been', 'were', 'also', 'which', 'their', 'there', 'when', 'what', 'they', 'some', 'such', 'other', 'most', 'many', 'more'):
            key_terms.append(clean)

    if not key_terms:
        # Use significant words
        significant = [w.strip('.,;:()[]"\'') for w in words if len(w.strip('.,;:()[]"\'')) > 5]
        if significant:
            key_terms = significant[:3]

    if not key_terms:
        return None

    correct = key_terms[0]

    # Generate distractors from other sentences
    distractors = set()
    for other_sent in all_sentences:
        if other_sent == sentence:
            continue
        other_words = other_sent.split()
        for w in other_words:
            clean = w.strip('.,;:()[]"\'')
            if len(clean) > 3 and clean != correct and clean[0].isupper() and clean.lower() not in ('the', 'this', 'that', 'also', 'they', 'these'):
                distractors.add(clean)
            if len(distractors) >= 10:
                break

    distractor_list = list(distractors)[:3]
    while len(distractor_list) < 3:
        distractor_list.append(f"None of the above" if len(distractor_list) == 2 else f"Option {len(distractor_list) + 1}")

    # Formulate question
    question_text = sentence.replace(correct, '_____', 1)
    if question_text == sentence:
        question_text = f"According to the study of {topic}, which of the following is correct?\n\n\"{sentence}\""
        options = [correct, distractor_list[0], distractor_list[1], distractor_list[2]]
        random.shuffle(options)
        return {
            'question_type': 'mcq',
            'question_text': question_text,
            'options': options,
            'correct_answer': correct,
            'explanation': sentence,
            'difficulty': difficulty
        }
    else:
        question_text = f"Fill in the blank: {question_text}"
        options = [correct, distractor_list[0], distractor_list[1], distractor_list[2]]
        random.shuffle(options)
        return {
            'question_type': 'mcq',
            'question_text': question_text,
            'options': options,
            'correct_answer': correct,
            'explanation': sentence,
            'difficulty': difficulty
        }


def _create_tf_from_sentence(sentence, topic, difficulty):
    """Create a True/False question from a real sentence."""
    if len(sentence) < 30:
        return None

    # 50% chance of making it true, 50% false
    if random.random() > 0.5:
        # True statement
        return {
            'question_type': 'true_false',
            'question_text': f"True or False: {sentence}",
            'options': None,
            'correct_answer': 'True',
            'explanation': f"This statement is true. {sentence}",
            'difficulty': difficulty
        }
    else:
        # False: negate or alter the sentence
        negated = sentence
        replacements = [
            ('is ', 'is not '), ('are ', 'are not '), ('was ', 'was not '),
            ('can ', 'cannot '), ('has ', 'does not have '), ('have ', 'do not have '),
            ('will ', 'will not '), ('does ', 'does not ')
        ]
        for orig, repl in replacements:
            if orig in negated.lower():
                idx = negated.lower().index(orig)
                negated = negated[:idx] + repl + negated[idx + len(orig):]
                break
        else:
            negated = f"It is false that {sentence[0].lower()}{sentence[1:]}"

        return {
            'question_type': 'true_false',
            'question_text': f"True or False: {negated}",
            'options': None,
            'correct_answer': 'False',
            'explanation': f"This is false. The correct fact is: {sentence}",
            'difficulty': difficulty
        }


def _create_fill_blank_from_sentence(sentence, topic, difficulty):
    """Create a fill-in-the-blank from a real sentence."""
    words = sentence.split()
    if len(words) < 6:
        return None

    # Find a significant word to blank out
    candidates = []
    for i, word in enumerate(words):
        clean = word.strip('.,;:()[]"\'')
        if len(clean) > 4 and clean.lower() not in ('which', 'there', 'their', 'these', 'those', 'about', 'where', 'would', 'could', 'should', 'being', 'other'):
            candidates.append((i, clean))

    if not candidates:
        return None

    idx, answer = random.choice(candidates)
    blanked = words.copy()
    blanked[idx] = '_____'
    question_text = ' '.join(blanked)

    return {
        'question_type': 'fill_blank',
        'question_text': question_text,
        'options': None,
        'correct_answer': answer,
        'explanation': sentence,
        'difficulty': difficulty
    }


def _create_short_answer_from_sentence(sentence, topic, difficulty):
    """Create a short answer question from a real sentence."""
    if len(sentence) < 40:
        return None

    # Various question templates
    templates = [
        f"Based on your knowledge of {topic}, explain the following concept: {sentence[:80]}...",
        f"What does the following statement about {topic} mean? \"{sentence[:100]}...\"",
        f"In the context of {topic}, describe what is meant by: {sentence[:80]}...",
    ]

    return {
        'question_type': 'short_answer',
        'question_text': random.choice(templates),
        'options': None,
        'correct_answer': sentence,
        'explanation': f"The correct explanation relates to: {sentence}",
        'difficulty': difficulty
    }


# ─────────────────────────────────────────────────────────────
# EVALUATION
# ─────────────────────────────────────────────────────────────

def _smart_bulk_evaluate(prompt):
    """Intelligent bulk evaluation using keyword matching and semantic overlap."""
    blocks = re.split(r'Question ID:\s*', prompt)
    results = []

    for block in blocks[1:]:  # Skip first empty block
        lines = block.strip().split('\n')
        qid_match = re.match(r'(\d+)', lines[0])
        if not qid_match:
            continue
        qid = int(qid_match.group(1))

        q_type = ''
        correct = ''
        student = ''
        question_text = ''

        for line in lines:
            line_lower = line.lower().strip()
            if line_lower.startswith('type:'):
                q_type = line.split(':', 1)[1].strip().lower()
            elif line_lower.startswith('correct answer:'):
                correct = line.split(':', 1)[1].strip()
            elif line_lower.startswith('student answer:'):
                student = line.split(':', 1)[1].strip()
            elif line_lower.startswith('question:'):
                question_text = line.split(':', 1)[1].strip()

        score, is_correct, feedback = _evaluate_single(q_type, correct, student, question_text)

        results.append({
            'question_id': qid,
            'score': score,
            'is_correct': is_correct,
            'feedback': feedback,
            'correct_answer': correct
        })

    if not results:
        results = [{'question_id': 0, 'score': 0, 'is_correct': False, 'feedback': 'Could not evaluate.', 'correct_answer': 'N/A'}]

    return json.dumps(results)


def _evaluate_single(q_type, correct, student, question_text=''):
    """Evaluate a single answer with intelligent matching."""
    if not student or student.strip() == '' or student.strip() == '(no answer)':
        return 0.0, False, "No answer was provided."

    correct_lower = correct.lower().strip()
    student_lower = student.lower().strip()

    # Exact match types
    if q_type in ('mcq', 'true_false'):
        if student_lower == correct_lower:
            return 1.0, True, "Correct! Well done."
        else:
            return 0.0, False, f"Incorrect. The correct answer is: {correct}"

    # For text-based answers, use smart matching
    # 1. Exact match
    if student_lower == correct_lower:
        return 1.0, True, "Perfect answer!"

    # 2. Substring containment
    if correct_lower in student_lower or student_lower in correct_lower:
        return 0.9, True, "Excellent! Your answer captures the key point."

    # 3. Keyword overlap scoring
    correct_words = set(re.findall(r'\b\w{3,}\b', correct_lower))
    student_words = set(re.findall(r'\b\w{3,}\b', student_lower))

    # Remove common stop words
    stop_words = {'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her',
                  'was', 'one', 'our', 'out', 'has', 'have', 'been', 'will', 'that', 'this',
                  'with', 'from', 'they', 'been', 'some', 'them', 'than', 'its', 'also', 'into',
                  'which', 'more', 'other', 'would', 'there', 'their', 'about', 'could', 'does'}
    correct_words -= stop_words
    student_words -= stop_words

    if not correct_words:
        return 0.5, False, "Could not properly evaluate. Review the correct answer."

    overlap = len(correct_words & student_words)
    precision = overlap / len(student_words) if student_words else 0
    recall = overlap / len(correct_words)

    # F1-like score
    if precision + recall > 0:
        f1 = 2 * (precision * recall) / (precision + recall)
    else:
        f1 = 0

    score = round(min(f1 * 1.15, 1.0), 2)  # Small boost
    is_correct = score >= 0.7

    if is_correct:
        feedback = "Good answer! You demonstrated understanding of the key concepts."
    elif score >= 0.4:
        missed = correct_words - student_words
        hint = ', '.join(list(missed)[:3])
        feedback = f"Partially correct. You got some key points. Consider these keywords: {hint}. Full answer: {correct[:150]}"
    else:
        feedback = f"Incorrect. The correct answer is: {correct[:200]}"

    return score, is_correct, feedback


def _mock_evaluate(prompt):
    """Single answer evaluation fallback."""
    correct_match = re.search(r"correct answer:\s*(.+?)(?:\n|$)", prompt, re.IGNORECASE)
    student_match = re.search(r"student's answer:\s*(.+?)(?:\n|$)", prompt, re.IGNORECASE)
    type_match = re.search(r"question type:\s*(.+?)(?:\n|$)", prompt, re.IGNORECASE)

    correct = correct_match.group(1).strip() if correct_match else ""
    student = student_match.group(1).strip() if student_match else ""
    q_type = type_match.group(1).strip().lower() if type_match else ""

    score, is_correct, feedback = _evaluate_single(q_type, correct, student)
    return json.dumps({"score": score, "is_correct": is_correct, "feedback": feedback})


def _mock_feedback():
    """Mock feedback for wrong answers."""
    feedbacks = [
        "Don't worry! This is a common mistake. Review the key concepts and try to understand the underlying principles. Remember, practice makes perfect!",
        "Good attempt! The key thing to remember here is to focus on the core definition. Try breaking the problem into smaller parts next time.",
        "Almost there! You had the right idea but missed some details. Review the topic notes and pay attention to the specific terminology used.",
        "This is a tricky one! The important thing is to understand WHY the correct answer is right. Try relating it to real-world examples to help remember.",
    ]
    return random.choice(feedbacks)


def _get_brief_summary(topic):
    """Get a real brief summary for search results."""
    wiki = _fetch_wikipedia(topic)
    if wiki and wiki.get('summary'):
        # Return first 3-4 sentences
        sentences = re.split(r'(?<=[.!?])\s+', wiki['summary'])
        return ' '.join(sentences[:4])

    ddg = _fetch_duckduckgo(topic)
    if ddg and ddg.get('abstract'):
        return ddg['abstract']

    return f"{topic} is an important area of study with numerous real-world applications and theoretical foundations."


def parse_json_response(text):
    """Extract JSON from AI response, handling markdown code blocks."""
    text = text.strip()
    match = re.search(r'```(?:json)?\s*([\s\S]*?)```', text)
    if match:
        text = match.group(1).strip()
    return json.loads(text)
