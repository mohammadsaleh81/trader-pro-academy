
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ContentDetailHeaderProps {
  title: string;
}

const ContentDetailHeader: React.FC<ContentDetailHeaderProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <>
      <Button
        variant="ghost"
        className="mb-6 flex items-center gap-2"
        onClick={() => navigate("/content")}
      >
        <ArrowRight size={18} />
        <span>بازگشت به کتابخانه محتوا</span>
      </Button>

      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold text-right flex-1 ml-4">{title}</h1>
      </div>
    </>
  );
};

export default ContentDetailHeader;
