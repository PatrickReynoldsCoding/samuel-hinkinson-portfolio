import React, { useState, useEffect } from "react";

import "./pinball.css";
import { loadGame } from "./functions/loadGame";

export default function Pinball() {
  useEffect(() => {
    const canvas = document.getElementsByTagName("canvas");
    console.log(canvas);
    if (canvas.length > 0) {
      return;
    } else {
      loadGame();
    }
  }, []);

  return (
    <div className="wrapper">
      <div className="top-face">
        <img src="../public/large-face-top.png" alt="" />
      </div>
      <div className="container">
        <div className="score current-score">
          score
          <br />
          <span></span>
        </div>
      </div>
    </div>
  );
}
