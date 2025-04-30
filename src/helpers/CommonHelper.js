import pool from "../config/db.js"
class CommonHelper{
    static checkUser(username, email, mobile) {
        const query = "SELECT id, username, email, mobile FROM users WHERE username = ? OR email = ? OR mobile = ?";
        return pool.query(query, [username, email, mobile]);
    }
    
    static emailRegex(email)
    {
        const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return mailRegex.test(email)
    }
    
    static checkMobileRegex(mobile)
    {
        const mobileRegex = /^\+?[1-9]\d{1,14}$/;
        return mobileRegex.test(mobile)
    }
}

export default CommonHelper