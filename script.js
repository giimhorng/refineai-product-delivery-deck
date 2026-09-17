// RefineAI hackathon presentation site — interactions & data viz

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initReveal();
  initCounters();
  initMermaid();
  initCharts();
});

/* ---------- Mobile nav ---------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  toggle?.addEventListener("click", () => links.classList.toggle("open"));
  links
    ?.querySelectorAll("a")
    .forEach((a) =>
      a.addEventListener("click", () => links.classList.remove("open")),
    );

  // Active link highlighting on scroll
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navAnchors.forEach((a) =>
            a.classList.toggle(
              "active",
              a.getAttribute("href") === `#${entry.target.id}`,
            ),
          );
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  sections.forEach((s) => observer.observe(s));
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  items.forEach((i) => io.observe(i));
}

/* ---------- Animated stat counters ---------- */
function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const decimals = el.dataset.count.includes(".") ? 1 : 0;
        const duration = 1200;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    },
    { threshold: 0.5 },
  );
  counters.forEach((c) => io.observe(c));
}

/* ---------- Mermaid architecture diagram ---------- */
function initMermaid() {
  if (!window.mermaid) return;
  mermaid.initialize({
    startOnLoad: true,
    theme: "dark",
    themeVariables: {
      background: "#141b2d",
      primaryColor: "#1a2338",
      primaryTextColor: "#e6e9f2",
      primaryBorderColor: "#7c5cff",
      lineColor: "#5f6b8a",
      secondaryColor: "#22d3ee",
      tertiaryColor: "#0f1524",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    flowchart: { curve: "basis", htmlLabels: true },
  });
}

/* ---------- Chart.js visualizations (real data from the 2026-08-01 OneXP Alpha portfolio brief) ---------- */
function initCharts() {
  if (!window.Chart) return;

  Chart.defaults.color = "#94a1bd";
  Chart.defaults.font.family = "Inter, sans-serif";
  Chart.defaults.borderColor = "#232d45";

  const gridOpt = { grid: { color: "#1c2440" }, ticks: { color: "#94a1bd" } };

  // 1. Sprint 17 readiness gauge (doughnut)
  const readinessCtx = document.getElementById("chartReadiness");
  if (readinessCtx) {
    new Chart(readinessCtx, {
      type: "doughnut",
      data: {
        labels: ["Ready", "Gap"],
        datasets: [
          {
            data: [52, 48],
            backgroundColor: ["#22d3ee", "#1c2440"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        cutout: "75%",
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
      },
      plugins: [
        {
          id: "centerText",
          afterDraw(chart) {
            const { ctx, chartArea } = chart;
            ctx.save();
            const cx = (chartArea.left + chartArea.right) / 2;
            const cy = (chartArea.top + chartArea.bottom) / 2;
            ctx.textAlign = "center";
            ctx.fillStyle = "#e6e9f2";
            ctx.font = "700 28px Inter, sans-serif";
            ctx.fillText("52%", cx, cy - 2);
            ctx.fillStyle = "#5f6b8a";
            ctx.font = "600 11px Inter, sans-serif";
            ctx.fillText("NOT READY", cx, cy + 18);
            ctx.restore();
          },
        },
      ],
    });
  }

  // 2. Readiness scorecard breakdown (bar)
  const scorecardCtx = document.getElementById("chartScorecard");
  if (scorecardCtx) {
    new Chart(scorecardCtx, {
      type: "bar",
      data: {
        labels: [
          "Acceptance criteria",
          "Story points",
          "Assignees",
          "Blockers clear",
        ],
        datasets: [
          {
            data: [11, 100, 9, 100],
            backgroundColor: ["#f43f5e", "#22c55e", "#f43f5e", "#22c55e"],
            borderRadius: 6,
            barThickness: 26,
          },
        ],
      },
      options: {
        indexAxis: "y",
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ...gridOpt,
            max: 100,
            ticks: { ...gridOpt.ticks, callback: (v) => v + "%" },
          },
          y: { grid: { display: false }, ticks: { color: "#e6e9f2" } },
        },
      },
    });
  }

  // 3. Risk severity breakdown (bar)
  const riskCtx = document.getElementById("chartRisk");
  if (riskCtx) {
    new Chart(riskCtx, {
      type: "bar",
      data: {
        labels: ["High", "Medium", "Low"],
        datasets: [
          {
            data: [2, 3, 1],
            backgroundColor: ["#f43f5e", "#f59e0b", "#94a1bd"],
            borderRadius: 8,
            barThickness: 46,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: {
            ...gridOpt,
            beginAtZero: true,
            ticks: { ...gridOpt.ticks, stepSize: 1 },
          },
          x: { grid: { display: false }, ticks: { color: "#e6e9f2" } },
        },
      },
    });
  }

  // 4. Sprint 16 pace: expected vs actual completion
  const paceCtx = document.getElementById("chartPace");
  if (paceCtx) {
    new Chart(paceCtx, {
      type: "bar",
      data: {
        labels: ["Expected pace (day 6/14)", "Actual completion"],
        datasets: [
          {
            data: [42.9, 5.9],
            backgroundColor: ["#7c5cff", "#f43f5e"],
            borderRadius: 8,
            barThickness: 46,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: {
            ...gridOpt,
            beginAtZero: true,
            max: 60,
            ticks: { ...gridOpt.ticks, callback: (v) => v + "%" },
          },
          x: { grid: { display: false }, ticks: { color: "#e6e9f2" } },
        },
      },
    });
  }

  // 5. Agent privilege split (donut): read-only vs Jira-write vs Teams-write
  const privCtx = document.getElementById("chartPrivilege");
  if (privCtx) {
    new Chart(privCtx, {
      type: "doughnut",
      data: {
        labels: [
          "Read-only (12)",
          "Creates Jira issues, gated (1)",
          "Comment only, gated (2)",
          "Teams post, gated (1)",
        ],
        datasets: [
          {
            data: [12, 1, 2, 1],
            backgroundColor: ["#22c55e", "#f43f5e", "#a855f7", "#f59e0b"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        cutout: "65%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#94a1bd",
              boxWidth: 12,
              padding: 16,
              font: { size: 11 },
            },
          },
        },
      },
    });
  }

  // 6. Where refinement effort goes today (executive summary)
  const effortCtx = document.getElementById("chartEffort");
  if (effortCtx) {
    new Chart(effortCtx, {
      type: "bar",
      data: {
        labels: [
          "Gathering evidence across 5 systems",
          "Grading against the DoR",
          "Reconciling contradictions",
          "Writing stories & acceptance criteria",
          "Building a coverage matrix",
          "Sizing & assigning ownership",
        ],
        datasets: [
          {
            label: "Manual today",
            data: [100, 100, 100, 100, 100, 100],
            backgroundColor: "#f43f5e",
            borderRadius: 5,
            barThickness: 16,
          },
          {
            label: "Remaining after RefineAI (human review)",
            data: [20, 10, 60, 40, 5, 35],
            backgroundColor: "#22d3ee",
            borderRadius: 5,
            barThickness: 16,
          },
        ],
      },
      options: {
        indexAxis: "y",
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#94a1bd", boxWidth: 12, font: { size: 11 } },
          },
          tooltip: {
            callbacks: { label: (c) => `${c.dataset.label}: ${c.raw}%` },
          },
        },
        scales: {
          x: {
            ...gridOpt,
            max: 100,
            ticks: { ...gridOpt.ticks, callback: (v) => v + "%" },
          },
          y: {
            grid: { display: false },
            ticks: { color: "#e6e9f2", font: { size: 10 } },
          },
        },
      },
    });
  }

  // 7. Value model — which artifacts RefineAI produces per run
  const valueCtx = document.getElementById("chartValue");
  if (valueCtx) {
    new Chart(valueCtx, {
      type: "radar",
      data: {
        labels: [
          "Evidence breadth",
          "Grading consistency",
          "Contradiction detection",
          "Requirement coverage",
          "Capacity realism",
          "Decision traceability",
        ],
        datasets: [
          {
            label: "Manual refinement",
            data: [40, 30, 15, 20, 35, 10],
            borderColor: "#f43f5e",
            backgroundColor: "rgba(244,63,94,0.15)",
            pointBackgroundColor: "#f43f5e",
            borderWidth: 2,
          },
          {
            label: "With RefineAI",
            data: [90, 100, 85, 95, 85, 100],
            borderColor: "#22d3ee",
            backgroundColor: "rgba(34,211,238,0.15)",
            pointBackgroundColor: "#22d3ee",
            borderWidth: 2,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#94a1bd", boxWidth: 12, font: { size: 11 } },
          },
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            angleLines: { color: "#232d45" },
            grid: { color: "#1c2440" },
            pointLabels: { color: "#94a1bd", font: { size: 10 } },
            ticks: { display: false },
          },
        },
      },
    });
  }

  // 8. Test coverage by engine module (npm test, 2026-09-17)
  const testsCtx = document.getElementById("chartTests");
  if (testsCtx) {
    const modules = [
      ["capacity", 43],
      ["proposals", 31],
      ["calendar", 26],
      ["prioritization", 23],
      ["roster", 23],
      ["planning", 21],
      ["platform", 21],
      ["closure", 20],
      ["orchestrator", 20],
      ["e2e", 17],
      ["manualTests", 17],
      ["rosterImport", 16],
      ["evidence", 14],
      ["readiness", 14],
      ["setup", 14],
      ["schema", 13],
      ["xlsx", 13],
      ["coverage", 11],
      ["scoring", 10],
    ];
    new Chart(testsCtx, {
      type: "bar",
      data: {
        labels: modules.map((m) => m[0]),
        datasets: [
          {
            data: modules.map((m) => m[1]),
            backgroundColor: "#7c5cff",
            borderRadius: 4,
          },
        ],
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => `${c.raw} tests` } },
        },
        scales: {
          y: { ...gridOpt, beginAtZero: true },
          x: {
            grid: { display: false },
            ticks: { color: "#94a1bd", font: { size: 9 }, maxRotation: 60 },
          },
        },
      },
    });
  }
}
