import pool from "../config/db.js"
import argon2 from "argon2"
import jwt from "jsonwebtoken"
import knex from 'knex';
import knexfile from '../../knexfile.js';
import CommonHelper from "../helpers/CommonHelper.js";
import { validateFields } from "../helpers/CommonFunctions.js";
import { uploadImage, handleUploadErrors } from "../middlewares/upload.js";

const db = knex(knexfile.development);

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

class AuthController
{
    static async Login(req, res){
        try{
            const {email, mobile, password} = req.body;
            if(!email && !mobile)
            {
                return res.status(400).json({"status":400, "success":false, "message":"Please insert email or mobile", "data":[]})
            }
            
            if(!password)
            {
                return res.status(400).json({"status":400, "success":false, "message":"Please insert password", "data":[]})
            }
            const [user] = await pool.query("SELECT * FROM users WHERE is_active = 1 AND email = ? OR mobile = ?", [email, mobile] );
            if(user.length > 0)
            {
                if(user[0].is_active === 0)
                {
                    return res.status(400).json({"status":400, "success":false, "message":"User is not active", "data":[]})
                }

                const passwordMatch = await argon2.verify(user[0].password, password);
                if(passwordMatch)
                {
                    const token = jwt.sign({id:user[0].id,email:user[0].email}, process.env.JWT_SECRET);
                    res.status(200).json({"status":200, "success":true, "message":"Login Successfully", "data":user[0], "token":token})
                }
            }
            else
            {
                res.status(400).json({"status":400, "success":false, "message":"User not found", "data":[]})
            }
        }
        catch(error)
        {
            res.status(500).json({"status":500, "success":false, "message":"Something went wrong", "data":[]})
        }
    }

    static async loginWithMobile(req, res)
    {
        try
        {
            const { mobile, OTP } = req.body;
            if (!mobile || !OTP) {
                return res.status(400).json({ status: 400, success: false, message: 'Please provide both mobile and OTP', data: []});
            }

            const query = db('users').select('id', 'username', 'email', 'mobile', 'OTP', 'is_active');
            if (mobile) {
                query.where({ mobile }).orWhere({ OTP });
            }

            const users = await query;

            if (users.length === 0) {
                return res.status(404).json({ status: 404, success: false, message: 'No user found with provided mobile', data: [] });
            }

            if(users[0].OTP !== OTP)
            {
                return res.status(400).json({ status: 400, success: false, message: 'Invalid OTP', data: [] });
            }

            if(users[0].is_active === 0)
            {
                return res.status(400).json({ status: 400, success: false, message: 'User is not active', data: [] });
            }

            await db('users')
            .where({ id: users[0].id })
            .update({ OTP: null});

            const token = jwt.sign({ id: users[0].id, email: users[0].email }, process.env.JWT_SECRET);
            res.status(200).json({ status: 200, success: true, message: 'Login Successfully', data: users[0], token: token });

        }
        catch(error)
        {
            console.error('Error:', error);
            return res.status(500).json({ "status": 500, "success": false, "message": "Something went wrong", "data": [] });
        }
    }

    static async Register(req, res) {
        try {
            await new Promise((resolve, reject) => {
                uploadImage(req, res, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            const { name, username, email, password, mobile, city, address } = req.body;
            const image = req.file ? req.file.buffer : null;

            // This validateFields function is from CommonFunctions.js and created by Aadil Aazem
            const validationError = validateFields({ name: name, username: username, email: email, password: password, mobile: mobile, city: city, address: address, image: req.file })
              if (validationError) {
                return res.status(400).json({ status: 400, success: false, message: validationError, data: [] });
            }

            const emailRegex = CommonHelper.emailRegex(email);
            if (emailRegex === false) {
                return res.status(400).json({ "status": 400, "success": false, "message": "Invalid email", "data": [] });
            }

            const mobileRegex = CommonHelper.checkMobileRegex(mobile);
            if (mobileRegex === false) {
                return res.status(400).json({ "status": 400, "success": false, "message": "Invalid mobile number", "data": [] });
            }

            const hash = await argon2.hash(password);

            const checkUser = await CommonHelper.checkUser(username, email, mobile);
            if (checkUser[0].length > 0) {
                return res.status(400).json({ "status": 400, "success": false, "message": "User already exists", "data": checkUser[0] });
            }

            const [user] = await pool.query(
                "INSERT INTO users (name, username, email, password, mobile, city, address, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [name, username, email, hash, mobile, city, address, image]
            );

            return res.status(201).json({ "status": 201, "success": true, "message": "User inserted successfully", "data": { id: user.insertId } });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ "status": 400, "success": false, "message": "Duplicate username, email, or mobile", "data": [] });
            }
            console.error('Error:', error);
            return res.status(500).json({ "status": 500, "success": false, "message": "Something went wrong", "data": [] });
        }
    }

    static async sendOTP(req, res) {
        try {
          const { email, mobile } = req.body;
    
          if (!email && !mobile) {
            return res.status(400).json({ status: 400, success: false, message: 'Please provide either email or mobile', data: []});
          }
    
          const query = db('users').select('id', 'username', 'email', 'mobile');
          if (email && mobile) {
            query.where({ email }).orWhere({ mobile });
          } else if (email) {
            query.where({ email });
          } else if (mobile) {
            query.where({ mobile });
          }
    
          const users = await query;
    
          if (users.length === 0) {
            return res.status(404).json({ status: 404, success: false, message: 'No user found with provided email or mobile', data: [] });
          }
    
          const otp = generateOTP();
          await db('users')
            .where({ id: users[0].id })
            .update({ OTP: otp });
    
          console.log(`OTP ${otp} generated for user:`, users[0]);
    
          return res.status(200).json({ status: 200, success: true, message: 'OTP generated successfully', data: { user: users[0] }
          });
        } catch (error) {
          console.error('Error in sendOTP:', error);
          return res.status(500).json({ status: 500, success: false, message: 'Something went wrong', data: [] });
        }
      }

    static async activateUser(req, res)
    {
        try
        {
            const { email, mobile, OTP } = req.body;
            if (!email && !mobile) {
                return res.status(400).json({ status: 400, success: false, message: 'Please provide either email or mobile', data: []});
            }

            if(!OTP)
            {
                return res.status(400).json({ status: 400, success: false, message: 'Please provide OTP', data: []});
            }

            const query = db('users').select('id', 'username', 'email', 'mobile', 'OTP', 'is_active');
            if (email && mobile) {
                query.where({ email }).orWhere({ mobile });
            } else if (email) {
                query.where({ email }).orWhere({ OTP });
            } else if (mobile) {
                query.where({ mobile }).orWhere({ OTP });
            }

            const users = await query;

            if (users.length === 0) {
                return res.status(404).json({ status: 404, success: false, message: 'No user found with provided email or mobile', data: [] });
            }

            if(users[0].OTP !== OTP)
            {
                return res.status(400).json({ status: 400, success: false, message: 'Invalid OTP', data: [] });
            }

            await db('users')
            .where({ id: users[0].id })
            .update({ OTP: null, is_active: true });
            return res.status(200).json({ status: 200, success: true, message: 'User activated successfully', data: { user: users[0] }
            });

        }
        catch(error)
        {
            console.error('Error:', error);
            return res.status(500).json({ "status": 500, "success": false, "message": "Something went wrong", "data": [] });
        }
    }
}

export default AuthController