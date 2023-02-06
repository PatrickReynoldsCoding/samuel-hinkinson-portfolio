import React, { useState, useEffect } from "react";

import "./pinball.css";
import { loadGame } from "./functions/loadGame";

export const Pinball = () => {
  // useEffect(() => {
  //   if (document.getElementById("canvas")) {
  //     return null;
  //   } else {
  //     loadGame();
  //   }
  // }, []);

  useEffect(() => {
    let container = document.getElementById("pinball");
    console.log(container);
    if (container.id === "pinball") {
      return;
    } else {
      loadGame();
    }
  }, []);
};
// function definately loads two canvases at the same time!!! You need to google Matter.js in react or you need to give the canvas tag an ID
