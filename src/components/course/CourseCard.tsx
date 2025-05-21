
import React from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

type CourseCardProps = {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  price: number;
  rating: number;
  progress?: number;
  isFree?: boolean;
};

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  instructor,
  thumbnail,
  price,
  rating,
  progress,
  isFree = false
}) => {
  return (
    <Link to={`/courses/${id}`}>
      <div className="trader-card h-full flex flex-col">
        <div className="relative h-44 w-full">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover rounded-t-xl"
          />
          {progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 py-1 px-2">
              <div className="progress-bar">
                <div className="progress-value" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-white text-xs mt-1 text-center">
                {progress}% تکمیل شده
              </p>
            </div>
          )}
        </div>
        <div className="p-3 flex-1 flex flex-col">
          <h3 className="font-bold text-sm line-clamp-2 mb-1">{title}</h3>
          <p className="text-gray-600 text-xs mb-2">مدرس: {instructor}</p>
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-3.5 w-3.5 text-yellow-500 ml-1" />
              <span className="text-xs font-medium">{rating}</span>
            </div>
            <p className={`font-bold ${isFree ? "text-green-600" : "text-trader-500"} text-sm`}>
              {isFree ? "رایگان" : `${price.toLocaleString()} تومان`}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
