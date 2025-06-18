
import React, { useState, useEffect } from "react";
import CarouselCard from "@/components/ui/carousel-card";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useData } from "@/contexts/DataContext";
import { Link } from "react-router-dom";
import type { CarouselApi } from "@/components/ui/carousel";
import { DEFAULT_IMAGES } from "@/lib/config";
import { formatPrice } from "@/utils/currency";



const HeroCarousel: React.FC = () => {
  const [isRtl, setIsRtl] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const isMobile = useIsMobile();
  const { courses } = useData();
  
  useEffect(() => {
    setIsRtl(document.documentElement.dir === "rtl");
  }, []);

  // Get first 3 courses for the hero carousel
  const heroSlides = courses.slice(0, 3);

  // Listen to carousel changes
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

  // Handle dot click
  const handleDotClick = (index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  };

  // If no courses available, show loading or empty state
  if (heroSlides.length === 0) {
    return (
      <div className="relative w-full">
        <div className="w-full rounded-2xl overflow-hidden bg-gray-200 animate-pulse">
          <div className="h-[180px] md:h-[240px] lg:h-[300px] w-full bg-gray-300"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <CarouselCard 
        className="w-full"
        controlsClassName="bg-white/50 text-trader-500 hover:bg-white"
        itemClassName={isMobile ? 'basis-full' : 'basis-1/2'}
        setApi={setApi}
      >
        {heroSlides.map((course, index) => (
          <Link 
            key={course.id} 
            to={`/courses/${course.id}`}
            className="relative w-full rounded-2xl overflow-hidden block"
          >
            <div className="relative h-[180px] md:h-[240px] lg:h-[300px] w-full">
              <img
                src={course.thumbnail || DEFAULT_IMAGES.PLACEHOLDER_CONTENT}
                alt={course.title}
                className="w-full h-full object-cover "
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = DEFAULT_IMAGES.PLACEHOLDER_CONTENT;
                }}
              />

            </div>
          </Link>
        ))}
      </CarouselCard>
      
      <div className="flex justify-center gap-3 mt-4">
        {heroSlides.map((course, index) => (
          <div 
            key={course.id} 
            className={cn(
              "w-4 h-4 rounded-full transition-all duration-300 cursor-pointer hover:scale-110", 
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
