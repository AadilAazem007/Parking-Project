import jwt  from "jsonwebtoken";

const authValidator = (req, res, next) => {
    const authHeader = req.headers['authorization']
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        res.status(400).json({"status":400, "success":false, "message":"Token not found", "data":[]})
    }

    const token = authHeader.split(' ')[1]
    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decode

        next()
    }
    catch(error)
    {
        res.status(401).json({"status":401, "success":false, "message":"Invalid Tokan or Token Expired", "data":[]})
    }
}

export default authValidator