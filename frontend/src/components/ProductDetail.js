﻿import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById, addToCart, getCart, getProducts, getCategoryPath } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';
import styles from './style.component/ProductDetail.module.css';
import ProductReviews from './ProductReviews';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import placeholderImage from '../components/placeholder.png';

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const { id } = useParams();
  const { user } = useAuth();
  const { setCartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const [categoryPath, setCategoryPath] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      try {
        const productData = await getProductById(id);
        setProduct(productData);
        setSelectedImage(0);
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }

        const relatedData = await getProducts({ 
          category: productData.category,
          limit: 4,
          exclude: id
        });
        setRelatedProducts(relatedData);

        if (productData.category) {
          const pathData = await getCategoryPath(productData.category);
          setCategoryPath(pathData);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Không thể tải thông tin sản phẩm');
      }
    };
    fetchProductAndRelated();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      setError('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }
    if (product.stock === 0) {
      setError('Sản phẩm đã hết hàng');
      return;
    }
    try {
      await addToCart(id, quantity, selectedSize, selectedColor);
      const updatedCart = await getCart();
      setCartItems(updatedCart.items);
      setShowModal(true);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prevQuantity => prevQuantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  const handleNextImage = () => {
    if (selectedImage < (product.detailImages?.length || 0)) {
      setSelectedImage(prevImage => prevImage + 1);
    }
  };

  const handlePrevImage = () => {
    if (selectedImage > 0) {
      setSelectedImage(prevImage => prevImage - 1);
    }
  };

  const imageUrl = (img) => {
    if (!img) return placeholderImage;
    if (img.startsWith('http')) return img;
    return `${process.env.REACT_APP_API_URL}/uploads/${img.split('/').pop()}`;
  };

  if (!product) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.productDetail}>
      <div className={styles.productMain}>
        <div className={styles.imageSection}>
          <div className={styles.thumbnails}>
            {[product.image, ...(product.detailImages || [])].map((img, index) => (
              <div 
                key={index} 
                className={`${styles.thumbnailContainer} ${selectedImage === index ? styles.selected : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={imageUrl(img)}
                  alt={`Thumbnail ${index + 1}`}
                  className={styles.thumbnail}
                  onError={(e) => {
                    console.error("Error loading image:", e.target.src);
                    e.target.onerror = null;
                    e.target.src = placeholderImage;
                  }}
                />
              </div>
            ))}
          </div>
          <div className={styles.mainImageContainer}>
            <img
              className={styles.mainImage}
              src={imageUrl([product.image, ...(product.detailImages || [])][selectedImage])}
              alt={product.name}
              onError={(e) => {
                console.error("Error loading image:", e.target.src);
                e.target.onerror = null;
                e.target.src = placeholderImage;
              }}
            />
            <div className={styles.imageNavigation}>
              <button onClick={handlePrevImage} disabled={selectedImage === 0} className={styles.navButton}>
                <FaChevronLeft />
              </button>
              <button onClick={handleNextImage} disabled={selectedImage === (product.detailImages?.length || 0)} className={styles.navButton}>
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
        <div className={styles.productInfo}>
          <h1 className={styles.productName}>{product.name}</h1>
          {product.colors && product.colors.length > 0 && (
            <p className={styles.productColor}>{product.colors[0]}</p>
          )}
          <p className={styles.price}>£{product.price.toFixed(2)}</p>
          
          {product.sizes && product.sizes.length > 0 && (
            <div className={styles.sizeSection}>
              <p>SIZE</p>
              <div className={styles.sizeButtons}>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`${styles.sizeButton} ${selectedSize === size ? styles.selectedSize : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button className={styles.viewSizeGuide}>VIEW SIZE GUIDE</button>

          {product.stock === 0 ? (
            <div className={styles.outOfStock}>
              <p>EMAIL WHEN STOCK AVAILABLE</p>
              <input type="text" placeholder="Your Name" className={styles.input} />
              <input type="email" placeholder="nguyentruongnhathao1922@gmail.com" className={styles.input} />
              <button className={styles.subscribeButton}>SUBSCRIBE NOW</button>
            </div>
          ) : (
            <>
              <div className={styles.quantitySection}>
                <span className={styles.label}>Số lượng:</span>
                <div className={styles.quantityControl}>
                  <button onClick={decrementQuantity} className={styles.quantityButton}>-</button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max={product.stock}
                    className={styles.quantityInput}
                  />
                  <button onClick={incrementQuantity} className={styles.quantityButton}>+</button>
                </div>
              </div>
              <button 
                className={styles.addToBasket} 
                onClick={handleAddToCart}
              >
                ADD TO BASKET
              </button>
            </>
          )}

          <div className={styles.description}>
            <h2>DESCRIPTION</h2>
            <p>{product.description}</p>
          </div>

          {categoryPath.length > 0 && (
            <p className={styles.category}>
              Danh mục: {categoryPath.map((cat, index) => (
                <span key={cat.id}>
                  {index > 0 && " > "}
                  <Link to={`/category/${cat.slug}`}>{cat.name}</Link>
                </span>
              ))}
            </p>
          )}
          <p className={styles.sku}>SKU: {product._id}</p>

          <div className={styles.additionalInfo}>
            <p className={styles.deliveryReturns}>DELIVERY & RETURNS</p>
            <p className={styles.questions}>QUESTIONS?</p>
          </div>
        </div>
      </div>

      <ProductReviews productId={id} />

      {relatedProducts.length > 0 && (
        <div className={styles.relatedProducts}>
          <h3>Sản phẩm liên quan</h3>
          <div className={styles.productGrid}>
            {relatedProducts.map(relatedProduct => (
              <div key={relatedProduct._id} className={styles.relatedProductCard}>
                <img src={imageUrl(relatedProduct.image)} alt={relatedProduct.name} />
                <h4>{relatedProduct.name}</h4>
                <p>{relatedProduct.price.toLocaleString('vi-VN')} đ</p>
                <Link to={`/products/${relatedProduct._id}`}>Xem chi tiết</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Bạn đã thêm sản phẩm vào giỏ hàng !!</h2>
            <div className={styles.modalButtons}>
              <button onClick={() => { setShowModal(false); navigate('/products'); }}>Tiếp tục mua hàng</button>
              <button onClick={() => { setShowModal(false); navigate('/cart'); }}>Xem giỏ hàng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;