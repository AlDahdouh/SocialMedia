import React from "react";
import spinner from "./spinner.gif";

function Spinner(props) {
  return (
    <>
      <img
        src={spinner}
        style={{ width: "200px", margin: "auto", display: "block" }}
        alt="loading..."
      />
    </>
  );
}

export default Spinner;
