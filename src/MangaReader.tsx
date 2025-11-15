import {Fragment, useEffect, useRef, useState} from "react";
import {useGesture} from "@use-gesture/react";

const clamp = (v: number, min: number, max: number): number => Math.min(Math.max(v, min), max);

export interface ReadingState {
  [story: string]: {
    [chapter: string]: string[];
  };
}

/*
  "3311475": {
    "000": [
      "/e-reader.github.io/images/3311475/000/001-000.jpg",
 */

export default function MangaReader({images}: { images: ReadingState }) {
  const [scale, setScale] = useState<number>(1);

  const bind = useGesture({
    onDrag: ({delta: [dx], buttons}) => {
      if (buttons === 1) {
        setScale((s) => clamp(s + dx * 0.002, 0.5, 3));
      }
    },
    onDoubleClick: () => setScale(1),
  });

  return (
    <div {...bind()} style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      {Object.entries(images).map(([story, chapterObj]) => (
          <Fragment key={story}>
            <h1>{story}</h1>
            {Object.entries(chapterObj).map(([chapter, imagePaths]) =>
              (
                <Fragment key={story + chapter}>
                  <h3>{chapter}</h3>
                  {imagePaths.map((src) =>
                    <Page src={story + chapter + src} key={src} scale={scale}/>
                  )}
                </Fragment>
              )
            )}
          </Fragment>
        )
      )}
    </div>
  );
}

function Page({src, scale}: { src: string; scale: number }) {
  const ref = useRef<HTMLImageElement>(null);
  const [dimension, setDimension] = useState({w: 0, h: 0});

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    el.onload = function (this) {
      const naturalWidth = (this as HTMLImageElement).naturalWidth;
      const naturalHeight = (this as HTMLImageElement).naturalHeight;
      console.log(window.innerHeight);

      const ratio = naturalWidth / naturalHeight; // 10 / 20 = 0.5
      const innerWidth = window.innerHeight * ratio;

      const minWidth = 400;
      if (innerWidth > window.innerWidth) {
        const newState = {w: naturalWidth, h: naturalHeight};
        setDimension(newState)
      } else if (innerWidth > naturalWidth) {
        const multiplier = naturalWidth / innerWidth;
        const newState = {w: naturalWidth, h: window.innerHeight * multiplier};
        setDimension(newState)
      } else if (innerWidth < minWidth) {
        const multiplier = minWidth / innerWidth;
        const newState = {w: minWidth, h: window.innerHeight * multiplier};
        setDimension(newState)
      } else {
        const newState = {w: innerWidth, h: window.innerHeight};
        setDimension(newState)
      }
    }
  }, [ref]);

  return (
    <img
      ref={ref}
      src={src}
      alt={src}
      style={{
        width: `${dimension.w * scale}px`,
        height: `${dimension.h * scale}px`,
        border: '1px solid orange',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    />
  );
}