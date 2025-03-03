import React, {useState} from "react";
import {QRCodeCanvas} from "qrcode.react";
import "./App.css";

function App() {
  const [carts, setCarts] = useState({
    Groceries: [],
    Clothing: [],
    Electronics: [],
    "Food & Beverages": [],
  });
  const [showQR, setShowQR] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Groceries");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPayScreen, setIsPayScreen] = useState(false);

  const categories = {
    Groceries: {
      items: [
        {name: "Milk (1L)", price: 3.5},
        {name: "Bread", price: 2.0},
        {name: "Eggs (10pk)", price: 4.8},
        {name: "Tomato", price: 1.64},
        {name: "Carrot", price: 0.65},
      ],
      uen: "T1234567A",
    },
    Clothing: {
      items: [
        {name: "T-Shirt", price: 15.0},
        {name: "Jeans", price: 35.0},
        {name: "Jacket", price: 50.0},
      ],
      uen: "T2345678B",
    },
    Electronics: {
      items: [
        {name: "Headphones", price: 25.0},
        {name: "USB Cable", price: 5.0},
      ],
      uen: "T3456789C",
    },
    "Food & Beverages": {
      items: [
        {name: "Coffee (500g)", price: 8.99},
        {name: "Orange Juice (1L)", price: 4.25},
        {name: "Chocolate Bar", price: 1.99},
        {name: "Soda Can (330ml)", price: 1.5},
        {name: "Bottled Water (500ml)", price: 0.99},
      ],
      uen: "T4567890D",
    },
  };

  const addToCart = (item) => {
    setCarts((prevCarts) => {
      const currentCart = prevCarts[activeCategory];
      const existingItem = currentCart.find(
        (cartItem) => cartItem.name === item.name
      );
      if (existingItem) {
        return {
          ...prevCarts,
          [activeCategory]: currentCart.map((cartItem) =>
            cartItem.name === item.name
              ? {...cartItem, quantity: cartItem.quantity + 1}
              : cartItem
          ),
        };
      }
      return {
        ...prevCarts,
        [activeCategory]: [...currentCart, {...item, quantity: 1}],
      };
    });
  };

  const calculateTotals = () => {
    const currentCart = carts[activeCategory];
    const total = currentCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const taxRate = 0.09;
    const tax = (total * taxRate) / (1 + taxRate);
    return {tax, total};
  };

  const generateTransactionId = () => {
    return "TXN" + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handlePay = () => {
    const currentCart = carts[activeCategory];
    if (currentCart.length === 0) {
      alert("Cart is empty for this category!");
      return;
    }
    const {tax, total} = calculateTotals();
    const transactionId = generateTransactionId();
    const receipt = {
      store: `${activeCategory} Shop - GroceryMart SG`,
      category: activeCategory, // Added category to QR code data
      date: new Date().toLocaleString(),
      items: currentCart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        amount: item.price * item.quantity,
      })),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      payment_method: "CASH",
      note: "GST (9%) is included in item prices.",
      uen: categories[activeCategory].uen,
      transaction_id: transactionId,
    };
    setReceiptData(JSON.stringify(receipt));
    setShowQR(true);
    setIsPayScreen(true);
  };

  const resetCart = () => {
    setCarts((prevCarts) => ({
      ...prevCarts,
      [activeCategory]: [],
    }));
    setShowQR(false);
    setReceiptData(null);
    setIsPayScreen(false);
  };

  const goBack = () => {
    setIsPayScreen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="App">
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

      <div className="main-container">
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
                  setIsPayScreen(false);
                }}
              >
                {category}
              </li>
            ))}
          </ul>
        </aside>

        {!isPayScreen ? (
          <div className="content">
            <header className="header">
              <h1>{activeCategory} POS Terminal</h1>
            </header>

            <div className="item-selection">
              <h2>Select Items</h2>
              <div className="item-list">
                {categories[activeCategory].items.map((item) => (
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
              {carts[activeCategory].length === 0 ? (
                <p>No items in cart.</p>
              ) : (
                <>
                  <ul className="cart-items">
                    {carts[activeCategory].map((item, index) => (
                      <li key={index} className="cart-item">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">{item.quantity}x</span>
                        <span className="item-price">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="item-total">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="totals">
                    {(() => {
                      const {tax, total} = calculateTotals();
                      return (
                        <>
                          <p>
                            GST (9%, included): <span>${tax.toFixed(2)}</span>
                          </p>
                          <p className="total">
                            Total: <span>${total.toFixed(2)}</span>
                          </p>
                          <p className="uen">
                            UEN: <span>{categories[activeCategory].uen}</span>
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
        ) : (
          <div className="content pay-screen">
            <header className="header">
              <h1>Payment Confirmation - {activeCategory}</h1>
            </header>

            <div className="pay-screen-container">
              <div className="cart pay-cart">
                <h2>Cart</h2>
                <ul className="cart-items">
                  {carts[activeCategory].map((item, index) => (
                    <li key={index} className="cart-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">{item.quantity}x</span>
                      <span className="item-price">
                        ${item.price.toFixed(2)}
                      </span>
                      <span className="item-total">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="totals">
                  {(() => {
                    const {tax, total} = calculateTotals();
                    return (
                      <>
                        <p>
                          GST (9%, included): <span>${tax.toFixed(2)}</span>
                        </p>
                        <p className="total">
                          Total: <span>${total.toFixed(2)}</span>
                        </p>
                        <p className="uen">
                          UEN: <span>{categories[activeCategory].uen}</span>
                        </p>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="qr-code pay-qr">
                <h2>Scan Receipt QR Code</h2>
                <QRCodeCanvas value={receiptData} size={256} />
                <p>Scan this with your mobile app to save the receipt.</p>
              </div>
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
