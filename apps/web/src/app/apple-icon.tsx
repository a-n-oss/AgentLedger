import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — solid brand mark on paper tile. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f7fc",
          borderRadius: 36,
        }}
      >
        <svg
          width="140"
          height="140"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#0b1220"
            d="M18 8h28a10 10 0 0 1 10 10v28a10 10 0 0 1-10 10H18A10 10 0 0 1 8 46V18A10 10 0 0 1 18 8Zm0 4a6 6 0 0 0-6 6v28a6 6 0 0 0 6 6h28a6 6 0 0 0 6-6V18a6 6 0 0 0-6-6H18Z"
          />
          <path
            fill="#0b1220"
            d="M21 22a2 2 0 0 1 2-2h6a2 2 0 1 1 0 4h-6a2 2 0 0 1-2-2Zm0 10a2 2 0 0 1 2-2h6a2 2 0 1 1 0 4h-6a2 2 0 0 1-2-2Zm0 10a2 2 0 0 1 2-2h4a2 2 0 1 1 0 4h-4a2 2 0 0 1-2-2Z"
          />
          <path
            fill="#0b1220"
            d="M35.3 24.3a2 2 0 0 1 2.8-.1l7 6.5a2 2 0 0 1 .1 2.9l-9.5 9.2a2 2 0 0 1-2.9-.1l-4.2-4.5a2 2 0 1 1 2.9-2.7l2.8 3 8-7.8-6.1-5.6a2 2 0 0 1-.1-2.8Z"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
