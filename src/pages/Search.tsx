
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ModernNavbar from '@/components/ModernNavbar';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  // Mock products for demonstration
  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Premium Green Tea',
      price: 299,
      image: '/placeholder.svg',
      description: 'High-quality green tea with antioxidants',
      category: 'Tea'
    },
    {
      id: 2,
      name: 'Earl Grey Tea',
      price: 349,
      image: '/placeholder.svg',
      description: 'Classic Earl Grey with bergamot',
      category: 'Tea'
    },
    {
      id: 3,
      name: 'Chamomile Tea',
      price: 249,
      image: '/placeholder.svg',
      description: 'Relaxing herbal chamomile tea',
      category: 'Herbal'
    },
    {
      id: 4,
      name: 'Tea Infuser',
      price: 199,
      image: '/placeholder.svg',
      description: 'Stainless steel tea infuser',
      category: 'Accessories'
    }
  ];

  useEffect(() => {
    if (query) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const results = mockProducts.filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(results);
        setLoading(false);
      }, 500);
    }
  }, [query]);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: 'Medium',
      image: product.image,
      category: product.category
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <ModernNavbar />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Results</h1>
          {query && (
            <p className="text-gray-600 mb-4">
              Showing results for: <span className="font-semibold">"{query}"</span>
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600">Searching...</span>
          </div>
        ) : (
          <>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-emerald-600">₹{product.price}</span>
                        <Button
                          onClick={() => handleAddToCart(product)}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">No products found</h2>
                <p className="text-gray-500">
                  {query ? `No results found for "${query}"` : 'Try searching for tea products, accessories, or herbs'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
