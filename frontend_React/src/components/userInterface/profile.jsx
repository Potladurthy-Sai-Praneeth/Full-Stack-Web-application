import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.css";
import "./../../Styling/App.css";
import Footer from "./footer";
import ProductIndividual from "./productIndividual";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { startGettingIndividualUser } from "../actions/actions";

function mapStateToProps(state) {
  return {
    store: state,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
            startGettingIndividualUser,
    },
    dispatch
  );
}

class Profile extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      
      cart: [],
      actualUser: this.props.store.individualUserObject || { items: [] },
      orders: [],
      extra: true,
    };
  }
  async componentDidMount() {
    // Set user data - will show login prompt if not logged in
    this.setState({
      actualUser: this.props.store.individualUserObject || { items: [] },
    });
  }
  async componentDidUpdate() {
    if (this.state.extra) {
      // Only fetch user data if logged in and has email
      if (this.props.store.isLoggedIn && this.props.store.email) {
        try {
          await this.props.startGettingIndividualUser(
            `http://localhost:8081/api/users/${this.props.store.email}`
          );
         
          this.setState({ extra: false });
          setTimeout(() => {
            this.setState({ actualUser: this.props.store.individualUserObject || { items: [] } });
          }, 1000);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          this.setState({ extra: false });
        }
      } else {
        // User not logged in, don't fetch
        this.setState({ extra: false });
      }
    }
  }

  render() {
    return (
      <div className="profile text-centered">
        {!this.props.store.isLoggedIn ? (
          <div className="container mt-5">
            <div className="alert alert-info" role="alert">
              <h4 className="alert-heading">Please Log In</h4>
              <p>You need to be logged in to view your profile and orders.</p>
              <hr />
              <Link to="/Login" className="btn btn-primary">Go to Login</Link>
            </div>
          </div>
        ) : this.props.store.user !== "Admin" ? (
          <div>
            <p>
              <b> Hi </b> {this.state.actualUser?.name || 'Guest'}
            </p>
            <p>
              <b> Your registered email: </b>
              {this.state.actualUser?.userid || 'Not logged in'}
            </p>
            <label>
              <b> Your Previous Orders: </b>
            </label>
            {/* <p> {this.state.orders} </p> */}
            <div className="productIndividual">
              {this.state.actualUser?.items && this.state.actualUser.items.length > 0 ? (
                this.state.actualUser.items.map((el, index) => {
                  return <ProductIndividual data={el} key={index} />;
                })
              ) : (
                <div>
                  <p>No Orders Yet</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link to={{ pathname: "/Admin" }}>
            <br />
            <button className="btn btn-success">View Items</button>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
          </Link>
        )}
       
        <Footer />
      </div>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Profile);
