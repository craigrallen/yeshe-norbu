'use client';

import { useState } from 'react';

interface CartItem {
  id: string;
  name: string;
  priceSek: number;
  quantity: number;
}

const QUICK_PRODUCTS = [
  { id: 'drop-in', name: 'Drop-in meditation', priceSek: 100 },
  { id: 'tea', name: 'Te / Kaffe', priceSek: 30 },
  { id: 'book-1', name: 'Bok — Hjärtats Sutra', priceSek: 250 },
  { id: 'incense', name: 'Rökelse', priceSek: 80 },
  { id: 'mala', name: 'Mala-pärlor', priceSek: 350 },
  { id: 'donation', name: 'Donation', priceSek: 0 },
];

/** Main POS screen with product grid + cart. Optimised for tablet. */
export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  function addToCart(product: typeof QUICK_PRODUCTS[number]) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQuantity(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0),
    );
  }

  const total = cart.reduce((sum, i) => sum + i.priceSek * i.quantity, 0);

  return (
    <div className="flex h-screen">
      {/* Product grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h1 className="text-lg font-bold text-primary mb-4">Kassa — Yeshe Norbu</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {QUICK_PRODUCTS.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[100px]"
            >
              <span className="text-sm font-medium text-primary text-center">{product.name}</span>
              <span className="text-sm text-muted mt-1">
                {product.priceSek > 0 ? `${product.priceSek} kr` : 'Valfritt belopp'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Cart sidebar */}
      <div className="w-80 border-l border-border bg-surface flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-base font-semibold text-primary">Varukorg</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 && (
            <p className="text-sm text-muted text-center py-8">Varukorgen är tom</p>
          )}
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">{item.name}</p>
                <p className="text-xs text-muted">{item.priceSek} kr × {item.quantity}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="h-7 w-7 rounded border border-border text-sm hover:bg-gray-50"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="h-7 w-7 rounded border border-border text-sm hover:bg-gray-50"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-1 h-7 w-7 rounded text-error text-sm hover:bg-red-50"
                  aria-label="Ta bort"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Total + pay */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="flex justify-between text-base font-bold text-primary">
            <span>Totalt</span>
            <span>{total} kr</span>
          </div>
          <a
            href={cart.length > 0 ? `/pos/payment?total=${total}&items=${encodeURIComponent(JSON.stringify(cart))}` : '#'}
            className={`block w-full h-12 rounded-lg font-medium text-base text-center leading-[48px] transition-colors ${
              cart.length > 0
                ? 'bg-brand text-white hover:bg-brand-dark'
                : 'bg-gray-200 text-gray-400 pointer-events-none'
            }`}
          >
            Till betalning
          </a>
        </div>
      </div>
    </div>
  );
}
