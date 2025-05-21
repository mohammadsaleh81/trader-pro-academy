import React from "react";
import { FileText, Headphones, Video, Calendar, File } from "lucide-react";
import { cn } from "@/lib/utils";

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
    icon: <Video className="w-6 h-6" />,
    link: "/content?type=videos"
  },
  {
    id: "podcasts",
    title: "پادکست‌ها",
    icon: <Headphones className="w-6 h-6" />,
    link: "/content?type=podcasts"
  },
  {
    id: "articles",
    title: "مقالات",
    icon: <FileText className="w-6 h-6" />,
    link: "/content?type=articles"
  },
  {
    id: "webinars",
    title: "وبینارها",
    icon: <Calendar className="w-6 h-6" />,
    link: "/content?type=webinars"
  },
  {
    id: "files",
    title: "فایل‌ها",
    icon: <File className="w-6 h-6" />,
    link: "/content?type=files"
  }
];

const ContentCategories: React.FC = () => {
  return (
    <div className="flex justify-between my-6 px-3 overflow-x-auto pb-2 gap-3">
      {categories.map((category) => (
        <a 
          key={category.id}
          href={category.link} 
          className="flex flex-col items-center min-w-[75px]"
        >
          <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-2 text-trader-500 hover:scale-105 transition-transform duration-200">
            {category.icon}
          </div>
          <span className="text-xs text-center text-gray-600">{category.title}</span>
        </a>
      ))}
    </div>
  );
};

export default ContentCategories;
