import pool from "../config/db.js"
import adminResource from "../resources/adminResource.js"
import { decryptId } from "../helpers/CommonFunctions.js"
import CommonHelper from "../helpers/CommonHelper.js";
import { validateFields } from "../helpers/CommonFunctions.js";

class VendorController
{
    static async getAllVendors(req, res)
    {
        const vendors = await pool.query("SELECT * FROM admins WHERE type = 'vendor'")
        try{
            const vendors = await pool.query("SELECT * FROM admins WHERE type = 'vendor'")
            let resourceData = await adminResource(vendors[0])
            if(vendors[0].length > 0)
            {
                res.status(200).json({"status":200, "success":true, "message":"Vendor List", "data": resourceData})
            }
            else
            {
                res.status(200).json({"status":200, "success":false, "message":"No User Found", "data":[]})
            }
        }
        catch(error)
        {
            console.log(error)
            res.status(400).json({"status":400, "success":false, "message":"Something went wrong", "data":[]})
        }
    }

    static async getVendorById(req, res){
        try{
            const vendorId = decryptId(req.params.id)
            const [vendor] = await pool.query("SELECT * FROM admins WHERE type='vendor' AND id = ?", [vendorId])
            let resourceData = await adminResource(vendor)
            if(vendor.length > 0)
            {
                res.status(200).json({"status":200, "success":true, "message":"Vendor Details", "data":resourceData})
            }
            else
            {
                res.status(400).json({"status":400, "success":true, "message":"Invalid Vendor", "data":[]})
            }
        }
        catch(error)
        {
            res.status(500).json({"status":500, "success":false, "message":"Something went wrong", "data":[]})
        }
    }

    static async updateVendor(req, res){
        try{
            const vendorId = decryptId(req.params.id)
            const [vendor] = await pool.query("SELECT * FROM admins WHERE id = ?", [vendorId])
            if(vendor.length > 0)
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

                const [updateVendor] = await pool.query("UPDATE admins SET name = ?, email = ?, address = ?, city = ?, mobile = ? WHERE id = ?", [name, email, address, city, mobile, vendorId])
                if(updateVendor['affectedRows'] === 1)
                {
                    const [vendorData] = await pool.query("SELECT * FROM admins WHERE id = ?", [vendorId])
                    let resourceData = await adminResource(vendorData)
                    res.status(200).json({"status":200, "success":true, "message":"Vendor Updated", "data":resourceData})
                }

                let resourceData = await adminResource(updateVendor)
                res.status(200).json({"status":200, "success":true, "message":"Vendor Details", "data":resourceData})
            }
            else
            {
                res.status(400).json({"status":400, "success":true, "message":"Invalid Vendor", "data":[]})
            }
        }
        catch(error)
        {
            console.log(error, 'error in catch block')
            res.status(500).json({"status":500, "success":false, "message":"Something went wrong", "data":[]})
        }
    }

    static async deleteVendor(req, res){
        try{
            const vendorId = decryptId(req.params.id)
            const [vendor] = await pool.query("SELECT * FROM admins WHERE type = 'vendor' AND id =?", [vendorId])
            if(vendor.length > 0)
            {
                const [deleteVendor] = await pool.query("DELETE FROM admins WHERE type = 'vendor' AND id = ?", [vendorId])
                if(deleteVendor['affectedRows'] === 1)
                {
                    res.status(200).json({"status":200, "success":true, "message":`Vendor Deleted Successfully`, "data":[]})
                }
            }
            else
            {
                res.status(400).json({"status":400, "success":true, "message":"Invalid Vendor", "data":[]})
            }
        }
        catch(error)
        {
            console.log(error, 'error in catch block')
            res.status(500).json({"status":500, "success":false, "message":"Something went wrong", "data":[]})
        }
    }

}

export default VendorController