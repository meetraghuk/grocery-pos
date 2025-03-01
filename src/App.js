import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // Changed from QRCode to QRCodeCanvas
import './App.css';

function App() {
  const [cart, setCart] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const availableItems = [
    { name: 'Milk (1L)', price: 3.50 },
    { name: 'Bread', price: 2.00 },
    { name: 'Eggs (10pk)', price: 4.80 },
    { name: 'Tomato', price: 1.64 },
    { name: 'Carrot', price: 0.65 },
  ];

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.name === item.name);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.name === item.name
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxRate = 0.09;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handlePay = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const { subtotal, tax, total } = calculateTotals();
    const receipt = {
      store: 'GroceryMart SG',
      date: new Date().toLocaleString(),
      items: cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        amount: item.price * item.quantity,
      })),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      payment_method: 'CASH',
    };

    setReceiptData(JSON.stringify(receipt));
    setShowQR(true);
  };

  const resetCart = () => {
    setCart([]);
    setShowQR(false);
    setReceiptData(null);
  };

  return (
    <div className="App">
      <h1>Grocery POS Terminal</h1>

      <div className="item-selection">
        <h2>Select Items</h2>
        <div className="item-list">
          {availableItems.map((item) => (
            <button
              key={item.name}
              onClick={() => addToCart(item)}
              className="item-button"
            >
              {item.name} (${item.price.toFixed(2)})
            </button>
          ))}
        </div>
      </div>

      <div className="cart">
        <h2>Cart</h2>
        {cart.length === 0 ? (
          <p>No items in cart.</p>
        ) : (
          <>
            <ul>
              {cart.map((item, index) => (
                <li key={index}>
                  {item.name} - {item.quantity}x ${item.price.toFixed(2)} = $
                  {(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
            <div className="totals">
              {(() => {
                const { subtotal, tax, total } = calculateTotals();
                return (
                  <>
                    <p>Subtotal: ${subtotal.toFixed(2)}</p>
                    <p>GST (9%): ${tax.toFixed(2)}</p>
                    <p><strong>Total: ${total.toFixed(2)}</strong></p>
                  </>
                );
              })()}
            </div>
          </>
        )}
      </div>

      <div className="actions">
        <button onClick={handlePay} className="pay-button">
          Pay
        </button>
        <button onClick={resetCart} className="reset-button">
          Reset
        </button>
      </div>

      {showQR && receiptData && (
        <div className="qr-code">
          <h2>Scan Receipt QR Code</h2>
          <QRCodeCanvas value={receiptData} size={256} /> {/* Changed to QRCodeCanvas */}
          <p>Scan this with your mobile app to save the receipt.</p>
        </div>
      )}
    </div>
  );
}

export default App;