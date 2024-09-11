"use client";

import { type TLShape } from "tldraw";
import { Drawer } from "./components";
import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState<{
    shapes: TLShape[] | null;
    prevCenterX: number | null;
    prevCenterY: number | null;
  } | null>(null);

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      const json = localStorage.getItem("prevShapes");

      if (json) {
        const savedData = JSON.parse(json) as {
          shapes: TLShape[] | null;
          prevCenterX: number | null;
          prevCenterY: number | null;
        };

        setData(savedData);
      }
    }
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Drawer data={data} />
    </div>
  );
}

export default App;
