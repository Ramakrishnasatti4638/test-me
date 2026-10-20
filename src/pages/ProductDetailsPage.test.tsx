import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProductDetailsPage } from './ProductDetailsPage';

function renderDetails(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/products/${id}`]}>
      <Routes>
        <Route path="/products/:id" element={<ProductDetailsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProductDetailsPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading state initially', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () => new Promise(() => {}),
    );

    renderDetails('1');

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders name, formatted price, and description for a product', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          name: 'Sample Product',
          price: 1299,
          description: 'A great product.',
          lastUpdated: '2024-05-01',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    renderDetails('1');

    await waitFor(() => {
      expect(screen.getByRole('heading')).toHaveTextContent('Sample Product');
    });
    expect(screen.getByText('$1,299.00')).toBeInTheDocument();
    expect(screen.getByText('A great product.')).toBeInTheDocument();
  });

  it('renders the "Updated <date>" line for a product', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          name: 'Sample Product',
          price: 1299,
          description: 'A great product.',
          lastUpdated: '2024-05-01',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    renderDetails('1');

    await waitFor(() => {
      expect(screen.getByText('Updated 2024-05-01')).toBeInTheDocument();
    });
  });

  it('shows "Product not found" on a 404', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Not Found', { status: 404 }),
    );

    renderDetails('999');

    await waitFor(() => {
      expect(screen.getByText('Product not found')).toBeInTheDocument();
    });
  });
});