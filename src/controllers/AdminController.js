import pool from "../config/db.js"
import CommonHelper from "../helpers/CommonHelper.js";
import argon2 from "argon2"
import jwt from "jsonwebtoken"

class AdminController{
    static async AdminLogin(req, res){
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
            const [user] = await pool.query("SELECT * FROM admins WHERE email = ? OR mobile = ?", [email, mobile] );
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
                res.status(400).json({"status":400, "success":false, "message":"Admin not found", "data":[]})
            }
        }
        catch(error)
        {
            res.status(500).json({"status":500, "success":false, "message":"Something went wrong", "data":[]})
        }
    }


    static async AdminRegister(req, res) {
        try {
            const { name, username, email, password, mobile, city, address } = req.body;

            if (!name || !username || !email || !password || !mobile || !city || !address) {
                return res.status(400).json({ "status": 400, "success": false, "message": "All fields are required", "data": [] });
            }

            const emailRegex = await CommonHelper.emailRegex(email);
            if (emailRegex === false) {
                return res.status(400).json({ "status": 400, "success": false, "message": "Invalid email", "data": [] });
            }

            const mobileRegex = await CommonHelper.checkMobileRegex(mobile);
            if (mobileRegex === false) {
                return res.status(400).json({ "status": 400, "success": false, "message": "Invalid mobile number", "data": [] });
            }

            const hash = await argon2.hash(password);

            const checkUser = await CommonHelper.checkUser(username, email, mobile);
            if (checkUser[0].length > 0) {
                return res.status(400).json({ "status": 400, "success": false, "message": "User already exists", "data": checkUser[0] });
            }

            const [user] = await pool.query(
                "INSERT INTO admins (name, username, email, password, mobile, city, address) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [name, username, email, hash, mobile, city, address]
            );

            return res.status(201).json({ "status": 201, "success": true, "message": "Admin inserted successfully", "data": { id: user.insertId } });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ "status": 400, "success": false, "message": "Duplicate username, email, or mobile", "data": [] });
            }
            console.error('Error:', error);
            return res.status(500).json({ "status": 500, "success": false, "message": "Something went wrong", "data": [] });
        }
    }
}

export default AdminController