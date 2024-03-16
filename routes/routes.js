import express from 'express';
import * as auth from '../controllers/authController.js';
import * as post from '../controllers/postController.js';

const router = express.Router();

// Define routes

router.get('/login', auth.login);
router.post('/login', auth.verifyLogin);
router.get('/register', auth.register);
router.post('/register', auth.verifyRegister);
router.get('/logout', auth.logout);
router.post('/changeRole', auth.changeRole);

router.get('/changePassword', auth.changePassword);
router.post('/updatePassword', auth.updatePassword);


router.get('/', auth.isAuthenticated, post.home);
router.get('/newCrossword', post.newCrossword);



//router.post('/save-crossword', post.saveCrosswordToProfile);
router.get('/crossword/:id', post.loadCrossword);
//router.post('/start-crossword', post.startAndLoadCrossword)
router.post('/submit-word', post.submitWord);

//router.post('/mark-word-found', post.markWordFound);

//router.post('/submit-word', post.submitWord);
//router.post('/add-found-word', post.addFoundWord);
//router.get('/products/:page', post.loadPosts);
//router.post('/api/products', post.getProducts);
//
//
//
//router.post('/addToCart/:productId', post.addToCart);
//router.get('/cart', post.viewCart);
//router.post('/cart/clear', post.clearCart);
//router.post('/cart/delete/:itemId', post.deleteCartItem); 
//router.post('/cart/addQuantity/:itemId', post.addQuantityToCartItem);
//router.post('/cart/minusQuantity/:itemId', post.minusQuantityToCartItem);
//router.post('/cart/purchase', post.purchase); 
//
//
//router.get('/userProfile', post.viewProfile);

            
export default router;
