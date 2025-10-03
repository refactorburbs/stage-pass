import styles from "./PaginationDots.module.css";

interface PaginationDotsProps {
  activeIndex: number;
  dotQuantity: number;
}

export default function PaginationDots({ activeIndex, dotQuantity }: PaginationDotsProps) {
  return (
    <div className={styles.pagination_dot_container}>
      {Array(dotQuantity).fill(true).map((_, i) => (
        <div className={styles.dot} key={i}>
          <svg width="66" height="66" viewBox="0 0 66 66" fill="none" xmlns="http://www.w3.org/2000/svg" className="object-fit">
            <g filter="url(#filter0_d_223_1129)">
              <circle cx="34" cy="32" r="32" fill={activeIndex === i ? "var(--color-secondary)" : "#F3F4F5"}/>
              <circle cx="34" cy="32" r="29.5" stroke="var(--color-secondary)" strokeWidth="5"/>
            </g>
            <defs>
              <filter id="filter0_d_223_1129" x="0" y="0" width="66" height="66" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dx="-1" dy="1"/>
                <feGaussianBlur stdDeviation="0.5"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_223_1129"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_223_1129" result="shape"/>
              </filter>
            </defs>
          </svg>
        </div>
      ))}
    </div>
  );
}