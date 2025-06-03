
import DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'div', 'span', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'iframe'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });
};
