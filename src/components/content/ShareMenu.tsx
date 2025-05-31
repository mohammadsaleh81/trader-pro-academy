
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share, Instagram, Twitter, Facebook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareMenuProps {
  title: string;
  url?: string;
}

const ShareMenu: React.FC<ShareMenuProps> = ({ title, url = window.location.href }) => {
  const { toast } = useToast();

  const handleTelegramShare = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    window.open(telegramUrl, '_blank');
  };

  const handleInstagramShare = () => {
    // Instagram doesn't support direct URL sharing, so we copy to clipboard
    navigator.clipboard.writeText(`${title}\n${url}`);
    toast({
      title: "لینک کپی شد",
      description: "لینک در کلیپ‌بورد کپی شد. می‌توانید در استوری اینستاگرام استفاده کنید",
    });
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast({
      title: "لینک کپی شد",
      description: "لینک در کلیپ‌بورد کپی شد",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
        >
          <Share className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleTelegramShare} className="flex items-center gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.91 1.21-5.41 3.56-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.47-.81-.27-1.46-.42-1.41-.88.03-.24.38-.49 1.05-.74 4.11-1.79 6.85-2.97 8.22-3.54 3.92-1.66 4.73-1.95 5.26-1.96.12 0 .38.03.55.18.14.12.18.28.2.4-.01.07.01.24-.03.37z"/>
          </svg>
          اشتراک در تلگرام
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleInstagramShare} className="flex items-center gap-2">
          <Instagram className="h-4 w-4" />
          اشتراک در اینستاگرام
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterShare} className="flex items-center gap-2">
          <Twitter className="h-4 w-4" />
          اشتراک در توییتر
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFacebookShare} className="flex items-center gap-2">
          <Facebook className="h-4 w-4" />
          اشتراک در فیسبوک
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="flex items-center gap-2">
          <Share className="h-4 w-4" />
          کپی لینک
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareMenu;
