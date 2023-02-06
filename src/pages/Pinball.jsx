import { useState, useEffect, useRef } from "react";
import { Engine } from "matter-js";
function Pinball() {
  const scene = useRef();
  const engine = useRef(Engine.create());

  return <div ref={scene} style={{ width: "100%", height: "100%" }} />;
}

export default Pinball;
