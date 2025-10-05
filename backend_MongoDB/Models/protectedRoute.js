const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const Users = require("../../Models/users");

export async function validateJWT(header) {
    try {
        let token;
        if (header.authorization && header.authorization.startsWith("Bearer"))
            token = header.authorization.split(" ")[1];

        if (!token) return false;

        const decoded = await promisify(jwt.verify)(
            token,
            "my@SecretKey-with-characters$"
        );

        Users.findById({ _id: decoded.id }, (err, standup) => {
            if (err) {
                console.error('User lookup error:', err.message);
                return false;
            }
            if (standup.passwordChangedAt) {
                if (decoded.iat < standup.passwordChangedAt) {
                    return false;
                } else return true;
            } else return true;
        });
    } catch (error) {
        console.error('JWT validation error:', error.message);
        return false;
    }
}