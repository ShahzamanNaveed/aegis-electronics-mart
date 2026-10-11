export function ApplianceScene() {
  return (
    <svg
      className="appliance-scene"
      viewBox="0 0 560 420"
      role="img"
      aria-label="Illustration of a refrigerator, washing machine, and house plant"
    >
      <defs>
        <linearGradient id="fridge" x2="1" y2=".4">
          <stop stopColor="#f7f8f3" />
          <stop offset="1" stopColor="#c4ceca" />
        </linearGradient>
        <linearGradient id="washer" x2="1" y2="1">
          <stop stopColor="#fffef8" />
          <stop offset="1" stopColor="#d5ddd7" />
        </linearGradient>
      </defs>
      <path d="M77 360V209a178 178 0 01356 0v151" fill="#dce7db" />
      <circle cx="445" cy="89" r="38" fill="#e5b96e" />
      <path d="M54 365h472" stroke="#c4cfc1" strokeWidth="2" />
      <ellipse
        cx="275"
        cy="366"
        rx="220"
        ry="16"
        fill="#1c4038"
        opacity=".09"
      />
      <path d="M266 62h123l20 13v273l-20 12H266z" fill="#9baea7" />
      <rect
        x="242"
        y="62"
        width="145"
        height="298"
        rx="10"
        fill="url(#fridge)"
      />
      <path d="M242 158h145" stroke="#9fb0a8" strokeWidth="3" />
      <rect x="254" y="110" width="5" height="33" rx="2.5" fill="#536e63" />
      <rect x="254" y="174" width="5" height="51" rx="2.5" fill="#536e63" />
      <rect x="313" y="85" width="22" height="3" rx="1" fill="#9aaba4" />
      <path d="M95 183h151l17 12v160H95z" fill="#9eb0a7" />
      <rect
        x="80"
        y="183"
        width="164"
        height="177"
        rx="8"
        fill="url(#washer)"
      />
      <path d="M80 224h164" stroke="#becbc3" />
      <rect x="95" y="197" width="37" height="12" rx="3" fill="#c9d3cb" />
      <circle cx="180" cy="204" r="9" fill="#527565" />
      <rect x="202" y="200" width="24" height="8" rx="2" fill="#2e4f44" />
      <circle cx="163" cy="290" r="53" fill="#afc1b7" />
      <circle cx="163" cy="290" r="44" fill="#21463e" />
      <circle cx="163" cy="290" r="34" fill="#43675d" />
      <path d="M135 301q27-37 54-7a33 33 0 01-54 7" fill="#c0d0bd" />
      <path
        d="M139 267q-12 12-8 24"
        fill="none"
        stroke="#f5fff0"
        strokeWidth="4"
        strokeLinecap="round"
        opacity=".6"
      />
      <path
        d="M453 298v-82m0 52q-43-27-27-52 35 10 27 52m0-28q34-16 30-41-34 1-30 41m0-14q-25-16-17-39 26 10 17 39"
        fill="#51765c"
        stroke="#51765c"
        strokeWidth="3"
      />
      <path d="M426 294h55l-8 66h-39z" fill="#c78455" />
      <path
        d="M434 301l5 51m11-51v51m17-51l-4 51"
        stroke="#dfa579"
        strokeWidth="2"
      />
      <rect x="108" y="168" width="95" height="15" rx="4" fill="#c8a46d" />
      <rect x="115" y="155" width="90" height="13" rx="4" fill="#eee2c5" />
      <path d="M51 108l5-12 5 12 12 5-12 5-5 12-5-12-12-5z" fill="#447668" />
      <path d="M418 158l3-8 3 8 8 3-8 3-3 8-3-8-8-3z" fill="#447668" />
    </svg>
  );
}
