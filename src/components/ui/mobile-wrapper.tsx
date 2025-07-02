
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileWrapperProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
}

const MobileWrapper: React.FC<MobileWrapperProps> = ({
  children,
  className,
  mobileClassName,
  desktopClassName
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      className,
      isMobile ? mobileClassName : desktopClassName
    )}>
      {children}
    </div>
  );
};

export default MobileWrapper;
