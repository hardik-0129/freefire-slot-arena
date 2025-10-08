import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './css/AnnouncementBar.css';

interface AnnouncementItem {
  _id: string;
  title: string;
  content: string;
  type: 'html' | 'text';
  priority: number;
  targetAudience: 'all' | 'logged_in' | 'guests';
}

export default function AnnouncementBar() {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const endpoint = '/api/announcement/public';
        const url = `${apiBase}${endpoint}`;
       
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (res.ok && data.status) {
          const announcements = data.announcements || [];
          
          announcements.forEach((ann, index) => {
            
          });
          setItems(announcements);
          setCurrentIndex(0);
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [apiBase, token]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  if (loading) {
    return null;
  }
  if (!items.length) {
    // Show a test announcement for debugging
    return (
      <div className="announcement-bar">
        <div className="announcement-container">
          <div className="announcement-content">
            <div className="announcement-body">
              <p>No announcements</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentAnnouncement = items[currentIndex];
  if (!currentAnnouncement) return null;

  const getPriorityClass = (priority: number) => {
    if (priority >= 3) return 'priority-high';
    if (priority >= 2) return 'priority-medium';
    return 'priority-low';
  };

  return (
    <div className={`announcement-bar ${getPriorityClass(currentAnnouncement.priority)}`} data-announcement-id={currentAnnouncement._id}>
      <div className="announcement-container">
        {/* Navigation arrows */}
        {items.length > 1 && (
          <>
            <button 
              className="announcement-nav announcement-nav-left"
              onClick={handlePrevious}
              aria-label="Previous announcement"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className="announcement-nav announcement-nav-right"
              onClick={handleNext}
              aria-label="Next announcement"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Announcement content */}
        <div className="announcement-content">
          <div 
            className="announcement-body"
            dangerouslySetInnerHTML={{ 
              __html: currentAnnouncement.type === 'html' 
                ? currentAnnouncement.content 
                : `<p>${currentAnnouncement.content}</p>`
            }}
          />
        </div>
      </div>
    </div>
  );
}


