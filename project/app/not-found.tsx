import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-sky-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. 
            Perhaps you'd like to explore our amazing destinations instead?
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full bg-sky-600 hover:bg-sky-700">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/destinations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Explore Destinations
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}