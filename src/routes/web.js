import express from 'express'
import UserController from '../controllers/UserController.js'
import AuthController from '../controllers/AuthController.js'
import AdminController from '../controllers/AdminController.js'
import VendorController from '../controllers/VendorController.js'
import authValidator from '../middlewares/authValidator.js'
const router = express.Router()

//Admin Auth Routes
router.post('/admin-register', AdminController.AdminRegister)
router.post('/admin-login', AdminController.AdminLogin)

//User Auth Routes (This Routes for users)
router.post('/register', AuthController.Register)
router.post('/login', AuthController.Login)
router.post('/sendOTP', AuthController.sendOTP)
router.post('/activateUser', AuthController.activateUser)
router.post('/loginWithMobile', AuthController.loginWithMobile)

//Users Routes
router.get('/users/userlist', authValidator,  UserController.userList)
router.get('/users/:id', authValidator,  UserController.getUserById)
router.put('/users/:id', authValidator,  UserController.updateUser)
router.delete('/users/:id', authValidator,  UserController.deleteUser)

//Vendor Routes
router.get('/vendors/', authValidator, VendorController.getAllVendors)
router.get('/vendors/:id', authValidator, VendorController.getVendorById)
router.put('/vendors/:id', authValidator, VendorController.updateVendor)
router.delete('/vendors/:id', authValidator, VendorController.deleteVendor)

export default router