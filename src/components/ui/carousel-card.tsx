
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
    <Carousel className={cn("w-full", className)}>
      <CarouselContent>
        {React.Children.map(children, (child, index) => (
          <CarouselItem key={index}>
            {child}
          </CarouselItem>
        ))}
      </CarouselContent>
      
      {showControls && (
        <>
          <CarouselPrevious className={cn("-left-3 md:-left-5", controlsClassName)} />
          <CarouselNext className={cn("-right-3 md:-right-5", controlsClassName)} />
        </>
      )}
    </Carousel>
  );
};

export default CarouselCard;
