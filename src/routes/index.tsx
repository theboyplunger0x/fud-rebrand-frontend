import { Navigate, createFileRoute } from "@tanstack/react-router";
import { Apple, ArrowRight, Download } from "lucide-react";
import { useRef, useState } from "react";

import "@/fomo-home.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FUD — Will it pump or dump?" },
      {
        name: "description",
        content: "Turn a crypto take into a real USDC market in seconds.",
      },
      { property: "og:title", content: "FUD — Will it pump or dump?" },
      {
        property: "og:description",
        content: "Launch a market, pick a side and let the crowd price the outcome.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeEntry,
});

const localAppHref = import.meta.env.DEV ? "http://localhost:8092/" : "/markets";

function StoreBadge({ store }: { store: "apple" | "google" }) {
  const isApple = store === "apple";

  return (
    <a
      className="fomo-home-store"
      href="#download"
      aria-label={isApple ? "Download on the App Store" : "Get it on Google Play"}
    >
      {isApple ? (
        <Apple aria-hidden="true" />
      ) : (
        <span className="fomo-home-play-mark" aria-hidden="true" />
      )}
      <span>
        <small>{isApple ? "Download on the" : "GET IT ON"}</small>
        <strong>{isApple ? "App Store" : "Google Play"}</strong>
      </span>
    </a>
  );
}

function FomoHome() {
  const [logoBouncing, setLogoBouncing] = useState(false);
  const bounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bounceLogo = () => {
    if (bounceTimer.current) clearTimeout(bounceTimer.current);
    setLogoBouncing(false);
    requestAnimationFrame(() => {
      setLogoBouncing(true);
      bounceTimer.current = setTimeout(() => setLogoBouncing(false), 650);
    });
  };

  return (
    <main className="fomo-home" lang="en">
      <div className="fomo-home-background" data-background-slot aria-hidden="true" />

      <header className="fomo-home-header is-nav-only">
        <nav className="fomo-home-nav" aria-label="Download and launch FUD">
          <StoreBadge store="apple" />
          <StoreBadge store="google" />
          <a href={localAppHref} className="fomo-home-login">
            <span>Launch app</span>
            <ArrowRight className="fomo-home-button-icon is-trailing" aria-hidden="true" />
          </a>
        </nav>
      </header>

      <section id="top" className="fomo-home-hero" aria-labelledby="fomo-home-title">
        <div className="fomo-home-copy">
          <button
            type="button"
            className={`fomo-home-3d-wordmark${logoBouncing ? " is-bouncing" : ""}`}
            onClick={bounceLogo}
            aria-label="Bounce the FUD logo"
          >
            <span className="fomo-home-3d-wordmark-crop">
              <img src="/fud-3d-wordmark.jpg" alt="FUD." />
            </span>
          </button>
          <h1 id="fomo-home-title">Will it pump or dump?</h1>
          <p>Turn any crypto take into a real USDC market in seconds.</p>
          <div className="fomo-home-actions">
            <a href={localAppHref} className="fomo-home-button fomo-home-button-primary">
              <span>Launch app</span>
              <ArrowRight className="fomo-home-button-icon is-trailing" aria-hidden="true" />
            </a>
            <a href="#download" className="fomo-home-button fomo-home-button-secondary">
              <Download className="fomo-home-button-icon is-leading" aria-hidden="true" />
              <span>Download app</span>
            </a>
          </div>
        </div>

        <img
          className="fomo-home-character"
          src="/fud-wojak-white-sunglasses.jpg"
          alt="FUD Wojak wearing sunglasses"
        />

        <div id="download" className="fomo-home-download-target" aria-hidden="true" />
      </section>
    </main>
  );
}

function HomeEntry() {
  if (import.meta.env.VITE_FUD_LOCAL_SURFACE === "app") {
    return <Navigate to="/markets" replace />;
  }

  return <FomoHome />;
}
