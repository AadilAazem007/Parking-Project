import express from 'express'
import UserController from '../controllers/UserController.js'
import AuthController from '../controllers/AuthController.js'
const router = express.Router()


router.get('/', UserController.index)

//Auth Routes
router.post('/register', AuthController.Register)
router.post('/login', AuthController.Login)
router.post('/sendOTP', AuthController.sendOTP)
router.post('/activateUser', AuthController.activateUser)
router.post('/loginWithMobile', AuthController.loginWithMobile)


//Users Routes
router.get('/users/userlist', UserController.userList)

export default router