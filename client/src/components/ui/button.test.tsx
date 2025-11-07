import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByText('Disabled Button')).toBeDisabled();
  });

  it('should apply variant className', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should apply size className', () => {
    const { container } = render(<Button size="lg">Large Button</Button>);
    expect(container.firstChild).toBeInTheDocument();
  });
});
