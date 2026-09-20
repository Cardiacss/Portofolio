import { useState, useEffect, useRef } from "react";
import React from 'react';
import ReactDOM from 'react-dom/client';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Portfolio />
    </React.StrictMode>
  );
}

const NOISE_BG =
  "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOCIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjxmZURpZmZ1c2VMaWdodGluZyBzdXJmYWNlU2NhbGU9IjEwIiBkaWZmdXNlQ29uc3RhbnQ9IjEiIGxpZ2h0aW5nLWNvbG9yPSJ3aGl0ZSI+PGZlRHNwb3QgeD0iMCIgeT0iMCIgej0iMCIvPjwvZmVEaWZmdXNlTGlnaHRpbmc+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlKSIvPjwvc3ZnPg==')";

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

const PROJECTS = [
  {
    title: "Eco Plan",
    description: "A website about processing garbage, to know what type it is and etc.",
    url: "https://github.com/Shinta505/EcoPlan-Product_Capstone_Project-Bangkit2024",
  },
  {
    title: "Student Deppresion",
    description: "A website to predict depression tendencies in students",
    url: "https://depression-prediction-99.streamlit.app/",
  },
  {
    title: "School Payment",
    description: "A Website for students to pay and know how much they need to pay their tuition",
    url: "https://github.com/Cardiacss/RPL",
  },
];

// Top-down water surface: a fine dot-grid whose brightness rises and falls
// with a rippling height field, like sunlight glinting off water seen from
// above. Ripples spawn on their own (ambient) and wherever the cursor moves
// (like a fingertip touching the surface), then expand and fade as rings.
function WaveBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = 0;
    let height = 0;
    let rafId = null;

    function resize() {
      const parent = canvas.parentElement;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    let lastMouseSpawnPos = null;
    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
    }
    function handleMouseLeave() {
      mouseRef.current = { x: -9999, y: -9999, active: false };
      lastMouseSpawnPos = null;
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // --- Ripple sources: each expands outward as a ring and fades with age ---
    const GRID_SPACING = 20;
    const LIFETIME = 3.4; // seconds a ripple stays visible
    const RING_SPEED = 130; // px/sec the ring expands
    const WAVELENGTH = 30; // px between crests within a ring
    const SIGMA = WAVELENGTH * 0.55; // thickness of the visible ring band
    const AMBIENT_MIN_MS = 900;
    const AMBIENT_MAX_MS = 2200;
    const MOUSE_SPAWN_DIST = 10; // px cursor must move before spawning another ripple

    let sources = [];
    let nextAmbientAt = performance.now() + 400;
    const startTime = performance.now();

    function spawnRipple(x, y, amplitude, t0) {
      sources.push({ x, y, amplitude, t0 });
      if (sources.length > 40) sources.shift();
    }

    function draw(now) {
      const t = (now - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      // Ambient ripples: appear on their own so the surface is never still.
      if (now > nextAmbientAt) {
        spawnRipple(Math.random() * width, Math.random() * height, 0.75 + Math.random() * 0.5, now);
        nextAmbientAt = now + AMBIENT_MIN_MS + Math.random() * (AMBIENT_MAX_MS - AMBIENT_MIN_MS);
      }

      // Cursor ripples: spawned as the pointer moves, like touching water.
      const mouse = mouseRef.current;
      if (mouse.active) {
        if (!lastMouseSpawnPos) {
          spawnRipple(mouse.x, mouse.y, 1.4, now);
          lastMouseSpawnPos = { x: mouse.x, y: mouse.y };
        } else {
          const dx = mouse.x - lastMouseSpawnPos.x;
          const dy = mouse.y - lastMouseSpawnPos.y;
          if (Math.sqrt(dx * dx + dy * dy) > MOUSE_SPAWN_DIST) {
            spawnRipple(mouse.x, mouse.y, 1.4, now);
            lastMouseSpawnPos = { x: mouse.x, y: mouse.y };
          }
        }
      }

      // Drop expired ripples.
      sources = sources.filter((s) => (now - s.t0) / 1000 < LIFETIME);

      const cols = Math.ceil(width / GRID_SPACING) + 1;
      const rows = Math.ceil(height / GRID_SPACING) + 1;

      for (let gy = 0; gy < rows; gy++) {
        const y = gy * GRID_SPACING;
        for (let gx = 0; gx < cols; gx++) {
          const x = gx * GRID_SPACING;

          // Calm baseline swell so the surface is never perfectly flat.
          let h = 0.12 * Math.sin(x * 0.004 + t * 0.3) * Math.sin(y * 0.004 - t * 0.25);

          for (let i = 0; i < sources.length; i++) {
            const s = sources[i];
            const age = (now - s.t0) / 1000;
            const dx = x - s.x;
            const dy = y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const ringRadius = age * RING_SPEED;
            const shell = Math.exp(-((dist - ringRadius) ** 2) / (2 * SIGMA * SIGMA));
            if (shell < 0.01) continue;
            const phase = ((dist - ringRadius) / WAVELENGTH) * Math.PI * 2;
            const ageFade = Math.max(0, 1 - age / LIFETIME);
            const distFade = 1 / (1 + dist * 0.0035);
            h += s.amplitude * shell * Math.sin(phase) * ageFade * distFade;
          }

          const opacity = Math.min(0.95, Math.max(0.035, 0.11 + h * 0.85));
          const radius = Math.max(0.4, 0.9 + Math.max(0, h) * 1.8);

          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,255,${opacity.toFixed(3)})`;
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        display: "block",
      }}
    />
  );
}

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState("home");
  const [waveOpacity, setWaveOpacity] = useState(1);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);

  const scrollContainerRef = useRef(null);
  const sectionRefs = useRef({});

  // Inject the Google Fonts stylesheet once, client-side, so this component
  // stays fully self-contained if you don't want to touch your document head.
  useEffect(() => {
    const preconnect1 = document.createElement("link");
    preconnect1.rel = "preconnect";
    preconnect1.href = "https://fonts.googleapis.com";

    const preconnect2 = document.createElement("link");
    preconnect2.rel = "preconnect";
    preconnect2.href = "https://fonts.gstatic.com";
    preconnect2.crossOrigin = "true";

    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400&family=Roboto+Mono:wght@300;400&display=swap";

    document.head.appendChild(preconnect1);
    document.head.appendChild(preconnect2);
    document.head.appendChild(fontLink);

    return () => {
      document.head.removeChild(preconnect1);
      document.head.removeChild(preconnect2);
      document.head.removeChild(fontLink);
    };
  }, []);

  // Highlight the nav item for whichever section is mostly in view.
  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.dataset.sectionId);
          }
        });
      },
      { root, threshold: 0.5 }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Fade the wave background out as the user scrolls from Home into About.
  function handleScroll(e) {
    const scrollTop = e.currentTarget.scrollTop;
    const fadeDistance = Math.max(1, window.innerHeight * 0.85);
    const opacity = Math.max(0, 1 - scrollTop / fadeDistance);
    setWaveOpacity(opacity);
  }

  function scrollToSection(id) {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleContactChange(e) {
    setContactForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleContactSubmit(e) {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio message from ${contactForm.name || "a visitor"}`);
    const body = encodeURIComponent(`${contactForm.message}\n\n— ${contactForm.name} (${contactForm.email})`);
    window.location.href = `mailto:filberthvalentino@gmail.com?subject=${subject}&body=${body}`;
    setContactSent(true);
  }

  return (
    <div
      style={{
        backgroundColor: "#000000",
        color: "#e0e0e0",
        fontFamily: "'Roboto Mono', monospace",
        fontWeight: 300,
        fontSize: 14,
        position: "relative",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
      className="text-white"
    >
      {/* Animated wave background, reactive to the cursor, fades on scroll */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          opacity: waveOpacity,
          transition: "opacity 0.15s linear",
        }}
      >
        <WaveBackground />
      </div>

      {/* Noise overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 2,
          opacity: 0.25,
          background: NOISE_BG,
        }}
      />

      {/* Framed, scrollable content. Sections are padded to this same box,
          so nothing can render past its edges. */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="scroll-smooth"
        style={{
          position: "fixed",
          top: "2rem",
          left: "2rem",
          right: "2rem",
          bottom: "2rem",
          zIndex: 3,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Sticky header + nav, compact so it stays out of the way while scrolling */}
        <header
          className="sticky top-0 z-20 px-6 md:px-10 pt-4 pb-3"
          style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
        >
          <nav>
            <ul className="flex items-start space-x-4 text-sm">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(item.id);
                      }}
                      className="text-gray-300 hover:text-white"
                      style={{
                        position: "relative",
                        display: "inline-block",
                        padding: "0.25rem",
                        opacity: isActive ? 1 : undefined,
                      }}
                    >
                      <span style={{ transition: "opacity 0.3s ease", opacity: isActive ? 0 : 1 }}>
                        {item.label}
                      </span>
                      {/* X-mark that appears when active, replicating the ::before/::after treatment */}
                      <span
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          width: "1em",
                          height: 1,
                          backgroundColor: "white",
                          top: "50%",
                          left: "50%",
                          transition: "transform 0.3s ease",
                          transformOrigin: "center",
                          transform: isActive
                            ? "translateX(-50%) rotate(45deg) scaleX(1)"
                            : "translateX(-50%) scaleX(0)",
                        }}
                      />
                      <span
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          width: "1em",
                          height: 1,
                          backgroundColor: "white",
                          top: "50%",
                          left: "50%",
                          transition: "transform 0.3s ease",
                          transformOrigin: "center",
                          transform: isActive
                            ? "translateX(-50%) rotate(-45deg) scaleX(1)"
                            : "translateX(-50%) scaleX(0)",
                        }}
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </header>

        {/* Home */}
        <section
          id="home"
          data-section-id="home"
          ref={(el) => (sectionRefs.current.home = el)}
          className="min-h-full flex flex-col items-center justify-center text-center px-6 md:px-10"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-white">
            Hello, I'm Filbert Valentino Hartono
          </h2>
          <p
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, opacity: 0.7 }}
            className="mt-3 text-gray-400 text-base md:text-lg"
          >
            Software Engineer &amp; Web Developer
          </p>
          <button
            type="button"
            onClick={() => scrollToSection("about")}
            className="mt-10 inline-flex flex-col items-center gap-2 rounded-2xl border border-white/60 px-8 py-4 text-sm text-gray-200 transition-colors duration-300 hover:border-white hover:text-white"
          >
            <span>View my work</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="animate-bounce"
              style={{ opacity: 0.85 }}
            >
              <path
                d="M3 6L8 11L13 6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </section>

        {/* About */}
        <section
          id="about"
          data-section-id="about"
          ref={(el) => (sectionRefs.current.about = el)}
          className="min-h-full flex flex-col items-center justify-center text-center px-6 md:px-10 py-16"
        >
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-semibold text-white">About Me</h2>
            <p className="text-gray-400 mt-4 leading-relaxed">
              I'm an Information Systems graduate from Duta Wacana Christian University and a Cloud
              Computing graduate of Bangkit Academy, a program led by Google, GoTo, Tokopedia, and
              Traveloka. My work centers on full-stack web development, cloud computing, and RESTful
              API design, and I've built scalable applications with Laravel, JavaScript, PHP, MySQL,
              and Google Cloud Platform through academic projects and a hands-on internship.
            </p>
            <p className="text-gray-400 mt-4 leading-relaxed">
              I'm currently a Web Developer Intern at the Salatiga Christian School Pension Fund
              (DPSK), where I develop and manage the organization's website. I enjoy solving real
              problems with technology and collaborating closely with the people I build for, and I'm
              looking to grow further as a Software Engineer, Web Developer, or IT professional.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {["Laravel", "JavaScript", "PHP", "MySQL", "Google Cloud", "RESTful APIs"].map((skill) => (
                <span
                  key={skill}
                  className="text-xs text-gray-300 border border-white/30 rounded-full px-3 py-1"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Projects */}
        <section
          id="projects"
          data-section-id="projects"
          ref={(el) => (sectionRefs.current.projects = el)}
          className="min-h-full flex flex-col items-center justify-center text-center px-6 md:px-10 py-16"
        >
          <h2 className="text-2xl font-semibold text-white">My Projects</h2>
          <p className="text-gray-400 mt-2">A collection of my work and experiments.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-8">
            {PROJECTS.map((project) => (
              <a
                key={project.title}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block w-64 h-40"
              >
                <div className="border border-gray-600 rounded-lg p-6 w-full h-full bg-gray-800/50 text-white flex flex-col justify-center transition-transform duration-300 group-hover:scale-105">
                  <h3 className="text-lg font-semibold">{project.title}</h3>
                  <p className="text-sm text-gray-400 mt-2">{project.description}</p>
                </div>
                <span className="pointer-events-none absolute inset-x-0 -bottom-4 flex justify-center opacity-0 scale-95 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-black/80 px-4 py-1.5 text-xs tracking-wide text-white shadow-lg">
                    View Project
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M3 9L9 3M9 3H4M9 3V8"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section
          id="contact"
          data-section-id="contact"
          ref={(el) => (sectionRefs.current.contact = el)}
          className="min-h-full flex flex-col items-center justify-center px-6 md:px-10 py-16"
        >
          <div className="w-full max-w-xl mx-auto text-left">
            <div className="relative inline-block">
              <span
                aria-hidden="true"
                className="absolute left-0 right-2 bottom-1 h-3 bg-white/10"
                style={{ zIndex: 0 }}
              />
              <h2 className="relative text-4xl md:text-5xl font-semibold text-white" style={{ zIndex: 1 }}>
                Contact
              </h2>
            </div>

            <p className="text-gray-400 mt-4 leading-relaxed">
              Have a question or want to work together? Leave your details and I'll get back to you as
              soon as possible.
            </p>

            <form onSubmit={handleContactSubmit} className="mt-10 space-y-3">
              <input
                type="text"
                name="name"
                value={contactForm.name}
                onChange={handleContactChange}
                placeholder="Name"
                required
                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none transition-colors focus:border-white/50"
              />
              <input
                type="email"
                name="email"
                value={contactForm.email}
                onChange={handleContactChange}
                placeholder="Email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none transition-colors focus:border-white/50"
              />
              <textarea
                name="message"
                value={contactForm.message}
                onChange={handleContactChange}
                placeholder="Message"
                required
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none transition-colors focus:border-white/50 resize-none"
              />

              <div className="flex items-center justify-end gap-4 pt-2">
                {contactSent && (
                  <span className="text-xs text-gray-500">Opening your email client…</span>
                )}
                <button
                  type="submit"
                  className="relative pb-1 text-sm font-semibold tracking-[0.2em] text-white"
                >
                  SUBMIT
                  <span className="absolute left-0 bottom-0 h-px w-full bg-white/70" />
                </button>
              </div>
            </form>

            <p className="text-gray-500 text-xs mt-8">
              Prefer email directly? Write to{" "}
              <a href="mailto:filberthvalentino@gmail.com" className="text-blue-400 hover:underline">
                filberthvalentino@gmail.com
              </a>{" "}
              or connect on{" "}
              <a
                href="https://www.linkedin.com/in/filbert-hartono-54487a24a/"
                className="text-blue-400 hover:underline"
              >
                LinkedIn
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}