"use client";

import debounce from "lodash.debounce";
import React, { useEffect, useState } from "react";
import { type Editor, Tldraw, TLShape } from "tldraw";

type Props = {
  data: {
    shapes: TLShape[] | null;
    vw: number | null;
    vh: number | null;
  } | null;
};

const resizeShapes = ({
  shapes,
  vw,
  vh,
  editor,
}: {
  shapes: TLShape[];
  vw: number;
  vh: number;
  editor: Editor;
}) => {
  const currentVw = window.innerWidth;
  const currentVh = window.innerHeight;

  shapes.forEach((shape) => {
    editor.resizeShape(shape, { x: currentVw / vw, y: currentVh / vh });
  });
};

const Drawer = ({ data }: Props) => {
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => {
    if (!editor || !data) return;

    const shapes = data.shapes as TLShape[] | null;
    const vw = data.vw as number | null;
    const vh = data.vh as number | null;

    if (editor && shapes && vw && vh) {
      editor.createShapes(shapes);
      resizeShapes({ editor, shapes, vw, vh });
      editor.zoomToFit();
    }
  }, [editor, data]);

  const saveShapesToServer = debounce(async () => {
    if (!editor) return;

    const shapes = editor.getCurrentPageShapes();

    try {
      const response = await fetch("/api/shapes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shapes,
          vw: window.innerWidth,
          vh: window.innerHeight,
        }),
      });

      if (!response.ok) {
        throw new Error("Error saving shapes to server");
      }
    } catch (error) {
      console.error("Error saving shapes:", error);
    }
  }, 100);

  if (!data) return;

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Tldraw
        forceMobile
        autoFocus={false}
        onMount={(editor) => {
          setEditor(editor);

          editor.sideEffects.registerAfterChangeHandler(
            "shape",
            saveShapesToServer
          );

          editor.sideEffects.registerAfterDeleteHandler(
            "shape",
            saveShapesToServer
          );
        }}
      />
    </div>
  );
};

export default Drawer;
