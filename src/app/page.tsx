'use client';

import { useRef, useEffect, useState } from 'react';
import { type Editor, Tldraw, type TLShape } from 'tldraw';
import debounce from 'lodash.debounce';

function App() {
  const appRef = useRef<Editor | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchShapes = async () => {
      setLoading(true);

      try {
        const response = await fetch('/api/shapes', {
          method: 'GET',
        });

        const data = await response.json();

        if (data?.data) {
          const shapes = data.data.shapes as TLShape[];

          if (appRef.current) {
            appRef.current.createShapes(shapes);
          }
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
        body: JSON.stringify({ data: shapes }),
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
    <div style={{ height: '100vh', width: '100vw' }} ref={wrapperRef}>
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
