// DOM for renderpage
const dataPanel = document.querySelector('#data-panel')
const productList = document.querySelector('#product-list')
const cartList = document.querySelector('#cart-list')
const totalAmount = document.querySelector('#total-amount')

// API info _URL
const BASIC_URL = 'https://ac-pos-with-inventory.firebaseio.com/products.json'

// model{} 資料
const model = {
  productMap: {},
  cartItems: [],
  cartAmount: 0,
  getData(url) {
    axios.get(url).then(res => {
      res.data.forEach(product => {
        this.productMap[product.id] = product
      })
      view.renderProductLsit(this.productMap)
    })
  },
}

// view{} 畫面相關
const view = {
  renderProductLsit(data) {
    let rawHTML = ''
    Object.values(data).forEach(product => {
      let soldOut = product.inventory === 0
      rawHTML += `
    <div class="card col-2 m-1">
        <img src="${product.imgUrl
        }" class="card-img-top img-fluid rounded" alt="product-photo">
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">${product.price} $</p>
          <p class="card-text">剩下${product.inventory}份</p>
          <a href="#" class="btn btn-primary btn-add-to-cart ${soldOut ? "disabled" : ''}" data-id="${product.id}">${soldOut ? '已售完' :"加入購物車"}</a>
        </div>
      </div>
      `
    })
    productList.innerHTML = rawHTML
  },
  rendercartList(cartItems) {
    let rawHTML = ''
    model.cartAmount = 0
    cartItems.forEach(item => {
      const product = model.productMap[item.productId]
      model.cartAmount += product.price * item.qty
      rawHTML += `
      <li class="list-group-item">${product.name} x ${item.qty} 小記:${product.price * item.qty} 
      <button class="btn btn-danger btn-remove ms-3" data-id="${product.id}">x</button>
      </li>
      `
    })
    cartList.innerHTML = rawHTML
    totalAmount.textContent = model.cartAmount
  }

}

// control{} 控制流程
const controller = {
  setEventListener(){
    dataPanel.addEventListener('click', event => {
      event.preventDefault()
      const classCheck = event.target.classList
      const productId = event.target.dataset.id
      const cartItemIndex = model.cartItems.findIndex(item => item.productId === productId)
       //2-1 加入購物車
      if (classCheck.contains('btn-add-to-cart')) {
        this.addToCart(productId, cartItemIndex)
      }
      //2-2 從購物車中移除  
      if (classCheck.contains('btn-remove')) {
        this.removeFromCart(productId, cartItemIndex)
      }
      //2-3 清空購物車 (數量會補回inventory)
      if (classCheck.contains('btn-removeAllCart')) {
        this.removeAllCart(productId)
      }
      //2-4 結帳 (產品售出, 不會回填inventory)
      if (classCheck.contains('btn-submit-cart')) {
        this.cartCheck()
      }
    })
  },
  addToCart(productId, cartItemIndex) {
    if (model.cartItems.some(item => item.productId === productId)) {
      model.cartItems[cartItemIndex].qty ++
    } else {
      model.cartItems.push({productId, qty: 1})
    }
    model.productMap[productId].inventory --
    view.renderProductLsit(model.productMap)
    view.rendercartList(model.cartItems)
  },
  removeFromCart(productId, cartItemIndex) {
    model.cartItems[cartItemIndex].qty --
    model.productMap[productId].inventory ++
    if (model.cartItems[cartItemIndex].qty === 0) {
      model.cartItems.splice(cartItemIndex, 1)
      }
    view.renderProductLsit(model.productMap)
    view.rendercartList(model.cartItems)
  },
  removeAllCart(productId) {
    model.cartItems.forEach(item => {
      model.productMap[item.productId].inventory += item.qty
    })
    model.cartItems = []
    view.renderProductLsit(model.productMap)
    view.rendercartList(model.cartItems)
  },
  cartCheck() {
    if (model.cartItems.length > 0) {
      alert(`結帳金額${model.cartAmount}`)
      model.cartAmount = 0
      model.cartItems = []
      view.rendercartList(model.cartItems)
    }
  },
}

// main code 主程式
// AJAS for API data (這裡用的是axios)
// eventListener
model.getData(BASIC_URL)
controller.setEventListener()
