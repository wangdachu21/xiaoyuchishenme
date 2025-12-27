import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Admin({ onAddDish }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return alert('请输入菜名');

    onAddDish({ name, description: desc });
    alert('添加成功');
    setName('');
    setDesc('');
    // navigate('/'); // 可选：添加完跳转回首页
  };

  return (
    <div className="container">
      <h1>添加新菜品</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.group}>
          <label style={styles.label}>菜名：</label>
          <input 
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="比如：红烧肉"
          />
        </div>
        
        <div style={styles.group}>
          <label style={styles.label}>描述：</label>
          <input 
            style={styles.input}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="简单介绍一下"
          />
        </div>

        <button type="submit" style={styles.btn}>添加</button>
      </form>

      <button onClick={() => navigate('/orders')} style={{...styles.btn, background: '#ccc', marginTop: '10px'}}>
        返回
      </button>
    </div>
  );
}

const styles = {
  form: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
  },
  group: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  btn: {
    width: '100%',
    marginTop: '10px'
  }
};

export default Admin;