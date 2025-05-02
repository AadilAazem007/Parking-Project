import pool from "../config/db.js"
import userResource from "../resources/userResource.js"
import { decryptId } from "../helpers/CommonFunctions.js"
import CommonHelper from "../helpers/CommonHelper.js"
import { validateFields } from "../helpers/CommonFunctions.js"
import path from 'path';
import fs from 'fs';

class UserController
{
    static async userList(req, res){
        try{
            const [users] = await pool.query("SELECT * FROM users")
            let resourceData = await userResource(users)
            if(users)
            {
                res.status(200).json({"status":200, "success":true, "message":"User List", "data": resourceData})
            }
            else
            {
                res.status(200).json({"status":200, "success":true, "message":"No User Found", "data":[]})
            }
        }
        catch(error)
        {
            res.status(500).json({"status":500, "success":false, "message":"Something went wrong", "data":[]})
        }
    }


    static async getUserById(req, res){
        try{
            const userId = decryptId(req.params.id)
            const [user] = await pool.query("SELECT * FROM users WHERE id = ?", [userId])
            let resourceData = await userResource(user)
            if(user.length > 0)
            {
                res.status(200).json({"status":200, "success":true, "message":"User List", "data":resourceData})
            }
            else
            {
                res.status(200).json({"status":200, "success":true, "message":"No User Found", "data":[]})
            }
        }
        catch(error)
        {
            res.status(500).json({"status":500, "success":false, "message":"Something went wrong", "data":[]})
        }
    }

    static async updateUser(req, res){
        try{
            const userId = decryptId(req.params.id)
            const [user] = await pool.query("SELECT * FROM users WHERE id = ?", [userId])
            if(user.length > 0)
            {
                const { name, email, address, city, mobile } = req.body

                // This validateFields function is from CommonFunctions.js and created by Aadil Aazem
                const validationError = validateFields({ name: name, email: email, address: address, city: city, mobile: mobile })
                if (validationError) {
                return res.status(400).json({ status: 400, success: false, message: validationError, data: [] });
                }

                const emailRegex =  CommonHelper.emailRegex(email);
                if (emailRegex === false) {
                    return res.status(400).json({ "status": 400, "success": false, "message": "Invalid email", "data": [] });
                }

                const mobileRegex =  CommonHelper.checkMobileRegex(mobile);
                if (mobileRegex === false) {
                    return res.status(400).json({ "status": 400, "success": false, "message": "Invalid mobile number", "data": [] });
                }

                const [updateUser] = await pool.query("UPDATE users SET name = ?, email = ?, address = ?, city = ?, mobile = ? WHERE id = ?", [name, email, address, city, mobile, userId])
                if(updateUser['affectedRows'] === 1)
                {
                    const [userData] = await pool.query("SELECT * FROM users WHERE id = ?", [userId])
                    let resourceData = await userResource(userData)
                    res.status(200).json({"status":200, "success":true, "message":"User Updated", "data":resourceData})
                }
            }
            else
            {
                res.status(200).json({"status":200, "success":true, "message":"No User Found", "data":[]})
            }
        }
        catch(error)
        {
            res.status(500).json({"status":500, "success":false, "message":"Something went wrong", "data":[]})
        }
    }

    static async deleteUser(req, res) {
        try {
            const userId = decryptId(req.params.id);
            const [user] = await pool.query("SELECT image FROM users WHERE id = ?", [userId]);
            
            if (user.length === 0) {
                return res.status(404).json({ status: 404, success: false, message: "User not found", data: [] });
            }
    
            // Delete the image file from uploads folder
            if (user[0].image) {
                const imagePath = path.join('src/uploads', user[0].image.replace('/src/uploads/', ''));
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath); // Delete the file
                }
            }
    
            // Delete the user from database
            await pool.query("DELETE FROM users WHERE id = ?", [userId]);
            return res.status(200).json({ status: 200, success: true, message: "User deleted successfully", data: [] });
        } catch (error) {
            console.error('Error in DeleteUser:', error);
            return res.status(500).json({ status: 500, success: false, message: "Failed to delete user", data: [] });
        }
    }

    static async GetUserImage(req, res) {
        try {
            const userId = decryptId(req.params.id);
            const [rows] = await pool.query(
                "SELECT image FROM users WHERE id = ?",
                [userId]
            );

            if (rows.length === 0 || !rows[0].image) {
                return res.status(404).json({ status: 404, success: false, message: "Image not found", data: [] });
            }

            // Return the image path
            return res.json({ status: 200, success: true, message: "Image path retrieved", data: { imagePath: rows[0].image } });
        } catch (error) {
            console.error('Error in GetUserImage:', error);
            return res.status(500).json({ status: 500, success: false, message: "Failed to retrieve image", data: [] });
        }
    }
}

export default UserController