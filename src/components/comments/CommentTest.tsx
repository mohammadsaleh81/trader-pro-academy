import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const CommentTest: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [articleId, setArticleId] = useState('1');
  const [videoId, setVideoId] = useState('1');
  const [podcastId, setPodcastId] = useState('1');
  const [comment, setComment] = useState('تست کامنت');
  const [results, setResults] = useState<any[]>([]);

  const testArticleComments = async () => {
    try {
      const comments = await api.getArticleComments(articleId);
      setResults(prev => [...prev, { type: 'Article Comments', data: comments }]);
      toast({ title: 'موفق', description: 'کامنت‌های مقاله دریافت شد' });
    } catch (error) {
      toast({ title: 'خطا', description: 'دریافت کامنت‌های مقاله ناموفق', variant: 'destructive' });
      console.error(error);
    }
  };

  const testCreateArticleComment = async () => {
    if (!user) {
      toast({ title: 'خطا', description: 'وارد شوید', variant: 'destructive' });
      return;
    }
    try {
      const newComment = await api.createArticleComment(articleId, { content: comment });
      setResults(prev => [...prev, { type: 'New Article Comment', data: newComment }]);
      toast({ title: 'موفق', description: 'کامنت مقاله ایجاد شد' });
    } catch (error) {
      toast({ title: 'خطا', description: 'ایجاد کامنت مقاله ناموفق', variant: 'destructive' });
      console.error(error);
    }
  };

  const testVideoComments = async () => {
    try {
      const comments = await api.getVideoComments(videoId);
      setResults(prev => [...prev, { type: 'Video Comments', data: comments }]);
      toast({ title: 'موفق', description: 'کامنت‌های ویدیو دریافت شد' });
    } catch (error) {
      toast({ title: 'خطا', description: 'دریافت کامنت‌های ویدیو ناموفق', variant: 'destructive' });
      console.error(error);
    }
  };

  const testCreateVideoComment = async () => {
    if (!user) {
      toast({ title: 'خطا', description: 'وارد شوید', variant: 'destructive' });
      return;
    }
    try {
      const newComment = await api.createVideoComment(videoId, { content: comment });
      setResults(prev => [...prev, { type: 'New Video Comment', data: newComment }]);
      toast({ title: 'موفق', description: 'کامنت ویدیو ایجاد شد' });
    } catch (error) {
      toast({ title: 'خطا', description: 'ایجاد کامنت ویدیو ناموفق', variant: 'destructive' });
      console.error(error);
    }
  };

  const testPodcastComments = async () => {
    try {
      const comments = await api.getPodcastComments(podcastId);
      setResults(prev => [...prev, { type: 'Podcast Comments', data: comments }]);
      toast({ title: 'موفق', description: 'کامنت‌های پادکست دریافت شد' });
    } catch (error) {
      toast({ title: 'خطا', description: 'دریافت کامنت‌های پادکست ناموفق', variant: 'destructive' });
      console.error(error);
    }
  };

  const testCreatePodcastComment = async () => {
    if (!user) {
      toast({ title: 'خطا', description: 'وارد شوید', variant: 'destructive' });
      return;
    }
    try {
      const newComment = await api.createPodcastComment(podcastId, { content: comment });
      setResults(prev => [...prev, { type: 'New Podcast Comment', data: newComment }]);
      toast({ title: 'موفق', description: 'کامنت پادکست ایجاد شد' });
    } catch (error) {
      toast({ title: 'خطا', description: 'ایجاد کامنت پادکست ناموفق', variant: 'destructive' });
      console.error(error);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>تست API های کامنت</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <p className="text-green-600">وارد شده: {user.first_name} {user.last_name}</p>
          ) : (
            <p className="text-red-600">وارد نشده‌اید</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Article ID"
              value={articleId}
              onChange={(e) => setArticleId(e.target.value)}
            />
            <Input
              placeholder="Video ID"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Podcast ID"
              value={podcastId}
              onChange={(e) => setPodcastId(e.target.value)}
            />
            <Input
              placeholder="متن کامنت"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={testArticleComments} variant="outline">
              دریافت کامنت‌های مقاله
            </Button>
            <Button onClick={testCreateArticleComment} className="bg-blue-500 hover:bg-blue-600">
              ایجاد کامنت مقاله
            </Button>
            <Button onClick={testVideoComments} variant="outline">
              دریافت کامنت‌های ویدیو
            </Button>
            <Button onClick={testCreateVideoComment} className="bg-green-500 hover:bg-green-600">
              ایجاد کامنت ویدیو
            </Button>
            <Button onClick={testPodcastComments} variant="outline">
              دریافت کامنت‌های پادکست
            </Button>
            <Button onClick={testCreatePodcastComment} className="bg-purple-500 hover:bg-purple-600">
              ایجاد کامنت پادکست
            </Button>
          </div>

          <Button onClick={clearResults} variant="destructive">
            پاک کردن نتایج
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>نتایج</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border p-4 rounded">
                  <h4 className="font-semibold mb-2">{result.type}</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommentTest; 