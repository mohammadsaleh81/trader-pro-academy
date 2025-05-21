
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
};

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  instructor,
  thumbnail,
  price,
  rating,
  progress
}) => {
  return (
    <Link to={`/courses/${id}`}>
      <div className="trader-card h-full flex flex-col">
        <div className="relative h-40 w-full">
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
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-base line-clamp-2 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm mb-2">مدرس: {instructor}</p>
          <div className="flex items-center mt-auto justify-between">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 ml-1" />
              <span className="text-sm font-medium">{rating}</span>
            </div>
            <p className="font-bold text-trader-500">
              {price.toLocaleString()} تومان
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
