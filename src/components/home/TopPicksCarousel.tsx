import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TopPick {
  id: number;
  name: string;
  image: string;
  description: string;
  rating: number;
}

const TopPicksCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const topPicks: TopPick[] = [
    {
      id: 1,
      name: 'Premium Earl Grey',
      image: '/lovable-uploads/elachi tea.webp',
      description: 'Aromatic blend with bergamot essence, perfect for afternoon tea moments',
      rating: 4.8
    },
    {
      id: 2,
      name: 'Himalayan Green Tea',
      image: '/lovable-uploads/greentea.webp',
      description: 'Fresh mountain tea with natural antioxidants for health and wellness',
      rating: 4.9
    },
    {
      id: 3,
      name: 'Royal Masala Chai',
      image: '/lovable-uploads/icecream.webp',
      description: 'Traditional spice blend for authentic Indian chai experience',
      rating: 4.7
    },
    {
      id: 4,
      name: 'Chamomile Dreams',
      image: '/lovable-uploads/bluepeatea.webp',
      description: 'Relaxing herbal tea for peaceful evenings and better sleep',
      rating: 4.6
    },
    {
      id: 5,
      name: 'Dragon Well Green',
      image: '/lovable-uploads/kitkatmilkshake.webp',
      description: 'Premium Chinese green tea with delicate flavor and rich heritage',
      rating: 4.8
    },
    {
      id: 6,
      name: 'English Breakfast',
      image: '/lovable-uploads/salad.webp',
      description: 'Classic morning blend with robust flavor to start your day right',
      rating: 4.7
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === topPicks.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? topPicks.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 2000);

    return () => clearInterval(interval);
  }, [currentIndex, isHovered]);

  return (
    <section className="py-16 bg-white overflow-hidden">
      <style>
        {`
          .carousel-container-enhanced {
            position: relative;
            overflow: hidden;
          }
          
          .carousel-track-enhanced {
            display: flex;
            transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            gap: 1.5rem;
          }
          
          .carousel-item-enhanced {
            flex: 0 0 calc(33.333% - 1rem);
            min-width: 300px;
          }
          
          @media (max-width: 768px) {
            .carousel-item-enhanced {
              flex: 0 0 calc(100% - 1rem);
            }
          }
          
          @media (min-width: 769px) and (max-width: 1024px) {
            .carousel-item-enhanced {
              flex: 0 0 calc(50% - 1rem);
            }
          }
        `}
      </style>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Top Picks</h2>
          <p className="text-lg text-gray-600 mb-6">Discover our most loved tea selections crafted with perfection</p>
          <Link to="/about">
            <Button 
              className="text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              style={{ 
                backgroundColor: 'rgb(0, 100, 55)',
                borderColor: 'rgb(0, 100, 55)'
              }}
            >
              Know Us More
            </Button>
          </Link>
        </div>

        <div 
          className="relative carousel-container-enhanced"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Carousel Container */}
          <div className="overflow-hidden rounded-2xl">
            <div 
              className="carousel-track-enhanced"
              style={{
                transform: `translateX(-${currentIndex * (100 / 3)}%)`,
              }}
            >
              {topPicks.concat(topPicks.slice(0, 3)).map((item, index) => (
                <div key={`${item.id}-${index}`} className="carousel-item-enhanced">
                  <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 bg-white border border-gray-300 shadow-lg overflow-hidden h-full">
                    <div className="aspect-square overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-6 flex flex-col justify-between flex-1 border-t border-gray-200">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 
                            className="font-bold text-xl text-gray-900 group-hover:transition-colors duration-300"
                            style={{ color: 'rgb(0, 100, 55)' }}
                          >
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold text-yellow-700">{item.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-xl border border-gray-300 hover:scale-110 transition-all duration-300 z-20"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-xl border border-gray-300 hover:scale-110 transition-all duration-300 z-20"
            onClick={nextSlide}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-3">
            {topPicks.map((_, index) => (
              <button
                key={index}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-8 h-3 shadow-lg border border-gray-300'
                    : 'w-3 h-3 bg-gray-300 hover:bg-gray-400 hover:scale-125 border border-gray-400'
                }`}
                style={{
                  backgroundColor: index === currentIndex ? 'rgb(0, 100, 55)' : undefined
                }}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopPicksCarousel;