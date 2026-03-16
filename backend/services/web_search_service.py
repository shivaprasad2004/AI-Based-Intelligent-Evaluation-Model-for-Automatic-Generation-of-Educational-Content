import requests
import json
import logging

logger = logging.getLogger(__name__)


def get_topic_content(topic_name, topic_description=''):
    """Fetch real-time educational content about a topic from the internet."""
    result = {
        'wikipedia_summary': '',
        'wikipedia_url': '',
        'web_results': [],
        'key_concepts': [],
        'related_topics': []
    }

    # 1. Wikipedia
    try:
        import wikipedia
        wikipedia.set_lang("en")
        wiki_page = wikipedia.summary(topic_name, sentences=8, auto_suggest=True)
        result['wikipedia_summary'] = wiki_page
        try:
            result['wikipedia_url'] = wikipedia.page(topic_name, auto_suggest=False).url
        except Exception:
            result['wikipedia_url'] = f'https://en.wikipedia.org/wiki/{topic_name.replace(" ", "_")}'
    except Exception as e:
        logger.warning(f"Wikipedia primary fetch failed for '{topic_name}': {e}")
        try:
            import wikipedia
            search_results = wikipedia.search(topic_name, results=3)
            if search_results:
                wiki_page = wikipedia.summary(search_results[0], sentences=8, auto_suggest=False)
                result['wikipedia_summary'] = wiki_page
                result['wikipedia_url'] = f'https://en.wikipedia.org/wiki/{search_results[0].replace(" ", "_")}'
        except Exception as e2:
            logger.warning(f"Wikipedia fallback fetch also failed for '{topic_name}': {e2}")
            result['wikipedia_summary'] = f'{topic_name}: {topic_description}' if topic_description else ''

    # 2. DuckDuckGo Instant Answer API (free, no key needed)
    try:
        ddg_url = f'https://api.duckduckgo.com/?q={requests.utils.quote(topic_name)}&format=json&no_html=1&skip_disambig=1'
        resp = requests.get(ddg_url, timeout=8)
        data = resp.json()
        if data.get('AbstractText'):
            result['web_results'].append({
                'title': data.get('Heading', topic_name),
                'text': data['AbstractText'],
                'url': data.get('AbstractURL', '')
            })
        for rt in data.get('RelatedTopics', [])[:6]:
            if isinstance(rt, dict) and 'Text' in rt:
                result['related_topics'].append({
                    'text': rt['Text'],
                    'url': rt.get('FirstURL', '')
                })
    except Exception as e:
        logger.warning(f"DuckDuckGo fetch failed for '{topic_name}': {e}")

    # 3. Extract key concepts from content
    content = result['wikipedia_summary']
    if content:
        sentences = content.split('. ')
        result['key_concepts'] = [s.strip() + '.' for s in sentences[:5] if len(s.strip()) > 20]

    return result
