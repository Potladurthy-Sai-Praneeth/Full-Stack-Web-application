// User Related Functions
import axios from "axios";
let jwtToken = "";

export function fetchOptions() {
  return {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin

    credentials: "include", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": true,
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
  };
}

export function startShowingLoading() {
  return (dispatch) => {
    dispatch(showLoading(true));
  };
}
export function startHidingLoading() {
  return (dispatch) => {
    dispatch(hideLoading(false));
  };
}

export function showLoading(payload) {
  return { type: "SHOW_LOADING", payload: payload };
}

export function hideLoading(payload) {
  return { type: "HIDE_LOADING", payload: payload };
}

export function getAndSetJwt(payload) {
  return (dispatch) => {
    jwtToken = payload;
    dispatch(setJwt(payload));
  };
}

export function setJwt(payload) {
  return { type: "JWT", payload: payload };
}

export function changeUser(payload) {
  return { type: "CHANGE_USER", payload: payload };
}

export function resetUser(payload) {
  return { type: "RESET_USER", payload: payload };
}

export function startGettingAllUsers(payload) {
  return (dispatch) => {
    return fetch(payload, fetchOptions())
      .then((resp) => resp.json())
      .then((inp) => {
        let users = [];
        users = inp.standup;
        if (inp.success) {
          dispatch(getAllUsers(users));
        } else dispatch(verifyUserDetails(inp));
      })
      .catch((error) => {
        console.error('Error fetching all users:', error);
        dispatch(getAllUsers([]));
      });
  };
}

export function startGettingIndividualUser(payload) {
  return (dispatch) => {
    return fetch(payload, fetchOptions())
      .then((resp) => resp.json())
      .then((inp) => {
        let user = {};
        user = inp.standup;
        if (inp.success) {
          dispatch(getIndividualUser(user));
        } else dispatch(verifyUserDetails(inp));
      })
      .catch((error) => {
        console.error('Error fetching individual user:', error);
        dispatch(getIndividualUser({ items: [] }));
      });
  };
}

export function startDeletingUser(payload) {
  return (dispatch) => {
    axios.defaults.headers.common["Authorization"] = jwtToken;
    axios.defaults.withCredentials = true;
    return axios.delete(payload).then((inp) => {
      if (inp.success)
        dispatch(deleteIndividualUser("Users Deleted from database"));
      else dispatch(verifyUserDetails(inp));
    }).catch((error) => {
      console.error('Error deleting user:', error);
      dispatch(verifyUserDetails({ success: false, message: 'Failed to delete user' }));
    });
  };
}

export function startAddingUser(url, data) {
  return (dispatch) => {
    axios.defaults.withCredentials = true;
    return axios.post(url, data).then((inp) => {
      dispatch(addUser(inp.data.user));
    }).catch((error) => {
      console.error('Error adding user:', error);
      dispatch(verifyUserDetails({ success: false, message: 'Failed to add user' }));
    });
  };
}

export function startSendingEmailToUser(url, data) {
  return (dispatch) => {
    axios.defaults.withCredentials = true;
    return axios.post(url, data).then((inp) => {
      dispatch(verifyUserDetails(inp.data));
    }).catch((error) => {
      console.error('Error sending email to user:', error);
      dispatch(verifyUserDetails({ success: false, message: 'Failed to send email' }));
    });
  };
}

export function startResettingPassword(url, data) {
  return (dispatch) => {
    axios.defaults.headers.common["Authorization"] = jwtToken;
    return axios.post(url, data).then((inp) => {
      dispatch(verifyUserDetails(inp.data));
    }).catch((error) => {
      console.error('Error resetting password:', error);
      dispatch(verifyUserDetails({ success: false, message: 'Failed to reset password' }));
    });
  };
}
export function startUpdatingUserPassword(url, data) {
  return (dispatch) => {
    axios.defaults.headers.common["Authorization"] = jwtToken;
    return axios.post(url, data).then((inp) => {
      dispatch(verifyUserDetails(inp.data));
    }).catch((error) => {
      console.error('Error updating user password:', error);
      dispatch(verifyUserDetails({ success: false, message: 'Failed to update password' }));
    });
  };
}
export function startUpdatingUser(url, data) {
  return (dispatch) => {
    axios.defaults.headers.common["Authorization"] = jwtToken;
    return axios.patch(url, data).then((inp) => {
      if (inp.data.success) dispatch(updateUser(inp.data));
      else dispatch(verifyUserDetails(inp.data));
    }).catch((error) => {
      console.error('Error updating user:', error);
      dispatch(verifyUserDetails({ success: false, message: 'Failed to update user' }));
    });
  };
}

export function startVerifyingUserDetails(url, data) {
  return (dispatch) => {
    axios.defaults.headers.common["Authorization"] = jwtToken;
    axios.defaults.withCredentials = true;
    return axios.post(url, data).then((inp) => {
      dispatch(verifyUserDetails(inp.data));
      dispatch(changeUser(inp.data.userName));
    }).catch((error) => {
      console.error('Error verifying user details:', error);
      dispatch(verifyUserDetails({ success: false, message: 'Failed to verify user' }));
    });
  };
}

export function verifyUserDetails(payload) {
  return { type: "VERIFY_USER", payload: payload };
}

export function getAllUsers(payload) {
  return { type: "GET_ALL_USERS", payload: payload };
}

export function getIndividualUser(payload) {
  return { type: "GET_INDIVIDUAL_USER", payload: payload };
}

export function deleteIndividualUser(payload) {
  return { type: "DELETE_INDIVIDUAL_USER", payload: payload };
}
export function addUser(payload) {
  return { type: "ADD_USER", payload: payload };
}

export function updateUser(payload) {
  return { type: "UPDATE_USER", payload: payload };
}

// Products Related functions

export function startGettingRequestedProducts(payload) {
  return (dispatch) => {
    return fetch(payload, fetchOptions())
      .then((resp) => resp.json())
      .then((inp) => {
        let products = [];
        if (inp && inp.standup) {
          products = inp.standup;
        }
        dispatch(getRequestedProducts(products));
      })
      .catch((error) => {
        console.error('Error fetching requested products:', error);
        dispatch(getRequestedProducts([]));
      });
  };
}

export function startGettingIndividualProduct(payload) {
  return (dispatch) => {
    return fetch(payload, fetchOptions())
      .then((resp) => resp.json())
      .then((inp) => {
        let product = {};
        product = inp.standup;
        dispatch(getIndividualProduct(product));
      })
      .catch((error) => {
        console.error('Error fetching individual product:', error);
        dispatch(getIndividualProduct({}));
      });
  };
}

export function startGettingIndividualProductForCart(payload, qty) {
  return (dispatch) => {
    return fetch(payload, fetchOptions())
      .then((resp) => resp.json())
      .then((inp) => {
        let product = {};
        product = inp.standup;
        product.quantity = qty.quantity;
        return product;
      })
      .catch((error) => {
        console.error('Error fetching individual product for cart:', error);
        return {};
      });
  };
}

export function startDeletingProduct(payload) {
  return (dispatch) => {
    axios.defaults.withCredentials = true;
    return axios.delete(payload).then((inp) => {
      if (inp.data.success)
        dispatch(deleteIndividualProduct("Product Deleted from database"));
      else dispatch(verifyUserDetails(inp.data));
    }).catch((error) => {
      console.error('Error deleting product:', error);
      dispatch(verifyUserDetails({ success: false, message: 'Failed to delete product' }));
    });
  };
}

export function startAddingProduct(url, data) {
  return (dispatch) => {
    axios.defaults.withCredentials = true;
    return axios.post(url, data).then((inp) => {
      if (inp.success) dispatch(addProduct(inp));
      else dispatch(verifyUserDetails(inp));
    }).catch((error) => {
      console.error('Error adding product:', error);
      dispatch(verifyUserDetails({ success: false, message: 'Failed to add product' }));
    });
  };
}
export function startEditingProduct(url, data) {
  return (dispatch) => {
    axios.defaults.withCredentials = true;
    return axios.put(url, data).then((inp) => {
      if (inp.success) dispatch(editProduct(inp));
      else dispatch(verifyUserDetails(inp));
    }).catch((error) => {
      console.error('Error editing product:', error);
      dispatch(verifyUserDetails({ success: false, message: 'Failed to edit product' }));
    });
  };
}

export function getRequestedProducts(payload) {
  return { type: "GET_REQUESTED_PRODUCTS", payload: payload };
}

export function getIndividualProduct(payload) {
  return { type: "GET_INDIVIDUAL_PRODUCT", payload: payload };
}

export function deleteIndividualProduct(payload) {
  return { type: "DELETE_INDIVIDUAL_PRODUCT", payload: payload };
}
export function addProduct(payload) {
  return { type: "ADD_INDIVIDUAL_PRODUCT", payload: payload };
}
export function editProduct(payload) {
  return { type: "EDIT_INDIVIDUAL_PRODUCT", payload: payload };
}

// Cart Related Funcions

export function startGettingAllCart(payload) {
  return (dispatch) => {
    return fetch(payload, fetchOptions())
      .then((resp) => resp.json())
      .then((inp) => {
        if (inp.success) {
          let cart = [];
          inp.standup.map(async (el) => {
            if (el.price === 0 || el.quantity === 0) return;
            else {
              return await fetch(
                `http://localhost:8081/api/product/${el.productId}`
              )
                .then((resp) => resp.json())
                .then(async (inp) => {
                  let obj = inp.standup;
                  obj.quantity = el.quantity;
                  cart.push(obj);
                  return await obj;
                });
            }
          });
          setTimeout(() => {
            dispatch(getTotalCart(cart));
          }, 1000);
        } else dispatch(verifyUserDetails(inp));
      })
      .catch((error) => {
        console.error('Error fetching cart:', error);
        dispatch(getTotalCart([]));
      });
  };
}

export function startDeletingAllCart(payload) {
  return (dispatch) => {
    axios.defaults.withCredentials = true;
    return axios.delete(payload).then((inp) => {
      if (inp.success)
        dispatch(deleteTotalCart("Complete Cart Deleted from database"));
      else dispatch(verifyUserDetails(inp));
    }).catch((error) => {
      console.error('Error deleting all cart:', error);
      dispatch(verifyUserDetails({ success: false, message: 'Failed to delete cart' }));
    });
  };
}
export function startDeletingIndividualCart(payload) {
  return (dispatch) => {
    axios.defaults.withCredentials = true;
    return axios.delete(payload).then((inp) => {
      if (inp.success)
        dispatch(
          deleteIndividualCart("Specific Cart Item Deleted from database")
        );
      else dispatch(verifyUserDetails(inp));
    }).catch((error) => {
      console.error('Error deleting individual cart:', error);
      dispatch(verifyUserDetails({ success: false, message: 'Failed to delete cart item' }));
    });
  };
}

export function startUpdatingCart(url, data) {
  return (dispatch) => {
    axios.defaults.withCredentials = true;
    return axios.patch(url, data).then((inp) => {
      if (inp.success) dispatch(updateCart(inp));
      else dispatch(verifyUserDetails(inp));
    }).catch((error) => {
      console.error('Error updating cart:', error);
      dispatch(verifyUserDetails({ success: false, message: 'Failed to update cart' }));
    });
  };
}

export function startGettingCartAmount(payload) {
  return (dispatch) => {
    return fetch(payload, fetchOptions())
      .then((resp) => resp.json())
      .then((inp) => {
        console.log(inp);
        if (inp.success)
          dispatch(
            getCartAmount({
              total: inp.standup[0].total,
              items: inp.standup[0].items - 1,
            })
          );
        else dispatch(verifyUserDetails(inp));
      })
      .catch((error) => {
        console.error('Error fetching cart amount:', error);
        dispatch(getCartAmount({ total: 0, items: 0 }));
      });
  };
}

export function startAddingToCart(url, data) {
  return (dispatch) => {
    axios.defaults.withCredentials = true;
    return axios.post(url, data).then((inp) => {
      if (inp.success) dispatch(addToCart(inp));
      else dispatch(verifyUserDetails(inp));
    }).catch((error) => {
      console.error('Error adding to cart:', error);
      dispatch(verifyUserDetails({ success: false, message: 'Failed to add to cart' }));
    });
  };
}

export function startCheckOut(url, data) {
  return (dispatch) => {
    axios.defaults.withCredentials = true;
    return axios.post(url, data).then((inp) => {
      console.log(inp);
      if (inp.data.success) dispatch(checkout(inp.data.clientSecret));
      else dispatch(verifyUserDetails(inp));
    }).catch((error) => {
      console.error('Error during checkout:', error);
      dispatch(verifyUserDetails({ success: false, message: 'Failed to checkout' }));
    });
  };
}

export function getTotalCart(payload) {
  return { type: "GET_TOTAL_CART", payload: payload };
}
export function checkout(payload) {
  return { type: "CHECKOUT", payload: payload };
}

export function getIndividualCart(payload) {
  return { type: "GET_INDIVIDUAL_CART", payload: payload };
}

export function getCartAmount(payload) {
  return { type: "GET_CART_AMOUNT", payload: payload };
}

export function deleteIndividualCart(payload) {
  return { type: "DELETE_INDIVIDUAL_CART", payload: payload };
}

export function deleteTotalCart(payload) {
  return { type: "DELETE_TOTAL_CART", payload: payload };
}
export function addToCart(payload) {
  return { type: "ADD_TO_CART", payload: payload };
}
export function updateCart(payload) {
  return { type: "UPDATE_CART", payload: payload };
}

// Wishlist Related functions

export function startGettingAllWishlist(payload) {
  return (dispatch) => {
    return fetch(payload, fetchOptions())
      .then((resp) => resp.json())
      .then((inp) => {
        let wish = [];

        inp.standup.map(async (el) => {
          if (el.productId.substring(0, 2) === "00") return;
          else {
            return await fetch(
              `http://localhost:8081/api/product/${el.productId}`
            )
              .then((resp) => resp.json())
              .then(async (inp) => {
                wish.push(inp.standup);
                return await inp.standup;
              });
          }
        });

        setTimeout(() => {
          if (inp.success) dispatch(getTotalWishlist(wish));
          else dispatch(verifyUserDetails(inp));
        }, 1000);
      })
      .catch((error) => {
        console.error('Error fetching wishlist:', error);
        dispatch(getTotalWishlist([]));
      });
  };
}

export function startDeletingAllWishlist(payload) {
  return (dispatch) => {
    axios.defaults.withCredentials = true;
    return axios.delete(payload).then((inp) => {
      if (inp.success)
        dispatch(
          deleteTotalWishlist("Complete Wishlist Deleted from database")
        );
      else dispatch(verifyUserDetails(inp));
    }).catch((error) => {
      console.error('Error deleting all wishlist:', error);
      dispatch(verifyUserDetails({ success: false, message: 'Failed to delete wishlist' }));
    });
  };
}
export function startDeletingIndividualWishlist(payload) {
  return (dispatch) => {
    axios.defaults.withCredentials = true;
    return axios.delete(payload).then((inp) => {
      if (inp.success)
        dispatch(
          deleteIndividualWishlist(
            "Specific Wishlist Item Deleted from database"
          )
        );
      else dispatch(verifyUserDetails(inp));
    }).catch((error) => {
      console.error('Error deleting individual wishlist:', error);
      dispatch(verifyUserDetails({ success: false, message: 'Failed to delete wishlist item' }));
    });
  };
}
export function startAddingToWishlist(url, data) {
  return (dispatch) => {
    axios.defaults.withCredentials = true;
    return axios.post(url, data).then((inp) => {
      if (inp.success) dispatch(addToWishlist(inp));
      else dispatch(verifyUserDetails(inp));
    }).catch((error) => {
      console.error('Error adding to wishlist:', error);
      dispatch(verifyUserDetails({ success: false, message: 'Failed to add to wishlist' }));
    });
  };
}

export function getTotalWishlist(payload) {
  return { type: "GET_TOTAL_WISHLIST", payload: payload };
}

export function deleteIndividualWishlist(payload) {
  return { type: "DELETE_INDIVIDUAL_WISHLIST", payload: payload };
}

export function deleteTotalWishlist(payload) {
  return { type: "DELETE_TOTAL_WISHLIST", payload: payload };
}
export function addToWishlist(payload) {
  return { type: "ADD_TO_WISHLIST", payload: payload };
}
