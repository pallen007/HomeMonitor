import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach } from 'vitest';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
});

test('renders the home monitor application', () => {
  render(<App />);
  expect(screen.getByText(/welcome to home monitor/i)).toBeInTheDocument();
});

test('keeps the dark mode switch in sync with the selected theme', async () => {
  render(<App />);

  const switchInput = await screen.findByRole('checkbox', { name: /dark mode/i });
  expect(switchInput).not.toBeChecked();

  fireEvent.click(switchInput);

  await waitFor(() => {
    expect(switchInput).toBeChecked();
    expect(window.localStorage.getItem('theme')).toBe('dark');
  });
});