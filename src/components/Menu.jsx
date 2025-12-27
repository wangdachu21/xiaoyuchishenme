import React from 'react';

function Menu({ menuList, onOrder }) {
  const handleOrder = (dish) => {
    if (confirm(`确定要点一份 ${dish.name} 吗？`)) {
      onOrder(dish);
      alert('点菜成功！坐等开饭吧~');
    }
  };

  return (
    <div className="container">
      <h1>今天想吃点什么？</h1>
      <div className="menu-list">
        {menuList.map(item => (
          <div key={item.id} style={styles.menuItem}>
            <div style={styles.dishInfo}>
              <div style={styles.dishName}>{item.name}</div>
              <div style={styles.dishDesc}>{item.description}</div>
            </div>
            <button onClick={() => handleOrder(item)}>点菜</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  menuItem: {
    background: 'white',
    marginBottom: '10px',
    padding: '15px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  dishInfo: {
    flex: 1,
  },
  dishName: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  dishDesc: {
    fontSize: '14px',
    color: '#666'
  }
};

export default Menu;