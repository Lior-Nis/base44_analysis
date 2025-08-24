
import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem('pastelariaCart');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      // In case of parsing error or other issue with local storage
      console.error("Failed to parse cart items from local storage:", error);
      return [];
    }
  });

  const [cartType, setCartType] = useState(() => {
    try {
      const localType = localStorage.getItem('pastelariaCartType');
      return localType || 'encomenda'; // Default to 'encomenda'
    } catch (error) {
      // In case of error with local storage
      console.error("Failed to parse cart type from local storage:", error);
      return 'encomenda';
    }
  });


  useEffect(() => {
    localStorage.setItem('pastelariaCart', JSON.stringify(cartItems));
    localStorage.setItem('pastelariaCartType', cartType);
  }, [cartItems, cartType]);
  
  const generateCartItemId = (productId, variations) => {
    const variationKeys = Object.keys(variations).sort();
    const variationString = variationKeys.map(key => `${key}:${variations[key]}`).join('|');
    return `${productId}-${variationString}`;
  };

  const addToCart = (product, quantity, selectedVariations, orderType = 'encomenda') => {
    // Check if cart is not empty and the new item's order type clashes with current cart type
    if (cartItems.length > 0 && cartType !== orderType) {
      const message = orderType === 'vitrine_diaria'
        ? 'Seu carrinho contém itens de encomenda. Deseja limpá-lo para adicionar um item da vitrine diária (para retirada imediata)?'
        : 'Seu carrinho contém itens da vitrine diária. Deseja limpá-lo para adicionar um item de encomenda (para agendamento)?';
      
      if (!window.confirm(message)) {
        return; // User cancelled, do not add item or change cart
      }
      // User confirmed, clear cart before adding new item of different type
      setCartItems([]);
    }

    setCartType(orderType); // Set the cart type for the current operation
    
    const cartItemId = generateCartItemId(product.id, selectedVariations || {});
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === cartItemId);

      if (existingItem) {
        return prevItems.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, {
          id: cartItemId,
          productId: product.id,
          name: product.name,
          image: product.image_url,
          price: product.price,
          variations: selectedVariations || {},
          quantity: quantity,
        }];
      }
    });
  };

  const updateQuantity = (cartItemId, newQuantity) => {
    setCartItems(prevItems => {
      if (newQuantity <= 0) {
        return prevItems.filter(item => item.id !== cartItemId);
      }
      return prevItems.map(item =>
        item.id === cartItemId
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  };
  
  const removeFromCart = (cartItemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setCartType('encomenda'); // Reset cart type to default after clearing
  };

  const cartTotal = cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  const value = {
    cartItems,
    cartType, // Expose cartType to consumers
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    totalItems
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
