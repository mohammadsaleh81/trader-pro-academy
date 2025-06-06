import React from "react";
import Layout from "@/components/layout/Layout";
import BookmarkTestComponent from "@/components/content/BookmarkTestComponent";

const BookmarkTestPage: React.FC = () => {
  return (
    <Layout>
      <div className="trader-container py-6">
        <BookmarkTestComponent />
      </div>
    </Layout>
  );
};

export default BookmarkTestPage; 