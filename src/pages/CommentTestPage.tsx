import React from 'react';
import Layout from '@/components/layout/Layout';
import CommentTest from '@/components/comments/CommentTest';

const CommentTestPage: React.FC = () => {
  return (
    <Layout>
      <div className="trader-container py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">تست سیستم کامنت</h1>
        <CommentTest />
      </div>
    </Layout>
  );
};

export default CommentTestPage; 