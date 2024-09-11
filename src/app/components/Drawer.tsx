"use client";

import debounce from "lodash.debounce";
import React, { useEffect, useState } from "react";
import { type Editor, Tldraw, TLShape } from "tldraw";

type Props = {
  data: {
    shapes: TLShape[] | null;
    prevCenterX: number | null;
    prevCenterY: number | null;
  } | null;
};

type Params = {
  prevCenterX: number;
  prevCenterY: number;
  editor: Editor;
  shapes: TLShape[];
};

const updateShapesLayout = ({
  prevCenterX,
  prevCenterY,
  editor,
  shapes,
}: Params) => {
  const centerXOffset = window.innerWidth / 2 - prevCenterX;
  const centerYOffset = window.innerHeight / 2 - prevCenterY;

  const newShapes = shapes.map((shape) => {
    return {
      ...shape,
      x: shape.x - centerXOffset,
      y: shape.y - centerYOffset,
    };
  });

  editor.updateShapes(newShapes);
  editor.resetZoom();
};

const Drawer = ({ data }: Props) => {
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => {
    if (!editor || !data) return;

    const { shapes, prevCenterX, prevCenterY } = data;

    if (editor && shapes && prevCenterX && prevCenterY) {
      editor.createShapes(shapes);
      updateShapesLayout({ editor, shapes, prevCenterX, prevCenterY });
    }
  }, [editor, data]);

  const saveShapesToServer = debounce(async (editor: Editor) => {
    const shapes = editor.getCurrentPageShapes();

    localStorage.setItem(
      "prevShapes",
      JSON.stringify({
        shapes,
        prevCenterX: window.innerWidth / 2,
        prevCenterY: window.innerHeight / 2,
      })
    );
  }, 230);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Tldraw
        forceMobile
        autoFocus={false}
        onMount={(editor) => {
          setEditor(editor);

          editor.sideEffects.registerAfterChangeHandler("shape", () =>
            saveShapesToServer(editor)
          );

          editor.sideEffects.registerAfterDeleteHandler("shape", () =>
            saveShapesToServer(editor)
          );
        }}
      />
    </div>
  );
};

export default Drawer;
