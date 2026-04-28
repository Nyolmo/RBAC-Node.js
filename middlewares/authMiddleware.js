import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next)=> {
    let token;
    let authHeader = req.headers.authorization || req.headers.Authorization;

    if(authHeader && authHeader.startsWith("Bearer")){
        token = authHeader.split(" ")[1];

        if(!token){
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided"
            });
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            console.log("The decoded user is: ", req.user)
            next();
            
        } catch (err) {
            res.status(400).json({
                success: false,
                message: "Invalid token"
            });
        }   
    }
};