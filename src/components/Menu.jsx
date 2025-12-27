import React, { useState } from 'react';
import OrderSuccessAnimation from './OrderSuccessAnimation';
import EmptyState from './EmptyState';

function Menu({ menuList, onOrder }) {
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);

  const handleOrder = (dish) => {
    onOrder(dish);
    setShowSuccessAnim(true);
  };

  const handleAnimComplete = () => {
    setShowSuccessAnim(false);
  };

  return (
    <div className="container">
      {showSuccessAnim && (
        <OrderSuccessAnimation onComplete={handleAnimComplete} />
      )}
      <h1>小于今天想吃啥</h1>
      {menuList.length === 0 ? (
        <EmptyState message="暂时没有菜单，等厨师上菜吧~" />
      ) : (
        <div className="menu-list">
          {menuList.map(item => (
            <div key={item.id} className="glass-card" style={styles.menuItem}>
              <div style={styles.infoWrapper}>
                <div style={styles.dishInfo}>
                  <div style={styles.dishName}>{item.name}</div>
                  <div style={styles.dishDesc}>{item.description}</div>
                </div>
                {item.image && (
                  <img src={item.image} alt={item.name} style={styles.dishImage} />
                )}
              </div>
              <button onClick={() => handleOrder(item)} style={styles.orderBtn}>点菜</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Menu;