import {Fragment, useCallback, useEffect, useRef, useState} from "react";
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

  // todo: fix scale
  const bind = useGesture({
    onDrag: ({delta: [dx], buttons}) => {
      if (buttons === 1) {
        setScale((s) => clamp(s + dx * 0.002, 0.5, 3));
      }
    },
    onDoubleClick: () => setScale(1),
  });
  console.log(bind);

  return (
    <div style={{
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
                    <Page
                      key={story + chapter + src}
                      src={src}
                      scale={scale}
                    />
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
  const ref = useRef<HTMLImageElement | null>(null);
  const [dimension, setDimension] = useState({w: 0, h: 0});

  const computeAndSet = useCallback((img: HTMLImageElement) => {
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    if (!naturalWidth || !naturalHeight) return false;

    const ratio = naturalWidth / naturalHeight;
    const innerWidth = window.innerHeight * ratio; // falls du das bewusst so willst
    const minWidth = 400;

    let w: number;
    let h: number;

    if (innerWidth > window.innerWidth) {
      w = naturalWidth;
      h = naturalHeight;
    } else if (innerWidth > naturalWidth) {
      const multiplier = naturalWidth / innerWidth;
      w = naturalWidth;
      h = window.innerHeight * multiplier;
    } else if (innerWidth < minWidth) {
      const multiplier = minWidth / innerWidth;
      w = minWidth;
      h = window.innerHeight * multiplier;
    } else {
      w = innerWidth;
      h = window.innerHeight;
    }

    // runde auf ganze Pixel, um seltsame Browser-Rundungen zu vermeiden
    setDimension({w: Math.round(w), h: Math.round(h)});
    return true;
  }, []);

  useEffect(() => {
    const img = ref.current;
    if (!img) return;

    let mounted = true;

    const handler = async () => {
      if (!mounted) return;
      // wenn Dimensionen schon verfügbar sind, sofort nutzen
      if (img.naturalWidth && img.naturalHeight) {
        computeAndSet(img);
        return;
      }
      // moderne Browser: versuche decode() (kann warten bis Bild dekodiert ist)
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (img.decode) await img.decode();
      } catch {
        // ignore
      }
      if (!mounted) return;
      computeAndSet(img);
    };

    img.addEventListener('load', handler);

    // Falls das Bild bereits geladen ist (Cache), handler sofort ausführen
    if (img.complete) {
      // kleine Verzögerung vermeiden race-conditions mit decode()
      void handler();
    }

    return () => {
      mounted = false;
      img.removeEventListener('load', handler);
    };
  }, [src, computeAndSet]);

  const widthPx = Number.isFinite(dimension.w * scale) ? `${dimension.w * scale}px` : 'auto';
  const heightPx = Number.isFinite(dimension.h * scale) ? `${dimension.h * scale}px` : 'auto';

  return (
    <img
      ref={ref}
      src={src}
      alt=""
      style={{
        width: widthPx,
        height: heightPx,
        // border: '1px solid orange',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
      draggable={false}
    />
  );
}