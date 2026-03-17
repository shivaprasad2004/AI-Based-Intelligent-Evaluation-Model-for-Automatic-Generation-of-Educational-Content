import re
import math
import logging
from collections import Counter
from services.ai_service import _fetch_wikipedia, _fetch_duckduckgo, get_ai_response, parse_json_response

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


def _build_synonym_map(concept):
    """Build simple synonyms/variations for a concept."""
    variations = {concept.lower()}
    lower = concept.lower()

    # Add plural/singular variations
    if lower.endswith('s') and len(lower) > 3:
        variations.add(lower[:-1])
    elif lower.endswith('es') and len(lower) > 4:
        variations.add(lower[:-2])
    else:
        variations.add(lower + 's')

    # Add hyphenated/spaced variations
    if '-' in lower:
        variations.add(lower.replace('-', ' '))
        variations.add(lower.replace('-', ''))
    if ' ' in lower:
        variations.add(lower.replace(' ', '-'))
        variations.add(lower.replace(' ', ''))

    # Add stem
    variations.add(_simple_stem(lower))

    return variations


def extract_key_concepts(topic_name):
    """Extract key concepts from internet sources for a topic."""
    try:
        wiki = _fetch_wikipedia(topic_name)
    except Exception as e:
        logger.error(f"Wikipedia fetch failed in essay evaluator for '{topic_name}': {e}")
        wiki = None

    try:
        ddg = _fetch_duckduckgo(topic_name)
    except Exception as e:
        logger.error(f"DuckDuckGo fetch failed in essay evaluator for '{topic_name}': {e}")
        ddg = None

    concepts = set()
    concept_details = {}

    # Extract from Wikipedia
    if wiki:
        content = wiki.get('content', '') or wiki.get('summary', '')

        # 1. Section headings
        sections = re.findall(r'==\s*([^=]+?)\s*==', content)
        skip = {'see also', 'references', 'external links', 'further reading', 'notes', 'bibliography'}
        for s in sections:
            clean = s.strip()
            if clean.lower() not in skip and len(clean) > 2:
                concepts.add(clean.lower())
                concept_details[clean.lower()] = clean

        # 2. Frequently occurring significant words
        words = re.findall(r'\b[a-zA-Z]{4,}\b', content.lower())
        word_counts = Counter(w for w in words if w not in STOP_WORDS and w != topic_name.lower())
        for word, count in word_counts.most_common(30):
            if count >= 3:
                concepts.add(word)
                concept_details[word] = word.title()

        # 3. Proper nouns (capitalized words not at sentence starts)
        proper_nouns = re.findall(r'(?<=[a-z]\s)([A-Z][a-zA-Z]{3,})', content)
        for pn in proper_nouns:
            pn_lower = pn.lower()
            if pn_lower not in STOP_WORDS and pn_lower != topic_name.lower():
                concepts.add(pn_lower)
                concept_details[pn_lower] = pn

        # 4. Multi-word key phrases from definition patterns
        patterns = [
            r'(\w+\s+\w+)\s+is\s+(?:a|an|the)',
            r'known\s+as\s+(?:the\s+)?(\w+(?:\s+\w+)?)',
            r'called\s+(?:the\s+)?(\w+(?:\s+\w+)?)',
        ]
        for pattern in patterns:
            for match in re.finditer(pattern, content, re.IGNORECASE):
                phrase = match.group(1).strip().lower()
                if len(phrase) > 4 and phrase not in STOP_WORDS:
                    concepts.add(phrase)
                    concept_details[phrase] = phrase.title()

    # Extract from DuckDuckGo
    if ddg:
        abstract = ddg.get('abstract', '')
        if abstract:
            abs_words = re.findall(r'\b[a-zA-Z]{4,}\b', abstract.lower())
            for w in abs_words:
                if w not in STOP_WORDS and w != topic_name.lower():
                    concepts.add(w)
                    concept_details[w] = w.title()

        # Related topics
        for rt in ddg.get('related_topics', []):
            text = rt.get('text', '')
            if text:
                key_words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
                for w in key_words[:3]:
                    if w not in STOP_WORDS:
                        concepts.add(w)
                        concept_details[w] = w.title()

        # Infobox terms
        for label, value in ddg.get('infobox', {}).items():
            if isinstance(value, str):
                for w in re.findall(r'\b[a-zA-Z]{4,}\b', value.lower()):
                    if w not in STOP_WORDS:
                        concepts.add(w)
                        concept_details[w] = w.title()

    # Always include the topic itself
    concepts.add(topic_name.lower())
    concept_details[topic_name.lower()] = topic_name

    # Return sorted list, limited to 40
    concept_list = sorted(concepts, key=lambda c: len(c), reverse=True)[:40]

    return concept_list, concept_details, wiki, ddg


def _match_concept_in_essay(concept, essay_lower, essay_words, essay_normalized):
    """Enhanced concept matching with multiple strategies. Returns (found, match_type, count)."""
    concept_lower = concept.lower()
    found = False
    match_type = None
    mention_count = 0

    # Strategy 1: Exact substring match
    if concept_lower in essay_lower:
        found = True
        match_type = 'exact'
        mention_count = essay_lower.count(concept_lower)
    else:
        # Strategy 2: Synonym/variation match
        variations = _build_synonym_map(concept)
        for variant in variations:
            if variant in essay_lower and len(variant) > 3:
                found = True
                match_type = 'variation'
                mention_count = essay_lower.count(variant)
                break

    if not found:
        # Strategy 3: Stemmed match
        concept_stem = _simple_stem(concept_lower)
        for word in essay_words:
            if _simple_stem(word) == concept_stem and len(concept_stem) > 3:
                found = True
                match_type = 'stemmed'
                mention_count = sum(1 for w in essay_words if _simple_stem(w) == concept_stem)
                break

    if not found and ' ' in concept_lower:
        # Strategy 4: Multi-word window match for multi-word concepts
        concept_parts = concept_lower.split()
        if len(concept_parts) <= 3:
            for i in range(max(0, len(essay_words) - 50)):
                window = essay_words[i:i + 50]
                if all(any(_simple_stem(p) == _simple_stem(w) for w in window) for p in concept_parts):
                    found = True
                    match_type = 'window'
                    mention_count = 1
                    break

    return found, match_type, min(mention_count, 5)


def _get_ai_essay_analysis(essay_text, topic_name, key_concepts):
    """Use AI for semantic essay analysis to supplement keyword matching."""
    concepts_str = ', '.join(key_concepts[:25])
    prompt = f"""You are an expert academic evaluator. Analyze this student's essay about "{topic_name}".

ESSAY:
{essay_text[:3000]}

EXPECTED KEY CONCEPTS: {concepts_str}

Evaluate the essay and return ONLY a valid JSON object with:
- "concept_scores": an object where each key is a concept from the expected list, and value is 0 (not covered), 0.5 (partially covered/implied), or 1.0 (well covered)
- "accuracy_score": float 0-100 (how factually accurate is the content)
- "relevance_score": float 0-100 (how relevant is the essay to the topic)
- "coherence_score": float 0-100 (how well-organized and logical is the writing)
- "depth_score": float 0-100 (how deep is the analysis)
- "overall_feedback": a 2-3 sentence assessment of the essay

Return ONLY the JSON object, no markdown or extra text."""

    try:
        raw = get_ai_response(prompt)
        result = parse_json_response(raw)
        if isinstance(result, dict) and 'accuracy_score' in result:
            return result
    except Exception as e:
        logger.warning(f"AI essay analysis failed for '{topic_name}': {e}")

    return None


def evaluate_essay(essay_text, topic_name, key_concepts, wiki_data=None):
    """Evaluate an essay against key concepts with enhanced matching and AI analysis."""
    essay_lower = essay_text.lower()
    essay_normalized = re.sub(r'[^\w\s]', '', essay_lower)
    essay_words = essay_normalized.split()
    word_count = len(essay_words)

    # Match concepts using enhanced matching
    matched = []
    missed = []
    concept_match_details = {}

    for concept in key_concepts:
        found, match_type, mention_count = _match_concept_in_essay(
            concept, essay_lower, essay_words, essay_normalized
        )
        if found:
            matched.append(concept)
            concept_match_details[concept] = {
                'match_type': match_type,
                'mentions': mention_count
            }
        else:
            missed.append(concept)

    # Try AI analysis for supplementary scoring
    ai_analysis = _get_ai_essay_analysis(essay_text, topic_name, key_concepts)

    # If AI found concepts that keyword matching missed, add them as partial matches
    if ai_analysis and 'concept_scores' in ai_analysis:
        ai_concepts = ai_analysis.get('concept_scores', {})
        newly_matched = []
        for concept in missed[:]:
            ai_score = ai_concepts.get(concept, ai_concepts.get(concept.lower(), 0))
            if isinstance(ai_score, (int, float)) and ai_score >= 0.5:
                newly_matched.append(concept)
                concept_match_details[concept] = {
                    'match_type': 'ai_semantic',
                    'mentions': 1,
                    'ai_score': ai_score
                }
        for c in newly_matched:
            missed.remove(c)
            matched.append(c)

    # Calculate scores
    total_concepts = len(key_concepts)
    matched_count = len(matched)
    coverage_score = (matched_count / total_concepts * 100) if total_concepts > 0 else 0

    # Depth score: how many times matched concepts appear (with match type weighting)
    depth_counts = []
    for concept in matched:
        details = concept_match_details.get(concept, {})
        count = details.get('mentions', 1)
        # Weight by match type quality
        if details.get('match_type') == 'exact':
            count = min(count, 3)
        elif details.get('match_type') == 'ai_semantic':
            count = details.get('ai_score', 0.5) * 2
        else:
            count = min(count, 2)
        depth_counts.append(count)
    avg_depth = sum(depth_counts) / len(depth_counts) if depth_counts else 0
    depth_score = min(avg_depth / 2.0 * 100, 100)

    # Essay quality score
    sentences = re.split(r'[.!?]+', essay_text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 5]
    sentence_count = len(sentences)

    # Word count factor
    if word_count >= 280:
        wc_factor = 1.0
    elif word_count >= 200:
        wc_factor = 0.8
    elif word_count >= 100:
        wc_factor = 0.6
    else:
        wc_factor = 0.4

    # Sentence variety
    starters = set()
    for s in sentences:
        words = s.split()
        if words:
            starters.add(words[0].lower())
    variety_ratio = len(starters) / max(sentence_count, 1)
    variety_score = min(variety_ratio * 100, 100)

    # Average sentence length (ideal: 10-25 words)
    avg_sent_len = word_count / max(sentence_count, 1)
    if 10 <= avg_sent_len <= 25:
        coherence_score = 100
    elif 7 <= avg_sent_len <= 30:
        coherence_score = 70
    else:
        coherence_score = 40

    quality_score = (wc_factor * 40 + variety_score * 0.3 + coherence_score * 0.3)

    # Vocabulary richness
    unique_words = set(w for w in essay_words if len(w) > 3 and w not in STOP_WORDS)
    total_significant = len([w for w in essay_words if len(w) > 3 and w not in STOP_WORDS])
    vocab_richness = (len(unique_words) / max(total_significant, 1)) * 100 if total_significant > 0 else 0

    # AI-enhanced scoring components
    ai_accuracy = 0
    ai_relevance = 0
    if ai_analysis:
        ai_accuracy = float(ai_analysis.get('accuracy_score', 0))
        ai_relevance = float(ai_analysis.get('relevance_score', 0))
        ai_coherence = float(ai_analysis.get('coherence_score', 0))
        ai_depth = float(ai_analysis.get('depth_score', 0))

        # Blend AI scores with algorithmic scores for more accurate results
        # AI gets 40% weight, algorithmic gets 60%
        coverage_score = coverage_score * 0.6 + ai_relevance * 0.4
        depth_score = depth_score * 0.6 + ai_depth * 0.4
        quality_score = quality_score * 0.6 + ai_coherence * 0.4

    # Final weighted score
    final_score = (
        coverage_score * 0.35 +
        depth_score * 0.25 +
        quality_score * 0.15 +
        vocab_richness * 0.10 +
        ai_accuracy * 0.15  # Direct accuracy component from AI
    )
    # If no AI available, redistribute weights
    if not ai_analysis:
        final_score = (
            coverage_score * 0.40 +
            depth_score * 0.25 +
            quality_score * 0.20 +
            vocab_richness * 0.15
        )

    final_score = min(round(final_score, 1), 100)

    # Grade assignment
    grade = _assign_grade(final_score)

    # Build strengths and weaknesses
    strengths = []
    weaknesses = []

    if coverage_score >= 70:
        strengths.append(f'Excellent concept coverage ({matched_count}/{total_concepts} concepts)')
    elif coverage_score >= 50:
        strengths.append(f'Good concept coverage ({matched_count}/{total_concepts} concepts)')
    else:
        weaknesses.append(f'Low concept coverage - only {matched_count}/{total_concepts} key concepts mentioned')

    if depth_score >= 70:
        strengths.append('Good depth of discussion on matched concepts')
    elif depth_score < 40:
        weaknesses.append('Consider elaborating more on the concepts you mention')

    if word_count >= 280:
        strengths.append(f'Good essay length ({word_count} words)')
    elif word_count < 200:
        weaknesses.append(f'Essay is too short ({word_count} words). Aim for at least 300 words')

    if variety_score >= 60:
        strengths.append('Good sentence variety')
    else:
        weaknesses.append('Try to vary your sentence structure more')

    if vocab_richness >= 60:
        strengths.append('Rich vocabulary usage')
    elif vocab_richness < 30:
        weaknesses.append('Try to use more diverse vocabulary')

    if ai_analysis:
        if ai_accuracy >= 80:
            strengths.append('Content is factually accurate')
        elif ai_accuracy < 50:
            weaknesses.append('Some factual inaccuracies detected - review the source material')

    # Concept details for frontend
    concept_details = []
    for c in matched:
        # Find the context where concept appears
        idx = essay_lower.find(c.lower())
        context = ''
        if idx >= 0:
            start = max(0, idx - 40)
            end = min(len(essay_text), idx + len(c) + 40)
            context = '...' + essay_text[start:end] + '...'

        details = concept_match_details.get(c, {})
        concept_details.append({
            'concept': c.title(),
            'found': True,
            'context': context,
            'match_type': details.get('match_type', 'exact'),
            'mentions': details.get('mentions', 1)
        })

    for c in missed[:15]:  # Limit missed to 15
        hint = _get_concept_hint(c, wiki_data)
        concept_details.append({
            'concept': c.title(),
            'found': False,
            'hint': hint
        })

    # Overall feedback
    ai_overall = ''
    if ai_analysis:
        ai_overall = ai_analysis.get('overall_feedback', '')

    if final_score >= 80:
        overall = f'Excellent essay! You demonstrated strong understanding of {topic_name} by covering {matched_count} out of {total_concepts} key concepts.'
    elif final_score >= 60:
        overall = f'Good essay on {topic_name}. You covered {matched_count} out of {total_concepts} key concepts. Focus on the missed concepts to improve.'
    elif final_score >= 40:
        overall = f'Fair attempt at writing about {topic_name}. You covered {matched_count} out of {total_concepts} concepts. Review the topic material and try to include more key ideas.'
    else:
        overall = f'Your essay on {topic_name} needs improvement. Only {matched_count} out of {total_concepts} key concepts were found. Study the material thoroughly before retrying.'

    if ai_overall:
        overall += f' AI Analysis: {ai_overall}'

    writing_feedback = _generate_writing_feedback(word_count, sentence_count, avg_sent_len, variety_score)

    feedback = {
        'overall': overall,
        'strengths': strengths,
        'weaknesses': weaknesses,
        'concept_details': concept_details,
        'writing_feedback': writing_feedback,
        'score_breakdown': {
            'coverage': round(coverage_score, 1),
            'depth': round(depth_score, 1),
            'quality': round(quality_score, 1),
            'vocabulary': round(vocab_richness, 1),
            'accuracy': round(ai_accuracy, 1) if ai_analysis else None
        }
    }

    return {
        'score': final_score,
        'grade': grade,
        'matched': matched,
        'missed': missed,
        'total_concepts': total_concepts,
        'matched_count': matched_count,
        'feedback': feedback
    }


def _assign_grade(score):
    if score >= 90:
        return 'A+'
    elif score >= 80:
        return 'A'
    elif score >= 70:
        return 'B+'
    elif score >= 60:
        return 'B'
    elif score >= 50:
        return 'C'
    elif score >= 40:
        return 'D'
    else:
        return 'F'


def _get_concept_hint(concept, wiki_data):
    """Get a hint for a missed concept from source data."""
    if wiki_data and wiki_data.get('content'):
        content = wiki_data['content']
        idx = content.lower().find(concept.lower())
        if idx >= 0:
            start = max(0, idx - 20)
            end = min(len(content), idx + len(concept) + 80)
            snippet = content[start:end].strip()
            return f'This concept appears in the source material: "...{snippet}..."'
    return f'This is an important concept related to the topic. Research it further.'


def _generate_writing_feedback(word_count, sentence_count, avg_sent_len, variety_score):
    """Generate writing-specific feedback."""
    parts = []

    if word_count < 200:
        parts.append(f'Your essay is {word_count} words. Try to write at least 300 words for a comprehensive answer.')
    elif word_count < 280:
        parts.append(f'Your essay is {word_count} words. A bit more detail would strengthen your response.')
    else:
        parts.append(f'Good essay length at {word_count} words.')

    if avg_sent_len > 30:
        parts.append('Some sentences are quite long. Consider breaking them into shorter, clearer sentences.')
    elif avg_sent_len < 8:
        parts.append('Your sentences are quite short. Try to elaborate more and connect ideas.')

    if variety_score < 40:
        parts.append('Try starting sentences with different words to improve readability.')

    if sentence_count < 5:
        parts.append('Your essay has very few sentences. Aim for at least 10-15 sentences.')

    return ' '.join(parts) if parts else 'Your writing style is clear and well-structured.'
