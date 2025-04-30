import express from 'express'
import UserController from '../controllers/UserController.js'
import AuthController from '../controllers/AuthController.js'
import AdminController from '../controllers/AdminController.js'
import authValidator from '../middlewares/authValidator.js'
const router = express.Router()

//Auth Routes
router.post('/register', AuthController.Register)
router.post('/login', AuthController.Login)
router.post('/sendOTP', AuthController.sendOTP)
router.post('/activateUser', AuthController.activateUser)
router.post('/loginWithMobile', AuthController.loginWithMobile)


//Users Routes
router.get('/users/userlist', authValidator,  UserController.userList)
router.get('/users/:id', authValidator,  UserController.getUserById)

//Admin Routes
router.post('/admin-register', AdminController.AdminRegister)
router.post('/admin-login', AdminController.AdminLogin)

export default router