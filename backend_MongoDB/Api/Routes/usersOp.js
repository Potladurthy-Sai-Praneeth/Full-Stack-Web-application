const Users = require("../../Models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { crypto } =
import ("crypto");
const nodemailer = require("nodemailer");

const Cart = require("../../Models/cart");
const Wishlist = require("../../Models/wishlist");
const { MongoClient, ObjectID } = require("mongodb");

async function createEmptyCartOrWishlist(opt) {
    if (opt === "cart") {
        let note = await new Cart({
            products: [{
                productId: ObjectID("0000000088ff740dc8a7831b"),
                quantity: 0,
                price: 0,
            }, ],
        });
        await note.save();
        return note._id;
    } else if (opt === "wishlist") {
        let note = await new Wishlist({
            products: [{ productId: ObjectID("0000000088ff740dc8a7831b") }],
        });
        await note.save();
        return note._id;
    }
}

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
async function confirmLogin(entered, database) {
    let val = await bcrypt.compare(entered, database);
    return val;
}

function getJwt(id) {
    let tok = jwt.sign({ id: id }, "my@SecretKey-with-characters$", {
        expiresIn: "10m",
    });
    return tok;
}

function getResetToken() {
    const resetToken = crypto.randomBytes(32).toString("hex");
    return resetToken;
}

const sendEmail = async(options) => {
    const transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "",//User your personal User Id
            pass: "", //User your personal pass code
        },
    });
    const mailOptions = {
        from: "E$!Te <E$!Te.org.in>",
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    await transport.sendMail(mailOptions);
};

module.exports = function(router) {
    router.get("/users", async function(req, res) {
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
                    const standup = await Users.find({});
                    if (!standup || standup.length === 0) {
                        res.json({ success: false, message: "No Users Found" });
                    } else {
                        res.json({ success: true, standup: standup });
                    }
                } catch (err) {
                    res.json({ success: false, message: err.message });
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

    router.get("/users/:id", async function(req, res) {
        if (!req.params.id) {
            res.json({ success: false, message: "No id is given" });
        } else {
            try {
                const standup = await Users.findOne({ userid: req.params.id });
                if (!standup) {
                    res.json({ success: false, message: "No Users Found" });
                } else {
                    const token = getJwt(standup._id);
                    res.cookie("jwt_Token", token, {
                        expire: new Date(Date.now() + 10 * 60 * 1000),
                        httpOnly: true,
                    });
                    res.json({ success: true, standup: standup });
                }
            } catch (err) {
                res.json({ success: false, message: err.message });
            }
        }
    });

    router.post("/users", async function(req, res) {
        let cartObj = await createEmptyCartOrWishlist("cart");
        let wishObj = await createEmptyCartOrWishlist("wishlist");

        let note = new Users({
            name: req.body.name,
            userid: req.body.userid,
            password: req.body.password,
            orders: req.body.orders,
            items: req.body.items,
            cart: cartObj,
            wishlist: wishObj,
        });

        try {
            const savedNote = await note.save();
            return res.status(200).json({ user: savedNote });
        } catch (err) {
            return res.status(400).json(err);
        }
    });
    router.patch("/updateUsers/:id", async function(req, res) {
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
                        await Users.updateOne({ _id: req.params.id }, {
                            $set: { orders: req.body.orders, items: req.body.items },
                        });
                        res.json({
                            success: true,
                            message: "User Details Updated ",
                        });
                    } catch (err) {
                        res.json({ success: false, message: err.message });
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

    router.post("/forgotPassword", async function(req, res) {
        if (!req.body.email)
            res.json({ success: false, message: "No Email is given in request" });
        else {
            let standup = await Users.findOne({ userid: req.body.email });

            if (standup) {
                const resetNormal = getResetToken();
                const resetHash = crypto
                    .createHash("sha256")
                    .update(resetNormal)
                    .digest("hex");
                try {
                    await Users.updateOne({ userid: req.body.email }, {
                        $set: {
                            resetToken: resetHash,
                            resetTokenExpiry: Date.now() + 10 * 60 * 1000,
                        },
                    });
                    sendEmail({
                        email: req.body.email,
                        subject: "Your password Reset Token. Valid for 10 min only",
                        message: `Hi ${req.body.email}, \n Your unique secret token to reset password is:${resetNormal}\n Don't share it with anyone.\n This is valid only for 10 min.`,
                    });
                    res.json({
                        success: true,
                        message: "User is Valid and Mail is sent",
                    });
                } catch (err) {
                    res.json({
                        success: false,
                        message: err.message,
                    });
                }
            } else
                res.json({
                    success: false,
                    message: "Not a Valid User, Please Enter a valid Email Id ",
                });
        }
    });
    router.post("/resetPassword", async function(req, res) {
        if (!req.body.resetToken || !req.body.pass)
            res.json({
                success: false,
                message: "No Token is given in request",
                token: "",
            });
        else {
            const tokenHash = crypto
                .createHash("sha256")
                .update(req.body.resetToken)
                .digest("hex");

            try {
                const requi = await Users.updateOne({
                    resetToken: tokenHash,
                    resetTokenExpiry: { $gt: Date.now() },
                }, {
                    $set: {
                        password: req.body.pass,
                        resetToken: undefined,
                        resetTokenExpiry: undefined,
                        passwordChangedAt: Date.now(),
                    },
                });
                if (requi && requi.modifiedCount > 0) {
                    res.json({
                        success: true,
                        message: "Password is Reset",
                        token: "",
                    });
                } else {
                    res.json({
                        success: false,
                        message: "Your Token is incorrect or expired.Please Login again",
                        token: "",
                    });
                }
            } catch (err) {
                res.json({ success: false, message: err.message });
            }
        }
    });

    router.post("/updatePassword", async function(req, res) {
        // if (req.cookies) {

        if (!req.body.newPassword || !req.body.id)
            res.json({
                success: false,
                message: "No Password or Id is given in request",
                token: "",
            });
        else {
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
                    const jwt = getJwt(req.body.id);
                    try {
                        await Users.updateOne({ _id: req.body.id }, {
                            $set: {
                                password: req.body.newPassword,
                                resetToken: undefined,
                                resetTokenExpiry: undefined,
                                passwordChangedAt: Date.now(),
                            },
                        });
                        res.json({
                            success: true,
                            message: "Password is Reset",
                            token: jwt,
                        });
                    } catch (err) {
                        res.json({ success: false, message: err.message, token: "" });
                    }
                }
            } else {
                res.json({
                    success: false,
                    message: "Can't access. Please Login Again, Your Session is expired",
                    token: "",
                });
            }
        }
    });

    router.post("/verifyUser", async function(req, res) {
        if (!req.body.email || !req.body.pwd)
            res.json({
                success: false,
                message: "No Email is given in request",
            });
        else {
            let document = await Users.findOne({ userid: req.body.email });
            if (document) {
                if (await confirmLogin(req.body.pwd, document.password))
                    res.json({
                        success: true,
                        message: "User is Valid",
                        userName: document.name,
                        token: await getJwt(document._id),
                    });
                else
                    res.json({
                        success: false,
                        message: "Invalid User Credentials",
                        userName: "SignIn",
                    });
            } else
                res.json({
                    success: false,
                    message: "Not a Valid User, Please SignUp to continue",
                    userName: "SignIn",
                });
        }
    });

    router.delete("/deleteUsers/:id", async function(req, res) {
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
                        await Users.deleteOne({ _id: req.params.id });
                        res.json({ success: true, message: "User Deleted " });
                    } catch (err) {
                        res.json({ success: false, message: "InValid Id " });
                    }
                }
            } else {
                res.json({
                    success: false,
                    message: "Can't access. Please Login Again, Your Session is expired",
                    token: "",
                });
            }
        }
    });
};