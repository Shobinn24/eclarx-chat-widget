import React from "react";
import { createRoot } from "react-dom/client";
import ChatWidget from "./ChatWidget";

/**
 * Self-initializing widget.
 * When loaded via <script src="chatbot.js" data-firm="demo">,
 * it reads config from the script tag and mounts itself.
 */
function init() {
  // Find our script tag to read data attributes
  const scripts = document.querySelectorAll('script[src*="chatbot"]');
  const script = scripts[scripts.length - 1];

  const config = {
    firmId: script?.getAttribute("data-firm") || "demo",
    apiUrl:
      script?.getAttribute("data-api") ||
      "https://web-production-dc86b.up.railway.app",
    color: script?.getAttribute("data-color") || "#1a365d",
  };

  // Create mount point
  const container = document.createElement("div");
  container.id = "eclarx-chat-root";
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<ChatWidget config={config} />);
}

// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
