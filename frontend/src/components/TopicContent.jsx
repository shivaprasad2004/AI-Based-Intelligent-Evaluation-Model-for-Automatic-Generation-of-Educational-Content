import { useState } from 'react';
import { BookOpen, Lightbulb, Code, FileText, ChevronDown, ChevronUp, ExternalLink, Globe, Link2, Info } from 'lucide-react';
import GlassCard from './ui/GlassCard';

export default function TopicContent({ content }) {
  const [expandedConcept, setExpandedConcept] = useState(null);
  const [showAllResources, setShowAllResources] = useState(false);

  if (!content) return null;

  const resources = content.web_resources || [];
  const visibleResources = showAllResources ? resources : resources.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Topic Title + Source Badge */}
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{content.topic}</h2>
        {content.wikipedia_url && (
          <a
            href={content.wikipedia_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Globe className="w-3.5 h-3.5" />
            Source: Wikipedia — {content.wikipedia_title || content.topic}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Infobox (if available) */}
      {content.infobox && Object.keys(content.infobox).length > 0 && (
        <GlassCard hover={false}>
          <div className="flex items-start gap-3 mb-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Quick Facts</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(content.infobox).map(([key, value]) => (
              <div key={key} className="flex gap-2 py-1.5 px-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">{key}:</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Overview */}
      {content.overview && (
        <GlassCard hover={false}>
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Overview</h3>
              <div className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line text-[15px]">
                {content.overview}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Key Concepts */}
      {content.key_concepts?.length > 0 && (
        <GlassCard hover={false}>
          <div className="flex items-start gap-3 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-500 shrink-0 mt-1" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Key Concepts <span className="text-sm font-normal text-gray-400">({content.key_concepts.length})</span>
            </h3>
          </div>
          <div className="space-y-2">
            {content.key_concepts.map((concept, idx) => (
              <div
                key={idx}
                className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedConcept(expandedConcept === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="font-medium text-gray-800 dark:text-white flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs flex items-center justify-center font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="line-clamp-1">{concept.title}</span>
                  </span>
                  {expandedConcept === idx ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </button>
                {expandedConcept === idx && (
                  <div className="px-4 pb-4 pt-0 animate-fadeIn">
                    <p className="text-sm text-gray-600 dark:text-gray-300 ml-9 leading-relaxed">{concept.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Examples */}
      {content.examples?.length > 0 && (
        <GlassCard hover={false}>
          <div className="flex items-start gap-3 mb-4">
            <Code className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Examples & Applications</h3>
          </div>
          <div className="space-y-4">
            {content.examples.map((example, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border-l-3 border-l-emerald-400">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">{example.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{example.description}</p>
                {example.code && (
                  <pre className="mt-3 bg-gray-900 text-green-400 p-3 rounded-lg text-sm overflow-x-auto">
                    <code>{example.code}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Web Resources */}
      {resources.length > 0 && (
        <GlassCard hover={false}>
          <div className="flex items-start gap-3 mb-4">
            <Link2 className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Web Resources <span className="text-sm font-normal text-gray-400">({resources.length})</span>
            </h3>
          </div>
          <div className="space-y-2">
            {visibleResources.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
              >
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">
                    {res.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{res.source} &middot; {res.url}</p>
                </div>
              </a>
            ))}
          </div>
          {resources.length > 4 && (
            <button
              onClick={() => setShowAllResources(!showAllResources)}
              className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {showAllResources ? 'Show less' : `Show all ${resources.length} resources`}
            </button>
          )}
        </GlassCard>
      )}

      {/* Related Topics */}
      {content.related_topics?.length > 0 && (
        <GlassCard hover={false}>
          <div className="flex items-start gap-3 mb-3">
            <Globe className="w-5 h-5 text-purple-500 shrink-0 mt-1" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Related Topics</h3>
          </div>
          <div className="flex flex-wrap gap-2 ml-8">
            {content.related_topics.slice(0, 15).map((rt, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm border border-purple-200 dark:border-purple-800"
              >
                {typeof rt === 'string' ? rt : rt.text || rt.title || ''}
              </span>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Study Material */}
      {content.study_material && (
        <GlassCard hover={false}>
          <div className="flex items-start gap-3 mb-3">
            <FileText className="w-5 h-5 text-orange-500 shrink-0 mt-1" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Study Guide</h3>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line ml-8">
            {content.study_material}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
