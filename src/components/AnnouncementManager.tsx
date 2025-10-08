import { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Eye, EyeOff, Calendar, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: 'html' | 'text';
  isActive: boolean;
  priority: number;
  startDate: string;
  endDate?: string;
  targetAudience: 'all' | 'logged_in' | 'guests';
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'html' as 'html' | 'text',
  });
  const { toast } = useToast();

  const token = localStorage.getItem('adminToken');
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/announcement/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status) {
        setAnnouncements(data.announcements || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch announcements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch(`${apiBase}/api/announcement/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.status) {
        toast({
          title: 'Success',
          description: 'Announcement created successfully',
        });
        setIsCreateOpen(false);
        resetForm();
        fetchAnnouncements();
      } else {
        throw new Error(data.msg || 'Failed to create announcement');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create announcement',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingAnnouncement) return;
    try {
      const res = await fetch(`${apiBase}/api/announcement/admin/${editingAnnouncement._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.status) {
        toast({
          title: 'Success',
          description: 'Announcement updated successfully',
        });
        setIsEditOpen(false);
        setEditingAnnouncement(null);
        resetForm();
        fetchAnnouncements();
      } else {
        throw new Error(data.msg || 'Failed to update announcement');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update announcement',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${apiBase}/api/announcement/admin/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status) {
        toast({
          title: 'Success',
          description: 'Announcement deleted successfully',
        });
        fetchAnnouncements();
      } else {
        throw new Error(data.msg || 'Failed to delete announcement');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete announcement',
        variant: 'destructive',
      });
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${apiBase}/api/announcement/admin/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status) {
        toast({
          title: 'Success',
          description: `Announcement ${!currentStatus ? 'activated' : 'deactivated'}`,
        });
        fetchAnnouncements();
      } else {
        throw new Error(data.msg || 'Failed to toggle announcement');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to toggle announcement',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'html',
    });
  };

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
    });
    setIsEditOpen(true);
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return 'text-red-600 bg-red-50';
    if (priority >= 2) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getTargetAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'all': return 'All Users';
      case 'logged_in': return 'Logged In Users';
      case 'guests': return 'Guests Only';
      default: return audience;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-white">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">HTML Announcements</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="text-white bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-[#0F0F0F] border border-[#2A2A2A] text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Announcement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter announcement title"
                  className="text-white placeholder:text-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="type" className="text-white">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'html' | 'text') => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="html" className="text-white hover:bg-gray-700">HTML</SelectItem>
                    <SelectItem value="text" className="text-white hover:bg-gray-700">Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="content" className="text-white">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={formData.type === 'html' ? 'Enter HTML content' : 'Enter text content'}
                  rows={6}
                  className="text-white placeholder:text-gray-300"
                />
                {formData.type === 'html' && (
                  <p className="text-sm text-white mt-1">
                    You can use HTML tags like &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, etc.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="text-white">
                Cancel
              </Button>
              <Button onClick={handleCreate} className="text-white">Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {announcements.map((announcement) => (
          <Card key={announcement._id} className={`${!announcement.isActive ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-white">
                    {announcement.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-white mt-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {getTargetAudienceLabel(announcement.targetAudience)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(announcement.startDate).toLocaleDateString()}
                    </span>
                    <span>Type: {announcement.type.toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                 
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(announcement)}
                    className="text-white hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(announcement._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-white">
                  <strong>Content Preview:</strong>
                </div>
                <div 
                  className="prose prose-sm max-w-none text-white"
                  dangerouslySetInnerHTML={{ 
                    __html: announcement.type === 'html' 
                      ? announcement.content 
                      : `<p>${announcement.content}</p>`
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl bg-[#0F0F0F] border border-[#2A2A2A] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title" className="text-white">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter announcement title"
                className="text-white placeholder:text-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="edit-type" className="text-white">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'html' | 'text') => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="html" className="text-white hover:bg-gray-700">HTML</SelectItem>
                  <SelectItem value="text" className="text-white hover:bg-gray-700">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-content" className="text-white">Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder={formData.type === 'html' ? 'Enter HTML content' : 'Enter text content'}
                rows={6}
                className="text-white placeholder:text-gray-300"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="text-white">
              Cancel
            </Button>
            <Button onClick={handleUpdate} className="text-white">Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
