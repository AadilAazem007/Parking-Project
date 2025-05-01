import pool from "../config/db.js"
import userResource from "../resources/userResource.js"
import { decryptId } from "../helpers/CommonFunctions.js"
import CommonHelper from "../helpers/CommonHelper.js"
import { validateFields } from "../helpers/CommonFunctions.js"

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

    static async deleteUser(req, res)
    {
        try{
            const userId = decryptId(req.params.id)
            const [user] = await pool.query("SELECT * FROM users WHERE id = ?", [userId])
            if(user.length > 0)
            {
                const [deleteUser] = await pool.query("DELETE FROM users WHERE id = ?", [userId])
                if(deleteUser['affectedRows'] === 1)
                {
                    res.status(200).json({"status":200, "success":true, "message":"User Deleted", "data":[]})
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
}

export default UserController