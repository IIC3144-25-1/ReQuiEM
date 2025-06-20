import React from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton } from '@/components/ui/skeleton';

describe('Skeleton Component', () => {
  describe('Rendering', () => {
    it('should render skeleton element', () => {
      render(<Skeleton data-testid="skeleton" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeInTheDocument();
    });

    it('should render with default classes', () => {
      render(<Skeleton data-testid="skeleton" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-pulse');
      expect(skeleton).toHaveClass('rounded-md');
      expect(skeleton).toHaveClass('bg-muted');
    });

    it('should render as div element by default', () => {
      render(<Skeleton data-testid="skeleton" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton.tagName).toBe('DIV');
    });
  });

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      render(<Skeleton className="custom-skeleton" data-testid="skeleton" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('custom-skeleton');
      expect(skeleton).toHaveClass('animate-pulse'); // Should still have base classes
    });

    it('should accept custom width and height', () => {
      render(<Skeleton className="w-32 h-8" data-testid="skeleton" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('w-32');
      expect(skeleton).toHaveClass('h-8');
    });

    it('should accept data attributes', () => {
      render(<Skeleton data-loading="true" data-testid="skeleton" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('data-loading', 'true');
    });

    it('should accept id attribute', () => {
      render(<Skeleton id="unique-skeleton" data-testid="skeleton" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('id', 'unique-skeleton');
    });
  });

  describe('Styling Variations', () => {
    it('should support different shapes', () => {
      const { rerender } = render(<Skeleton className="rounded-full" data-testid="skeleton" />);
      
      let skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('rounded-full');

      rerender(<Skeleton className="rounded-none" data-testid="skeleton" />);
      skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('rounded-none');

      rerender(<Skeleton className="rounded-lg" data-testid="skeleton" />);
      skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('rounded-lg');
    });

    it('should support different sizes', () => {
      const { rerender } = render(<Skeleton className="w-4 h-4" data-testid="skeleton" />);
      
      let skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('w-4');
      expect(skeleton).toHaveClass('h-4');

      rerender(<Skeleton className="w-full h-20" data-testid="skeleton" />);
      skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('w-full');
      expect(skeleton).toHaveClass('h-20');
    });

    it('should support custom colors', () => {
      render(<Skeleton className="bg-gray-200" data-testid="skeleton" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('bg-gray-200');
    });
  });

  describe('Common Use Cases', () => {
    it('should work as text skeleton', () => {
      render(<Skeleton className="h-4 w-[250px]" data-testid="text-skeleton" />);
      
      const skeleton = screen.getByTestId('text-skeleton');
      expect(skeleton).toHaveClass('h-4');
      expect(skeleton).toHaveClass('w-[250px]');
    });

    it('should work as avatar skeleton', () => {
      render(<Skeleton className="h-12 w-12 rounded-full" data-testid="avatar-skeleton" />);
      
      const skeleton = screen.getByTestId('avatar-skeleton');
      expect(skeleton).toHaveClass('h-12');
      expect(skeleton).toHaveClass('w-12');
      expect(skeleton).toHaveClass('rounded-full');
    });

    it('should work as card skeleton', () => {
      render(<Skeleton className="h-[125px] w-[250px] rounded-xl" data-testid="card-skeleton" />);
      
      const skeleton = screen.getByTestId('card-skeleton');
      expect(skeleton).toHaveClass('h-[125px]');
      expect(skeleton).toHaveClass('w-[250px]');
      expect(skeleton).toHaveClass('rounded-xl');
    });

    it('should work as button skeleton', () => {
      render(<Skeleton className="h-10 w-20 rounded-md" data-testid="button-skeleton" />);
      
      const skeleton = screen.getByTestId('button-skeleton');
      expect(skeleton).toHaveClass('h-10');
      expect(skeleton).toHaveClass('w-20');
      expect(skeleton).toHaveClass('rounded-md');
    });
  });

  describe('Multiple Skeletons', () => {
    it('should render multiple skeletons for list loading', () => {
      render(
        <div>
          <Skeleton className="h-4 w-[250px]" data-testid="skeleton-1" />
          <Skeleton className="h-4 w-[200px]" data-testid="skeleton-2" />
          <Skeleton className="h-4 w-[150px]" data-testid="skeleton-3" />
        </div>
      );
      
      expect(screen.getByTestId('skeleton-1')).toBeInTheDocument();
      expect(screen.getByTestId('skeleton-2')).toBeInTheDocument();
      expect(screen.getByTestId('skeleton-3')).toBeInTheDocument();
    });

    it('should render skeleton card layout', () => {
      render(
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" data-testid="avatar" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" data-testid="title" />
            <Skeleton className="h-4 w-[200px]" data-testid="subtitle" />
          </div>
        </div>
      );
      
      expect(screen.getByTestId('avatar')).toBeInTheDocument();
      expect(screen.getByTestId('title')).toBeInTheDocument();
      expect(screen.getByTestId('subtitle')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label for screen readers', () => {
      render(<Skeleton aria-label="Loading content" data-testid="skeleton" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
    });

    it('should support role attribute', () => {
      render(<Skeleton role="status" data-testid="skeleton" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('role', 'status');
    });

    it('should support aria-busy for loading state', () => {
      render(<Skeleton aria-busy="true" data-testid="skeleton" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
    });

    it('should be properly announced by screen readers', () => {
      render(
        <Skeleton 
          role="status" 
          aria-label="Loading user profile" 
          data-testid="skeleton" 
        />
      );
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('role', 'status');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading user profile');
    });
  });

  describe('Animation', () => {
    it('should have pulse animation by default', () => {
      render(<Skeleton data-testid="skeleton" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('should allow disabling animation', () => {
      render(<Skeleton className="animate-none" data-testid="skeleton" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-none');
    });

    it('should support custom animations', () => {
      render(<Skeleton className="animate-bounce" data-testid="skeleton" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-bounce');
    });
  });

  describe('Responsive Design', () => {
    it('should support responsive classes', () => {
      render(
        <Skeleton 
          className="h-4 w-full sm:w-[250px] md:w-[300px]" 
          data-testid="responsive-skeleton" 
        />
      );
      
      const skeleton = screen.getByTestId('responsive-skeleton');
      expect(skeleton).toHaveClass('h-4');
      expect(skeleton).toHaveClass('w-full');
      expect(skeleton).toHaveClass('sm:w-[250px]');
      expect(skeleton).toHaveClass('md:w-[300px]');
    });

    it('should adapt to different screen sizes', () => {
      render(
        <Skeleton 
          className="h-8 w-32 sm:h-10 sm:w-40 md:h-12 md:w-48" 
          data-testid="adaptive-skeleton" 
        />
      );
      
      const skeleton = screen.getByTestId('adaptive-skeleton');
      expect(skeleton).toHaveClass('h-8');
      expect(skeleton).toHaveClass('w-32');
      expect(skeleton).toHaveClass('sm:h-10');
      expect(skeleton).toHaveClass('sm:w-40');
      expect(skeleton).toHaveClass('md:h-12');
      expect(skeleton).toHaveClass('md:w-48');
    });
  });

  describe('Integration', () => {
    it('should work within complex layouts', () => {
      render(
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Skeleton className="h-[125px] w-full rounded-xl" data-testid="card-1" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" data-testid="line-1" />
              <Skeleton className="h-4 w-4/5" data-testid="line-2" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-[125px] w-full rounded-xl" data-testid="card-2" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" data-testid="line-3" />
              <Skeleton className="h-4 w-4/5" data-testid="line-4" />
            </div>
          </div>
        </div>
      );
      
      expect(screen.getByTestId('card-1')).toBeInTheDocument();
      expect(screen.getByTestId('card-2')).toBeInTheDocument();
      expect(screen.getByTestId('line-1')).toBeInTheDocument();
      expect(screen.getByTestId('line-2')).toBeInTheDocument();
      expect(screen.getByTestId('line-3')).toBeInTheDocument();
      expect(screen.getByTestId('line-4')).toBeInTheDocument();
    });
  });
});
