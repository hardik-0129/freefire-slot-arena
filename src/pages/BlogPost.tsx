import Footer from '@/components/Footer'
import { Header } from '@/components/Header'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

interface BlogPost {
  _id: string;
  title: string;
  image?: string;
  head: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

const BlogPostPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetSlug = useMemo(() => (params.slug || '').toLowerCase(), [params.slug]);

  useEffect(() => {
    const fetchOne = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/blogs`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const blogs: BlogPost[] = data.blogs || [];
        const matched = blogs.find(b => slugify(b.title) === targetSlug) || null;
        setBlog(matched);
        if (!matched) setError('Blog not found');
      } catch (e) {
        setError('Failed to load blog');
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [targetSlug]);

  return (
    <>
      <Header />
      <section className="py-10 match-section bg-white">
        <div className="container max-w-3xl">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 border rounded text-black hover:bg-gray-100"
          >
            ← Back to Blog
          </button>
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : !blog ? (
            <p className="text-center">Not found</p>
          ) : (
            <article>
              {blog.image && (
                <img src={blog.image} alt={blog.title} className="w-full h-64 object-cover rounded-xl mb-6" />
              )}
              <div className="text-xs text-gray-500 mb-2">{new Date(blog.createdAt).toLocaleDateString()}</div>
              <h1 className="text-3xl font-bold mb-6 text-black">{blog.title}</h1>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: blog.body }} />
            </article>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default BlogPostPage;


