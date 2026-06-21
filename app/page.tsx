"use client";

import { useRouter } from "next/navigation";
import LightbulbIcon from "./components/LightbulbIcon";

export default function LandingPage() {
  const router = useRouter();

  const handleNext = () => {
    router.push("/login");
  };

  return (
    <div className="landing-wrapper">
      {/* White top strip */}
      <div className="landing-top-strip" />

      {/* Hero section */}
      <section className="landing-hero" id="hero-section">
        <div className="landing-content">
          {/* Lightbulb icon */}
          <div className="lightbulb-container">
            <LightbulbIcon />
          </div>

          {/* Text content */}
          <div className="landing-text">
            <h1 className="landing-title">
              Creating a brighter
              <br />
              Future with <span className="highlight">LUMINA LMS</span>
            </h1>

            <div className="landing-btn-wrapper">
              <button
                id="btn-next"
                className="btn-next"
                onClick={handleNext}
                type="button"
              >
                next
              </button>
            </div>
          </div>
        </div>

        {/* Pagination dots */}
        <div className="landing-pagination">
          <span className="dot active" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </section>
    </div>
  );
}
