import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Pause, Volume2, SkipBack, SkipForward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Podcast, podcastsApi } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import ContentActions from "@/components/content/ContentActions";
import ContentFooter from "@/components/content/ContentFooter";
import CommentSection from "@/components/comments/CommentSection";
import ErrorBoundary from "@/components/error/ErrorBoundary";

const PodcastDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchPodcast = async () => {
      if (!id) {
        navigate('/content');
        return;
      }

      try {
        setIsLoading(true);
        const data = await podcastsApi.getById(id);

        if (!data) {
          navigate('/content');
          return;
        }

        setPodcast(data);
      } catch (error) {
        console.error('Error fetching podcast:', error);
        toast({
          title: "خطا در دریافت پادکست",
          description: "لطفا دوباره تلاش کنید",
          variant: "destructive",
        });
        navigate('/content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPodcast();
  }, [id, navigate, toast]);

  useEffect(() => {
    if (podcast && podcast.audio_url) {
      const audio = new Audio(podcast.audio_url);
      
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });

      setAudioRef(audio);

      return () => {
        audio.pause();
        audio.removeEventListener('timeupdate', () => {});
        audio.removeEventListener('loadedmetadata', () => {});
        audio.removeEventListener('ended', () => {});
      };
    }
  }, [podcast]);

  const togglePlayPause = () => {
    if (!audioRef) return;

    if (isPlaying) {
      audioRef.pause();
    } else {
      audioRef.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    if (audioRef) {
      audioRef.currentTime = Math.min(audioRef.currentTime + 30, duration);
    }
  };

  const skipBackward = () => {
    if (audioRef) {
      audioRef.currentTime = Math.max(audioRef.currentTime - 30, 0);
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef) {
      const newTime = (parseFloat(event.target.value) / 100) * duration;
      audioRef.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="trader-container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!podcast) {
    return (
      <Layout>
        <div className="trader-container py-8">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">پادکست مورد نظر یافت نشد</p>
            <Button 
              onClick={() => navigate("/content")}
              className="mx-auto"
            >
              بازگشت به کتابخانه محتوا
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <ErrorBoundary>
      <Layout>
        <div className="trader-container py-8">
          <Button
            variant="ghost"
            className="mb-6 flex items-center gap-2"
            onClick={() => navigate("/content")}
          >
            <ArrowRight size={18} />
            <span>بازگشت به کتابخانه محتوا</span>
          </Button>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-2xl font-bold text-right flex-1 ml-4">{podcast.title}</h1>
              </div>

              <div className="flex justify-end mb-6">
                <ContentActions 
                  articleId={podcast.id}
                  title={podcast.title}
                />
              </div>

              {/* Podcast Cover and Player */}
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                {podcast.thumbnail && (
                  <div className="md:w-1/3">
                    <img
                      src={podcast.thumbnail}
                      alt={podcast.title}
                      className="w-full h-64 md:h-80 object-cover rounded-lg"
                      loading="lazy"
                    />
                  </div>
                )}
                
                {/* Audio Player */}
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={skipBackward}
                        className="rounded-full"
                      >
                        <SkipBack size={16} />
                      </Button>
                      
                      <Button
                        onClick={togglePlayPause}
                        className="rounded-full w-12 h-12 bg-trader-500 hover:bg-trader-600"
                      >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={skipForward}
                        className="rounded-full"
                      >
                        <SkipForward size={16} />
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={duration ? (currentTime / duration) * 100 : 0}
                        onChange={handleSeek}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>

                    {/* Episode Info */}
                    <div className="mt-4 space-y-2 text-sm">
                      {podcast.episode_number && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">قسمت:</span>
                          <span className="font-medium">{podcast.episode_number}</span>
                        </div>
                      )}
                      {podcast.season_number && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">فصل:</span>
                          <span className="font-medium">{podcast.season_number}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">مدت زمان:</span>
                        <span className="font-medium">{podcast.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div 
                className="prose prose-lg max-w-none text-right prose-headings:text-right prose-p:text-right mb-12" 
                dir="rtl"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(podcast.description) }}
              />

              {/* Transcript Section */}
              {podcast.transcript && (
                <div className="mb-12">
                  <h3 className="text-lg font-semibold mb-4 text-right">متن پیاده‌شده</h3>
                  <div 
                    className="bg-gray-50 rounded-lg p-6 prose prose-sm max-w-none text-right" 
                    dir="rtl"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(podcast.transcript) }}
                  />
                </div>
              )}

              <ContentFooter
                author={podcast.author}
                publishDate={podcast.date}
                duration={podcast.duration}
                viewCount={podcast.view_count}
                tags={podcast.tags}
              />

              {/* Comments Section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <CommentSection
                  contentType="podcast"
                  contentId={id!}
                />
              </div>

              {/* Related content section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-right">پادکست‌های مرتبط</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center text-gray-500 py-8">
                    پادکست‌های مرتبط به‌زودی اضافه خواهد شد
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ErrorBoundary>
  );
};

export default PodcastDetailPage; 