
import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type CarouselCardProps = {
  children: React.ReactNode;
  className?: string;
  controlsClassName?: string;
  showControls?: boolean;
};

const CarouselCard: React.FC<CarouselCardProps> = ({
  children,
  className,
  controlsClassName,
  showControls = true
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
        align: "center",
        direction: isRtl ? "rtl" : "ltr",
      }}
    >
      <CarouselContent>
        {React.Children.map(children, (child, index) => (
          <CarouselItem 
            key={index} 
            className="transition-opacity hover:opacity-100 focus:opacity-100"
          >
            {child}
          </CarouselItem>
        ))}
      </CarouselContent>
      
      {showControls && (
        <>
          <CarouselPrevious 
            className={cn(
              `${isRtl ? "-right-3 md:-right-5" : "-left-3 md:-left-5"} min-w-[44px] min-h-[44px] flex items-center justify-center`, 
              controlsClassName
            )} 
            style={{ touchAction: "manipulation" }}
          />
          <CarouselNext 
            className={cn(
              `${isRtl ? "-left-3 md:-left-5" : "-right-3 md:-right-5"} min-w-[44px] min-h-[44px] flex items-center justify-center`, 
              controlsClassName
            )} 
            style={{ touchAction: "manipulation" }}
          />
        </>
      )}
    </Carousel>
  );
};

export default CarouselCard;
