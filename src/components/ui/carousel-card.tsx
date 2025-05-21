
import React from "react";
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
  return (
    <Carousel 
      className={cn("w-full touch-pan-x", className)}
      opts={{
        dragFree: true,
        loop: true,
        align: "center",
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
              "-left-3 md:-left-5 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center", 
              controlsClassName
            )} 
          />
          <CarouselNext 
            className={cn(
              "-right-3 md:-right-5 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center", 
              controlsClassName
            )} 
          />
        </>
      )}
    </Carousel>
  );
};

export default CarouselCard;
