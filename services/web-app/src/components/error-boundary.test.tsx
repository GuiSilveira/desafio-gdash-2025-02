import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, withErrorBoundary } from './error-boundary';
import { StructuredLogger } from '@/utils/logger';

function ThrowingComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

function ToggleErrorComponent({ error }: { error: boolean }) {
  if (error) {
    throw new Error('Toggle error');
  }
  return <div>Content rendered</div>;
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('should render default fallback UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument();
  });

  it('should render custom fallback ReactNode when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });

  it('should render custom fallback function with error and reset', () => {
    const fallbackFn = vi.fn((error: Error, reset: () => void) => (
      <div>
        <span>Error: {error.message}</span>
        <button onClick={reset}>Reset</button>
      </div>
    ));

    render(
      <ErrorBoundary fallback={fallbackFn}>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(fallbackFn).toHaveBeenCalled();
    expect(screen.getByText('Error: Test error')).toBeInTheDocument();
  });

  it('should reset error state when reset button is clicked', () => {
    const fallbackFn = vi.fn((error: Error, reset: () => void) => (
      <div>
        <span>Caught: {error.message}</span>
        <button onClick={reset}>Reset</button>
      </div>
    ));

    render(
      <ErrorBoundary fallback={fallbackFn}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Caught: Test error')).toBeInTheDocument();

    const initialCallCount = fallbackFn.mock.calls.length;

    fireEvent.click(screen.getByText('Reset'));

    expect(fallbackFn.mock.calls.length).toBeGreaterThan(initialCallCount);
  });

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should use provided logger for logging errors', () => {
    const mockLogError = vi.fn();
    const mockLogger = {
      withField: vi.fn().mockReturnThis(),
      logError: mockLogError,
      info: vi.fn(),
    } as unknown as StructuredLogger;

    render(
      <ErrorBoundary logger={mockLogger}>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(mockLogError).toHaveBeenCalledWith(
      expect.any(Error),
      'React component error',
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should log when error boundary is reset', () => {
    const mockInfo = vi.fn();
    const mockLogger = {
      withField: vi.fn().mockReturnThis(),
      logError: vi.fn(),
      info: mockInfo,
    } as unknown as StructuredLogger;

    render(
      <ErrorBoundary logger={mockLogger}>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('Tentar novamente'));

    expect(mockInfo).toHaveBeenCalledWith('Error boundary reset by user');
  });
});

describe('withErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should wrap component with error boundary', () => {
    const WrappedComponent = withErrorBoundary(ThrowingComponent);

    render(<WrappedComponent shouldThrow={true} />);

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
  });

  it('should pass props to wrapped component', () => {
    const WrappedComponent = withErrorBoundary(ThrowingComponent);

    render(<WrappedComponent shouldThrow={false} />);

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should apply error boundary props', () => {
    const onError = vi.fn();
    const WrappedComponent = withErrorBoundary(ThrowingComponent, { onError });

    render(<WrappedComponent shouldThrow={true} />);

    expect(onError).toHaveBeenCalled();
  });

  it('should set display name correctly', () => {
    function MyComponent() {
      return <div>My Component</div>;
    }

    const WrappedComponent = withErrorBoundary(MyComponent);

    expect(WrappedComponent.displayName).toBe('withErrorBoundary(MyComponent)');
  });

  it('should handle anonymous components', () => {
    const WrappedComponent = withErrorBoundary(() => <div>Anonymous</div>);

    expect(WrappedComponent.displayName).toBe('withErrorBoundary(Component)');
  });
});
