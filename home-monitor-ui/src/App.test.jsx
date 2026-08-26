import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

test('renders the home monitor application', () => {
  render(<App />);
  expect(screen.getByText(/welcome to home monitor/i)).toBeInTheDocument();
});