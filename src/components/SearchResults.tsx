import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Coffee, BookOpen, Droplets, IceCream } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResultsProps {
  query: string;
  onClose: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ query, onClose }) => {
  const [results, setResults] = useState<any[]>([]);

  // Mock data for search results
  const mockProducts = [
    { id: 1, name: "Earl Grey Supreme", category: "Tea", price: 299, type: 'tea', icon: Coffee },
    { id: 2, name: "Himalayan Green Tea", category: "Tea", price: 349, type: 'tea', icon: Coffee },
    { id: 3, name: "Masala Chai Blend", category: "Tea", price: 279, type: 'tea', icon: Coffee },
    { id: 4, name: "Chamomile Dreams", category: "Tea", price: 329, type: 'tea', icon: Coffee },
    { id: 5, name: "Orange Fresh Juice", category: "Juice", price: 199, type: 'juice', icon: Droplets },
    { id: 6, name: "Mango Delight Juice", category: "Juice", price: 229, type: 'juice', icon: Droplets },
    { id: 7, name: "Apple Cinnamon Juice", category: "Juice", price: 219, type: 'juice', icon: Droplets },
    { id: 8, name: "Vanilla Bean Ice-Cream", category: "Ice-Cream", price: 149, type: 'ice-cream', icon: IceCream },
    { id: 9, name: "Chocolate Fudge Ice-Cream", category: "Ice-Cream", price: 169, type: 'ice-cream', icon: IceCream },
    { id: 10, name: "Strawberry Swirl Ice-Cream", category: "Ice-Cream", price: 159, type: 'ice-cream', icon: IceCream },
  ];

  const mockBlogs = [
    { id: 1, title: "Health Benefits of Green Tea", category: "Health", type: 'blog', icon: BookOpen },
    { id: 2, title: "The Art of Tea Brewing", category: "Culture", type: 'blog', icon: BookOpen },
    { id: 3, title: "Masala Chai: A Cultural Journey", category: "Culture", type: 'blog', icon: BookOpen },
    { id: 4, title: "Best Juice Combinations for Summer", category: "Health", type: 'blog', icon: BookOpen },
    { id: 5, title: "Ice-Cream Making Techniques", category: "Food", type: 'blog', icon: BookOpen },
  ];

  useEffect(() => {
    if (query.length > 0) {
      const filteredProducts = mockProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );

      const filteredBlogs = mockBlogs.filter(blog => 
        blog.title.toLowerCase().includes(query.toLowerCase()) ||
        blog.category.toLowerCase().includes(query.toLowerCase())
      );

      setResults([...filteredProducts, ...filteredBlogs]);
    } else {
      setResults([]);
    }
  }, [query]);

  if (query.length === 0) {
    return null;
  }

  if (results.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-emerald-200 rounded-lg shadow-lg mt-1 p-4 z-50">
        <div className="text-center text-gray-500">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No results found for "{query}"</p>
          <p className="text-sm text-gray-400 mt-1">Try searching for tea, juice, or ice-cream</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-emerald-200 rounded-lg shadow-lg mt-1 z-50 max-h-96 overflow-y-auto">
      <div className="p-4">
        <h3 className="font-semibold text-emerald-800 mb-3">Search Results ({results.length})</h3>
        <div className="space-y-2">
          {results.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={`${item.type}-${item.id}`}
                to={item.type === 'blog' ? `/blog` : `/order`}
                onClick={onClose}
                className="block hover:bg-emerald-50 p-3 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className={cn(
                    "h-5 w-5",
                    item.type === 'tea' ? "text-green-600" :
                    item.type === 'juice' ? "text-orange-600" :
                    item.type === 'ice-cream' ? "text-pink-600" :
                    "text-blue-600"
                  )} />
                  <div className="flex-1">
                    <div className="font-medium text-emerald-800">
                      {item.type === 'blog' ? item.title : item.name}
                    </div>
                    <div className="text-sm text-emerald-600 flex items-center space-x-2">
                      <span>{item.category}</span>
                      {item.price && (
                        <>
                          <span>•</span>
                          <span className="font-medium">₹{item.price}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    item.type === 'tea' ? "border-green-200 text-green-700" :
                    item.type === 'juice' ? "border-orange-200 text-orange-700" :
                    item.type === 'ice-cream' ? "border-pink-200 text-pink-700" :
                    "border-blue-200 text-blue-700"
                  )}>
                    {item.type === 'blog' ? 'Blog' : item.category}
                  </Badge>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
