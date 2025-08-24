import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, User as UserEntity } from '@/api/entities';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initializeCart = async () => {
      try {
        const currentUser = await UserEntity.me();
        setUser(currentUser);
        await loadCartItems(currentUser.id);
      } catch (error) {
        // Not logged in, cart is empty
        setUser(null);
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    initializeCart();
  }, []);

  const loadCartItems = async (userId) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const items = await CartItem.filter({ user_id: userId });
      setCartItems(items);
    } catch (error) {
      console.error("Error loading cart items:", error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      await UserEntity.login();
      return;
    }
    
    const existingItem = cartItems.find(item => item.product_id === productId);

    try {
      if (existingItem) {
        const updatedItem = await CartItem.update(existingItem.id, { 
          quantity: existingItem.quantity + quantity 
        });
        setCartItems(cartItems.map(item => item.id === existingItem.id ? updatedItem : item));
      } else {
        const newItem = await CartItem.create({
          user_id: user.id,
          product_id: productId,
          quantity,
        });
        setCartItems([...cartItems, newItem]);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId);
      return;
    }
    
    try {
      const updatedItem = await CartItem.update(itemId, { quantity: newQuantity });
      setCartItems(cartItems.map(item => item.id === itemId ? updatedItem : item));
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await CartItem.delete(itemId);
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };
  
  const clearCart = async () => {
    if (!user) return;
    try {
        const userCartItems = await CartItem.filter({ user_id: user.id });
        const deletePromises = userCartItems.map(item => CartItem.delete(item.id));
        await Promise.all(deletePromises);
        setCartItems([]);
    } catch(error) {
        console.error("Error clearing cart:", error);
    }
  };

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    isLoading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};