import { useState, useEffect, createContext, useContext } from 'react';

export const CartContext = createContext<any>(null);

export function useCartStore() {
  const [items, setItems] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('dragonz_cart') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('dragonz_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: any, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find((i: any) => i.product_id === product.id);
      if (existing) {
        return prev.map((i: any) => i.product_id === product.id
          ? { ...i, quantity: i.quantity + quantity }
          : i
        );
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity,
        available_stock: product.available_stock || product.stock_count,
      }];
    });
  };

  const removeItem = (productId: number) => {
    setItems(prev => prev.filter((i: any) => i.product_id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) return removeItem(productId);
    setItems(prev => prev.map((i: any) => i.product_id === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum: number, i: any) => sum + i.quantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, total, count };
}

export function useCart() {
  return useContext(CartContext);
}
