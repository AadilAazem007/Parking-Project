import pool from "../config/db.js"
import { userResource, decryptId } from "../helpers/userResource.js"

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
            if(user)
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

    static async emailRegex(email)
    {
        const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return mailRegex.test(email)
    }

    static async checkMobileRegex(mobile)
    {
        const mobileRegex = /^\+?[1-9]\d{1,14}$/;
        return mobileRegex.test(mobile)
    }
}

export default UserController