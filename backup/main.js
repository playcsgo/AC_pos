//DOM
const container = document.querySelector('#container')
const prodcutList = document.querySelector('#product-list')
const cartList = document.querySelector('#cart-list')
const totalAmount = document.querySelector('#total-amount')
//這裡不用id, 是因為會有很多同樣的按鈕. 用id只會抓到第一個
//所以用querySelectAll 搭配class來放監聽器

// API網址  with-inventory
const prodcut_URL = 'https://ac-pos-with-inventory.firebaseio.com/products.json'


let products = []
let productMap = {}
let cartItems = []
let cartAmount = 0

//function set
function renderProductList (productMap) {
  let rawHTML = ''
  // Object.values(物件)可以把物件轉成陣列
  Object.values(productMap).forEach(product => {
    // 判斷賣完沒,使用三元運算子設定加入購物車btn的class跟文字
    const soldOut = product.inventory === 0;
    rawHTML += `
    <div class="card col-2 m-1">
    <img src="${product.imgUrl
    }" class="card-img-top img-fluid" alt="product-photo">
    <div class="card-body">
      <p class="card-title">${product.name}</p>
      <p class="card-text">${product.price}</p>
      <p class="card-text ">還有${product.inventory}份</p>
      <a href="#" class="btn btn-primary add-to-cart ${soldOut ? 'disabled' : ''}" data-id="${product.id}">${soldOut ? '已售完' : '加入購物車'}</a>
    </div>
  </div>
    `
  })
  prodcutList.innerHTML = rawHTML
}




function rendercartList(cartItems) {
  let rawHTML = ''
  cartAmount = 0
  cartItems.forEach(cartItem => {
    const product = productMap[cartItem.productId]
    cartAmount += product.price * cartItem.qty
    rawHTML += `
  <li class="list-group-item">${product.name} x ${cartItem.qty} 小記:${product.price * cartItem.qty} <button type="button" class="btn btn-danger btn-remove" data-id="${product.id}">x</button></li>
  `
  })
  cartList.innerHTML = rawHTML
  totalAmount.textContent = cartAmount
}

//AJAS for API data
axios.get(prodcut_URL).then(res => {
  products = res.data
  productMap = {}

  products.forEach(product => {
    productMap[product.id] = product
  })
  renderProductList(productMap)
  //為什麼一定要放axios裡面: 因為你放外面. 執行到的時候, AJAS還沒有把資料抓取完. 資料會是空的
})

//監聽器  
//這邊監聽器的安裝方式我是選擇個別安裝在個別按鈕上
//不是用delegation加上判別class/id的方式
//原因是因為這次只有兩組監聽器要安裝. 這樣程式碼寫起來比較簡潔
// 幹  不覺得...
container.addEventListener('click', (event) => {
  //避免向上捲動
  event.preventDefault()

  //加入購物車
  if (event.target.classList.contains('add-to-cart')) {
    let productId = event.target.dataset.id
  let cartItemIndex = cartItems.findIndex(cartItem => cartItem.productId === productId)
  // console.log(productId)
  // console.log(cartItems)
  if (cartItems.some(cartItem => cartItem.productId === productId)) {
    cartItems[cartItemIndex].qty ++
    //cartItems[cartItems.indexOf(productId)].qty += 1
    //這邊不能用indexOf, 因為cartItems裡面是物件
    //所以上面用findIndex()先找index
  } else {
  cartItems.push({productId, qty: 1})
  }
  //cartItems裡面只有產品id跟數量. 
  //然後使用其中的productId從productMap中撈資料
  productMap[productId].inventory --
  renderProductList(productMap)
  rendercartList(cartItems)
  }
  //清空購物車
  if (event.target.classList.contains('btn-reset-cart')) {
    Object.values(cartItems).forEach(item => {
      //這裡cartItem直接forEach就好. 因為他是陣列
      productMap[item.productId].inventory += item.qty
    }) 
    cartItems = []
    //cartList.innerHTML = ''  
    //因為已經cartItem =[]  直接用rendercartList(carItems)就好. 還可以檢查資料庫是否真的清空. 
    renderProductList(productMap)
    rendercartList(cartItems)
    totalAmount.textContent = '--'
  }

//結帳
if (event.target.classList.contains('btn-submit')) {
  alert(`結帳金額為 ${cartAmount}`)
  cartItems = []
  //cartList.innerHTML = ''
  //跟清空購物車一樣
  renderProductList(productMap)
  rendercartList(cartItems)
  totalAmount.textContent = '--'
}

  //從購物車中移除
  if (event.target.classList.contains('btn-remove')) {
    let productId = event.target.dataset.id
    let cartItemIndex = cartItems.findIndex(cartItem => cartItem.productId === productId)
    cartItems[cartItemIndex].qty -= 1
    productMap[productId].inventory ++
    if (cartItems[cartItemIndex].qty <= 0) {
        cartItems.splice(cartItemIndex, 1)
        }
    renderProductList(productMap)
    rendercartList(cartItems)
  }
})


//Q1. 事件監聽器的放法 -> 業界是習慣用querySelectorAll(). 還是用delegate的.  我個人是覺得用delegate的然後比對id或是class比較好. 但是你這樣的話. 就全部寫在一起了. 也可以拆開啦

// 物件. productMap[key] =  來塞入物件
// 要加入預設