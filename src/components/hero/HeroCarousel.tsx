
import React, { useState, useEffect } from "react";
import CarouselCard from "@/components/ui/carousel-card";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useData } from "@/contexts/DataContext";
import { Link } from "react-router-dom";
import type { CarouselApi } from "@/components/ui/carousel";
import { DEFAULT_IMAGES } from "@/lib/config";

const HeroCarousel: React.FC = () => {
  const [isRtl, setIsRtl] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const isMobile = useIsMobile();
  const { courses } = useData();
  
  useEffect(() => {
    setIsRtl(document.documentElement.dir === "rtl");
  }, []);

  const heroSlides = courses.slice(0, 3);

  useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => {
      setActiveSlide(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect();

    return () => {
      api?.off("select", onSelect);
    };
  }, [api]);

  const handleDotClick = (index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  };

  if (heroSlides.length === 0) {
    return (
      <div className="relative w-full">
        <div className="w-full rounded-lg sm:rounded-2xl overflow-hidden bg-gray-200 animate-pulse">
          <div className="h-[140px] sm:h-[180px] md:h-[240px] lg:h-[300px] w-full bg-gray-300"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <CarouselCard 
        className="w-full"
        controlsClassName="bg-white/70 text-trader-500 hover:bg-white"
        itemClassName={isMobile ? 'basis-full' : 'basis-1/2'}
        setApi={setApi}
      >
        {heroSlides.map((course, index) => (
          <Link 
            key={course.id} 
            to={`/courses/${course.id}`}
            className="relative w-full rounded-lg sm:rounded-2xl overflow-hidden block"
          >
            <div className="relative h-[140px] sm:h-[180px] md:h-[240px] lg:h-[300px] w-full">
              <img
                src={course.thumbnail || DEFAULT_IMAGES.PLACEHOLDER_CONTENT}
                alt={course.title}
                className="w-full h-full object-cover brightness-[0.7]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = DEFAULT_IMAGES.PLACEHOLDER_CONTENT;
                }}
              />
              <div className={`absolute inset-0 bg-gradient-to-${isRtl ? 'r' : 'l'} from-trader-500/50 to-blue-900/60 flex items-center ${isRtl ? 'justify-start' : 'justify-end'}`}>
                <div className={`text-white ${isRtl ? 'text-left' : 'text-right'} p-3 sm:p-4 md:p-8 max-w-xs sm:max-w-md ${isRtl ? 'ml-0 sm:ml-3 md:ml-6' : 'mr-0 sm:mr-3 md:mr-6'}`}>
                  <h2 className="text-xs sm:text-sm md:text-lg mb-1 font-light">دوره آموزشی</h2>
                  <h1 className="text-sm sm:text-xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 line-clamp-2">{course.title}</h1>
                  <div className="inline-block bg-trader-500 hover:bg-trader-600 text-white text-[10px] sm:text-xs md:text-sm px-2 sm:px-4 py-1 sm:py-1.5 rounded-full transition-colors duration-300">
                    {course.price === 0 ? 'مشاهده رایگان' : `${course.price.toLocaleString()} تومان`}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </CarouselCard>
      
      <div className="flex justify-center gap-2 sm:gap-3 mt-3 sm:mt-4">
        {heroSlides.map((course, index) => (
          <div 
            key={course.id} 
            className={cn(
              "w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 cursor-pointer hover:scale-110", 
              index === activeSlide 
                ? "bg-trader-500 scale-110" 
                : "bg-gray-300 hover:bg-gray-400"
            )}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
