
import React, { useState, useEffect } from "react";
import { Dot } from "lucide-react";
import CarouselCard from "@/components/ui/carousel-card";
import { cn } from "@/lib/utils";

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
  
  useEffect(() => {
    setIsRtl(document.documentElement.dir === "rtl");
  }, []);

  return (
    <div className="relative w-full">
      <CarouselCard 
        className="w-full"
        controlsClassName="bg-white/70 text-trader-500 hover:bg-white"
      >
        {slides.map((slide, index) => (
          <div 
            key={slide.id} 
            className="relative w-full rounded-2xl overflow-hidden"
            onFocus={() => setActiveSlide(index)}
          >
            <div className="relative h-[220px] md:h-[300px] lg:h-[400px] w-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover brightness-[0.7]"
              />
              <div className={`absolute inset-0 bg-gradient-to-${isRtl ? 'r' : 'l'} from-trader-500/50 to-blue-900/60 flex items-center ${isRtl ? 'justify-start' : 'justify-end'}`}>
                <div className={`text-white ${isRtl ? 'text-left' : 'text-right'} p-6 md:p-12 max-w-md ${isRtl ? 'ml-0 md:ml-8' : 'mr-0 md:mr-8'}`}>
                  <h2 className="text-lg md:text-xl mb-2 font-light">{slide.title}</h2>
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">{slide.subtitle}</h1>
                  <a 
                    href={slide.buttonLink} 
                    className="inline-block bg-trader-500 hover:bg-trader-600 text-white text-sm md:text-base px-5 py-2 rounded-full transition-colors duration-300"
                  >
                    {slide.buttonText}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CarouselCard>
      
      <div className="flex justify-center gap-1 mt-2">
        {slides.map((slide, index) => (
          <Dot 
            key={slide.id} 
            className={cn(
              "h-3 w-3", 
              index === activeSlide ? "text-trader-500" : "text-gray-300"
            )} 
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
