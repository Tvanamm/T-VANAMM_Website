import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  linkTo: string; 
}

const slides: CarouselSlide[] = [
  {
    id: 1,
    title: "Tea That Suits You!",
    subtitle: "Premium Tea Experience",
    description: "Discover the finest collection of handpicked teas from around the world. Each blend crafted with love and tradition.",
    image: "/lovable-uploads/carousal2.webp",
    buttonText: "Explore Now",
    linkTo: "/Franchise"
  },
  {
    id: 2,
    title: "The Taste of Purity",
    subtitle: "100% Natural & Organic",
    description: "Experience authentic flavors with our sustainably sourced, premium quality tea blends.",
    image: "/lovable-uploads/carousal1.webp",
    buttonText: "Shop Collection",
    linkTo: "/Order"
  },
  {
    id: 3,
    title: "Wellness in Every Sip",
    subtitle: "Health & Harmony",
    description: "Rich in antioxidants and natural benefits, our teas promote wellness and mindful living.",
    image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=1920&h=1080&fit=crop",
    buttonText: "Learn More",
    linkTo: "/About"
  },
  {
    id: 4,
    title: "Discover Tea Wisdom",
    subtitle: "From Our Tea Blog",
    description: "Explore insightful articles, brewing tips, and the latest tea trends from our expert tea masters.",
    image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=1920&h=1080&fit=crop",
    buttonText: 'Explore Our Blogs',
    linkTo: '/Blog'
  }
];

const AnimatedText = ({ text, className, delay = 0 }: { text: string; className: string; delay?: number }) => {
  const [visibleLetters, setVisibleLetters] = useState(0);

  useEffect(() => {
    setVisibleLetters(0);
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setVisibleLetters(prev => {
          if (prev >= text.length) {
            clearInterval(interval);
            return text.length;
          }
          return prev + 1;
        });
      }, 100);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [text, delay]);

  return (
    <div className={className}>
      {text.split('').map((letter, index) => (
        <span
          key={index}
          className={`inline-block transition-all duration-300 ${
            index < visibleLetters 
              ? 'opacity-100 transform translate-y-0' 
              : 'opacity-0 transform -translate-y-4'
          }`}
          style={{ transitionDelay: `${index * 50}ms` }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </span>
      ))}
    </div>
  );
};

const AnimatedHeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentSlide]);

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          {/* Only show subtitle if it exists */}
          {currentSlideData.subtitle && (
            <AnimatedText
              text={currentSlideData.subtitle}
              className="text-lg md:text-xl font-medium mb-4"
              delay={200}
            />
          )}
          
          {/* Only show title if it exists */}
          {currentSlideData.title && (
            <AnimatedText
              text={currentSlideData.title}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
              delay={600}
            />
          )}
          
          {/* Only show description if it exists */}
          {currentSlideData.description && (
            <div className="opacity-0 animate-fade-in text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
                 style={{ animationDelay: '1.5s', animationFillMode: 'forwards' }}>
              {currentSlideData.description}
            </div>
          )}
          
          {/* Button - always shown */}
          <div className="opacity-0 animate-fade-in"
               style={{ animationDelay: '2s', animationFillMode: 'forwards' }}>
            <Link to={currentSlideData.linkTo} className="inline-block">
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg hover-scale"
                style={{ backgroundColor: 'rgb(0, 100, 55)' }}
              >
                {currentSlideData.buttonText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover-scale"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={nextSlide}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover-scale"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            style={{ 
              backgroundColor: index === currentSlide ? 'rgb(0, 100, 55)' : undefined 
            }}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-8 right-8 bg-black/30 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
        {currentSlide + 1} / {slides.length}
      </div>
    </section>
  );
};

export default AnimatedHeroCarousel;
