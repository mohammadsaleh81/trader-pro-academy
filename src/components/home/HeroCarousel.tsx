
import React, { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Dot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type HeroSlide = {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
};

const slides: HeroSlide[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
    title: "دوره آنلایـــن جامع",
    subtitle: "بیزینس کوچینگ",
    buttonText: "نجات کسب‌وکارها",
    buttonLink: "/courses/business-coaching",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop",
    title: "استراتژی‌های معاملاتی",
    subtitle: "فارکس پیشرفته",
    buttonText: "شروع یادگیری",
    buttonLink: "/courses/forex-advanced",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1620228885847-9eab2a1adddc?q=80&w=2070&auto=format&fit=crop",
    title: "آشنایی با ارزهای دیجیتال",
    subtitle: "کریپتوکارنسی",
    buttonText: "مشاهده دوره",
    buttonLink: "/courses/crypto-intro",
  },
];

const HeroCarousel: React.FC = () => {
  const [isRtl, setIsRtl] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    setIsRtl(document.documentElement.dir === "rtl");
  }, []);

  return (
    <div className="relative w-full">
      <Carousel
        className="w-full" 
        opts={{
          align: "start",
          loop: true,
          direction: isRtl ? "rtl" : "ltr",
          slidesToScroll: 1,
        }}
      >
        <CarouselContent className="-ml-2 -mr-2">
          {slides.map((slide, index) => (
            <CarouselItem
              key={slide.id}
              className={isMobile ? 'pl-2 pr-2 basis-full' : 'pl-2 pr-2 basis-1/2'}
              onFocus={() => setActiveSlide(index)}
            >
              <div className="relative w-full rounded-2xl overflow-hidden">
                <div className="relative h-[180px] md:h-[240px] lg:h-[300px] w-full">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 flex items-center ${isRtl ? 'justify-start' : 'justify-end'}`}>
                    <div className={`${isRtl ? 'text-left' : 'text-right'} p-4 md:p-8 max-w-md ${isRtl ? 'ml-0 md:ml-6' : 'mr-0 md:mr-6'}`}>
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                        <h2 className="text-sm md:text-lg mb-1 font-light text-gray-700">{slide.title}</h2>
                        <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-3 text-gray-900">{slide.subtitle}</h1>
                        <a 
                          href={slide.buttonLink} 
                          className="inline-block text-white text-xs md:text-sm px-4 py-1.5 rounded-full transition-colors duration-300"
                        >
                          {slide.buttonText}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      <div className="flex justify-center gap-1 mt-1">
        {slides.map((slide, index) => (
          <Dot 
            key={slide.id} 
            className={cn(
              "h-2.5 w-2.5", 
              index === activeSlide ? "text-trader-300" : "text-gray-300"
            )} 
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
