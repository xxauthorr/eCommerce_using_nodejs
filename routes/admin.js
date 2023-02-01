var express = require('express');
var router = express.Router();
var adminHelper = require('../helpers/adminAccountHelper')
var add_products = require('../helpers/productHelpers')
var sampleData = require('../datas/sampledata');
var productHelpers = require('../helpers/productHelpers');
var fs = require('fs');
const req = require('express/lib/request');

const verifyAdminLogin = ((req, res, next) => {
  if (req.session.adminLoggedIn) {
    next()
  } else {
    res.redirect('/admin')
  }
})



/* GET users listing. */
router.get('/', function (req, res) {
  if(req.session.adminLoggedIn){
    res.redirect('/admin/products')
  }else
  res.render('admin/adminLogin', { admin: true, title: "Cherish Garments" });

})

router.get('/adminLogout', (req, res, next) => {
  req.session.destroy()
  res.redirect('/admin')
})


router.post('/products', function (req, res, next) {
  if (req.session.adminLoggedIn) {
    req.session.adminLoggedIn = true
    req.session.admin = response.adminData
    let adminData = response.adminData
    productHelpers.showProducts().then((product) => {
      res.render('admin/viewProducts', { pro: true, product, adminData, title: "CG | Products List" });

    })

  } else {

    adminHelper.adminLoggedIn(req.body).then((response) => {

      if (response.admin) {
        req.session.adminLoggedIn = true
        req.session.admin = response.adminData
        let adminData = response.adminData
        productHelpers.showProducts().then((product) => {
          res.render('admin/viewProducts', { pro: true, product, adminData, title: "CG | Products List" });
        })
      } else {
        let message = response.adminData
        res.render('admin/adminLogin', { message, admin: true, title: "Cherish Garments" })
      }
    })
  }
});

router.get('/products', verifyAdminLogin,function (req, res, next) {
  if (req.session.adminLoggedIn) {
    let adminData = res.session.admin
    productHelpers.showProducts().then((product) => {
      res.render('admin/viewProducts', { pro: true, product, adminData, title: "CG | Products List" });

    })

  }else{
      let message = response.adminData
      res.render('admin/adminLogin', { message, admin: true, title: "Cherish Garments" })
  }
});

router.get('/addProducts', verifyAdminLogin, (req, res, next) => {
  res.render('admin/addProducts', { pro: true, title: "CG | Add Products" })
});

router.post('/productAdded', verifyAdminLogin, function (req, res, next) {

  add_products.addProduct(req.body, (imgId) => {
    console.log(req.files.img)
    let image = req.files.img
    image.mv('./public/images/' + imgId + '.jpg', (err, done) => {
      if (err) {
        console.log(err)
      }
      else {
        res.render('admin/addProducts', { admin: true, title: "CG | Add Products" });
      }
    })
  });
});

router.get('/signUp', verifyAdminLogin, (req, res, next) => {
  res.render('admin/adminSignup', { pro: true })
})


router.post('/signedUp', verifyAdminLogin, (req, res, next) => {
  adminHelper.adminSignup(req.body).then((data) => {

    let staff = data
    res.render('admin/adminSignup', { staff })
  })
})

router.get('/productDelete', verifyAdminLogin, (req, res, next) => {
  let product = req.query.id
  productHelpers.deleteProduct(product).then((response) => {
    productHelpers.showProducts().then((product) => {
      res.render('admin/viewProducts', { pro: true, product, title: "CG | Products List" });

    })
  })
})

router.get('/productEdit', verifyAdminLogin, (req, res, next) => {
  let product = req.query.id
  productHelpers.editProduct(product).then((response) => {
    productData = response
    res.render('admin/editProduct', { productData, pro: true })

  })
})

router.post('/productEdit', verifyAdminLogin, (req, res, next) => {
  productHelpers.updateProduct(req.body, req.query.id).then((response) => {
    productHelpers.showProducts().then((product) => {
      res.render('admin/viewProducts', { pro: true, product });

    })

  })
})

router.post('/productEditted', verifyAdminLogin, (req, res, next) => {
  let image = req.files.img
  image.mv('./public/images/' + req.query.id + '.jpg', (err, done) => {
    if (err) {
      console.log(err)
    }
    else {
      productHelpers.updateProduct(req.body, req.query.id).then((response) => {
        productHelpers.showProducts().then((product) => {
          res.render('admin/viewProducts', { pro: true, product });

        })

      })

    }
  })

})

router.get('/changeimage', verifyAdminLogin, (req, res) => {
  let product = req.query.id
  productHelpers.editProduct(product).then((response) => {
    productData = response
    res.render('admin/editProduct', { productData, change: true, pro: true })

  })

})

module.exports = router;
