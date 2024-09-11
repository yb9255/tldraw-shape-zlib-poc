'use client';

import { useRef, useEffect, useState } from 'react';
import { type Editor, Tldraw, type TLShape } from 'tldraw';
import debounce from 'lodash.debounce';

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

function App() {
  const appRef = useRef<Editor | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchShapes = async () => {
      setLoading(true);

      try {
        const response = await fetch('/api/shapes', {
          method: 'GET',
        });

        const editor = appRef.current;

        const data = (await response.json()) as {
          shapes: TLShape[] | null;
          vw: number | null;
          vh: number | null;
        };

        const shapes = data.shapes as TLShape[] | null;
        const vw = data.vw as number | null;
        const vh = data.vh as number | null;

        if (editor && shapes && vw && vh) {
          editor.createShapes(shapes);
          resizeShapes({ editor, shapes, vw, vh });
          editor.zoomToFit();
        }
      } catch (error) {
        console.error('Error fetching shapes:', error);
      }

      setLoading(false);
    };

    fetchShapes();
  }, []);

  const saveShapesToServer = debounce(async () => {
    if (!appRef.current) return;

    const shapes = appRef.current.getCurrentPageShapes();

    try {
      const response = await fetch('/api/shapes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shapes,
          vw: window.innerWidth,
          vh: window.innerHeight,
        }),
      });

      if (!response.ok) {
        throw new Error('Error saving shapes to server');
      }
    } catch (error) {
      console.error('Error saving shapes:', error);
    }
  }, 100);

  if (loading) return <h2>loading...</h2>;

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Tldraw
        forceMobile
        autoFocus={false}
        onMount={(editor) => {
          appRef.current = editor;

          editor.sideEffects.registerAfterChangeHandler(
            'shape',
            saveShapesToServer
          );

          editor.sideEffects.registerAfterDeleteHandler(
            'shape',
            saveShapesToServer
          );
        }}
      />
    </div>
  );
}

export default App;
