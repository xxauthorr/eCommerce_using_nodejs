var express = require('express');
var router = express.Router();
const userHelper = require('../helpers/userAccountHelper')
const productHelpers = require('../helpers/productHelpers');
//Verify Login -->

const verifyLogin = ((req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
})

/* GET home page. */

router.get('/', function (req, res, next) {

  let user = req.session.user

  productHelpers.showProducts().then((product) => {
    res.render('user/userViewProducts', { product, user });
  }
  )

});

router.get('/logIn', function (req, res, next) {
  if (req.session.loggedIn)
    res.redirect('/')
  else
    res.render('user/userLogin', { userLog: true })

})

router.get('/logOut', (req, res, next) => {
  req.session.destroy()
  res.redirect('/')
})

router.post('/logIn', function (req, res, next) {
  userHelper.userLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.data
      res.redirect('/')
    } else {
      req.session.wrong = true
      res.render('user/userLogin', { wrong: true, userLog: true })
      req.session.wrong = ""
    }
  }
  )
})

router.post('/signedUp', function (req, res, next) {
  userHelper.userSignup(req.body).then((userData, insertedId) => {
    req.session.loggedIn = true
    req.session.user = userData
    res.redirect('/')
  })

})

router.get('/signUp', function (req, res, next) {
  res.render('user/userSignup', { userLog: true })
})

router.get('/addToCart', verifyLogin, (req, res) => {
  let prodId = req.query.id
  userHelper.addToCart(prodId, req.session.user._id).then(() => {
    res.redirect('/')
  })

})

router.get('/viewCart', verifyLogin, (req, res, next) => {
  let userId = req.session.user._id
  userHelper.cartProducts(userId).then((response) => {
    userHelper.cartAmount(userId).then((amount) => {
      let cart = response.cart
      if (cart.products && amount.status) {
        let total = amount.data
        let products = response.cartItems
        let user = req.session.user
        console.log(products)
        res.render('user/cart', { products, user, total })
      } else {
        let message = "Your cart is empty"
        let user = req.session.user
        res.render('user/cart', { message, user })
      }
    })
  })
})

router.get('/viewproduct', (req, res, next) => {
  let user = req.session.user
  let proId = req.query.id
  productHelpers.showProduct(proId).then((proDa) => {
    let product = proDa
    res.render('user/productView', { product, proId, user })
  })
})

router.get('/orders', verifyLogin, (req, res) => {
  let userId = req.session.user._id
  let user = req.session.user
  userHelper.showOrders(userId).then((response)=>{
    if(response.status){
      let details = response.data
      res.render('user/userOrders',{user,details})
    }else{
      res.render('user/userOrders',{user,noOrders:true})
    }
  })
  
})

router.get('/product-inc-dec', (req, res, next) => {
  let get = req.query
  userHelper.updateQnty(get.cart, get.product, get.count, get.qnty).then((response) => {
    res.redirect('/user/viewcart')
  })
})

router.get('/buyproduct',verifyLogin,(req,res,next)=>{
  userId = req.session.user._id
  console.log(userId)
  userHelper.userAddOrder(req.query.productId,userId).then(()=>{
    res.render('user/proAdded')
  })
})

module.exports = router;
