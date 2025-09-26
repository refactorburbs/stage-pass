// Original Bottom Wave:
//   clip-path: path("M 0,0 L 467,0 A 20,20 0 0 1 487,20 L 487,640 A 25,20 0 0 1 467,660 A 30,20 0 0 0 437,680 A 25,15 0 0 1 417,695 A 20,15 0 0 0 397,710 A 20,12 0 0 1 382,725 L 0,725 Z");
// Original top and bottom wave:
//   clip-path: path("M 0,60 A 10,10 0,0,1 10,50 A 30,10 0,0,0 40,40 A 20,10 0,0,1 60,30 A 30,15 0,0,0 90,15 A 20,15 0,0,1 110,0 L 467,0 A 20,20 0 0 1 487,20 L 487,640 A 25,20 0 0 1 467,660 A 30,20 0 0 0 437,680 A 25,15 0 0 1 417,695 A 20,15 0 0 0 397,710 A 20,12 0 0 1 382,725 L 0,725 Z");

interface WaveDefsProps {
  idPrefix?: string;
}

/**
 * Import for a hidden SVG definition of a clip path that you can use like:
 * clip-path: url(#idPrefix-top-and-bottom-wave); in css. (they're positioned absolutely so
 * they don't take up any space or interfere with layout).
 * This clip path is based on a reference image in Figma, and was originally constructed
 * with hard-coded clip-path path() function values in pixels based on a known grid size,
 * then converted to a scalable clipPathUnits="objectBoundingBox" version.
 *
 * To learn more about clip paths, see:
 * https://youtu.be/oWXm5n-Zi38?si=QH3TWJYVzGVfJiPg&t=305
*/
export default function TopAndBottomWave({ idPrefix = "" }: WaveDefsProps) {
  // When you extract <defs> into a separate component, React treats it as a separate DOM tree,
  // which can cause clip path references to not work. One thing to do is to wrap it in a fragment
  // instead of an svg, and another is to make a unique but dynamic id to avoid conflicts. (idPrefix prop)
  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id={`${idPrefix}top-and-bottom-wave`} clipPathUnits="objectBoundingBox">
            <path
              d="M 0,0.08
                A 0.02,0.014 0,0,1 0.02,0.069
                A 0.06,0.014 0,0,0 0.082,0.055
                A 0.04,0.014 0,0,1 0.123,0.041
                A 0.06,0.021 0,0,0 0.185,0.021
                A 0.04,0.021 0,0,1 0.226,0
                L 0.96,0
                A 0.041,0.028 0 0 1 1,0.028
                L 1,0.883
                A 0.051,0.028 0 0 1 0.959,0.91
                A 0.062,0.028 0 0 0 0.898,0.938
                A 0.051,0.021 0 0 1 0.857,0.959
                A 0.041,0.021 0 0 0 0.816,0.979
                A 0.041,0.017 0 0 1 0.784,1
                L 0,1 Z"
              />
          </clipPath>
          <clipPath id={`${idPrefix}bottom-wave`} clipPathUnits="objectBoundingBox">
            <path
              d="M 0,0
                L 0.96,0
                A 0.041,0.028 0 0 1 1,0.028
                L 1,0.883
                A 0.051,0.028 0 0 1 0.959,0.91
                A 0.062,0.028 0 0 0 0.898,0.938
                A 0.051,0.021 0 0 1 0.857,0.959
                A 0.041,0.021 0 0 0 0.816,0.979
                A 0.041,0.017 0 0 1 0.784,1
                L 0,1 Z"
              />
          </clipPath>
        </defs>
      </svg>
    </>
  );
}