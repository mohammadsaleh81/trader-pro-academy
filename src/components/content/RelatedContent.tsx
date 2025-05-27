
import React from "react";

const RelatedContent: React.FC = () => {
  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-right">محتوای مرتبط</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-center text-gray-500 py-8">
          محتوای مرتبط به‌زودی اضافه خواهد شد
        </div>
      </div>
    </div>
  );
};

export default RelatedContent;
