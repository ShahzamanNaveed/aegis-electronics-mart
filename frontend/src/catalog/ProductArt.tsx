import { useId } from "react";
export function ProductArt({
  department,
  color = "Silver",
}: {
  department: string;
  color?: string;
}) {
  const id = useId().replaceAll(":", "");
  const dark = ["Graphite", "Midnight"].includes(color);
  const fill = dark
    ? "#40504d"
    : color === "Sage"
      ? "#aabfaf"
      : color === "Sand"
        ? "#d9cbb6"
        : "#dce2df";
  const shape = () => {
    switch (department) {
      case "refrigerators":
        return (
          <>
            <rect x="87" y="26" width="107" height="194" rx="8" />
            <path d="M87 89h107" />
            <path d="M99 61v18m0 25v36" strokeWidth="5" />
            <path d="M128 39h27" />
          </>
        );
      case "washing-machines":
        return (
          <>
            <rect x="66" y="63" width="148" height="150" rx="9" />
            <path d="M66 101h148" />
            <rect x="78" y="76" width="35" height="10" rx="2" fill="#96a89e" />
            <circle cx="181" cy="83" r="9" fill="#647e70" />
            <circle cx="141" cy="156" r="44" fill="#9daea7" />
            <circle cx="141" cy="156" r="34" fill="#244d44" />
            <path
              d="M112 163q28-26 57 0a31 31 0 01-57 0"
              fill="#b6ccc0"
              stroke="none"
            />
          </>
        );
      case "air-conditioners":
        return (
          <>
            <rect x="29" y="66" width="222" height="87" rx="14" />
            <path d="M41 126h198M41 134h198" />
            <circle cx="227" cy="88" r="3" fill="#467d60" />
            <path
              d="M83 172q-15 17 0 32m57-32q-15 17 0 32m57-32q-15 17 0 32"
              fill="none"
              stroke="#8da99a"
              strokeWidth="3"
            />
          </>
        );
      case "televisions":
        return (
          <>
            <rect
              x="24"
              y="44"
              width="232"
              height="149"
              rx="6"
              fill="#263e39"
            />
            <rect
              x="31"
              y="51"
              width="218"
              height="134"
              rx="2"
              fill="#c2d4c5"
            />
            <path d="M31 164L95 79l76 106H31" fill="#7d9f8b" stroke="none" />
            <path d="M134 185l54-99 61 64v35" fill="#446f5e" stroke="none" />
            <circle cx="204" cy="76" r="16" fill="#e8c680" stroke="none" />
            <path d="M80 194l-13 23m133-23 13 23" strokeWidth="6" />
          </>
        );
      case "kitchen-essentials":
        return (
          <>
            <path d="M92 82h93l14 115q0 18-19 18H93q-20 0-18-19z" />
            <path d="M95 82q0-29 43-29t43 29" />
            <path
              d="M183 108q65-15 34 55l-21 15"
              fill="none"
              strokeWidth="12"
            />
            <path d="M91 95L64 75l11 59" />
            <path d="M108 125v49" stroke="#8da99a" strokeWidth="6" />
            <path d="M91 220h111" strokeWidth="7" />
          </>
        );
      case "microwaves-ovens":
        return (
          <>
            <rect x="28" y="72" width="224" height="132" rx="9" />
            <rect x="41" y="88" width="158" height="96" rx="3" fill="#334e43" />
            <rect x="50" y="96" width="139" height="80" rx="2" fill="#728d7d" />
            <path
              d="M52 169l136-59"
              opacity=".3"
              stroke="white"
              strokeWidth="8"
            />
            <circle cx="225" cy="154" r="13" fill="#96a99e" />
            <rect x="210" y="92" width="28" height="17" fill="#344f44" />
            <path d="M176 109v46" strokeWidth="5" />
          </>
        );
      case "vacuum-cleaners":
        return (
          <>
            <path d="M175 31l-56 164" strokeWidth="13" />
            <rect
              x="143"
              y="43"
              width="43"
              height="82"
              rx="12"
              transform="rotate(18 163 84)"
            />
            <path d="M100 184h65l28 28H73z" fill="#527461" />
            <path d="M165 27q48 0 28 35" fill="none" strokeWidth="8" />
          </>
        );
      case "air-care":
        return (
          <>
            <path d="M137 139v68" strokeWidth="12" />
            <ellipse cx="140" cy="214" rx="51" ry="9" />
            <circle cx="140" cy="89" r="59" />
            <circle cx="140" cy="89" r="49" fill="#eff1e8" />
            <path
              d="M140 89q-47-50-14-39 25 3 14 39m0 0q62-19 34 7-16 17-34-7m0 0q-16 65-24 27-6-23 24-27"
              fill="#8ba99a"
              stroke="none"
            />
            <circle cx="140" cy="89" r="8" fill="#547664" />
          </>
        );
      case "smartphones":
        return (
          <>
            <rect
              x="86"
              y="26"
              width="108"
              height="196"
              rx="17"
              fill="#344c43"
            />
            <rect
              x="93"
              y="34"
              width="94"
              height="180"
              rx="12"
              fill="#b4c9b8"
            />
            <path
              d="M93 160l94-105v124q-53-43-94 20z"
              fill="#6d9680"
              stroke="none"
            />
            <path d="M93 188q47-88 94-39v65H93" fill="#315e4c" stroke="none" />
            <rect x="126" y="40" width="30" height="5" rx="3" fill="#344c43" />
          </>
        );
      case "laptops":
        return (
          <>
            <rect
              x="42"
              y="40"
              width="196"
              height="132"
              rx="8"
              fill="#344b44"
            />
            <rect x="50" y="48" width="180" height="116" fill="#c2d3c2" />
            <path
              d="M50 147l68-76 60 93H50m92 0 44-62 44 47v15"
              fill="#729782"
              stroke="none"
            />
            <path d="M42 172h196l30 37H13z" />
            <path d="M15 209h253l-13 8H28z" fill="#8d9f96" />
            <path d="M65 181h151m-160 8h169m-111 11h52" strokeWidth="3" />
          </>
        );
      case "audio":
        return (
          <>
            <path
              d="M73 135V97a67 67 0 01134 0v38"
              fill="none"
              strokeWidth="18"
            />
            <rect
              x="59"
              y="112"
              width="39"
              height="85"
              rx="18"
              fill="#627c6f"
            />
            <rect
              x="182"
              y="112"
              width="39"
              height="85"
              rx="18"
              fill="#627c6f"
            />
            <rect x="85" y="122" width="15" height="65" rx="7" fill="#b9c9bc" />
            <rect
              x="180"
              y="122"
              width="15"
              height="65"
              rx="7"
              fill="#b9c9bc"
            />
          </>
        );
      default:
        return (
          <>
            <rect x="74" y="62" width="120" height="131" rx="16" />
            <path d="M108 62V38m48 24V38" strokeWidth="10" />
            <rect
              x="110"
              y="155"
              width="49"
              height="13"
              rx="5"
              fill="#365247"
            />
            <path
              d="M199 115q57 0 42 65t-73 30"
              fill="none"
              stroke="#527967"
              strokeWidth="6"
            />
          </>
        );
    }
  };
  return (
    <svg viewBox="0 0 280 250" className="product-art" aria-hidden="true">
      <defs>
        <linearGradient id={id} x2="1" y2="1">
          <stop stopColor={fill} />
          <stop offset="1" stopColor={dark ? "#263d36" : "#bcc9c0"} />
        </linearGradient>
      </defs>
      <ellipse cx="140" cy="226" rx="101" ry="9" fill="#163a2d" opacity=".08" />
      <g
        fill={"url(#" + id + ")"}
        stroke="#71877b"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {shape()}
      </g>
    </svg>
  );
}
