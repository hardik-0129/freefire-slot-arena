import Footer from '@/components/Footer'
import { Header } from '@/components/Header'
import { useState, useEffect } from 'react'

interface BlogPost {
  _id: string;
  title: string;
  image?: string;
  head: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

const Blog = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    useEffect(() => {
        fetchBlogs(1);
    }, []);

	// Update document head with blog head content (safe, merges into existing global tags)
	useEffect(() => {
		if (blogs.length === 0) return;

		const firstBlogHead = blogs[0].head;
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = firstBlogHead || '';

		// Allow only a safe subset of elements
		const allowedSelectors = ['title', 'meta', 'link', 'style'];
		const headElements = tempDiv.querySelectorAll(allowedSelectors.join(','));

		const addedNodes: Node[] = [];
		const restorers: Array<() => void> = [];

		headElements.forEach((element) => {
			const tag = element.tagName;
			if (tag === 'TITLE') {
				const previousTitle = document.title;
				document.title = element.textContent || 'Blog';
				restorers.push(() => {
					document.title = previousTitle;
				});
				return;
			}

			if (tag === 'META') {
				const name = element.getAttribute('name');
				const property = element.getAttribute('property');
				const selector = name ? `meta[name="${name}"]` : property ? `meta[property="${property}"]` : null;
				const content = element.getAttribute('content') ?? '';
				if (selector) {
					const existing = document.head.querySelector(selector) as HTMLMetaElement | null;
					if (existing) {
						const prev = existing.getAttribute('content');
						existing.setAttribute('content', content);
						restorers.push(() => {
							if (prev === null) existing.removeAttribute('content');
							else existing.setAttribute('content', prev);
						});
						return;
					}
				}
				const cloned = element.cloneNode(true) as HTMLElement;
				cloned.setAttribute('data-blog-head', 'true');
				document.head.appendChild(cloned);
				addedNodes.push(cloned);
				return;
			}

			if (tag === 'LINK') {
				const rel = element.getAttribute('rel');
				if (rel) {
					const existing = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
					if (existing) {
						const prevHref = existing.getAttribute('href');
						const newHref = element.getAttribute('href') ?? '';
						existing.setAttribute('href', newHref);
						restorers.push(() => {
							if (prevHref === null) existing.removeAttribute('href');
							else existing.setAttribute('href', prevHref);
						});
						return;
					}
				}
				const cloned = element.cloneNode(true) as HTMLElement;
				cloned.setAttribute('data-blog-head', 'true');
				document.head.appendChild(cloned);
				addedNodes.push(cloned);
				return;
			}

			if (tag === 'STYLE') {
				// Append styles as new nodes, remove later
				const cloned = element.cloneNode(true) as HTMLElement;
				cloned.setAttribute('data-blog-head', 'true');
				document.head.appendChild(cloned);
				addedNodes.push(cloned);
				return;
			}
		});

		return () => {
			// Restore any modified global tags
			restorers.forEach((fn) => fn());
			// Remove nodes that we added
			addedNodes.forEach((node) => {
				node.parentNode?.removeChild(node);
			});
		};
	}, [blogs]);

    const fetchBlogs = async (page: number) => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/blogs?page=${page}&limit=9`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch blogs');
            }
            
            const data = await response.json();
            setBlogs(data.blogs || []);
            setPage(data.page || 1);
            setPages(data.pages || 1);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setError('Failed to load blog posts');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <section className="py-16 match-section">
                <div className="container">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold text-center mb-8 sm:mb-12 px-4">
                        Blog
                    </h2>
                    
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            <p className="text-white mt-4">Loading blog posts...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-400">{error}</p>
                            <button 
                                onClick={() => fetchBlogs(1)}
                                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-400">No blog posts available yet.</p>
                        </div>
                    ) : (
                        <>
                        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                            {blogs.map((blog) => (
                                <article
                                    key={blog._id}
                                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition"
                                    onClick={() => {
                                        const slug = blog.title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                                        window.location.href = `/blog/${slug}`;
                                    }}
                                >
                                    {/* Image */}
                                    {blog.image ? (
                                        <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover" />
                                    ) : (
                                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">No image</div>
                                    )}
                                    {/* Content */}
                                    <div className="p-4">
                                        <div className="text-xs text-gray-500 mb-2">
                                            {new Date(blog.createdAt).toLocaleDateString()}
                                        </div>
                                        <h3 className="text-lg font-bold text-black mb-2">
                                            {blog.title}
                                        </h3>
                                        {/* Optional short body preview if body has plain text */}
                                        {/* {blog.body && (
                                            <div className="text-sm text-gray-700 line-clamp-3" dangerouslySetInnerHTML={{ __html: blog.body }} />
                                        )} */}
                                    </div>
                                </article>
                            ))}
                        </div>
                        {/* Pagination */}
                        <div className="max-w-6xl mx-auto flex items-center justify-center gap-3 mt-8">
                            <button
                                disabled={page <= 1}
                                onClick={() => fetchBlogs(page - 1)}
                                className="px-4 py-2 rounded border disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600">Page {page} of {pages}</span>
                            <button
                                disabled={page >= pages}
                                onClick={() => fetchBlogs(page + 1)}
                                className="px-4 py-2 rounded border disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        </>
                    )}
                </div>
            </section>
            <Footer />
        </>
    )
}

export default Blog
