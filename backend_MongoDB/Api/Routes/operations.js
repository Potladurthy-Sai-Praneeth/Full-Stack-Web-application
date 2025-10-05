const Products = require("../../Models/standup");
const jwt = require("jsonwebtoken");
const categories = [
    "mobiles",
    "laptops",
    "televisions",
    "microwave",
    "audio",
    "refrigerators",
    "washing machines",
    "air conditioners",
];
const util = require("util");
const Users = require("../../Models/users");

// Helper function to extract JWT token from cookie string
function extractJWTFromCookie(cookieString) {
    if (!cookieString) return null;
    
    // Handle multiple cookies - split by semicolon
    const cookies = cookieString.split(';');
    
    for (let cookie of cookies) {
        const trimmedCookie = cookie.trim();
        // Check if this cookie is the jwt_Token
        if (trimmedCookie.startsWith('jwt_Token=')) {
            // Extract everything after 'jwt_Token='
            return trimmedCookie.substring('jwt_Token='.length);
        }
    }
    
    return null;
}

async function validateJWT(header) {
    try {
        if (!header) {
            return null;
        }
        let decoded = await util.promisify(jwt.verify)(
            header,
            "my@SecretKey-with-characters$"
        );
        let userCheck = await Users.findOne({ _id: decoded.id });
        if (userCheck && userCheck.passwordChangedAt) {
            if (decoded.iat < userCheck.passwordChangedAt) {
                return null;
            }
        }
        return userCheck;
    } catch (error) {
        console.error('JWT validation error:', error.message);
        return null;
    }
}
module.exports = function(router) {
    router.get("/products", async function(req, res) {
        try {
            const standup = await Products.find({});
            if (!standup || standup.length === 0) {
                res.json({ success: false, message: "No Products Found" });
            } else {
                res.json({ success: true, standup: standup });
            }
        } catch (err) {
            res.json({ success: false, message: err.message });
        }
    });

    router.get("/products/:asked", async function(req, res) {
        try {
            let standup;
            if (categories.includes(req.params.asked)) {
                const index = categories.indexOf(req.params.asked);
                standup = await Products.find({ category: categories[index] });
            } else {
                standup = await Products.find({ prodname: { $regex: String(req.params.asked), $options: "i" } });
            }
            
            if (!standup || standup.length === 0) {
                res.json({ success: false, message: "No Products Found" });
            } else {
                res.json({ success: true, standup: standup });
            }
        } catch (err) {
            res.json({ success: false, message: err.message });
        }
    });

    router.get("/product/:id", async function(req, res) {
        try {
            const standup = await Products.findOne({ _id: req.params.id });
            if (!standup) {
                res.json({ success: false, message: "No Products Found" });
            } else {
                res.json({ success: true, standup: standup });
            }
        } catch (err) {
            res.json({ success: false, message: err.message });
        }
    });

    router.post("/products", async function(req, res) {
        // if (req.cookies) {

        if (req.headers.cookie) {
            const token = extractJWTFromCookie(req.headers.cookie);
            let userStandup = await validateJWT(token);
            if (userStandup === null || userStandup === undefined) {
                res.clearCookie("jwt_Token");
                res.json({
                    success: false,
                    message: "Can't access. Please Login Again, Your Session is expired",
                });
            } else {
                try {
                    let note = new Products(req.body);
                    const savedNote = await note.save();
                    return res.status(200).json(savedNote);
                } catch (err) {
                    return res.status(400).json(err);
                }
            }
        } else {
            res.clearCookie("jwt_Token");
            res.json({
                success: false,
                message: "Can't access. Please Login Again, Your Session is expired",
            });
        }
    });

    router.put("/updateProducts/:id", async function(req, res) {
        // if (req.cookies) {

        if (!req.params.id) {
            res.json({ success: false, message: "No id is given" });
        } else {
            if (req.headers.cookie) {
                const token = extractJWTFromCookie(req.headers.cookie);
                let userStandup = await validateJWT(token);
                if (userStandup === null || userStandup === undefined) {
                    res.clearCookie("jwt_Token");
                    res.json({
                        success: false,
                        message: "Can't access. Please Login Again, Your Session is expired",
                    });
                } else {
                    try {
                        await Products.updateOne({ _id: req.params.id }, {
                            $set: {
                                id: req.body.id,
                                prodname: req.body.prodname,
                                price: req.body.price,
                                content: req.body.content,
                                image: req.body.imag,
                                popularity: req.body.popularity,
                                category: req.body.category,
                            },
                        });
                        res.json({
                            success: true,
                            message: "Product Details Updated ",
                        });
                    } catch (err) {
                        res.json({ success: false, message: "Not a Valid Product " });
                    }
                }
            } else {
                res.clearCookie("jwt_Token");
                res.json({
                    success: false,
                    message: "Can't access. Please Login Again, Your Session is expired",
                });
            }
        }
    });
    router.delete("/deleteProduct/:id", async function(req, res) {
        // if (req.cookies) {

        if (!req.params.id) {
            res.json({ success: false, message: "No id is given" });
        } else {
            if (req.headers.cookie) {
                const token = extractJWTFromCookie(req.headers.cookie);
                let userStandup = await validateJWT(token);
                if (userStandup === null || userStandup === undefined) {
                    res.clearCookie("jwt_Token");
                    res.json({
                        success: false,
                        message: "Can't access. Please Login Again, Your Session is expired",
                    });
                } else {
                    try {
                        await Products.deleteOne({ _id: req.params.id });
                        res.json({ success: true, message: "Product Deleted " });
                    } catch (err) {
                        res.json({ success: false, message: "InValid Id " });
                    }
                }
            } else {
                res.clearCookie("jwt_Token");
                res.json({
                    success: false,
                    message: "Can't access. Please Login Again, Your Session is expired",
                });
            }
        }
    });
};