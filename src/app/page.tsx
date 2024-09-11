"use client";

import { useEffect, useState } from "react";
import { type TLShape } from "tldraw";
import { Drawer } from "./components";

function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    shapes: TLShape[] | null;
    vw: number | null;
    vh: number | null;
  } | null>(null);

  useEffect(() => {
    const fetchShapes = async () => {
      setLoading(true);

      try {
        const response = await fetch("/api/shapes", {
          method: "GET",
        });

        const data = (await response.json()) as {
          shapes: TLShape[] | null;
          vw: number | null;
          vh: number | null;
        };

        setData(data);
      } catch (error) {
        console.error("Error fetching shapes:", error);
      }

      setLoading(false);
    };

    fetchShapes();
  }, []);

  if (loading) return <h2>loading...</h2>;

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Drawer data={data} />
    </div>
  );
}

export default App;
