import React from "react";
import AppFilteredIndividual from "./appFilteredIndividual";
import "../../Styling/App.css";
import "bootstrap/dist/css/bootstrap.css";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { startGettingRequestedProducts } from "../actions/actions";

function mapStateToProps(state) {
  return {
    store: state,
  };
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators({ startGettingRequestedProducts }, dispatch);
}
class AppFiltered extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      input: [],
      asked: this.props.asked,
    };
  }
  
  componentDidMount() {
    this.apiget();
  }
  
  async apiget() {
    try {
      const response = await fetch(
        `http://localhost:8081/api/products/${this.props.asked}`,
        {
          method: "GET",
          mode: "cors",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Credentials": true,
          },
          redirect: "follow",
        }
      );
      const data = await response.json();
      if (data && data.standup) {
        this.setState({ input: data.standup });
      }
    } catch (error) {
      console.error(`Error fetching ${this.props.asked}:`, error);
    }
  }
  render() {
    return (
      <div>
        <div className="container">
          <br />
          <h2>
            <i>Popular {this.state.asked}</i>
          </h2>
          <div className="row mt-5 popular">
            {this.state.input
              .filter((el) => el.popularity === "high")
              .map((el) => (
                <AppFilteredIndividual data={el} key={el._id} />
              ))}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppFiltered);
// export default AppFiltered;
