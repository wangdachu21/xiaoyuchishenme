import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Menu from './components/Menu';
import Orders from './components/Orders';
import History from './components/History';
import Admin from './components/Admin';
import BackgroundDecorations from './components/BackgroundDecorations';
import AV from 'leancloud-storage';

// 初始化 LeanCloud (需要替换为你自己的 AppID 和 AppKey)
const APP_ID = '7AmoHvpWoTjYsWcrUuCKcbMw-gzGzoHsz';
const APP_KEY = 'iriV4XpRxwuuEPL4frJ0jMID';

if (APP_ID && APP_KEY) {
  AV.init({
    appId: APP_ID,
    appKey: APP_KEY,
    serverURL: 'https://7amohvpw.lc-cn-n1-shared.com' // 使用 LeanCloud 国际版或者根据 AppID 自动推导的 API 域名
  });
}

function TabBar() {
  const location = useLocation();
  const isMenu = location.pathname === '/' || location.pathname === '/menu';
  const isOrders = location.pathname === '/orders';
  const isHistory = location.pathname === '/history';

  return (
    <div className="tab-bar">
      <Link to="/" className={`tab-item ${isMenu ? 'active' : ''}`}>
        <span className="tab-icon">🍽️</span>
        <span>点菜</span>
      </Link>
      <Link to="/orders" className={`tab-item ${isOrders ? 'active' : ''}`}>
        <span className="tab-icon">📋</span>
        <span>已点</span>
      </Link>
      <Link to="/history" className={`tab-item ${isHistory ? 'active' : ''}`}>
        <span className="tab-icon">📅</span>
        <span>记录</span>
      </Link>
    </div>
  );
}

function App() {
  // 全局状态管理（模拟数据库）
  const [menuList, setMenuList] = useState([
    { id: '1', name: '红烧肉', description: '肥而不腻，最爱吃的', image: '' },
    { id: '2', name: '番茄炒蛋', description: '经典国民菜', image: '' },
    { id: '3', name: '酸菜鱼', description: '酸辣开胃', image: '' },
    { id: '4', name: '可乐鸡翅', description: '甜甜的，很嫩', image: '' }
  ]);

  const [orders, setOrders] = useState([]);

  // 从本地存储加载数据
  useEffect(() => {
    // 优先加载本地缓存，避免白屏
    const savedMenu = localStorage.getItem('my_menu');
    if (savedMenu) {
      try {
        setMenuList(JSON.parse(savedMenu));
      } catch (e) { console.error('读取本地菜单失败', e); }
    }
    
    const savedOrders = localStorage.getItem('my_orders');
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) { console.error('读取本地订单失败', e); }
    }

    // 尝试从云端更新，设置超时
    const fetchCloudData = async () => {
      try {
        // 1. 加载菜单
        const queryMenu = new AV.Query('Menu');
        // 设置3秒超时，如果国内访问慢直接放弃云端同步
        const menuPromise = Promise.race([
          queryMenu.find(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]);

        const menuResults = await menuPromise;
        if (menuResults && menuResults.length > 0) {
          const cloudMenu = menuResults.map(item => ({
            id: item.id,
            ...item.attributes
          }));
          setMenuList(cloudMenu);
          localStorage.setItem('my_menu', JSON.stringify(cloudMenu)); // 更新本地缓存
        } else {
           // 如果云端是空的（第一次），初始化默认数据
           if (!savedMenu) {
             const defaultMenu = [
               { name: '红烧肉', description: '肥而不腻，最爱吃的', image: '' },
               { name: '番茄炒蛋', description: '经典国民菜', image: '' },
               { name: '酸菜鱼', description: '酸辣开胃', image: '' },
               { name: '可乐鸡翅', description: '甜甜的，很嫩', image: '' }
             ];
             // 尝试上传默认数据，但不阻塞
             const objects = defaultMenu.map(dish => {
                const MenuObj = AV.Object.extend('Menu');
                const menu = new MenuObj();
                menu.set('name', dish.name);
                menu.set('description', dish.description);
                menu.set('image', dish.image);
                return menu;
             });
             AV.Object.saveAll(objects).catch(e => console.log('初始化默认数据上传失败', e));
             setMenuList(defaultMenu.map((m, i) => ({ ...m, id: 'local_' + i })));
           }
        }

        // 2. 加载订单
        const queryOrders = new AV.Query('Orders');
        queryOrders.descending('createdAt');
        const orderPromise = Promise.race([
          queryOrders.find(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]);

        const orderResults = await orderPromise;
        if (orderResults) {
          const cloudOrders = orderResults.map(item => ({
            id: item.id,
            ...item.attributes,
            createTime: item.createdAt.toISOString()
          }));
          setOrders(cloudOrders);
          localStorage.setItem('my_orders', JSON.stringify(cloudOrders)); // 更新本地缓存
        }

      } catch (error) {
        console.log('云端同步失败或超时，使用本地数据模式', error);
        // 不做任何处理，静默失败，保持显示本地数据
      }
    };

    fetchCloudData();

    // 开启实时查询（轮询）
    const timer = setInterval(() => {
      const q = new AV.Query('Orders');
      q.descending('createdAt');
      q.find().then((results) => {
        const cloudOrders = results.map(item => ({
          id: item.id,
          ...item.attributes,
          createTime: item.createdAt.toISOString()
        }));
        setOrders(cloudOrders);
        localStorage.setItem('my_orders', JSON.stringify(cloudOrders));
      }).catch(e => console.log('轮询更新失败，忽略'));
    }, 10000); // 放宽到10秒，减少请求失败的频率

    return () => clearInterval(timer);
  }, []);

  const addToMenu = (dish) => {
    // 保存到云端
    const MenuObj = AV.Object.extend('Menu');
    const menu = new MenuObj();
    menu.set('name', dish.name);
    menu.set('description', dish.description);
    menu.set('image', dish.image || ''); // 支持图片
    
    menu.save().then((savedMenu) => {
      setMenuList([...menuList, { id: savedMenu.id, ...savedMenu.attributes }]);
      alert('菜品添加成功！');
    }, (error) => {
      alert('添加失败：' + error.message);
    });
  };

  const updateMenu = (id, updatedData) => {
    const menu = AV.Object.createWithoutData('Menu', id);
    menu.set('name', updatedData.name);
    menu.set('description', updatedData.description);
    if (updatedData.image !== undefined) {
      menu.set('image', updatedData.image);
    }
    
    menu.save().then(() => {
      setMenuList(menuList.map(item => {
        if (item.id === id) {
          return { ...item, ...updatedData };
        }
        return item;
      }));
      alert('修改成功');
    }).catch(error => {
      console.error('修改失败', error);
      alert('修改失败：' + error.message);
    });
  };

  const deleteMenu = (id) => {
    const menu = AV.Object.createWithoutData('Menu', id);
    menu.destroy().then(() => {
      setMenuList(menuList.filter(item => item.id !== id));
    }).catch(error => {
      console.error('删除失败', error);
      alert('删除失败：' + error.message);
    });
  };

  const addOrder = (dish) => {
    const OrderObj = AV.Object.extend('Orders');
    const order = new OrderObj();
    order.set('dishName', dish.name);
    order.set('status', 'pending');
    
    order.save().then((savedOrder) => {
      const newOrder = {
        id: savedOrder.id,
        ...savedOrder.attributes,
        createTime: savedOrder.createdAt.toISOString()
      };
      setOrders([newOrder, ...orders]);
    }, (error) => {
      alert('点菜失败：' + error.message);
    });
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const order = AV.Object.createWithoutData('Orders', orderId);
    order.set('status', newStatus);
    order.save().then(() => {
      // 更新本地状态
      setOrders(orders.map(o => {
        if (o.id === orderId) {
          return { ...o, status: newStatus };
        }
        return o;
      }));
    }).catch(error => {
      console.error('更新状态失败', error);
      alert('操作失败，请重试');
    });
  };

  const updateOrderReview = (orderId, review, reviewImage) => {
    const order = AV.Object.createWithoutData('Orders', orderId);
    order.set('review', review);
    if (reviewImage) {
      order.set('reviewImage', reviewImage);
    }
    order.save().then(() => {
      // 更新本地状态
      setOrders(orders.map(o => {
        if (o.id === orderId) {
          return { ...o, review: review, reviewImage: reviewImage || o.reviewImage };
        }
        return o;
      }));
    }).catch(error => {
      console.error('保存评价失败', error);
      alert('保存评价失败，请重试');
    });
  };

  const deleteOrder = (orderId) => {
    const order = AV.Object.createWithoutData('Orders', orderId);
    order.destroy().then(() => {
      setOrders(orders.filter(o => o.id !== orderId));
    }).catch(error => {
      console.error('删除订单失败', error);
      alert('删除失败：' + error.message);
    });
  };

  // 过滤出今天的订单或未完成的订单
  const isToday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const activeOrders = orders.filter(order => 
    order.status === 'pending' || isToday(order.createTime)
  );

  return (
    <Router basename="/zuofan-web">
      <div className="app-content">
        <BackgroundDecorations />
        <Routes>
          <Route path="/" element={<Menu menuList={menuList} onOrder={addOrder} />} />
          <Route path="/menu" element={<Menu menuList={menuList} onOrder={addOrder} />} />
          <Route path="/orders" element={<Orders orders={activeOrders} onUpdateStatus={updateOrderStatus} onDeleteOrder={deleteOrder} />} />
          <Route path="/history" element={<History orders={orders} onUpdateReview={updateOrderReview} onDeleteOrder={deleteOrder} />} />
          <Route path="/admin" element={
            <Admin 
              menuList={menuList} 
              onAddDish={addToMenu} 
              onUpdateDish={updateMenu}
              onDeleteDish={deleteMenu}
            />
          } />
        </Routes>
        <TabBar />
      </div>
    </Router>
  );
}

export default App;