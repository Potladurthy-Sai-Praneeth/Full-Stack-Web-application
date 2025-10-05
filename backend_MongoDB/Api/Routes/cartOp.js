const Cart = require("../../Models/cart");
const jwt = require("jsonwebtoken");
const Users = require("../../Models/users");
const { MongoClient, ObjectID } = require("mongodb");
const util = require("util");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || ""); // Use your personal Stripe secret API key

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
module.exports = function (router) {
  router.post("/addToCart/:id", async function (req, res) {
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
            message:
              "Can't access. Please Login Again, Your Session is expired",
          });
        } else {
          try {
            let cartID = userStandup.cart;
            const standup = await Cart.updateOne(
              { _id: cartID },
              {
                $push: {
                  products: {
                    productId: req.body.productId,
                    price: req.body.price,
                    quantity: req.body.quantity,
                  },
                },
              }
            );
            if (standup) {
              res.json({
                success: true,
                message: "Cart Item Quantity Added ",
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

  router.get("/cart/:id", async function (req, res) {
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
            message:
              "Can't access. Please Login Again, Your Session is expired",
          });
        } else {
          try {
            let cartID = userStandup.cart;
            const standup = await Cart.findOne({ _id: cartID });
            if (!standup) {
              res.json({
                success: false,
                message: "No Products Found",
              });
            } else {
              res.json({
                success: true,
                standup: standup.products,
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
  router.get("/getCartTotal/:id", async function (req, res) {
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
            message:
              "Can't access. Please Login Again, Your Session is expired",
          });
        } else {
          let cartID = userStandup.cart;

          try {
            const standup = await Cart.aggregate([
              {
                $match: { _id: cartID },
              },
              {
                $project: {
                  _id: 0,
                  total: {
                    $sum: {
                      $map: {
                        input: "$products",
                        in: {
                          $multiply: ["$$this.price", "$$this.quantity"],
                        },
                      },
                    },
                  },
                  items: { $sum: { $size: "$products" } },
                },
              },
            ]);
            if (!standup) {
              res.json({
                success: false,
                message: "No Products Found",
              });
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
    }
  });

  router.patch("/updateCart/:userId/:productId", async function (req, res) {
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
            message:
              "Can't access. Please Login Again, Your Session is expired",
          });
        } else {
          try {
            let cartID = userStandup.cart;
            const standup = await Cart.updateOne(
              {
                _id: cartID,
                "products.productId": req.params.productId,
              },
              {
                $set: { "products.$.quantity": req.body.quantity },
              }
            );
            console.log(standup);
            res.json({
              success: true,
              message: "Cart Item Quantity Updated ",
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

  router.delete("/deleteCart/:userId/:productId", async function (req, res) {
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
            message:
              "Can't access. Please Login Again, Your Session is expired",
          });
        } else {
          try {
            let cartID = userStandup.cart;
            await Cart.updateOne(
              { _id: cartID },
              {
                $pull: {
                  products: { productId: req.params.productId },
                },
              },
              { multi: "true" }
            );
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

  router.delete("/deleteTotalCart/:id", async function (req, res) {
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
            message:
              "Can't access. Please Login Again, Your Session is expired",
          });
        } else {
          try {
            let cartID = userStandup.cart;
            const standup = await Cart.updateOne(
              { _id: cartID },
              {
                $set: {
                  products: [
                    {
                      productId: ObjectID("0000000088ff740dc8a7831b"),
                      price: 0,
                      quantity: 0,
                    },
                  ],
                },
              }
            );
            console.log(standup);
            res.json({ success: true, message: "Cart Deleted " });
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

  router.post("/checkout/:id", async function (req, res) {
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
            message:
              "Can't access. Please Login Again, Your Session is expired",
          });
        } else {
          const sess = await stripe.checkout.sessions.create({
            mode: "payment",
            success_url: "http://localhost:4400/OrderSummary",
            cancel_url: "http://localhost:4400/Cart",
            customer_email: req.body.email,
            client_reference_id: req.params.id,
            line_items: req.body.product.map((el) => {
              return {
                name: el.prodname,
                images: [el.image],
                amount: el.price * 100,
                quantity: el.quantity,
                currency: "INR",
              };
            }),
          });
          const paymentIntent = await stripe.paymentIntents.create({
            amount: req.body.amount * 100,
            currency: "INR",
            automatic_payment_methods: {
              enabled: true,
            },
          });

          res.json({
            success: true,
            payment_session: sess,
            clientSecret: paymentIntent.client_secret,
          });
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
