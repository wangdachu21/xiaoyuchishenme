import React, { useState } from 'react';

function History({ orders, onUpdateReview }) {
  const [editingId, setEditingId] = useState(null);
  const [reviewText, setReviewText] = useState('');

  // 过滤出已完成的订单
  const completedOrders = orders.filter(o => o.status === 'completed');

  // 按日期分组
  const groupedOrders = completedOrders.reduce((groups, order) => {
    const date = new Date(order.createTime).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(order);
    return groups;
  }, {});

  const handleEditClick = (order) => {
    setEditingId(order.id);
    setReviewText(order.review || '');
  };

  const handleSaveReview = (orderId) => {
    onUpdateReview(orderId, reviewText);
    setEditingId(null);
  };

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      <h1>点菜记录</h1>
      
      {Object.keys(groupedOrders).length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#999' }}>
          还没做过菜呢
        </div>
      ) : (
        Object.keys(groupedOrders).sort((a, b) => new Date(b) - new Date(a)).map(date => (
          <div key={date} style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              color: '#666', 
              fontSize: '16px', 
              borderLeft: '4px solid #FF5733', 
              paddingLeft: '10px',
              margin: '20px 0 10px 0'
            }}>
              {date}
            </h3>
            
            {groupedOrders[date].map(item => (
              <div key={item.id} style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '15px', 
                marginBottom: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{item.dishName}</span>
                  <span style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(item.createTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                {editingId === item.id ? (
                  <div style={{ marginTop: '10px' }}>
                    <textarea 
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="写点评价吧... (比如：太好吃了！)"
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        marginBottom: '8px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => setEditingId(null)}
                        style={{
                          marginRight: '10px',
                          padding: '5px 15px',
                          background: '#eee',
                          border: 'none',
                          borderRadius: '20px'
                        }}
                      >取消</button>
                      <button 
                        onClick={() => handleSaveReview(item.id)}
                        style={{
                          padding: '5px 15px',
                          background: '#FF5733',
                          color: 'white',
                          border: 'none',
                          borderRadius: '20px'
                        }}
                      >保存评价</button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => handleEditClick(item)}
                    style={{ 
                      marginTop: '8px',
                      padding: '8px',
                      background: '#f9f9f9',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: item.review ? '#333' : '#ccc',
                      cursor: 'pointer'
                    }}
                  >
                    {item.review ? `💬 ${item.review}` : '✍️ 写评价...'}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

export default History;