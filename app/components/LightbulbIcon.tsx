export default function LightbulbIcon() {
  return (
    <svg
      className="lightbulb-svg"
      viewBox="0 0 280 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bulb glass */}
      <ellipse
        cx="140"
        cy="140"
        rx="100"
        ry="105"
        stroke="#e8a838"
        strokeWidth="8"
        fill="none"
      />
      {/* Neck connecting to base */}
      <path
        d="M100 220 C100 245, 105 255, 110 260 L170 260 C175 255, 180 245, 180 220"
        stroke="#e8a838"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      {/* Base rings */}
      <rect
        x="108"
        y="260"
        width="64"
        height="10"
        rx="3"
        stroke="#e8a838"
        strokeWidth="5"
        fill="none"
      />
      <rect
        x="112"
        y="274"
        width="56"
        height="10"
        rx="3"
        stroke="#e8a838"
        strokeWidth="5"
        fill="none"
      />
      <rect
        x="118"
        y="288"
        width="44"
        height="8"
        rx="4"
        stroke="#e8a838"
        strokeWidth="5"
        fill="none"
      />
      {/* Bottom tip */}
      <path
        d="M130 296 L140 310 L150 296"
        stroke="#e8a838"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Filament inside */}
      <path
        d="M130 210 L130 170 L125 150 L135 130 L125 110 L140 95"
        stroke="#e8a838"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M150 210 L150 170 L155 150 L145 130 L155 110 L140 95"
        stroke="#e8a838"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Filament support bars */}
      <line
        x1="125"
        y1="210"
        x2="155"
        y2="210"
        stroke="#e8a838"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
