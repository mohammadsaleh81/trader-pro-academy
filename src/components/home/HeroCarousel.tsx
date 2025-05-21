
import React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const heroCarouselItems = [
  {
    id: 1,
    title: "دوره آنلاین جامع",
    subtitle: "بیزینس کوچینگ",
    description: "نجات کسب و کارها",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
    color: "from-blue-900 to-blue-950",
  },
  {
    id: 2,
    title: "آموزش تخصصی",
    subtitle: "ترید ارزهای دیجیتال",
    description: "موفقیت در بازارهای مالی",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    color: "from-trader-700 to-trader-800",
  }
];

const HeroCarousel: React.FC = () => {
  return (
    <Carousel className="mb-8">
      <CarouselContent>
        {heroCarouselItems.map((item) => (
          <CarouselItem key={item.id}>
            <div className={`rounded-2xl bg-gradient-to-l ${item.color} p-6 text-white relative overflow-hidden h-64 md:h-80`}>
              <div className="absolute inset-0">
                <img 
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover opacity-30 mix-blend-overlay"
                />
              </div>
              <div className="relative flex flex-col md:flex-row items-center h-full">
                <div className="md:w-2/3 text-right">
                  <h3 className="text-lg opacity-90 mb-1">{item.title}</h3>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">{item.subtitle}</h2>
                  <div className="bg-trader-500 text-white inline-block px-4 py-1 rounded-full mb-4">
                    {item.description}
                  </div>
                  <Button className="bg-white text-trader-600 hover:bg-gray-100 rounded-full">
                    مشاهده دوره
                  </Button>
                </div>
                <div className="md:w-1/3 hidden md:block">
                  {/* Placeholder for potential instructor image or course graphic */}
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center mt-3">
        <div className="flex gap-1">
          {heroCarouselItems.map((_, index) => (
            <div key={index} className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-trader-500' : 'bg-gray-300'}`}></div>
          ))}
        </div>
      </div>
    </Carousel>
  );
};

export default HeroCarousel;
