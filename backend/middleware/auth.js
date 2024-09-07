const jwt = require('jsonwebtoken');
const User = require("../src/User/userModel.js");

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer", "");
        const decoded = jwt.verify(token, "nanyytatan");
        const user = await User.findOne({
            _id: decoded._id,
            "tokens.token": token
        })
        if (!user) {
            throw new Error();
        }
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        req.status(401).send({ error: "Please Authenticate" });
    }
}

module.exports = auth;