
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface NavigationBreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const NavigationBreadcrumb: React.FC<NavigationBreadcrumbProps> = ({ 
  items: customItems,
  className 
}) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs based on current path if no custom items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/franchise-dashboard' }
    ];

    // Add breadcrumbs based on current route
    if (pathSegments.includes('order')) {
      breadcrumbs.push({ label: 'Browse Inventory', href: '/order' });
    }
    
    if (pathSegments.includes('order-checkout')) {
      breadcrumbs.push({ label: 'Browse Inventory', href: '/order' });
      breadcrumbs.push({ label: 'Checkout', active: true });
    }

    return breadcrumbs;
  };

  const items = customItems || generateBreadcrumbs();

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          
          {item.href && !item.active ? (
            <Link
              to={item.href}
              className="hover:text-foreground transition-colors"
            >
              {index === 0 ? (
                <div className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
              ) : (
                item.label
              )}
            </Link>
          ) : (
            <span className={cn(
              index === 0 ? "flex items-center gap-1" : "",
              item.active ? "text-foreground font-medium" : ""
            )}>
              {index === 0 && <Home className="h-4 w-4" />}
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default NavigationBreadcrumb;
