import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertCircle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Blog {
  _id: string;
  title: string;
  image?: string;
  head: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

interface BlogFormData {
  title: string;
  image: string;
  head: string;
  body: string;
}

const BlogManagement: React.FC = () => {
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAddBlogModal, setShowAddBlogModal] = useState(false);
  const [showEditBlogModal, setShowEditBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [blogFormData, setBlogFormData] = useState<BlogFormData>({
    title: '',
    image: '',
    head: '',
    body: ''
  });
  const [isSubmittingBlog, setIsSubmittingBlog] = useState(false);

  // Fetch blogs (paginated)
  const fetchBlogs = async (targetPage: number = 1, limit: number = 10) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/blogs?page=${targetPage}&limit=${limit}` , {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
        setPage(data.page || 1);
        setPages(data.pages || 1);
        setTotal(data.total || (data.blogs?.length ?? 0));
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  // Create blog
  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBlog(true);

    try {
      // If a File object was stored temporarily in image (as data URL), upload it first
      if ((blogFormData as any)._imageFile instanceof File) {
        const formData = new FormData();
        formData.append('image', (blogFormData as any)._imageFile);
        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/blogs/upload-image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
          body: formData
        });
        if (uploadRes.ok) {
          const up = await uploadRes.json();
          if (up.url) blogFormData.image = up.url;
        }
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(blogFormData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Blog created successfully",
        });
        setShowAddBlogModal(false);
        setBlogFormData({ title: '', image: '', head: '', body: '' });
        fetchBlogs();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to create blog');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create blog",
      });
    } finally {
      setIsSubmittingBlog(false);
    }
  };

  // Edit blog
  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setBlogFormData({
      title: blog.title || '',
      image: blog.image || '',
      head: blog.head || '',
      body: blog.body || ''
    });
    setShowEditBlogModal(true);
  };

  // Update blog
  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBlog(true);

    try {
      if ((blogFormData as any)._imageFile instanceof File) {
        const formData = new FormData();
        formData.append('image', (blogFormData as any)._imageFile);
        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/blogs/upload-image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
          body: formData
        });
        if (uploadRes.ok) {
          const up = await uploadRes.json();
          if (up.url) blogFormData.image = up.url;
        }
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/blogs/${editingBlog?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(blogFormData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Blog updated successfully",
        });
        setShowEditBlogModal(false);
        setEditingBlog(null);
        setBlogFormData({ title: '', image: '', head: '', body: '' });
        fetchBlogs();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to update blog');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update blog",
      });
    } finally {
      setIsSubmittingBlog(false);
    }
  };

  // Delete blog
  const handleDeleteBlog = async (blogId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Blog deleted successfully",
        });
        fetchBlogs();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to delete blog');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete blog",
      });
    }
  };

  useEffect(() => {
    fetchBlogs(1);
  }, []);

  return (
    <div className="space-y-6">
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Blog Management ({total} Blogs)</CardTitle>
            <Button
              onClick={() => setShowAddBlogModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Blog
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {blogs.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold text-white mb-2">No Blogs Yet</h3>
              <p className="text-gray-400">Create your first blog post to get started</p>
            </div>
          ) : (
            <>
            <div className="grid gap-4">
              {blogs.map((blog) => (
                <div key={blog._id} className="border border-[#2A2A2A] rounded-lg p-4 bg-[#2A2A2A]">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{blog.title}</h3>
                      {blog.image && (
                        <img src={blog.image} alt={blog.title} className="mb-3 max-h-40 rounded" />
                      )}
                      <h4 className="font-medium text-white mb-2">Head:</h4>
                      <div 
                        className="text-sm text-gray-300 mb-3 p-2 bg-[#1A1A1A] rounded border"
                        dangerouslySetInnerHTML={{ __html: blog.head }}
                      />
                      <h4 className="font-medium text-white mb-2">Body:</h4>
                      <div 
                        className="text-sm text-gray-300 p-2 bg-[#1A1A1A] rounded border max-h-32 overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: blog.body }}
                      />
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        onClick={() => handleEditBlog(blog)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteBlog(blog._id)}
                        size="sm"
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Created: {new Date(blog.createdAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(blog.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Button variant="outline" disabled={page<=1} onClick={() => fetchBlogs(page-1)} className="border-[#2A2A2A] text-white">
                Previous
              </Button>
              <span className="text-gray-300 text-sm">Page {page} of {pages}</span>
              <Button variant="outline" disabled={page>=pages} onClick={() => fetchBlogs(page+1)} className="border-[#2A2A2A] text-white">
                Next
              </Button>
            </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Blog Modal */}
      <Dialog open={showAddBlogModal} onOpenChange={setShowAddBlogModal}>
        <DialogContent className="max-w-4xl w-full bg-[#181818] border border-[#333] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Add New Blog</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateBlog} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="blogTitle" className="text-white">Title</Label>
                <Input
                  id="blogTitle"
                  value={blogFormData.title}
                  onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                  placeholder="Enter blog title"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <Label htmlFor="blogImage" className="text-white">Image</Label>
                <Input
                  id="blogImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setBlogFormData({ ...blogFormData, image: blogFormData.image, ...(file ? { _imageFile: file } as any : {}) });
                  }}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-400"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="blogHead" className="text-white">Head (HTML)</Label>
              <Textarea
                id="blogHead"
                value={blogFormData.head}
                onChange={(e) => setBlogFormData({ ...blogFormData, head: e.target.value })}
                placeholder="Enter HTML content for the blog head..."
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-400 min-h-[100px]"
              />
              <p className="text-xs text-gray-400 mt-1">You can use HTML tags like &lt;h1&gt;, &lt;p&gt;, &lt;strong&gt;, etc.</p>
            </div>
            <div>
              <Label htmlFor="blogBody" className="text-white">Body (HTML)</Label>
              <Textarea
                id="blogBody"
                value={blogFormData.body}
                onChange={(e) => setBlogFormData({ ...blogFormData, body: e.target.value })}
                placeholder="Enter HTML content for the blog body..."
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-400 min-h-[200px]"
                required
              />
              <p className="text-xs text-gray-400 mt-1">You can use HTML tags like &lt;h1&gt;, &lt;p&gt;, &lt;strong&gt;, etc.</p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddBlogModal(false);
                  setBlogFormData({ title: '', image: '', head: '', body: '' });
                }}
                className="border-[#2A2A2A] text-white hover:bg-[#2A2A2A]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingBlog}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmittingBlog ? 'Creating...' : 'Create Blog'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Blog Modal */}
      <Dialog open={showEditBlogModal} onOpenChange={setShowEditBlogModal}>
        <DialogContent className="max-w-4xl w-full bg-[#181818] border border-[#333] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Edit Blog</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateBlog} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editBlogTitle" className="text-white">Title</Label>
                <Input
                  id="editBlogTitle"
                  value={blogFormData.title}
                  onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                  placeholder="Enter blog title"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <Label htmlFor="editBlogImage" className="text-white">Image</Label>
                <Input
                  id="editBlogImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setBlogFormData({ ...blogFormData, image: blogFormData.image, ...(file ? { _imageFile: file } as any : {}) });
                  }}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-400"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editBlogHead" className="text-white">Head (HTML)</Label>
              <Textarea
                id="editBlogHead"
                value={blogFormData.head}
                onChange={(e) => setBlogFormData({ ...blogFormData, head: e.target.value })}
                placeholder="Enter HTML content for the blog head..."
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-400 min-h-[100px]"
                required
              />
              <p className="text-xs text-gray-400 mt-1">You can use HTML tags like &lt;h1&gt;, &lt;p&gt;, &lt;strong&gt;, etc.</p>
            </div>
            <div>
              <Label htmlFor="editBlogBody" className="text-white">Body (HTML)</Label>
              <Textarea
                id="editBlogBody"
                value={blogFormData.body}
                onChange={(e) => setBlogFormData({ ...blogFormData, body: e.target.value })}
                placeholder="Enter HTML content for the blog body..."
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-400 min-h-[200px]"
                required
              />
              <p className="text-xs text-gray-400 mt-1">You can use HTML tags like &lt;h1&gt;, &lt;p&gt;, &lt;strong&gt;, etc.</p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditBlogModal(false);
                  setEditingBlog(null);
                  setBlogFormData({ title: '', image: '', head: '', body: '' });
                }}
                className="border-[#2A2A2A] text-white hover:bg-[#2A2A2A]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingBlog}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmittingBlog ? 'Updating...' : 'Update Blog'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManagement;
