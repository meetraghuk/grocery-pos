import React, {useState} from "react";
import {QRCodeCanvas} from "qrcode.react";
import "./App.css";

function App() {
  const [cart, setCart] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Groceries");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPayScreen, setIsPayScreen] = useState(false);

  const categories = {
    Groceries: [
      {name: "Milk (1L)", price: 3.5},
      {name: "Bread", price: 2.0},
      {name: "Eggs (10pk)", price: 4.8},
      {name: "Tomato", price: 1.64},
      {name: "Carrot", price: 0.65},
    ],
    Clothing: [
      {name: "T-Shirt", price: 15.0},
      {name: "Jeans", price: 35.0},
      {name: "Jacket", price: 50.0},
    ],
    Electronics: [
      {name: "Headphones", price: 25.0},
      {name: "USB Cable", price: 5.0},
    ],
    "Food & Beverages": [
      {name: "Coffee (500g)", price: 8.99},
      {name: "Orange Juice (1L)", price: 4.25},
      {name: "Chocolate Bar", price: 1.99},
      {name: "Soda Can (330ml)", price: 1.5},
      {name: "Bottled Water (500ml)", price: 0.99},
    ],
  };

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.name === item.name
      );
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.name === item.name
            ? {...cartItem, quantity: cartItem.quantity + 1}
            : cartItem
        );
      }
      return [...prevCart, {...item, quantity: 1}];
    });
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const taxRate = 0.09;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return {subtotal, tax, total};
  };

  const handlePay = () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    const {subtotal, tax, total} = calculateTotals();
    const receipt = {
      store: "GroceryMart SG",
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
      payment_method: "CASH",
    };
    setReceiptData(JSON.stringify(receipt));
    setShowQR(true);
    setIsPayScreen(true);
  };

  const resetCart = () => {
    setCart([]);
    setShowQR(false);
    setReceiptData(null);
    setIsPayScreen(false);
  };

  const goBack = () => {
    setIsPayScreen(false); // Simply go back without resetting cart
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="App">
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="hamburger" onClick={toggleSidebar}>
          ☰
        </div>
        <div className="logo">POS Simulator</div>
        <ul className="top-nav-links">
          <li>
            <a href="#">Home</a>
          </li>
          <li>
            <a href="#">Reports</a>
          </li>
          <li>
            <a href="#">Settings</a>
          </li>
          <li>
            <a href="#">Logout</a>
          </li>
        </ul>
      </nav>

      {/* Main Container */}
      <div className="main-container">
        {!isPayScreen ? (
          <>
            {/* Sidebar (only shown in main view) */}
            <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
              <h3>Categories</h3>
              <ul>
                {Object.keys(categories).map((category) => (
                  <li
                    key={category}
                    className={activeCategory === category ? "active" : ""}
                    onClick={() => {
                      setActiveCategory(category);
                      setIsSidebarOpen(false);
                    }}
                  >
                    {category}
                  </li>
                ))}
              </ul>
            </aside>

            {/* Main Content (only shown in main view) */}
            <div className="content">
              <header className="header">
                <h1>{activeCategory} POS Terminal</h1>
              </header>

              <div className="item-selection">
                <h2>Select Items</h2>
                <div className="item-list">
                  {categories[activeCategory].map((item) => (
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
                          {item.name} - {item.quantity}x $
                          {item.price.toFixed(2)} = $
                          {(item.price * item.quantity).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                    <div className="totals">
                      {(() => {
                        const {subtotal, tax, total} = calculateTotals();
                        return (
                          <>
                            <p>Subtotal: ${subtotal.toFixed(2)}</p>
                            <p>GST (9%): ${tax.toFixed(2)}</p>
                            <p>
                              <strong>Total: ${total.toFixed(2)}</strong>
                            </p>
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
            </div>
          </>
        ) : (
          /* Pay Screen */
          <div className="content pay-screen">
            <header className="header">
              <h1>Payment Confirmation</h1>
            </header>

            <div className="cart">
              <h2>Cart</h2>
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
                  const {subtotal, tax, total} = calculateTotals();
                  return (
                    <>
                      <p>Subtotal: ${subtotal.toFixed(2)}</p>
                      <p>GST (9%): ${tax.toFixed(2)}</p>
                      <p>
                        <strong>Total: ${total.toFixed(2)}</strong>
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="qr-code">
              <h2>Scan Receipt QR Code</h2>
              <QRCodeCanvas value={receiptData} size={256} />
              <p>Scan this with your mobile app to save the receipt.</p>
            </div>

            <div className="actions">
              <button onClick={goBack} className="back-button">
                Back
              </button>
              <button onClick={resetCart} className="reset-button">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
