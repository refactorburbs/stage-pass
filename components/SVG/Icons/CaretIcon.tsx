interface CaretIconProps {
  sizePx?: number; // Width in pixels
  color?: string;
  direction?: "up" | "down" | "left" | "right";
}

const getRotationDegrees = (direction: string) => {
  switch (direction) {
    case "up":
      return 270;
    case "down":
      return 90;
    case "left":
      return 180;
    default:
      return 0;
  }
}

export default function CaretIcon({
  sizePx = 10,
  color = "white",
  direction = "right"
}: CaretIconProps) {
  return (
    <div style={{
      width: `${sizePx}px`,
      transform: `rotate(${getRotationDegrees(direction)}deg)`,
    }}>
      <svg
        width="54"
        height="93"
        viewBox="0 0 54 93"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: "100%", width: "100%", objectFit: "cover" }}
      >
        <path
          d="M1.9552e-07 7.75998C1.9552e-07 4.63682 1.88056 1.80418 4.77374 0.593656C7.66692 -0.616872 10.97 0.0610237 13.164 2.2884L51.7397 41.0253C54.7534 44.0516 54.7534 48.9664 51.7397 51.9927L13.164 90.7296C10.9459 92.957 7.64282 93.6106 4.74964 92.4001C1.85646 91.1896 1.9552e-07 88.357 1.9552e-07 85.2338V7.75998Z"
          fill={color}
        />
      </svg>
    </div>
  );
}