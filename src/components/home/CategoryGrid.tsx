
import React from "react";
import { FileText, Video, Headphones, BookOpen, FileJson } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    icon: <Video className="w-8 h-8 text-trader-500" />,
    title: "ویدیوها",
    path: "/content?type=video"
  },
  {
    icon: <BookOpen className="w-8 h-8 text-trader-500" />,
    title: "کتاب ها",
    path: "/content?type=book"
  },
  {
    icon: <FileJson className="w-8 h-8 text-trader-500" />,
    title: "فایل ها",
    path: "/content?type=file"
  },
  {
    icon: <Headphones className="w-8 h-8 text-trader-500" />,
    title: "پادکست ها",
    path: "/content?type=podcast"
  },
  {
    icon: <FileText className="w-8 h-8 text-trader-500" />,
    title: "مقالات",
    path: "/content?type=article"
  },
];

const CategoryGrid: React.FC = () => {
  return (
    <div className="flex justify-center my-8">
      <div className="grid grid-cols-5 gap-4 md:gap-8">
        {categories.map((category, index) => (
          <Link 
            key={index}
            to={category.path}
            className="flex flex-col items-center"
          >
            <div className="bg-white rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shadow-md border border-gray-100">
              {category.icon}
            </div>
            <span className="text-xs md:text-sm mt-2 text-center text-gray-700">
              {category.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
