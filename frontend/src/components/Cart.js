﻿import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import styles from './style.component/Cart.module.css';
import VoucherInput from './VoucherInput';

const Cart = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateCartItem, 
    total,
    fetchCart,
    voucher,
    discountAmount,
    finalAmount 
  } = useContext(CartContext);

  const [stockErrors, setStockErrors] = useState({});

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      await updateCartItem(itemId, { quantity: newQuantity });
      setStockErrors(prev => ({...prev, [itemId]: null}));
    } catch (error) {
      if (error.response?.data?.availableStock) {
        setStockErrors(prev => ({
          ...prev, 
          [itemId]: `Chỉ còn ${error.response.data.availableStock} sản phẩm trong kho`
        }));
      }
    }
  };

  const handleSizeChange = (itemId, newSize) => {
    updateCartItem(itemId, { size: newSize });
  };

  const handleColorChange = (itemId, newColor) => {
    updateCartItem(itemId, { color: newColor });
  };

  // Thêm log để kiểm tra state của giỏ hàng
  console.log('Cart state:', {
    items: cartItems,
    total,
    voucher,
    discountAmount,
    finalAmount
  });

  if (cartItems.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>Giỏ hàng trống</h2>
        <Link to="/products" className={styles.continueShopping}>Tiếp tục mua sắm</Link>
      </div>
    );
  }

  return (
    <div className={styles.cart}>
      <h2>Giỏ hàng của bạn</h2>
      {cartItems.map(item => (
        <div key={item._id} className={styles.cartItem}>
          <img 
            src={`${process.env.REACT_APP_API_URL}/uploads/${item.product.image}`} 
            alt={item.product.name} 
            className={styles.productImage} 
          />
          <div className={styles.productInfo}>
            <h3>{item.product.name}</h3>
            <p>Giá: {item.product.price.toLocaleString('vi-VN')} đ</p>
            <div className={styles.itemOptions}>
              <select 
                value={item.size} 
                onChange={(e) => handleSizeChange(item._id, e.target.value)}
              >
                {item.product.sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <select 
                value={item.color} 
                onChange={(e) => handleColorChange(item._id, e.target.value)}
              >
                {item.product.colors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
            <div className={styles.quantityControl}>
              <button 
                onClick={() => handleQuantityChange(item._id, Math.max(1, item.quantity - 1))}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={item.product.stock}
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
              />
              <button 
                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                disabled={item.quantity >= item.product.stock}
              >
                +
              </button>
            </div>
            {stockErrors[item._id] && (
              <p className={styles.errorMessage}>{stockErrors[item._id]}</p>
            )}
            <p className={styles.stockInfo}>
              Còn lại: {item.product.stock} sản phẩm
            </p>
            <button 
              onClick={() => removeFromCart(item.product._id)} 
              className={styles.removeButton}
            >Xóa</button>
          </div>
        </div>
      ))}
      <div className={styles.cartSummary}>
        <p>Tạm tính: {(total || 0).toLocaleString('vi-VN')} đ</p>
        <VoucherInput />
        {voucher && (
          <p className={styles.discount}>
            Giảm giá (Mã: {voucher.code}): -{(discountAmount || 0).toLocaleString('vi-VN')} đ
          </p>
        )}
        <p className={styles.finalAmount}>
          Tổng cộng: {(finalAmount || total || 0).toLocaleString('vi-VN')} đ
        </p>
        <Link to="/checkout" className={styles.checkoutButton}>
          Thanh toán
        </Link>
      </div>
    </div>
  );
};

export default Cart;
