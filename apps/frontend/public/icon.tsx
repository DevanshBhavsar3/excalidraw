interface IconProps {
  size: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "32",
  md: "45",
  lg: "100",
};

export default function Icon({ size }: IconProps) {
  return (
    <svg
      width={sizeStyles[size]}
      height={sizeStyles[size]}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="10"
        y="10"
        width="180"
        height="180"
        rx="40"
        fill="#F0F0F0"
        stroke="#d4d4d4"
        strokeWidth="2"
      />

      <g transform="translate(100,100) scale(5) translate(-10,-15)">
        <path
          d="M19.28 10.32c0-0.24-0.080-0.44-0.24-0.6l-3.12-3.12c-0.32-0.32-0.84-0.32-1.2 0l-2.36 2.36-11.32 11.36c-0.12 0.12-0.2 0.28-0.24 0.44l-0.8 3.92c-0.040 0.28 0.040 0.56 0.24 0.76 0.16 0.16 0.36 0.24 0.6 0.24 0.040 0 0.12 0 0.16 0l3.92-0.8c0.16-0.040 0.32-0.12 0.44-0.24l13.68-13.68c0.16-0.2 0.24-0.4 0.24-0.64zM4.32 23.24l-2.44 0.48 0.52-2.4 10.56-10.56 1.92 1.92-10.56 10.56zM16.080 11.52l-1.92-1.92 1.2-1.2 1.92 1.92-1.2 1.2z"
          fill="#792bc5"
        />
      </g>
    </svg>
  );
}
