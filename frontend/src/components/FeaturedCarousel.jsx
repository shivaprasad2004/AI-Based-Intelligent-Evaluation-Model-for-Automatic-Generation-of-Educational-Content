import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Brain, TrendingUp, Flame, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const defaultSlides = [
  {
    title: 'Daily Challenge',
    subtitle: 'Test your knowledge with today\'s question',
    icon: Flame,
    gradient: 'from-orange-500 to-red-600',
    shadowColor: 'shadow-orange-500/25',
    action: '/dashboard',
    cta: 'Take Challenge',
  },
  {
    title: 'AI Topic Explorer',
    subtitle: 'Search any topic and learn with AI-powered content',
    icon: Brain,
    gradient: 'from-indigo-500 to-purple-600',
    shadowColor: 'shadow-indigo-500/25',
    action: '/explore',
    cta: 'Explore Now',
  },
  {
    title: 'Track Progress',
    subtitle: 'View your analytics and improve weak areas',
    icon: TrendingUp,
    gradient: 'from-emerald-500 to-teal-600',
    shadowColor: 'shadow-emerald-500/25',
    action: '/analytics',
    cta: 'View Analytics',
  },
  {
    title: 'Browse Categories',
    subtitle: 'Explore subjects and take quizzes across topics',
    icon: BookOpen,
    gradient: 'from-blue-500 to-cyan-600',
    shadowColor: 'shadow-blue-500/25',
    action: '/browse',
    cta: 'Browse Now',
  },
];

export default function FeaturedCarousel({ weakTopics = [], slides = defaultSlides }) {
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Add weak topic slide if available
  const allSlides = [...slides];
  if (weakTopics.length > 0) {
    allSlides.splice(1, 0, {
      title: `Improve: ${weakTopics[0].topic_name || weakTopics[0].name || 'Weak Topic'}`,
      subtitle: `Score: ${weakTopics[0].average_score || weakTopics[0].score || 0}% - Practice to improve`,
      icon: TrendingUp,
      gradient: 'from-rose-500 to-pink-600',
      shadowColor: 'shadow-rose-500/25',
      action: '/explore',
      cta: 'Practice Now',
    });
  }

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);

    // Auto-play
    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => {
      clearInterval(interval);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="relative group">
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex gap-4">
          {allSlides.map((slide, i) => {
            const Icon = slide.icon;
            return (
              <div
                key={i}
                className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0"
              >
                <div
                  className={`bg-gradient-to-br ${slide.gradient} rounded-2xl p-6 h-full cursor-pointer
                    shadow-lg ${slide.shadowColor} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
                  onClick={() => navigate(slide.action)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{slide.title}</h3>
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">{slide.subtitle}</p>
                  <span className="inline-flex items-center gap-1 text-white/90 text-sm font-medium bg-white/15 px-3 py-1.5 rounded-lg hover:bg-white/25 transition-colors">
                    {slide.cta} <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-200" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-200" />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {allSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === selectedIndex ? 'w-6 bg-indigo-500' : 'w-1.5 bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
