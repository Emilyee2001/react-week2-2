// import環境變數
const baseUrl = import.meta.env.VITE_BASE_URL;
const apiPath = import.meta.env.VITE_API_PATH;
import { useState } from 'react';
import axios from 'axios';

function App() {
  // 建立account帳號密碼狀態
  const [account, setAccount] = useState({
    username: '',
    password: '',
  })

  // 建立是否登入通過驗證狀態
  const [isAuth, setIsAuth] = useState(false);

  // 建立products陣列狀態
  const [products, setProducts] = useState([]);

  // 建立product物件狀態
  const [tempProduct, setTempProduct] = useState({});

  // 建立驗證登入狀態
  const [loginStatus, setLoginStatus] = useState('未驗證登入');

  // input有onChange事件時觸發函式 改變account狀態
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAccount({
      ...account,
      [name]: value,
    })
  }

  // form監聽onSubmit事件
  // 有輸入帳密觸發函式戳API 未輸入完整則alert
  const handleLogin = (e) => {
    e.preventDefault();
    const { username, password } = account;
    { username && password ? userLogin() : alert('請輸入使用者帳號密碼') }
  }

  // 登入API取得token和expired存入cookie & 改變isAuth狀態
  // 執行取得資料函式
  const userLogin = async () => {
    try {
      const res = await axios.post(`${baseUrl}/v2/admin/signin`, account);
      setIsAuth(true);
      const { token, expired } = res.data;
      getProducts(token);
      document.cookie = `eeToken=${token}; expires=${new Date(expired)}`;
    } catch (error) {
      alert('登入失敗');
    }
  }

  // 取回token 設定axios預設headers
  const authToken = document.cookie.replace(
    /(?:(?:^|.*;\s*)eeToken\s*\=\s*([^;]*).*$)|^.*$/,
    "$1",
  );
  axios.defaults.headers.common['Authorization'] = authToken;

  // 取得資料API
  const getProducts = async (token) => {
    try {
      const res = await axios.get(`${baseUrl}/v2/api/${apiPath}/admin/products`,{
        headers:{
          authorization: token
        }
      });
      setProducts(res.data.products);
    } catch (error) {
      console.log('取得資料失敗');
    }
  }

  // 驗證登入API
  const checkLogin = async () => {
    try {
      await axios.post(`${baseUrl}/v2/api/user/check`)
      setLoginStatus('驗證成功');
    } catch (error) {
      setLoginStatus('驗證失敗');
    }
  }

  return (<>
    {isAuth ?
      // 登入成功產品列表畫面
      (<div className="container my-5">
        <div className="row">
          <div className="col-md-6">
            <h4 className='mb-3'>專題班學習組#3 異國香料電商</h4>
            <div className='d-flex'>
              <h2 className="mb-3">產品列表</h2>
              <button type="button" className="btn btn-success mb-3 ms-3" onClick={checkLogin}>{loginStatus}</button>
            </div>
            <table className="table">
              <thead className="table-primary">
                <tr>
                  <th scope="col">產品名稱</th>
                  <th scope="col">原價</th>
                  <th scope="col">售價</th>
                  <th scope="col">是否啟用</th>
                  <th scope="col">查看細節</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => {
                  return (
                    <tr key={product.id}>
                      <th scope="row">{product.title}</th>
                      <td>{product.origin_price}</td>
                      <td>{product.price}</td>
                      <td>{product.is_enabled ? "是" : "否"}</td>
                      <td><button type="button" className="btn btn-primary" onClick={() => setTempProduct(product)}>查看細節</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="col-md-6">
            <h2 className="mb-3">單一產品細節</h2>
            {tempProduct.title ? (
              <div className="card">
                <img src={tempProduct.imageUrl} className="card-img-top img-fluid" alt="{tempProduct.title}" />
                <div className="card-body">
                  <h5 className="card-title">{tempProduct.title}<span className="badge bg-primary ms-2">{tempProduct.category}</span></h5>
                  <ul>
                    <li>商品描述：{tempProduct.description}</li>
                    <li>商品內容：{tempProduct.content}</li>
                    <li>售價：<del className="text-secondary">{tempProduct.origin_price}元</del> / {tempProduct.price}元</li>
                  </ul>
                  <div className="fs-5">更多圖片：{tempProduct.imagesUrl?.map((image, index) => {
                    return image ? (<img src={image} key={index} className="img-fluid mb-3" alt={tempProduct.title} />) : (<img key={index} className="d-none" />)
                  })}
                  </div>
                </div>
              </div>) : (<p className="text-secondary fs-5">點選按鈕查看產品細節</p>)}
          </div>
        </div>
      </div>) :
      // 請先登入畫面
      (<div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <h1 className="mb-5">請先登入</h1>
        <form className="d-flex flex-column gap-3" onSubmit={handleLogin}>
          <div className="form-floating mb-3">
            <input type="email" className="form-control" id="username" placeholder="name@example.com" name="username" onChange={handleInputChange} />
            <label htmlFor="username">Email address</label>
          </div>
          <div className="form-floating">
            <input type="password" className="form-control" id="password" placeholder="Password" name="password" onChange={handleInputChange} />
            <label htmlFor="password">Password</label>
          </div>
          <button className="btn btn-primary">登入</button>
        </form>
        <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
      </div>)}
  </>)
}

export default App
