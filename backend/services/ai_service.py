import json
import re
import random
import time
import requests
from flask import current_app


# ─────────────────────────────────────────────────────────────
# AI PROVIDER CALL WITH RETRY + FALLBACK CHAIN
# ─────────────────────────────────────────────────────────────

_PROVIDER_CALL_MAP = {
    'gemini': '_call_gemini',
    'claude': '_call_claude',
    'openai': '_call_openai',
    'groq': '_call_groq',
}

_TRANSIENT_ERRORS = (
    TimeoutError, ConnectionError, requests.exceptions.Timeout,
    requests.exceptions.ConnectionError,
)


def _is_transient(e):
    """Check if an exception is likely transient (worth retrying)."""
    if isinstance(e, _TRANSIENT_ERRORS):
        return True
    msg = str(e).lower()
    if any(k in msg for k in ['timeout', 'rate limit', '429', '503', '502', '500', 'overloaded']):
        return True
    return False


def _call_provider(provider, prompt, temperature=0.3, max_retries=2):
    """Call a single AI provider with retry logic for transient errors."""
    func_name = _PROVIDER_CALL_MAP.get(provider)
    if not func_name:
        raise ValueError(f"Unknown provider: {provider}")
    func = globals()[func_name]

    last_error = None
    for attempt in range(max_retries + 1):
        try:
            return func(prompt, temperature=temperature)
        except Exception as e:
            last_error = e
            if attempt < max_retries and _is_transient(e):
                wait = (attempt + 1) * 1.0  # 1s, 2s
                current_app.logger.warning(
                    f"AI provider '{provider}' attempt {attempt + 1} failed (transient): {e}. Retrying in {wait}s..."
                )
                time.sleep(wait)
            else:
                break
    raise last_error


def _get_fallback_providers(primary):
    """Get ordered list of fallback providers based on available API keys."""
    fallback_order = ['gemini', 'groq', 'openai', 'claude']
    key_map = {
        'gemini': 'GEMINI_API_KEY',
        'claude': 'ANTHROPIC_API_KEY',
        'openai': 'OPENAI_API_KEY',
        'groq': 'GROQ_API_KEY',
    }
    providers = []
    for p in fallback_order:
        if p != primary and current_app.config.get(key_map.get(p, ''), ''):
            providers.append(p)
    return providers


def _ai_dispatch(prompt, temperature=0.3):
    """Try primary provider, then fallbacks, then mock."""
    provider = current_app.config.get('AI_PROVIDER', 'mock')

    if provider != 'mock':
        # Try primary provider
        try:
            return _call_provider(provider, prompt, temperature)
        except Exception as e:
            current_app.logger.error(f"Primary AI provider '{provider}' failed: {e}")

        # Try fallback providers
        for fallback in _get_fallback_providers(provider):
            try:
                current_app.logger.info(f"Trying fallback provider: {fallback}")
                return _call_provider(fallback, prompt, temperature, max_retries=1)
            except Exception as e:
                current_app.logger.warning(f"Fallback provider '{fallback}' also failed: {e}")

        current_app.logger.warning("All AI providers failed. Using mock response.")

    return _mock_response(prompt)


# ─────────────────────────────────────────────────────────────
# MAIN AI DISPATCH
# ─────────────────────────────────────────────────────────────

def get_ai_response(prompt, temperature=0.3):
    """Route to the configured AI provider with retry and fallback chain."""
    return _ai_dispatch(prompt, temperature)


def get_ai_content_response(prompt, context_data=None, temperature=0.3):
    """Enhanced AI call that includes web-fetched context for richer answers.
    This is the main function for generating accurate, AI-quality content."""

    # Build enriched prompt with real web data context
    enriched_prompt = prompt
    if context_data:
        enriched_prompt = f"""Use the following REAL information gathered from the internet to create your response.
Base your answer STRICTLY on these FACTS — do not make up information. If the provided data is insufficient, say so rather than inventing details.
Synthesize this data into a clear, well-structured, educational response.

--- VERIFIED DATA FROM THE INTERNET ---
{context_data}
--- END OF VERIFIED DATA ---

IMPORTANT: Your response must be factually consistent with the above data. Do not add information not supported by the sources above.

Now, using the above real information as your knowledge base:

{prompt}"""

    return _ai_dispatch(enriched_prompt, temperature)


# ─────────────────────────────────────────────────────────────
# AI PROVIDER IMPLEMENTATIONS
# ─────────────────────────────────────────────────────────────

def _call_gemini(prompt, temperature=0.3):
    """Call Google Gemini API with timeout."""
    import google.generativeai as genai
    api_key = current_app.config.get('GEMINI_API_KEY', '')
    if not api_key:
        raise ValueError("GEMINI_API_KEY not configured")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=temperature,
            max_output_tokens=8000,
        ),
        request_options={"timeout": 30}
    )
    return response.text.strip()


def _call_claude(prompt, temperature=0.3):
    """Call Anthropic Claude API with timeout."""
    import anthropic
    api_key = current_app.config.get('ANTHROPIC_API_KEY', '')
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY not configured")
    client = anthropic.Anthropic(api_key=api_key, timeout=30.0)
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4000,
        temperature=temperature,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content[0].text.strip()


def _call_openai(prompt, temperature=0.3):
    """Call OpenAI API with timeout."""
    import openai
    api_key = current_app.config.get('OPENAI_API_KEY', '')
    if not api_key:
        raise ValueError("OPENAI_API_KEY not configured")
    client = openai.OpenAI(api_key=api_key, timeout=30.0)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_tokens=4000
    )
    return response.choices[0].message.content.strip()


def _call_groq(prompt, temperature=0.3):
    """Call Groq API (free, fast inference)."""
    api_key = current_app.config.get('GROQ_API_KEY', '')
    if not api_key:
        raise ValueError("GROQ_API_KEY not configured")
    resp = requests.post(
        'https://api.groq.com/openai/v1/chat/completions',
        headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
        json={
            'model': 'llama-3.3-70b-versatile',
            'messages': [{'role': 'user', 'content': prompt}],
            'temperature': temperature,
            'max_tokens': 4000
        },
        timeout=30
    )
    resp.raise_for_status()
    return resp.json()['choices'][0]['message']['content'].strip()


# ─────────────────────────────────────────────────────────────
# REAL WEB DATA FETCHING
# ─────────────────────────────────────────────────────────────

def _fetch_wikipedia(topic):
    """Fetch real Wikipedia content for a topic."""
    try:
        import wikipedia
        wikipedia.set_lang("en")
        search_results = wikipedia.search(topic, results=5)
        if not search_results:
            return None

        for candidate in search_results:
            try:
                page = wikipedia.page(candidate, auto_suggest=False)
                summary = wikipedia.summary(candidate, sentences=25, auto_suggest=False)
                return {
                    'summary': summary,
                    'url': page.url,
                    'title': page.title,
                    'content': page.content[:15000],
                    'links': page.links[:25],
                    'categories': list(page.categories)[:10] if hasattr(page, 'categories') else []
                }
            except wikipedia.exceptions.DisambiguationError as e:
                if e.options:
                    try:
                        page = wikipedia.page(e.options[0], auto_suggest=False)
                        summary = wikipedia.summary(e.options[0], sentences=25, auto_suggest=False)
                        return {
                            'summary': summary,
                            'url': page.url,
                            'title': page.title,
                            'content': page.content[:15000],
                            'links': page.links[:25],
                            'categories': []
                        }
                    except Exception:
                        continue
            except wikipedia.exceptions.PageError:
                continue
            except Exception:
                continue
    except Exception as e:
        current_app.logger.error(f"Wikipedia fetch error: {e}")
    return None


def _fetch_duckduckgo(topic):
    """Fetch real DuckDuckGo instant answer data for a topic."""
    try:
        ddg_url = f'https://api.duckduckgo.com/?q={requests.utils.quote(topic)}&format=json&no_html=1&skip_disambig=1'
        resp = requests.get(ddg_url, timeout=12)
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
        current_app.logger.error(f"DuckDuckGo fetch error: {e}")
    return None


def _fetch_mediawiki_api(topic):
    """Direct MediaWiki REST API fallback when python-wikipedia library fails."""
    try:
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{requests.utils.quote(topic)}"
        resp = requests.get(url, timeout=10, headers={'User-Agent': 'EvalAI/1.0 (Educational Platform)'})
        if resp.status_code == 200:
            data = resp.json()
            extract = data.get('extract', '')
            if extract and len(extract) > 50:
                return {
                    'summary': extract,
                    'url': data.get('content_urls', {}).get('desktop', {}).get('page', ''),
                    'title': data.get('title', topic),
                    'content': extract,
                    'links': [],
                    'categories': []
                }
    except Exception as e:
        current_app.logger.error(f"MediaWiki API error: {e}")
    return None


def _fetch_with_retry(topic, max_retries=2):
    """Fetch from multiple sources with retry logic and alternative queries."""
    wiki = _fetch_wikipedia(topic)
    ddg = _fetch_duckduckgo(topic)

    # If we got good data from at least one source, return
    if wiki and wiki.get('summary') and len(wiki['summary']) > 100:
        return wiki, ddg
    if wiki:
        return wiki, ddg

    # Try MediaWiki REST API as fallback
    if not wiki:
        wiki = _fetch_mediawiki_api(topic)
        if wiki:
            return wiki, ddg

    # Try alternative queries
    alt_queries = []
    topic_lower = topic.lower()
    # Remove common prefixes
    for prefix in ['the ', 'a ', 'an ', 'introduction to ', 'theory of ', 'what is ']:
        if topic_lower.startswith(prefix):
            alt_queries.append(topic[len(prefix):].strip())
    # Add clarifying suffixes
    alt_queries.extend([
        f"{topic} (concept)",
        f"{topic} definition",
    ])

    for alt in alt_queries:
        if not alt or len(alt) < 2:
            continue
        wiki = _fetch_wikipedia(alt)
        if wiki and wiki.get('summary'):
            return wiki, ddg
        wiki = _fetch_mediawiki_api(alt)
        if wiki:
            return wiki, ddg

    # Try DuckDuckGo with alternatives if no abstract
    if not ddg or not ddg.get('abstract'):
        for alt in alt_queries[:2]:
            ddg = _fetch_duckduckgo(alt)
            if ddg and ddg.get('abstract'):
                break

    return wiki, ddg


def _score_content_quality(content, wiki_data=None, ddg_data=None):
    """Score 0-100 how well the generated content is."""
    score = 0
    overview = content.get('overview', '')

    # Check overview quality
    if len(overview) > 200:
        score += 15
    if len(overview) > 500:
        score += 10
    if len(overview) > 1000:
        score += 5

    # Check key concepts populated
    concepts = content.get('key_concepts', [])
    if len(concepts) >= 3:
        score += 10
    if len(concepts) >= 6:
        score += 10

    # Check if overview references actual source data
    if wiki_data and wiki_data.get('title'):
        if wiki_data['title'].lower() in overview.lower():
            score += 10

    # Check examples exist
    examples = content.get('examples', [])
    if len(examples) >= 2:
        score += 10
    if len(examples) >= 4:
        score += 5

    # Check study material exists
    study = content.get('study_material', '')
    if len(study) > 100:
        score += 10
    if len(study) > 500:
        score += 5

    # Check sources populated
    if content.get('sources'):
        score += 5
    if content.get('web_resources'):
        score += 5

    return min(score, 100)


def _build_context_from_web(topic, wiki, ddg):
    """Build a rich context string from web data for AI to use."""
    parts = []

    if wiki:
        parts.append(f"WIKIPEDIA ARTICLE: {wiki.get('title', topic)}")
        parts.append(f"URL: {wiki.get('url', '')}")
        if wiki.get('summary'):
            parts.append(f"\nSUMMARY:\n{wiki['summary']}")
        if wiki.get('content'):
            # Include section headings and key content
            content = wiki['content'][:10000]
            parts.append(f"\nFULL CONTENT:\n{content}")
        if wiki.get('categories'):
            parts.append(f"\nCATEGORIES: {', '.join(wiki['categories'][:10])}")

    if ddg:
        if ddg.get('abstract'):
            parts.append(f"\nDUCKDUCKGO ABSTRACT ({ddg.get('abstract_source', 'Web')}):\n{ddg['abstract']}")
        if ddg.get('definition'):
            parts.append(f"\nDEFINITION: {ddg['definition']}")
        if ddg.get('related_topics'):
            topics_text = '\n'.join([f"- {rt['text']}" for rt in ddg['related_topics'][:10]])
            parts.append(f"\nRELATED TOPICS:\n{topics_text}")
        if ddg.get('infobox'):
            infobox_text = '\n'.join([f"- {k}: {v}" for k, v in ddg['infobox'].items()])
            parts.append(f"\nQUICK FACTS:\n{infobox_text}")

    return '\n'.join(parts)


# ─────────────────────────────────────────────────────────────
# AI-POWERED TOPIC CONTENT GENERATION
# ─────────────────────────────────────────────────────────────

def _generate_ai_topic_content(topic):
    """Generate high-quality educational content using AI + real web data.
    This produces ChatGPT/Claude-level accurate content."""

    # Step 1: Fetch real data from internet (with retry logic)
    wiki, ddg = _fetch_with_retry(topic)

    # Step 2: Build context from real data
    context = _build_context_from_web(topic, wiki, ddg)

    # Step 3: AI prompt to synthesize into structured educational content
    prompt = f'''You are an expert educator creating comprehensive study material about "{topic}".

Using the real information provided, create accurate, well-structured educational content.

Return ONLY a valid JSON object with exactly these fields:

{{
  "overview": "A detailed, clear 3-5 paragraph explanation of {topic}. Cover what it is, its history/background, how it works, its importance, and current applications. Write like a great textbook — informative, engaging, and accurate. Use simple language suitable for university students.",

  "key_concepts": [
    {{
      "title": "Concept Name",
      "description": "A clear 2-3 sentence explanation of this concept and why it matters."
    }}
  ],

  "examples": [
    {{
      "title": "Example Title",
      "description": "A real-world example or application that demonstrates this topic in practice.",
      "code": null
    }}
  ],

  "study_material": "A comprehensive markdown-formatted study guide with ## headings, bullet points, key definitions, and important facts to remember."
}}

Requirements:
- "key_concepts": Exactly 8-10 key concepts that are genuinely important
- "examples": Exactly 4-5 real-world examples or applications
- "overview": Must be at least 300 words, factually accurate
- "study_material": Must include key definitions, important dates/facts, and study tips
- All information must come from the provided real data — do NOT invent facts
- If the topic is programming-related, include code snippets in the examples
- Write clearly and engagingly, like the best educational content online

Return ONLY the JSON object, no markdown code blocks, no extra text.'''

    # Step 4: Call AI with enriched context
    raw = get_ai_content_response(prompt, context)
    content = parse_json_response(raw)

    # Step 5: Enrich with metadata from web sources
    content['wikipedia_url'] = wiki.get('url', '') if wiki else ''
    content['wikipedia_title'] = wiki.get('title', topic) if wiki else topic

    # Web resources
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
    related = ddg.get('related_topics', []) if ddg else []
    for rt in related[:6]:
        if rt.get('url'):
            name = rt['text'].split(' - ')[0] if ' - ' in rt['text'] else rt['text'][:80]
            web_resources.append({'title': name, 'url': rt['url'], 'source': 'DuckDuckGo'})
    content['web_resources'] = web_resources

    # Related topics
    related_topics = []
    if wiki and wiki.get('links'):
        related_topics = wiki['links'][:12]
    elif related:
        related_topics = [rt['text'].split(' - ')[0].strip() for rt in related[:12] if rt.get('text')]
    content['related_topics'] = related_topics

    # Infobox
    content['infobox'] = ddg.get('infobox', {}) if ddg else {}

    # Sources
    sources = []
    if wiki:
        sources.append({'name': 'Wikipedia', 'url': wiki.get('url', ''), 'type': 'encyclopedia'})
    if ddg and ddg.get('abstract_url'):
        sources.append({'name': ddg.get('abstract_source', 'DuckDuckGo'), 'url': ddg['abstract_url'], 'type': 'search'})
    content['sources'] = sources

    return json.dumps(content)


def _generate_ai_questions(topic, difficulty, count):
    """Generate high-quality quiz questions using AI + real web data."""

    # Fetch real data (with retry logic)
    wiki, ddg = _fetch_with_retry(topic)
    context = _build_context_from_web(topic, wiki, ddg)

    prompt = f'''You are an expert quiz master creating questions about "{topic}" at difficulty level {difficulty}/5.

Generate exactly {count} quiz questions using the real information provided. Questions must be factually accurate.

Difficulty guide:
1 = Basic recall/definitions (What is...? Define...)
2 = Understanding concepts (Explain why... How does...)
3 = Application (Apply this concept to... Given that...)
4 = Analysis (Compare... What would happen if... Why is X different from Y?)
5 = Evaluation/Synthesis (Evaluate... Design... What are the implications of...)

Create a MIX of question types:
- 40% MCQ (multiple choice with 4 plausible options — wrong options should sound realistic, not obviously wrong)
- 20% true_false (mix of true and false statements — make false ones subtle, not obviously wrong)
- 20% fill_blank (remove a KEY term from a factual sentence)
- 20% short_answer (require 1-2 sentence explanations)

Return ONLY a JSON array of question objects:
[
  {{
    "question_type": "mcq",
    "question_text": "Clear, specific question about {topic}",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "The exact text of the correct option",
    "explanation": "Why this answer is correct, with educational context",
    "difficulty": {difficulty}
  }},
  {{
    "question_type": "true_false",
    "question_text": "True or False: [factual statement about {topic}]",
    "options": null,
    "correct_answer": "True",
    "explanation": "Explanation of why this is true/false",
    "difficulty": {difficulty}
  }},
  {{
    "question_type": "fill_blank",
    "question_text": "Sentence with _____ replacing a key term",
    "options": null,
    "correct_answer": "The missing term",
    "explanation": "The complete correct sentence and why this term matters",
    "difficulty": {difficulty}
  }},
  {{
    "question_type": "short_answer",
    "question_text": "Question requiring a brief explanation",
    "options": null,
    "correct_answer": "Model answer in 1-2 sentences",
    "explanation": "Extended explanation for learning",
    "difficulty": {difficulty}
  }}
]

CRITICAL RULES:
- Every question must be based on REAL facts from the provided data
- MCQ wrong options must be plausible (related to the topic, not random)
- Questions should test UNDERSTANDING, not just memorization
- Each question should cover a DIFFERENT aspect of the topic
- Return ONLY the JSON array, no extra text'''

    raw = get_ai_content_response(prompt, context)
    return parse_json_response(raw)


def _evaluate_ai_answers(topic, qa_pairs_text):
    """Use AI to evaluate quiz answers with nuanced understanding."""

    prompt = f'''You are an expert evaluator assessing student answers about "{topic}".

Evaluate each student answer below. Be fair but thorough:
- For MCQ and true_false: exact match required, but accept minor typos
- For fill_blank: accept the exact term or very close synonyms
- For short_answer: evaluate semantically — student doesn't need exact wording but must show understanding

{qa_pairs_text}

For EACH answer, return a JSON object:
{{
  "question_id": <the question ID>,
  "score": <float 0.0 to 1.0>,
  "is_correct": <true if score >= 0.7>,
  "feedback": "<specific, helpful feedback — what was right, what was wrong, and the key point to remember>",
  "correct_answer": "<the actual correct answer>"
}}

Return ONLY a JSON array of evaluation objects.'''

    raw = get_ai_content_response(prompt)
    return parse_json_response(raw)


# ─────────────────────────────────────────────────────────────
# MOCK RESPONSE ROUTER (fallback when no AI key)
# ─────────────────────────────────────────────────────────────

def _mock_response(prompt):
    """Fallback when no AI provider is available. Uses raw web data extraction."""
    prompt_lower = prompt.lower()

    if 'comprehensive educational content' in prompt_lower or 'expert educator creating' in prompt_lower:
        return _generate_real_topic_content(prompt)

    if 'generate' in prompt_lower and 'questions' in prompt_lower:
        return _generate_real_questions(prompt)

    if 'evaluate each student answer' in prompt_lower or 'expert evaluator' in prompt_lower:
        return _smart_bulk_evaluate(prompt)

    if 'evaluate' in prompt_lower and "student's answer" in prompt_lower:
        return _mock_evaluate(prompt)

    if 'student answered' in prompt_lower and 'incorrectly' in prompt_lower:
        return _mock_feedback()

    if 'brief educational summary' in prompt_lower:
        topic_match = re.search(r'"([^"]+)"', prompt)
        topic = topic_match.group(1) if topic_match else "this topic"
        return _get_brief_summary(topic)

    return '{"result": "mock response"}'


# ─────────────────────────────────────────────────────────────
# FALLBACK: RAW WEB DATA EXTRACTION (no AI key)
# ─────────────────────────────────────────────────────────────

def _generate_real_topic_content(prompt):
    """Fallback: Generate content from raw web data without AI."""
    topic_match = re.search(r'"([^"]+)"', prompt)
    topic = topic_match.group(1) if topic_match else "General Topic"

    wiki = _fetch_wikipedia(topic)
    ddg = _fetch_duckduckgo(topic)

    # Build overview
    overview_parts = []
    if ddg and ddg.get('definition'):
        overview_parts.append(f"**Definition:** {ddg['definition']}")
    if wiki and wiki.get('summary'):
        overview_parts.append(wiki['summary'])
    if ddg and ddg.get('abstract') and (not wiki or ddg['abstract'] not in wiki.get('summary', '')):
        overview_parts.append(ddg['abstract'])
    if not overview_parts and wiki and wiki.get('content'):
        paragraphs = wiki['content'].split('\n\n')
        for p in paragraphs[:3]:
            clean = p.strip()
            if len(clean) > 50 and not clean.startswith('=='):
                overview_parts.append(clean)
    overview = '\n\n'.join(overview_parts) if overview_parts else f'{topic} is an important field of study.'

    # Extract concepts
    full_text = wiki.get('content', wiki.get('summary', '')) if wiki else ''
    key_concepts = _extract_key_concepts_from_text(full_text, topic)
    if len(key_concepts) < 6 and wiki and wiki.get('content'):
        section_concepts = _extract_section_concepts(wiki['content'], topic)
        existing = {c['title'].lower() for c in key_concepts}
        for sc in section_concepts:
            if sc['title'].lower() not in existing and len(key_concepts) < 10:
                key_concepts.append(sc)

    # Examples
    related = ddg.get('related_topics', []) if ddg else []
    examples = _create_examples_from_content(full_text, topic, related)

    # Study material
    study_sections = [f"## Study Guide: {topic}\n"]
    if key_concepts:
        study_sections.append("### Key Points")
        for c in key_concepts[:8]:
            study_sections.append(f"- **{c['title']}**: {c['description'][:200]}")
    study_material = '\n'.join(study_sections)

    # Build result
    web_resources = []
    if wiki and wiki.get('url'):
        web_resources.append({'title': f"Wikipedia: {wiki.get('title', topic)}", 'url': wiki['url'], 'source': 'Wikipedia'})
    if ddg and ddg.get('abstract_url'):
        web_resources.append({'title': ddg.get('heading') or topic, 'url': ddg['abstract_url'], 'source': ddg.get('abstract_source', 'Web')})
    for rt in related[:6]:
        if rt.get('url'):
            name = rt['text'].split(' - ')[0] if ' - ' in rt['text'] else rt['text'][:80]
            web_resources.append({'title': name, 'url': rt['url'], 'source': 'DuckDuckGo'})

    sources = []
    if wiki:
        sources.append({'name': 'Wikipedia', 'url': wiki.get('url', ''), 'type': 'encyclopedia'})
    if ddg and ddg.get('abstract_url'):
        sources.append({'name': ddg.get('abstract_source', 'DuckDuckGo'), 'url': ddg['abstract_url'], 'type': 'search'})

    content = {
        'overview': overview,
        'key_concepts': key_concepts,
        'examples': examples,
        'study_material': study_material,
        'wikipedia_url': wiki.get('url', '') if wiki else '',
        'wikipedia_title': wiki.get('title', topic) if wiki else topic,
        'web_resources': web_resources,
        'related_topics': (wiki.get('links', [])[:12] if wiki else []) or [rt['text'].split(' - ')[0].strip() for rt in related[:12] if rt.get('text')],
        'infobox': ddg.get('infobox', {}) if ddg else {},
        'sources': sources
    }
    return json.dumps(content)


def _extract_key_concepts_from_text(text, topic):
    if not text:
        return []
    sentences = re.split(r'(?<=[.!?])\s+', text)
    concepts = []
    seen = set()
    patterns = [
        r'([\w\s]+)\s+is\s+(a|an|the)\s+',
        r'([\w\s]+)\s+refers?\s+to\s+',
        r'([\w\s]+)\s+involves?\s+',
        r'([\w\s]+)\s+consists?\s+of\s+',
    ]
    for sent in sentences:
        if len(sent) < 30 or len(sent) > 400:
            continue
        for pattern in patterns:
            match = re.search(pattern, sent, re.IGNORECASE)
            if match:
                title = match.group(1).strip()
                title = re.sub(r'^(the|a|an|in|of|and|or|this|that|these|those|it|its)\s+', '', title, flags=re.IGNORECASE).strip()
                if 3 < len(title) < 60 and title.lower() not in seen:
                    seen.add(title.lower())
                    concepts.append({'title': title.title(), 'description': sent.strip()})
                break
        if len(concepts) >= 8:
            break
    return concepts


def _extract_section_concepts(content, topic):
    concepts = []
    sections = re.split(r'==\s*([^=]+)\s*==', content)
    skip = {'see also', 'references', 'external links', 'further reading', 'notes', 'bibliography', 'sources'}
    for i in range(1, len(sections) - 1, 2):
        title = sections[i].strip().strip('=').strip()
        body = sections[i + 1].strip() if i + 1 < len(sections) else ''
        if title.lower() in skip or len(title) < 3:
            continue
        sentences = re.split(r'(?<=[.!?])\s+', body)
        desc = next((s.strip() for s in sentences if len(s.strip()) > 30 and not s.strip().startswith('==')), '')
        if desc:
            concepts.append({'title': title.title(), 'description': desc[:300]})
        if len(concepts) >= 6:
            break
    return concepts


def _create_examples_from_content(text, topic, related_topics):
    examples = []
    sentences = re.split(r'(?<=[.!?])\s+', text) if text else []
    keywords = ['for example', 'such as', 'instance', 'application', 'used in', 'applied']
    for sent in sentences:
        for kw in keywords:
            if kw in sent.lower() and 30 < len(sent) < 500:
                title = f"Application of {topic}" if len(examples) == 0 else f"Example {len(examples) + 1}"
                examples.append({'title': title, 'description': sent.strip(), 'code': None})
                break
        if len(examples) >= 4:
            break
    return examples


# ─────────────────────────────────────────────────────────────
# FALLBACK: QUIZ GENERATION (no AI key)
# ─────────────────────────────────────────────────────────────

def _generate_real_questions(prompt):
    topic_match = re.search(r'topic "([^"]+)"', prompt) or re.search(r'"([^"]+)"', prompt)
    topic = topic_match.group(1) if topic_match else "General Knowledge"
    diff_match = re.search(r'difficulty level (\d)', prompt)
    difficulty = int(diff_match.group(1)) if diff_match else 1
    count_match = re.search(r'exactly (\d+)', prompt) or re.search(r'Generate (\d+)', prompt)
    count = int(count_match.group(1)) if count_match else 5

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
    sentences = re.split(r'(?<=[.!?])\s+', text) if text else []
    skip_prefixes = ('see also', 'notes', 'references', 'external links', 'further reading', 'bibliography', 'isbn', 'retrieved', 'archived')
    good = [s.strip() for s in sentences if 30 < len(s.strip()) < 350 and not s.strip().startswith('==') and not s.strip().lower().startswith(skip_prefixes) and not s.strip().startswith('^') and len(s.strip().split()) >= 5]
    random.shuffle(good)

    questions = []
    used = set()

    for sent in good:
        if len(questions) >= count:
            break
        if sent in used:
            continue
        mcq = _create_mcq_from_sentence(sent, topic, difficulty, good)
        if mcq:
            questions.append(mcq)
            used.add(sent)

    while len(questions) < count:
        questions.append({
            'question_type': 'short_answer',
            'question_text': f'Explain a key concept related to {topic}.',
            'options': None,
            'correct_answer': f'{topic} involves understanding its fundamental principles and applications.',
            'explanation': f'{topic} has many important concepts.',
            'difficulty': difficulty
        })

    return questions[:count]


def _create_mcq_from_sentence(sentence, topic, difficulty, all_sentences):
    words = sentence.split()
    if len(words) < 6:
        return None
    key_terms = [w.strip('.,;:()[]"\'') for w in words if len(w.strip('.,;:()[]"\'')) > 3 and w[0].isupper() and w.strip('.,;:()[]"\'').lower() != topic.lower() and w.strip('.,;:()[]"\'').lower() not in ('the', 'this', 'that', 'these', 'those', 'with', 'from', 'have', 'been', 'were', 'also', 'which', 'their', 'there', 'when', 'what', 'they', 'some', 'such', 'other', 'most', 'many', 'more')]
    if not key_terms:
        key_terms = [w.strip('.,;:()[]"\'') for w in words if len(w.strip('.,;:()[]"\'')) > 5][:3]
    if not key_terms:
        return None

    correct = key_terms[0]
    distractors = set()
    for other in all_sentences:
        if other == sentence:
            continue
        for w in other.split():
            c = w.strip('.,;:()[]"\'')
            if len(c) > 3 and c != correct and c[0].isupper() and c.lower() not in ('the', 'this', 'that', 'also', 'they', 'these'):
                distractors.add(c)
            if len(distractors) >= 10:
                break

    dlist = list(distractors)[:3]
    while len(dlist) < 3:
        dlist.append(f"Option {len(dlist) + 1}")

    options = [correct] + dlist
    random.shuffle(options)
    return {
        'question_type': 'mcq',
        'question_text': f"Fill in the blank: {sentence.replace(correct, '_____', 1)}",
        'options': options,
        'correct_answer': correct,
        'explanation': sentence,
        'difficulty': difficulty
    }


# ─────────────────────────────────────────────────────────────
# FALLBACK: EVALUATION (no AI key)
# ─────────────────────────────────────────────────────────────

def _smart_bulk_evaluate(prompt):
    blocks = re.split(r'Question ID:\s*', prompt)
    results = []
    for block in blocks[1:]:
        lines = block.strip().split('\n')
        qid_match = re.match(r'(\d+)', lines[0])
        if not qid_match:
            continue
        qid = int(qid_match.group(1))
        q_type = correct = student = ''
        for line in lines:
            ll = line.lower().strip()
            if ll.startswith('type:'): q_type = line.split(':', 1)[1].strip().lower()
            elif ll.startswith('correct answer:'): correct = line.split(':', 1)[1].strip()
            elif ll.startswith('student answer:'): student = line.split(':', 1)[1].strip()
        score, is_correct, feedback = _evaluate_single(q_type, correct, student)
        results.append({'question_id': qid, 'score': score, 'is_correct': is_correct, 'feedback': feedback, 'correct_answer': correct})
    if not results:
        results = [{'question_id': 0, 'score': 0, 'is_correct': False, 'feedback': 'Could not evaluate.', 'correct_answer': 'N/A'}]
    return json.dumps(results)


def _evaluate_single(q_type, correct, student, question_text=''):
    if not student or student.strip() in ('', '(no answer)'):
        return 0.0, False, "No answer was provided."
    cl, sl = correct.lower().strip(), student.lower().strip()
    if q_type in ('mcq', 'true_false'):
        if sl == cl:
            return 1.0, True, "Correct! Well done."
        return 0.0, False, f"Incorrect. The correct answer is: {correct}"
    if sl == cl:
        return 1.0, True, "Perfect answer!"
    if cl in sl or sl in cl:
        return 0.9, True, "Excellent! Your answer captures the key point."
    stop = {'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'was', 'one', 'has', 'have', 'been', 'will', 'that', 'this', 'with', 'from', 'they', 'some', 'them', 'than', 'its', 'also', 'into', 'which', 'more', 'other', 'would', 'there', 'their', 'about', 'could', 'does'}
    cw = set(re.findall(r'\b\w{3,}\b', cl)) - stop
    sw = set(re.findall(r'\b\w{3,}\b', sl)) - stop
    if not cw:
        return 0.5, False, "Could not evaluate. Review the correct answer."
    overlap = len(cw & sw)
    p = overlap / len(sw) if sw else 0
    r = overlap / len(cw)
    f1 = 2 * p * r / (p + r) if (p + r) > 0 else 0
    score = round(min(f1 * 1.15, 1.0), 2)
    is_correct = score >= 0.7
    if is_correct:
        return score, True, "Good answer! You demonstrated understanding."
    elif score >= 0.4:
        missed = cw - sw
        hint = ', '.join(list(missed)[:3])
        return score, False, f"Partially correct. Consider: {hint}. Full answer: {correct[:150]}"
    return score, False, f"Incorrect. The correct answer is: {correct[:200]}"


def _mock_evaluate(prompt):
    correct_match = re.search(r"correct answer:\s*(.+?)(?:\n|$)", prompt, re.IGNORECASE)
    student_match = re.search(r"student's answer:\s*(.+?)(?:\n|$)", prompt, re.IGNORECASE)
    type_match = re.search(r"question type:\s*(.+?)(?:\n|$)", prompt, re.IGNORECASE)
    correct = correct_match.group(1).strip() if correct_match else ""
    student = student_match.group(1).strip() if student_match else ""
    q_type = type_match.group(1).strip().lower() if type_match else ""
    score, is_correct, feedback = _evaluate_single(q_type, correct, student)
    return json.dumps({"score": score, "is_correct": is_correct, "feedback": feedback})


def _mock_feedback():
    return random.choice([
        "Review the key concepts and try to understand the underlying principles.",
        "Good attempt! Focus on the core definition. Try breaking it into smaller parts.",
        "Almost there! Review the topic notes and pay attention to specific terminology.",
    ])


def _get_brief_summary(topic):
    wiki = _fetch_wikipedia(topic)
    if wiki and wiki.get('summary'):
        sentences = re.split(r'(?<=[.!?])\s+', wiki['summary'])
        return ' '.join(sentences[:4])
    ddg = _fetch_duckduckgo(topic)
    if ddg and ddg.get('abstract'):
        return ddg['abstract']
    return f"{topic} is an important area of study with real-world applications."


def parse_json_response(text):
    """Extract JSON from AI response, handling markdown code blocks and common issues."""
    if not text or not text.strip():
        raise ValueError("Empty AI response - no JSON to parse")

    text = text.strip()

    # Remove markdown code blocks
    match = re.search(r'```(?:json)?\s*([\s\S]*?)```', text)
    if match:
        text = match.group(1).strip()

    # Try to find JSON array or object
    if not text.startswith(('[', '{')):
        arr_match = re.search(r'(\[[\s\S]*\])', text)
        obj_match = re.search(r'(\{[\s\S]*\})', text)
        if arr_match:
            text = arr_match.group(1)
        elif obj_match:
            text = obj_match.group(1)

    # Clean common AI output issues
    # Remove trailing commas before } or ]
    text = re.sub(r',\s*([}\]])', r'\1', text)
    # Remove JavaScript-style single-line comments
    text = re.sub(r'//[^\n]*\n', '\n', text)
    # Handle Python None/True/False in JSON
    text = text.replace(': None', ': null').replace(': True', ': true').replace(': False', ': false')

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        # Try harder: extract partial JSON
        current_app.logger.warning(f"JSON parse error: {e}. Attempting partial extraction...")

        # Try extracting just an object
        obj_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', text)
        if obj_match:
            try:
                cleaned = re.sub(r',\s*([}\]])', r'\1', obj_match.group(0))
                return json.loads(cleaned)
            except json.JSONDecodeError:
                pass

        # Try extracting just an array
        arr_match = re.search(r'\[[^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*\]', text)
        if arr_match:
            try:
                cleaned = re.sub(r',\s*([}\]])', r'\1', arr_match.group(0))
                return json.loads(cleaned)
            except json.JSONDecodeError:
                pass

        raise ValueError(f"Failed to parse AI response as JSON: {str(e)[:200]}")
