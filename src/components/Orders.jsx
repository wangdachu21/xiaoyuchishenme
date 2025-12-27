import React from 'react';
import { Link } from 'react-router-dom';

function Orders({ orders, onUpdateStatus }) {
  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleStatusClick = (order) => {
    if (order.status === 'pending') {
      if (confirm(`这份 ${order.dishName} 做好了吗？`)) {
        onUpdateStatus(order.id, 'completed');
      }
    }
  };

  return (
    <div className="container">
      <h1>今日订单</h1>
      
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#999' }}>
          今天还没点菜呢
        </div>
      ) : (
        <div className="order-list">
          {orders.map(item => (
            <div 
              key={item.id} 
              style={{
                ...styles.orderItem,
                opacity: item.status === 'completed' ? 0.6 : 1
              }}
              onClick={() => handleStatusClick(item)}
            >
              <div>
                <div style={{
                  ...styles.orderName,
                  textDecoration: item.status === 'completed' ? 'line-through' : 'none'
                }}>{item.dishName}</div>
                <div style={styles.orderTime}>{formatDate(item.createTime)}</div>
              </div>
              <div style={{
                ...styles.status,
                color: item.status === 'completed' ? '#4CAF50' : '#FF5733'
              }}>
                {item.status === 'pending' ? '待制作' : '已完成'}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '50px', textAlign: 'center' }}>
        <Link to="/admin" style={{ color: '#ccc', fontSize: '12px', textDecoration: 'none' }}>
          我是厨师，我要加菜
        </Link>
      </div>
    </div>
  );
}

const styles = {
  orderItem: {
    background: 'white',
    marginBottom: '10px',
    padding: '15px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  orderName: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  orderTime: {
    fontSize: '12px',
    color: '#999',
    marginTop: '5px'
  },
  status: {
    color: '#FF5733',
    fontWeight: 'bold',
    fontSize: '14px'
  }
};

export default Orders;