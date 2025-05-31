
import React from "react";
import { FileText, Headphones, Video, Calendar, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

type Category = {
  id: string;
  title: string;
  icon: React.ReactNode;
  link: string;
};

const categories: Category[] = [
  {
    id: "videos",
    title: "ویدیوها",
    icon: <Video className="w-5 h-5 md:w-6 md:h-6" />,
    link: "/content?type=videos"
  },
  {
    id: "podcasts",
    title: "پادکست‌ها",
    icon: <Headphones className="w-5 h-5 md:w-6 md:h-6" />,
    link: "/content?type=podcasts"
  },
  {
    id: "articles",
    title: "مقالات",
    icon: <FileText className="w-5 h-5 md:w-6 md:h-6" />,
    link: "/content?type=articles"
  },
  {
    id: "webinars",
    title: "وبینارها",
    icon: <Calendar className="w-5 h-5 md:w-6 md:h-6" />,
    link: "/content?type=webinars"
  },
  {
    id: "files",
    title: "فایل‌ها",
    icon: <File className="w-5 h-5 md:w-6 md:h-6" />,
    link: "/content?type=files"
  }
];

const ContentCategories: React.FC = () => {
  return (
    <div className="flex justify-between my-6 overflow-x-auto pb-2 gap-2 md:gap-3">
      {categories.map((category) => (
        <Link 
          key={category.id}
          to={category.link} 
          className="flex flex-col items-center min-w-[60px] md:min-w-[75px]"
        >
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-2 text-trader-500 hover:scale-105 transition-transform duration-200">
            {category.icon}
          </div>
          <span className="text-xs text-center text-gray-600">{category.title}</span>
        </Link>
      ))}
    </div>
  );
};

export default ContentCategories;
