/**
 * Used to outline the border of the bottom wave of TopAndBottomWave clip path.
 * This is a separate SVG because it needs to be positioned relative to the image section,
 * and lays on top of the image. No fill, just a white stroke scaled to work with 0-100 on 100x100 for easy % values.
 * preserveAspectRatio="none" so it stretches to fit the container.
*/
export default function WaveBorder() {
  return (
    <>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, transparent 50%, white 100%)",
          borderBottom: "6px solid white"
        }}
      >
        <path
          d="M 0,0
            L 96,0
            A 4.1,2.8 0 0 1 100,2.8
            L 100,88.3
            A 5.1,2.8 0 0 1 95.9,91
            A 6.2,2.8 0 0 0 89.8,93.8
            A 5.1,2.1 0 0 1 85.7,95.9
            A 4.1,2.1 0 0 0 81.6,97.9
            A 4.1,1.7 0 0 1 78.4,100
            L 0,100"
          fill="none"
          stroke="white"
          strokeWidth="0.6"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </>
  );
}