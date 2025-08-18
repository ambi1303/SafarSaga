import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: '10 Hidden Gems in Southeast Asia You Must Visit',
    excerpt: 'Discover breathtaking destinations off the beaten path that will transform your perspective on travel in Southeast Asia.',
    image: 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    author: 'Sarah Johnson',
    date: '2025-01-15',
    readTime: '8 min read',
    category: 'Destinations',
    featured: true
  },
  {
    id: 2,
    title: 'The Ultimate Packing Guide for Adventure Travel',
    excerpt: 'Essential items and expert tips to pack smart for your next adventure, from hiking gear to weather protection.',
    image: 'https://images.pexels.com/photos/2387532/pexels-photo-2387532.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    author: 'Michael Chen',
    date: '2025-01-12',
    readTime: '6 min read',
    category: 'Travel Tips'
  },
  {
    id: 3,
    title: 'Budget-Friendly European Cities for Digital Nomads',
    excerpt: 'Explore affordable European destinations perfect for remote workers, complete with co-working spaces and vibrant communities.',
    image: 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    author: 'Emily Rodriguez',
    date: '2025-01-10',
    readTime: '10 min read',
    category: 'Digital Nomad'
  },
  {
    id: 4,
    title: 'Photography Tips for Capturing Stunning Travel Moments',
    excerpt: 'Learn professional techniques to take Instagram-worthy photos during your travels, from golden hour to composition.',
    image: 'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    author: 'David Kim',
    date: '2025-01-08',
    readTime: '7 min read',
    category: 'Photography'
  },
  {
    id: 5,
    title: 'Sustainable Travel: How to Explore Responsibly',
    excerpt: 'Make a positive impact while traveling with these eco-friendly practices and sustainable tourism tips.',
    image: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    author: 'Lisa Wang',
    date: '2025-01-05',
    readTime: '9 min read',
    category: 'Sustainability'
  },
  {
    id: 6,
    title: 'Food Adventures: Street Food Capitals of the World',
    excerpt: 'Embark on a culinary journey through the world\'s best street food destinations and local delicacies.',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    author: 'Carlos Martinez',
    date: '2025-01-03',
    readTime: '11 min read',
    category: 'Food & Culture'
  }
];

const categories = ['All', 'Destinations', 'Travel Tips', 'Digital Nomad', 'Photography', 'Sustainability', 'Food & Culture'];

export default function BlogPage() {
  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-64 bg-sky-900 flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url("https://images.pexels.com/photos/1658967/pexels-photo-1658967.jpeg?auto=compress&cs=tinysrgb&w=1920&h=400&fit=crop")'
          }}
        />
        <div className="relative z-10 container mx-auto px-4 text-white">
          <h1 className="text-5xl font-bold mb-4">Travel Blog</h1>
          <p className="text-xl">Stories, tips, and inspiration for your next adventure</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Featured Article</h2>
            <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge className="bg-orange-500 hover:bg-orange-600">
                      {featuredPost.category}
                    </Badge>
                    <Badge variant="outline">Featured</Badge>
                  </div>
                  <h3 className="text-3xl font-bold mb-4 hover:text-sky-600 transition-colors">
                    <Link href={`/blog/${featuredPost.id}`}>
                      {featuredPost.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {featuredPost.author}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(featuredPost.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {featuredPost.readTime}
                    </div>
                  </div>
                  <Button asChild className="bg-sky-600 hover:bg-sky-700">
                    <Link href={`/blog/${featuredPost.id}`}>
                      Read Full Article
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                className="hover:bg-sky-50 hover:border-sky-600 hover:text-sky-600"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <Card key={post.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="relative overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-gray-900 hover:bg-white">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-3 group-hover:text-sky-600 transition-colors leading-tight">
                    <Link href={`/blog/${post.id}`}>
                      {post.title}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {new Date(post.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <Link
                      href={`/blog/${post.id}`}
                      className="text-sky-600 hover:text-sky-700 font-medium text-sm"
                    >
                      Read More →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="text-center">
          <Card className="inline-block p-8 bg-sky-50 border-sky-200">
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Subscribe to our newsletter for the latest travel tips, destination guides, and exclusive offers.
            </p>
            <div className="flex gap-3 max-w-sm mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <Button className="bg-orange-500 hover:bg-orange-600">
                Subscribe
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}