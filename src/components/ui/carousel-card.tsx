
import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type CarouselCardProps = {
  children: React.ReactNode;
  className?: string;
  controlsClassName?: string;
  showControls?: boolean;
  itemClassName?: string;
  setApi?: (api: CarouselApi) => void;
};

const CarouselCard: React.FC<CarouselCardProps> = ({
  children,
  className,
  controlsClassName,
  showControls = true,
  itemClassName = "basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5",
  setApi
}) => {
  const [isRtl, setIsRtl] = useState(false);
  
  useEffect(() => {
    setIsRtl(document.documentElement.dir === "rtl");
  }, []);

  return (
    <Carousel 
      className={cn("w-full", className)}
      opts={{
        dragFree: true,
        loop: true,
        align: "start",
        direction: isRtl ? "rtl" : "ltr",
        slidesToScroll: 1,
      }}
      setApi={setApi}
    >
      <CarouselContent className="-ml-2 -mr-2">
        {React.Children.map(children, (child, index) => (
          <CarouselItem 
            key={index} 
            className={cn("pl-2 pr-2 transition-opacity hover:opacity-100 focus:opacity-100", itemClassName)}
          >
            {child}
          </CarouselItem>
        ))}
      </CarouselContent>
      
      {showControls && (
        <>
          <CarouselPrevious 
            className={cn(
              `${isRtl ? "-right-2 md:-right-3" : "-left-2 md:-left-3"} min-w-[36px] min-h-[36px] flex items-center justify-center`, 
              controlsClassName
            )} 
          />
          <CarouselNext 
            className={cn(
              `${isRtl ? "-left-2 md:-left-3" : "-right-2 md:-right-3"} min-w-[36px] min-h-[36px] flex items-center justify-center`, 
              controlsClassName
            )} 
          />
        </>
      )}
    </Carousel>
  );
};

export default CarouselCard;
