const Wishlist = require("../../Models/wishlist");
const Users = require("../../Models/users");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectID } = require("mongodb");
const util = require("util");

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
    router.get("/wishlist/:id", async function(req, res) {
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
                        let wishlistID = userStandup.wishlist;
                        const standup = await Wishlist.findOne({ _id: wishlistID });
                        if (!standup) {
                            res.json({ success: false, message: "No Products Found" });
                        } else {
                            res.json({ success: true, standup: standup.products });
                        }
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
    router.post("/addToWishlist/:id", async function(req, res) {
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
                        let wishlistID = userStandup.wishlist;
                        const standup = await Wishlist.updateOne({ _id: wishlistID }, {
                            $push: {
                                products: {
                                    productId: req.body.productId,
                                },
                            },
                        });
                        if (standup) {
                            res.json({
                                success: true,
                                message: "wishlist Item Quantity Added ",
                            });
                        } else {
                            res.json({
                                success: false,
                                message: "No Products Found",
                            });
                        }
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

    router.delete(
        "/deleteWishlist/:userId/:productId",
        async function(req, res) {
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
                            let wishlistID = userStandup.wishlist;
                            await Wishlist.updateOne({ _id: wishlistID }, {
                                $pull: {
                                    products: { productId: req.params.productId },
                                },
                            }, { multi: "true" });
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
        }
    );

    router.delete("/deleteTotalWishlist/:id", async function(req, res) {
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
                        let wishlistID = userStandup.wishlist;
                        await Wishlist.updateOne({ _id: wishlistID }, {
                            $set: {
                                products: [{
                                    productId: ObjectID("0000000088ff740dc8a7831b"),
                                }, ],
                            },
                        });
                        res.json({
                            success: true,
                            message: "wishlist Deleted ",
                        });
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