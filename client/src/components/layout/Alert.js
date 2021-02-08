import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

const Alert = ({ alerts }) => {
  if (alerts !== null && alerts.length > 0) {
    return alerts.map((alert) => (
      <div key={alert.id} className={`alert alert-${alert.alertType}`}>
        {alert.msg}
      </div>
    ));
  }
  return <></>;
};

Alert.propTypes = {
  alerts: PropTypes.array.isRequired,
};
const mapSateToProps = (state) => ({ alerts: state.alert });

export default connect(mapSateToProps)(Alert);
