// Minimal JavaScript for enhanced animations
// Respects prefers-reduced-motion preference
// Uses progressive enhancement - page works without JavaScript

(function () {
  "use strict";

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Ant animation system - ants moving along hexagonal grid lines
  function createAntSystem() {
    // Only create ants if user doesn't prefer reduced motion
    if (prefersReducedMotion) {
      console.log("Ants disabled: prefers-reduced-motion is enabled");
      return;
    }
    console.log("Creating ant system...");

    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "0";
    canvas.setAttribute("aria-hidden", "true");

    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext("2d");
    let ants = [];
    let animationFrameId;
    let hexGrid = [];

    // Set canvas size
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      generateHexGrid();
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Generate hexagonal grid paths that match the background pattern
    function generateHexGrid() {
      hexGrid = [];

      // The background pattern uses 20x17.32 units in the SVG viewBox (0 0 100 100)
      // We need to scale this to actual screen pixels
      const patternWidthVB = 20; // viewBox units
      const patternHeightVB = 17.32; // viewBox units
      const viewBoxSize = 100;

      // Calculate how many pixels per viewBox unit
      const pixelsPerVBUnit = canvas.width / viewBoxSize;

      // Pattern size in pixels
      const patternWidth = patternWidthVB * pixelsPerVBUnit;
      const patternHeight = patternHeightVB * pixelsPerVBUnit;

      const cols = Math.ceil(canvas.width / patternWidth) + 2;
      const rows = Math.ceil(canvas.height / patternHeight) + 2;

      // Generate hexagon edges matching the background pattern
      // Pattern hexagon points: "10,0 20,5 20,12.32 10,17.32 0,12.32 0,5"
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const baseX = col * patternWidth;
          const baseY = row * patternHeight;

          // Convert pattern coordinates to pixel coordinates
          const vertices = [
            { x: baseX + 10 * pixelsPerVBUnit, y: baseY + 0 * pixelsPerVBUnit },
            { x: baseX + 20 * pixelsPerVBUnit, y: baseY + 5 * pixelsPerVBUnit },
            {
              x: baseX + 20 * pixelsPerVBUnit,
              y: baseY + 12.32 * pixelsPerVBUnit,
            },
            {
              x: baseX + 10 * pixelsPerVBUnit,
              y: baseY + 17.32 * pixelsPerVBUnit,
            },
            {
              x: baseX + 0 * pixelsPerVBUnit,
              y: baseY + 12.32 * pixelsPerVBUnit,
            },
            { x: baseX + 0 * pixelsPerVBUnit, y: baseY + 5 * pixelsPerVBUnit },
          ];

          // Create paths along hexagon edges
          for (let i = 0; i < 6; i++) {
            hexGrid.push({
              start: vertices[i],
              end: vertices[(i + 1) % 6],
            });
          }
        }
      }
    }

    // Draw an ant shape
    function drawAnt(x, y, angle, size, opacity) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.fillStyle = `rgba(44, 95, 45, ${opacity})`;
      ctx.strokeStyle = `rgba(44, 95, 45, ${opacity})`;

      // Abdomen (large oval at back)
      ctx.beginPath();
      ctx.ellipse(-size * 0.7, 0, size * 0.5, size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Petiole (narrow waist with small node)
      ctx.lineWidth = size * 0.1;
      ctx.beginPath();
      ctx.moveTo(-size * 0.2, 0);
      ctx.lineTo(size * 0.05, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(-size * 0.08, 0, size * 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Thorax (elongated middle section)
      ctx.beginPath();
      ctx.ellipse(size * 0.4, 0, size * 0.35, size * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head (small, rounded)
      ctx.beginPath();
      ctx.arc(size * 0.85, 0, size * 0.18, 0, Math.PI * 2);
      ctx.fill();

      // Antennae (elbowed)
      ctx.lineWidth = size * 0.06;
      ctx.beginPath();
      // Left antenna
      ctx.moveTo(size * 0.92, -size * 0.08);
      ctx.lineTo(size * 1.15, -size * 0.3);
      ctx.lineTo(size * 1.3, -size * 0.6);
      // Right antenna
      ctx.moveTo(size * 0.92, size * 0.08);
      ctx.lineTo(size * 1.15, size * 0.3);
      ctx.lineTo(size * 1.3, size * 0.6);
      ctx.stroke();

      // Legs (6 legs from thorax, thin and jointed)
      ctx.lineWidth = size * 0.06;

      // Front legs - angled forward
      ctx.beginPath();
      ctx.moveTo(size * 0.6, size * 0.15);
      ctx.lineTo(size * 0.8, size * 0.5);
      ctx.lineTo(size * 0.95, size * 0.85);
      ctx.moveTo(size * 0.6, -size * 0.15);
      ctx.lineTo(size * 0.8, -size * 0.5);
      ctx.lineTo(size * 0.95, -size * 0.85);
      ctx.stroke();

      // Middle legs - angled sideways
      ctx.beginPath();
      ctx.moveTo(size * 0.4, size * 0.18);
      ctx.lineTo(size * 0.45, size * 0.65);
      ctx.lineTo(size * 0.4, size * 1.0);
      ctx.moveTo(size * 0.4, -size * 0.18);
      ctx.lineTo(size * 0.45, -size * 0.65);
      ctx.lineTo(size * 0.4, -size * 1.0);
      ctx.stroke();

      // Back legs - angled backward
      ctx.beginPath();
      ctx.moveTo(size * 0.2, size * 0.18);
      ctx.lineTo(size * 0.05, size * 0.6);
      ctx.lineTo(-size * 0.15, size * 0.9);
      ctx.moveTo(size * 0.2, -size * 0.18);
      ctx.lineTo(size * 0.05, -size * 0.6);
      ctx.lineTo(-size * 0.15, -size * 0.9);
      ctx.stroke();

      ctx.restore();
    }

    // Ant class
    class Ant {
      constructor() {
        this.reset();
      }

      reset() {
        // Pick a random hexagon edge to follow (only from visible paths)
        if (hexGrid.length === 0) return;
        const path = hexGrid[Math.floor(Math.random() * hexGrid.length)];
        this.startX = path.start.x;
        this.startY = path.start.y;
        this.endX = path.end.x;
        this.endY = path.end.y;
        this.progress = 0; // Always start at beginning of path
        this.speed = 0.0008 + Math.random() * 0.0015; // Slower, more realistic
        this.size = 3 + Math.random() * 1.5;
        this.opacity = 0.8 + Math.random() * 0.2;
      }

      update() {
        this.progress += this.speed;

        // When reaching end of path, pick a new path
        if (this.progress >= 1) {
          this.reset();
        }
      }

      draw() {
        // Calculate current position along the path
        const x = this.startX + (this.endX - this.startX) * this.progress;
        const y = this.startY + (this.endY - this.startY) * this.progress;

        // Calculate angle based on direction of movement
        const angle = Math.atan2(
          this.endY - this.startY,
          this.endX - this.startX
        );

        // Draw the ant
        drawAnt(x, y, angle, this.size, this.opacity);
      }
    }

    // Create ants
    for (let i = 0; i < 20; i++) {
      ants.push(new Ant());
    }

    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ants.forEach((ant) => {
        ant.update();
        ant.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    // Cleanup function
    return function cleanup() {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }

  // Initialize ant system
  let cleanupAnts;
  if (!prefersReducedMotion) {
    cleanupAnts = createAntSystem();
  }

  // Add entrance animation to main content
  if (!prefersReducedMotion) {
    const main = document.querySelector("main");
    if (main) {
      main.style.opacity = "0";
      main.style.transform = "translateY(20px)";
      main.style.transition = "opacity 0.8s ease, transform 0.8s ease";

      // Trigger animation after page load
      window.addEventListener("load", function () {
        setTimeout(function () {
          main.style.opacity = "1";
          main.style.transform = "translateY(0)";
        }, 100);
      });
    }
  }

  // Progressive enhancement: Add interaction feedback
  const contactLink = document.querySelector(".contact-link");
  if (contactLink) {
    contactLink.addEventListener("click", function (e) {
      // Visual feedback on click (works even with reduced motion)
      this.style.transform = "scale(0.98)";
      setTimeout(() => {
        this.style.transform = "";
      }, 150);
    });
  }

  // Listen for changes to motion preference
  const motionMediaQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );
  motionMediaQuery.addEventListener("change", function (e) {
    if (e.matches) {
      // User now prefers reduced motion - cleanup ants
      if (cleanupAnts) {
        cleanupAnts();
        cleanupAnts = null;
      }
    } else {
      // User no longer prefers reduced motion - reinitialize
      if (!cleanupAnts) {
        cleanupAnts = createAntSystem();
      }
    }
  });
})();
