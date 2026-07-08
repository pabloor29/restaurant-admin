import { ImageResponse } from "next/og";

export const alt =
  "RESA — Site web & réservations en ligne pour restaurants";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#13503B",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 18,
              backgroundColor: "#F5F1E9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 42,
              fontWeight: 800,
              color: "#13503B",
            }}
          >
            R
          </div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 800, color: "#F5F1E9" }}>
            RESA
            <span style={{ color: "#C77E3A" }}>.</span>
          </div>
        </div>

        {/* Titre */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              color: "#F5F1E9",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: 940,
            }}
          >
            Site web & réservations en ligne pour votre restaurant.
          </div>
          <div style={{ fontSize: 30, color: "rgba(245,241,233,0.72)", maxWidth: 900 }}>
            Site sur-mesure, réservations automatisées, espace d&apos;administration.
            Hébergement, maintenance et SEO inclus.
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              backgroundColor: "#C77E3A",
              color: "#F5F1E9",
              fontSize: 26,
              fontWeight: 600,
              padding: "12px 28px",
              borderRadius: 12,
              display: "flex",
            }}
          >
            resa-service.com
          </div>
          <div style={{ fontSize: 26, color: "rgba(245,241,233,0.55)", display: "flex" }}>
            Tout-en-un pour restaurants
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
