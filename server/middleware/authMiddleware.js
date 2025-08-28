const jwt = require('jsonwebtoken');

async function authMiddleware(req, res, next) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodeToken = jwt.verify(token, process.env.SECRET_KEY);
        req.userId = decodeToken.userId;
        next();
    } catch (error) {
        res.send({
            message: error.message,
            success: false
        })
    }
}

module.exports = {authMiddleware};