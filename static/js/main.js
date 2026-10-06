const productionVideoBase =
  window.location.hostname === "yilin-wu98.github.io"
    ? "https://media.githubusercontent.com/media/yilin-wu98/imprint_website/main/"
    : "";

const resolveVideoSource = (source) => {
  if (/^(?:https?:|blob:|data:)/.test(source) || !productionVideoBase) {
    return source;
  }

  return `${productionVideoBase}${source.replace(/^\/+/, "")}`;
};

const deferredVideoObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            const video = entry.target;
            video.dataset.videoNearViewport = "true";
            activateDeferredVideo(video);
          });
        },
        { rootMargin: "360px 0px" },
      )
    : null;

const activateDeferredVideo = (video) => {
  const source = video.dataset.src;

  if (!source || video.getAttribute("src") === source) {
    return;
  }

  video.preload = video.dataset.preload || "auto";
  video.setAttribute("src", source);
  video.load();
};

const deferVideoSource = (video, source, loadNow = false) => {
  const resolvedSource = resolveVideoSource(source);
  const sourceChanged = video.dataset.src !== resolvedSource;

  if (sourceChanged) {
    video.pause();
    video.dataset.src = resolvedSource;

    if (video.hasAttribute("src")) {
      video.removeAttribute("src");
      video.load();
    }
  }

  if (deferredVideoObserver && video.dataset.videoObserved !== "true") {
    video.dataset.videoObserved = "true";
    deferredVideoObserver.observe(video);
  }

  if (
    loadNow ||
    video.dataset.videoNearViewport === "true" ||
    !deferredVideoObserver
  ) {
    activateDeferredVideo(video);
  }
};

const clearDeferredVideo = (video) => {
  video.pause();
  delete video.dataset.src;

  if (video.hasAttribute("src")) {
    video.removeAttribute("src");
    video.load();
  }
};

const loadDeferredVideosWithin = (container) => {
  container.querySelectorAll("video[data-src]").forEach((video) => {
    activateDeferredVideo(video);
  });
};

const debounceWithFlush = (callback, delay = 180) => {
  let timer = null;

  const flush = () => {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
    callback();
  };

  const schedule = () => {
    if (timer !== null) {
      window.clearTimeout(timer);
    }
    timer = window.setTimeout(flush, delay);
  };

  schedule.flush = flush;
  return schedule;
};

document.querySelectorAll("video[data-src]").forEach((video) => {
  deferVideoSource(video, video.dataset.src);
});

document.querySelectorAll(".table-toggle").forEach((button) => {
  const targetId = button.getAttribute("aria-controls");
  const target = document.getElementById(targetId);
  const label = button.querySelector("span");

  if (!target || !label) {
    return;
  }

  const collapsedLabel = label.textContent.trim();
  const expandedLabel = collapsedLabel.endsWith("tables")
    ? "Hide full tables"
    : "Hide full table";

  button.addEventListener("click", () => {
    const willExpand = button.getAttribute("aria-expanded") !== "true";

    button.setAttribute("aria-expanded", String(willExpand));
    target.hidden = !willExpand;
    label.textContent = willExpand ? expandedLabel : collapsedLabel;
  });
});

const rolloutTasks = {
  "dust-table": {
    label: "Dust Table",
    total: 20,
    prompt:
      "The robot must place the objects down upright, dust the table exactly once, and return the objects upright to the small table in the correct left/right arrangement.",
    image: "static/images/realworld-dust-table.png",
    imageAlt: "Dust Table success-rate distributions across real-world methods",
    analysis:
      "IMPRINT reaches 80%, 30 points above uniform sampling; the unseen-object setting reaches 45%.",
  },
  "scan-bottle": {
    label: "Scan Bottle",
    total: 20,
    prompt:
      "The robot must pick up the bottles one at a time, scan each exactly once, and place them on the other side in an aligned vertical row without collisions.",
    image: "static/images/realworld-scan-bottle.png",
    imageAlt: "Scan Bottle success-rate distributions across real-world methods",
    analysis:
      "IMPRINT reaches 75%, 25 points above uniform sampling, and 70% with unseen bottles.",
  },
  "fold-cloth": {
    label: "Fold Cloth",
    total: 32,
    prompt:
      "The robot must reproduce the folding steps of the demonstration and reach a final shape close to the demonstrated one. Repeated grasp attempts are allowed.",
    image: "static/images/realworld-fold-cloth.png",
    imageAlt: "Fold Cloth success-rate distributions across real-world methods",
    analysis:
      "IMPRINT succeeds in 23/32 trials, eight more than uniform sampling; the unseen-towel setting succeeds in 10/32.",
  },
};

const rolloutMethods = [
  {
    id: "pi0",
    label: "π₀",
    fullLabel: "π₀ (non-memory)",
    results: {
      "dust-table": { successes: [1, 6, 8, 13, 16, 19], reported: 6 },
      "scan-bottle": { successes: [4, 7, 14, 15, 18], reported: 5 },
      "fold-cloth": { successes: [3, 4, 5, 6, 15, 21, 24], reported: 7 },
    },
    failureReasons: {
      "dust-table": {
        2: "Picks up the duster twice and fails to return the bottles in the correct left–right order.",
        3: "Fails to return the bottles in the correct left–right order.",
        4: "Fails to return the bottles in the correct left–right order.",
        5: "Continues dusting instead of completing the task.",
        7: "Fails to return the bottles in the correct left–right order.",
        9: "Fails to return the bottles in the correct left–right order.",
        10: "Fails to return the bottles in the correct left–right order.",
        11: "Fails to return the bottles in the correct left–right order.",
        12: "Pushes the small table away from its original position.",
        14: "Fails to return the bottles in the correct left–right order.",
        15: "Fails to dust the table.",
        17: "Dusts the table twice.",
        18: "Sweeps one object out of place.",
        20: "Picks up the duster twice.",
      },
      "scan-bottle": {
        1: "Scans the same bottle twice.",
        2: "Repeatedly scans the same bottle.",
        3: "Fails to pick up the bottle.",
        5: "Scans the same bottle twice.",
        6: "Scans the same bottle twice.",
        8: "Fails to place the bottle upright.",
        9: "Scans the same bottle twice.",
        10: "Fails to place the bottle upright.",
        11: "Fails to pick up the bottle.",
        12: "Fails to align the placed bottle with the vertical row.",
        13: "Scans the same bottle twice.",
        16: "Fails to pick up the bottle.",
        17: "Repeatedly scans the same bottle.",
        19: "Fails to pick up the bottle.",
        20: "Fails to align the placed bottles in a vertical row.",
      },
    },
    foldColors: ["Orange", "Dark blue", "Blue", "Pink"],
  },
  {
    id: "hamlet",
    label: "HAMLET",
    fullLabel: "HAMLET",
    results: {
      "dust-table": { successes: [4, 7, 11, 16, 18], reported: 5 },
      "scan-bottle": { successes: [5, 9, 15, 19, 20], reported: 5 },
      "fold-cloth": { successes: [5, 6, 9, 10, 23, 26], reported: 6 },
    },
    failureReasons: {
      "dust-table": {
        1: "Fails to pick up the bottle to return it to the small table.",
        2: "Fails to pick up the bottle to return it to the small table.",
        3: "Fails to pick up the bottle to return it to the small table.",
        5: "Fails to pick up the bottle to return it to the small table.",
        6: "Fails to pick up the bottle to return it to the small table.",
        8: "Fails to pick up the bottle to return it to the small table.",
        9: "Fails to pick up the bottle to return it to the small table.",
        10: "Fails to pick up the bottle to return it to the small table.",
        12: "Fails to pick up the bottle to place it on the main table.",
        13: "Fails to pick up the bottle to return it to the small table.",
        14: "Fails to pick up the bottle to return it to the small table.",
        15: "Fails to pick up the bottle to return it to the small table.",
        17: "Fails to pick up the bottle to return it to the small table.",
        19: "Fails to pick up the bottle to return it to the small table.",
        20: "Fails to pick up the bottle to return it to the small table.",
      },
      "scan-bottle": {
        1: "Scans the same bottle twice.",
        2: "Fails to pick up the bottle.",
        3: "Fails to pick up the bottle.",
        4: "Fails to pick up the bottle.",
        6: "Fails to pick up the bottle.",
        7: "Fails to pick up the bottle.",
        8: "Fails to pick up the bottle.",
        10: "Attempts to pick up the wrong bottle.",
        11: "Fails to place the bottles in an aligned vertical row.",
        12: "Fails to pick up the bottle.",
        13: "Attempts to pick up the wrong bottle.",
        14: "Fails to place the bottle upright.",
        16: "Fails to pick up the bottle.",
        17: "Fails to pick up the bottle.",
        18: "Fails to scan the bottle.",
      },
    },
    foldColors: ["Orange", "Dark blue", "Pink", "Blue"],
  },
  {
    id: "memer",
    label: "MemER",
    fullLabel: "MemER",
    results: {
      "dust-table": { successes: [3, 5, 6, 9, 11, 14, 18, 20], reported: 8 },
      "scan-bottle": { successes: [6, 8, 11, 16, 17, 19, 20], reported: 7 },
      "fold-cloth": { successes: [4, 7, 8, 11, 16, 18, 20, 23, 24, 27, 31, 32], reported: 12 },
    },
    failureReasons: {
      "dust-table": {
        1: "Fails to place the bottle upright on the larger table.",
        2: "Fails to return the duster to its original location.",
        4: "Dusts the table twice.",
        7: "Fails to pick up the duster.",
        8: "Fails to pick up the bottle to return it to the small table.",
        10: "Fails to return the bottles in the correct left–right order.",
        12: "Fails to pick up the bottle to return it to the small table.",
        13: "Fails to return the bottles in the correct left–right order.",
        15: "Fails to return the bottles in the correct left–right order.",
        16: "Fails to return the bottles in the correct left–right order.",
        17: "Fails to return the bottles in the correct left–right order.",
        19: "Fails to pick up the bottle to return it to the small table.",
      },
      "scan-bottle": {
        1: "Repeatedly scans the same bottle.",
        2: "Fails to place the bottle upright.",
        3: "Fails to place the bottle upright.",
        4: "Fails to pick up the bottle.",
        5: "Repeatedly scans the same bottle.",
        7: "Repeatedly scans the same bottle.",
        9: "Fails to pick up the bottle.",
        10: "Fails to pick up the bottle.",
        12: "Attempts to pick up the wrong bottle.",
        13: "Fails to pick up the wrong bottle.",
        14: "Fails to pick up the bottle.",
        15: "Repeatedly scans the same bottle.",
        18: "Fails to pick up the bottle.",
      },
    },
    foldColors: ["Blue", "Pink", "Dark blue", "Orange"],
  },
  {
    id: "uniform",
    label: "Uniform",
    fullLabel: "Uniform sampling",
    results: {
      "dust-table": { successes: [3, 4, 5, 7, 12, 14, 17, 18, 19, 20], reported: 10 },
      "scan-bottle": { successes: [3, 4, 5, 6, 8, 12, 13, 14, 16, 19], reported: 10 },
      "fold-cloth": { successes: [3, 5, 6, 13, 15, 16, 17, 19, 20, 26, 27, 29, 30, 31, 32], reported: 15 },
    },
    failureReasons: {
      "dust-table": {
        1: "Fails to pick up the bottle to return it to the small table.",
        2: "Fails to pick up the bottle to return it to the small table.",
        6: "Fails to pick up the bottle to return it to the small table.",
        8: "Fails to pick up the bottle to return it to the small table.",
        9: "Fails to pick up the bottle to return it to the small table.",
        10: "Fails to return the bottles in the correct left–right order.",
        11: "Knocks over a bottle with the duster.",
        13: "Knocks over a bottle with the duster.",
        15: "Fails to pick up the bottle to return it to the small table.",
        16: "Fails to return the bottles in the correct left–right order.",
      },
      "scan-bottle": {
        1: "Fails to pick up the bottle.",
        2: "Fails to pick up the bottle.",
        7: "Scans the same bottle twice.",
        9: "Fails to pick up the bottle.",
        10: "Fails to pick up the bottle.",
        11: "Fails to place the bottle upright.",
        15: "Fails to pick up the bottle.",
        17: "Returns the scanned bottle instead of placing it on the other side.",
        18: "Fails to pick up the bottle.",
        20: "Fails to align the placed bottles in a vertical row.",
      },
    },
    foldColors: ["Blue", "Orange", "Pink", "Dark blue"],
  },
  {
    id: "ours",
    label: "IMPRINT",
    fullLabel: "IMPRINT",
    results: {
      "dust-table": { successes: [1, 3, 4, 5, 7, 8, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20], reported: 16 },
      "scan-bottle": { successes: [2, 3, 4, 6, 7, 8, 10, 11, 13, 14, 15, 16, 18, 19, 20], reported: 15 },
      "fold-cloth": { successes: [1, 2, 4, 5, 6, 7, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 27, 28, 29, 30, 31, 32], reported: 23 },
    },
    failureReasons: {
      "dust-table": {
        2: "Fails to return the bottles in the correct left–right order.",
        6: "Fails to pick up the duster.",
        9: "Fails to pick up the second bottle to return it to the small table.",
        12: "Fails to pick up the bottle to return it to the small table.",
      },
      "scan-bottle": {
        1: "Fails to arrange the placed bottles in a vertically aligned row.",
        5: "Repeatedly scans the same bottle.",
        9: "Repeatedly scans the same bottle.",
        12: "Fails to pick up the bottle.",
        17: "Fails to place the bottle upright.",
      },
    },
    foldColors: ["Orange", "Dark blue", "Blue", "Pink"],
  },
  {
    id: "ours-ood",
    label: "IMPRINT OOD",
    fullLabel: "IMPRINT (OOD)",
    results: {
      "dust-table": { successes: [2, 4, 5, 9, 10, 13, 15, 18, 20], reported: 9 },
      "scan-bottle": { successes: [1, 2, 3, 4, 5, 7, 8, 9, 11, 12, 13, 16, 17, 19], reported: 14 },
      "fold-cloth": { successes: [2, 5, 6, 9, 12, 15, 17, 23, 27, 28], reported: 10 },
    },
    failureReasons: {
      "dust-table": {
        1: "Fails to return the objects in the correct left–right order.",
        3: "Fails to pick up the second bottle to return it to the small table.",
        6: "Fails to return the objects in the correct left–right order.",
        7: "Fails to pick up the bottle to return it to the small table.",
        8: "Fails to return the objects in the correct left–right order.",
        11: "Knocks over the other bottle while returning one bottle to the small table.",
        12: "Fails to return the objects in the correct left–right order.",
        14: "Fails to pick up the Tic Tac box to return it to the small table.",
        16: "Fails to place the Tic Tac box upright.",
        17: "Fails to place the Tic Tac box upright.",
        19: "Fails to return the Tic Tac box to the small table.",
      },
      "scan-bottle": {
        6: "Fails to pick up the bottle.",
        10: "Returns the bottle to the wrong position.",
        14: "Fails to pick up the bottle.",
        15: "Fails to pick up the bottle.",
        18: "Fails to align the placed bottles in a vertical row.",
        20: "Fails to place the object upright.",
      },
    },
    foldColors: ["Light gray", "Purple", "Charcoal", "Striped"],
    foldDemoColors: ["Orange", "Dark blue", "Blue", "Pink"],
  },
];

const foldDemoColorSlugs = {
  Blue: "blue",
  "Dark blue": "dark-blue",
  Orange: "orange",
  Pink: "pink",
};

const memerTraceCheckpoints = [
  {
    time: "15.3 s",
    observation: 231,
    prediction: "Pick up the bottle on the left.",
    keyframes: [2, 91],
  },
  {
    time: "24.7 s",
    observation: 370,
    prediction: "Pick up the duster.",
    keyframes: [2, 91, 223, 296, 322],
  },
  {
    time: "32.7 s",
    observation: 490,
    prediction: "Dust the small table from right to left.",
    keyframes: [2, 91, 223, 296, 322, 361],
  },
  {
    time: "35.2 s",
    observation: 528,
    prediction: "Put the duster back on the larger table.",
    keyframes: [2, 91, 223, 296, 322, 361],
  },
  {
    time: "41.7 s",
    observation: 625,
    prediction: "Put the bottle on the right side of the small table.",
    keyframes: [223, 296, 322, 361, 478, 512, 533, 567],
  },
  {
    time: "55.2 s",
    observation: 828,
    prediction: "Pick up the bottle on the left from the larger table.",
    keyframes: [361, 478, 512, 533, 567, 613, 654, 755],
  },
  {
    time: "65.2 s",
    observation: 978,
    prediction: "Put the bottle on the left side of the small table.",
    keyframes: [533, 567, 613, 654, 755, 796, 840, 889],
  },
];

rolloutMethods.forEach((method) => {
  Object.entries(method.results).forEach(([taskId, result]) => {
    const total = rolloutTasks[taskId].total;
    const unique = new Set(result.successes);
    const valid = result.successes.every((trial) => trial >= 1 && trial <= total);

    if (unique.size !== result.reported || unique.size !== result.successes.length || !valid) {
      console.error(`Rollout labels do not match the paper for ${method.id}/${taskId}.`);
    }
  });
});

const rolloutVideo = document.getElementById("rollout-video");
const methodSlider = document.getElementById("method-slider");
const trialSlider = document.getElementById("trial-slider");
const methodScale = document.getElementById("method-scale");
const methodName = document.getElementById("method-name");
const rolloutScore = document.getElementById("rollout-score");
const outcomeBadge = document.getElementById("outcome-badge");
const trialContextLabel = document.getElementById("trial-context-label");
const trialTitle = document.getElementById("trial-title");
const trialDescription = document.getElementById("trial-description");
const trialFailureDetail = document.getElementById("trial-failure-detail");
const trialFailureReason = document.getElementById("trial-failure-reason");
const memerTraceToggle = document.getElementById("memer-trace-toggle");
const memerTraceToggleLabel = document.getElementById("memer-trace-toggle-label");
const memerTracePanel = document.getElementById("memer-trace-panel");
const memerTraceStatus = document.getElementById("memer-trace-status");
const memerTraceImage = document.getElementById("memer-trace-image");
const memerTraceImageCaption = document.getElementById("memer-trace-image-caption");
const memerTracePrediction = document.getElementById("memer-trace-prediction");
const memerTraceObservation = document.getElementById("memer-trace-observation");
const memerTraceCount = document.getElementById("memer-trace-count");
const memerTraceSlider = document.getElementById("memer-trace-slider");
const memerKeyframeBank = document.getElementById("memer-keyframe-bank");
const trialOutput = document.getElementById("trial-output");
const trialGrid = document.getElementById("trial-grid");
const foldTrialMatrix = document.getElementById("fold-trial-matrix");
const foldContext = document.getElementById("fold-context");
const foldContextTitle = document.getElementById("fold-context-title");
const foldContextSummary = document.getElementById("fold-context-summary");
const foldContextVideo = document.getElementById("fold-context-video");
const foldContextCaption = document.getElementById("fold-context-caption");
const realworldTaskPrompt = document.getElementById("realworld-task-prompt");
const rolloutResultImage = document.getElementById("rollout-result-image");
const rolloutResultTitle = document.getElementById("rollout-result-title");
const rolloutResultAnalysis = document.getElementById("rollout-result-analysis");
const rolloutResultCaption = document.getElementById("rollout-result-caption");
const rolloutResultTableBody = document.getElementById("rollout-result-table-body");
const taskTabs = [...document.querySelectorAll(".task-tab")];

if (
  rolloutVideo &&
  methodSlider &&
  trialSlider &&
  methodScale &&
  methodName &&
  rolloutScore &&
  outcomeBadge &&
  trialContextLabel &&
  trialTitle &&
  trialDescription &&
  trialFailureDetail &&
  trialFailureReason &&
  memerTraceToggle &&
  memerTraceToggleLabel &&
  memerTracePanel &&
  memerTraceStatus &&
  memerTraceImage &&
  memerTraceImageCaption &&
  memerTracePrediction &&
  memerTraceObservation &&
  memerTraceCount &&
  memerTraceSlider &&
  memerKeyframeBank &&
  trialOutput &&
  trialGrid &&
  foldTrialMatrix &&
  foldContext &&
  foldContextTitle &&
  foldContextSummary &&
  foldContextVideo &&
  foldContextCaption &&
  realworldTaskPrompt &&
  rolloutResultImage &&
  rolloutResultTitle &&
  rolloutResultAnalysis &&
  rolloutResultCaption &&
  rolloutResultTableBody
) {
  let selectedTask = "dust-table";
  let selectedMethodIndex = Number(methodSlider.value);
  let selectedTrial = Number(trialSlider.value);
  let selectedMemerTraceCheckpoint = Number(memerTraceSlider.value);

  const memerKeyframeSource = (step) =>
    `static/images/memer-trace/step-${String(step).padStart(4, "0")}.jpg`;

  const renderMemerTrace = () => {
    const checkpoint = memerTraceCheckpoints[selectedMemerTraceCheckpoint];
    const newestStep = checkpoint.keyframes[checkpoint.keyframes.length - 1];

    memerTraceStatus.textContent =
      `Checkpoint ${selectedMemerTraceCheckpoint + 1} of ${memerTraceCheckpoints.length} · ${checkpoint.time}`;
    memerTracePrediction.textContent = checkpoint.prediction;
    memerTraceObservation.textContent = String(checkpoint.observation);
    memerTraceCount.textContent = `${checkpoint.keyframes.length} / 8`;
    memerTraceImage.src = memerKeyframeSource(newestStep);
    memerTraceImage.alt =
      `Newest retained head-camera keyframe at observation step ${newestStep}`;
    memerTraceImageCaption.textContent =
      `Newest retained keyframe · step ${newestStep}`;
    memerTraceSlider.value = String(selectedMemerTraceCheckpoint);
    memerTraceSlider.setAttribute(
      "aria-valuetext",
      `Checkpoint ${selectedMemerTraceCheckpoint + 1}, ${checkpoint.time}, ${checkpoint.prediction}`,
    );
    memerKeyframeBank.replaceChildren();

    checkpoint.keyframes.forEach((step, index) => {
      const figure = document.createElement("figure");
      const image = document.createElement("img");
      const caption = document.createElement("figcaption");

      figure.classList.toggle(
        "is-newest",
        index === checkpoint.keyframes.length - 1,
      );
      image.src = memerKeyframeSource(step);
      image.alt = `Retained head-camera keyframe at observation step ${step}`;
      image.loading = "lazy";
      image.decoding = "async";
      caption.textContent =
        index === checkpoint.keyframes.length - 1
          ? `Step ${step} · newest`
          : `Step ${step}`;
      figure.append(image, caption);
      memerKeyframeBank.append(figure);
    });
  };

  const setMemerTraceExpanded = (expanded) => {
    memerTraceToggle.setAttribute("aria-expanded", String(expanded));
    memerTraceToggleLabel.textContent = expanded
      ? "Hide example keyframe trace"
      : "Show example keyframe trace";
    memerTracePanel.hidden = !expanded;

    if (expanded) {
      renderMemerTrace();
    }
  };

  rolloutMethods.forEach((method, index) => {
    const marker = document.createElement("span");
    marker.textContent = method.label;
    marker.title = method.fullLabel;
    marker.classList.toggle("is-active", index === selectedMethodIndex);
    methodScale.append(marker);
  });

  const trialButton = (trial, method, taskId) => {
    const successful = method.results[taskId].successes.includes(trial);
    const button = document.createElement("button");

    button.className = `trial-button ${successful ? "is-success" : "is-failure"}`;
    button.classList.toggle("is-active", trial === selectedTrial);
    button.type = "button";
    button.textContent = String(trial).padStart(2, "0");
    button.setAttribute(
      "aria-label",
      `Trial ${trial}: ${successful ? "success" : "failure"}`,
    );
    button.setAttribute("aria-pressed", String(trial === selectedTrial));
    button.addEventListener("click", () => {
      selectedTrial = trial;
      trialSlider.value = String(trial);
      renderRollout(true);
    });

    return button;
  };

  const renderTrialBrowser = (method, taskId) => {
    trialGrid.replaceChildren();
    foldTrialMatrix.replaceChildren();

    if (taskId !== "fold-cloth") {
      trialGrid.hidden = false;
      foldTrialMatrix.hidden = true;

      for (let trial = 1; trial <= rolloutTasks[taskId].total; trial += 1) {
        trialGrid.append(trialButton(trial, method, taskId));
      }

      return;
    }

    trialGrid.hidden = true;
    foldTrialMatrix.hidden = false;

    method.foldColors.forEach((color, colorIndex) => {
      const colorGroup = document.createElement("section");
      const colorHeading = document.createElement("h4");
      const styleGrid = document.createElement("div");

      colorGroup.className = "fold-color-group";
      colorHeading.className = "fold-color-heading";
      colorHeading.textContent = color;
      styleGrid.className = "fold-style-grid";

      for (let style = 1; style <= 4; style += 1) {
        const styleGroup = document.createElement("div");
        const styleLabel = document.createElement("span");
        const styleTrials = document.createElement("div");

        styleGroup.className = "fold-style-group";
        styleLabel.className = "fold-style-label";
        styleLabel.textContent = `Style ${style}`;
        styleTrials.className = "fold-style-trials";

        for (let repeat = 0; repeat < 2; repeat += 1) {
          const trial = colorIndex * 8 + (style - 1) * 2 + repeat + 1;
          styleTrials.append(trialButton(trial, method, taskId));
        }

        styleGroup.append(styleLabel, styleTrials);
        styleGrid.append(styleGroup);
      }

      colorGroup.append(colorHeading, styleGrid);
      foldTrialMatrix.append(colorGroup);
    });
  };

  const foldDetailsForTrial = (method, trial) => {
    const colorIndex = Math.floor((trial - 1) / 8);
    const withinColor = (trial - 1) % 8;
    const style = Math.floor(withinColor / 2) + 1;
    const repeat = (withinColor % 2) + 1;

    return {
      demoColor: method.foldDemoColors?.[colorIndex] || method.foldColors[colorIndex],
      rolloutColor: method.foldColors[colorIndex],
      style,
      repeat,
    };
  };

  const foldContextForTrial = (method, trial) => {
    const details = foldDetailsForTrial(method, trial);

    return `${details.rolloutColor} towel · Style ${details.style} · Trial ${details.repeat} of 2`;
  };

  const renderFoldContext = (method, trial, loadVideoNow = false) => {
    const details = foldDetailsForTrial(method, trial);
    const colorSlug = foldDemoColorSlugs[details.demoColor];
    const source =
      `static/videos/in-context/fold/${colorSlug}/style-${details.style}.mp4` +
      "?v=20261002-matched-fold-context";

    foldContextTitle.textContent =
      `${details.demoColor} towel · Style ${details.style} demonstration`;
    foldContextSummary.textContent =
      details.demoColor === details.rolloutColor
        ? `Matched to the selected ${details.rolloutColor} towel rollout.`
        : `${details.demoColor} demonstration paired with the selected ${details.rolloutColor} OOD towel rollout.`;
    foldContextCaption.textContent =
      `${details.demoColor} towel · Style ${details.style} · Head, left wrist, and right wrist views`;
    foldContextVideo.setAttribute(
      "aria-label",
      `${details.demoColor} towel, folding style ${details.style} in-context demonstration, head, left wrist, and right wrist views`,
    );
    deferVideoSource(foldContextVideo, source, loadVideoNow);
  };

  const renderRolloutResult = (taskId) => {
    const task = rolloutTasks[taskId];

    realworldTaskPrompt.textContent = task.prompt;
    rolloutResultImage.src = task.image;
    rolloutResultImage.alt = task.imageAlt;
    rolloutResultTitle.textContent = task.label;
    rolloutResultAnalysis.textContent = task.analysis;
    rolloutResultCaption.textContent = `${task.label} results`;
    rolloutResultTableBody.replaceChildren();

    rolloutMethods.forEach((method, index) => {
      const result = method.results[taskId];
      const percentage = Math.round((result.reported / task.total) * 100);
      const row = document.createElement("tr");
      const methodCell = document.createElement("th");
      const percentageCell = document.createElement("td");
      const countCell = document.createElement("td");

      methodCell.scope = "row";
      methodCell.textContent = method.fullLabel;
      percentageCell.textContent = String(percentage);
      countCell.textContent = `${result.reported} / ${task.total}`;
      row.classList.toggle("is-selected", index === selectedMethodIndex);
      row.append(methodCell, percentageCell, countCell);
      rolloutResultTableBody.append(row);
    });
  };

  const renderRollout = (loadVideoNow = false) => {
    const method = rolloutMethods[selectedMethodIndex];
    const task = rolloutTasks[selectedTask];
    const result = method.results[selectedTask];
    const successful = result.successes.includes(selectedTrial);
    const failureReason =
      method.failureReasons?.[selectedTask]?.[selectedTrial] || "";
    const percentage = Math.round((result.reported / task.total) * 100);
    const videoVersion =
      method.id === "pi0" && selectedTask === "dust-table" && selectedTrial === 12
        ? "20261002-dust12-replacement"
        : method.id === "uniform" &&
            selectedTask === "scan-bottle" &&
            selectedTrial === 18
          ? "20261002-uniform-scan18-replacement"
          : method.id === "ours" && selectedTask === "fold-cloth"
            ? "20261003-imprint-fold-corrections-v3"
            : method.id === "pi0" && selectedTask === "fold-cloth"
              ? "20261003-pi0-fold-swap-09-11"
              : method.id === "memer" && selectedTask === "fold-cloth"
                ? "20261003-memer-fold-swap-02-04"
                : method.id === "uniform" && selectedTask === "fold-cloth"
                  ? "20261003-uniform-fold-corrections"
                  : "20261002-hd";
    const source = `static/videos/rollouts/${method.id}/${selectedTask}/trial-${String(selectedTrial).padStart(2, "0")}.mp4?v=${videoVersion}`;

    methodName.textContent = method.fullLabel;
    rolloutScore.textContent = `${result.reported} / ${task.total} successful (${percentage}%)`;
    outcomeBadge.textContent = successful ? "Success" : "Failure";
    outcomeBadge.classList.toggle("is-success", successful);
    outcomeBadge.classList.toggle("is-failure", !successful);
    trialContextLabel.textContent =
      selectedTask === "fold-cloth"
        ? foldContextForTrial(method, selectedTrial)
        : task.label;
    trialTitle.textContent = `Trial ${String(selectedTrial).padStart(2, "0")}`;
    trialDescription.textContent = `${method.fullLabel} · ${successful ? "Success" : "Failure"}`;
    trialFailureDetail.hidden = !failureReason;
    trialFailureReason.textContent = failureReason;
    const showMemerTrace =
      method.id === "memer" &&
      selectedTask === "dust-table";
    memerTraceToggle.hidden = !showMemerTrace;

    if (!showMemerTrace) {
      setMemerTraceExpanded(false);
    }

    if (selectedTask === "fold-cloth") {
      renderFoldContext(method, selectedTrial, loadVideoNow);
    }

    trialOutput.textContent = `${String(selectedTrial).padStart(2, "0")} / ${task.total}`;
    trialSlider.max = String(task.total);
    trialSlider.value = String(selectedTrial);
    trialSlider.style.setProperty(
      "--trial-outcome-color",
      successful ? "#15803d" : "#b91c1c",
    );

    deferVideoSource(rolloutVideo, source, loadVideoNow);

    rolloutVideo.setAttribute(
      "aria-label",
      `${method.fullLabel}, ${task.label}, trial ${selectedTrial}, ${successful ? "success" : "failure"}${failureReason ? `, failure reason: ${failureReason}` : ""}`,
    );

    [...methodScale.children].forEach((marker, index) => {
      marker.classList.toggle("is-active", index === selectedMethodIndex);
    });

    renderRolloutResult(selectedTask);
    renderTrialBrowser(method, selectedTask);
  };

  const scheduleRolloutRender = debounceWithFlush(() => {
    renderRollout(true);
  });

  methodSlider.addEventListener("input", () => {
    selectedMethodIndex = Number(methodSlider.value);
    rolloutVideo.pause();
    scheduleRolloutRender();
  });
  methodSlider.addEventListener("change", scheduleRolloutRender.flush);

  trialSlider.addEventListener("input", () => {
    selectedTrial = Number(trialSlider.value);
    rolloutVideo.pause();
    scheduleRolloutRender();
  });
  trialSlider.addEventListener("change", scheduleRolloutRender.flush);

  memerTraceToggle.addEventListener("click", () => {
    const willExpand =
      memerTraceToggle.getAttribute("aria-expanded") !== "true";
    setMemerTraceExpanded(willExpand);
  });

  memerTraceSlider.addEventListener("input", () => {
    selectedMemerTraceCheckpoint = Number(memerTraceSlider.value);
    renderMemerTrace();
  });

  taskTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      selectedTask = tab.dataset.task;
      selectedTrial = 1;
      foldContext.hidden = selectedTask !== "fold-cloth";

      if (selectedTask !== "fold-cloth") {
        foldContextVideo.pause();
      }

      taskTabs.forEach((candidate) => {
        const active = candidate === tab;
        candidate.classList.toggle("is-active", active);
        candidate.setAttribute("aria-selected", String(active));
      });

      renderRollout(true);
    });
  });

  renderRollout();
}

const rmbenchTasks = {
  "observe-pick": {
    label: "Observe / Pick",
    prompt: "Pick the object matching a target shown before occlusion.",
    rates: { ours: 6, hamlet: 6, uniform: 5 },
  },
  rearrange: {
    label: "Rearrange",
    prompt:
      "Move the center block to the empty mat, press, and move the initially mat-placed block to the center.",
    rates: { ours: 99, hamlet: 76, uniform: 79 },
  },
  "put-back": {
    label: "Put Back",
    prompt:
      "Move the block to the center, press, and return it to its original mat.",
    rates: { ours: 100, hamlet: 23, uniform: 100 },
  },
  "swap-blocks": {
    label: "Swap Blocks",
    prompt:
      "Use the spare tray to exchange the blocks' initial tray assignments, then press once.",
    rates: { ours: 100, hamlet: 25, uniform: 62 },
  },
  "swap-t": {
    label: "Swap T",
    prompt:
      "Exchange the initial positions and orientations of two T-shaped blocks.",
    rates: { ours: 100, hamlet: 13, uniform: 30 },
  },
  battery: {
    label: "Battery",
    prompt:
      "Use gauge feedback from tested orientation pairs to place both batteries correctly.",
    rates: { ours: 35, hamlet: 26, uniform: 28 },
  },
  ranking: {
    label: "Block Ranking",
    prompt:
      "Use feedback from failed arrangements to find the hidden left-to-right block order.",
    rates: { ours: 84, hamlet: 70, uniform: 82 },
  },
  "cover-blocks": {
    label: "Cover Blocks",
    prompt:
      "Remember the initial color order, cover from left to right, and uncover in red–green–blue order.",
    rates: { ours: 100, hamlet: 14, uniform: 13 },
  },
  "press-button": {
    label: "Press Button",
    prompt:
      "Recall two displayed numbers, press the left and middle buttons those numbers of times, and confirm.",
    rates: { ours: 31, hamlet: 0, uniform: 3 },
  },
};

const rmbenchMethods = [
  { id: "ours", label: "Ours (recurrent)", shortLabel: "Ours" },
  { id: "hamlet", label: "HAMLET", shortLabel: "HAMLET" },
  { id: "uniform", label: "Uniform sampling", shortLabel: "Uniform" },
];

const rmbenchTaskSelect = document.getElementById("rmbench-task-select");
const rmbenchMethodSlider = document.getElementById("rmbench-method-slider");
const rmbenchMethodScale = document.getElementById("rmbench-method-scale");
const rmbenchMethodName = document.getElementById("rmbench-method-name");
const rmbenchSuccessRate = document.getElementById("rmbench-success-rate");
const rmbenchTaskPrompt = document.getElementById("rmbench-task-prompt");
const rmbenchSuccessCard = document.getElementById("rmbench-success-card");
const rmbenchFailureCard = document.getElementById("rmbench-failure-card");
const rmbenchSuccessVideo = document.getElementById("rmbench-success-video");
const rmbenchFailureVideo = document.getElementById("rmbench-failure-video");

if (
  rmbenchTaskSelect &&
  rmbenchMethodSlider &&
  rmbenchMethodScale &&
  rmbenchMethodName &&
  rmbenchSuccessRate &&
  rmbenchTaskPrompt &&
  rmbenchSuccessCard &&
  rmbenchFailureCard &&
  rmbenchSuccessVideo &&
  rmbenchFailureVideo
) {
  let selectedRmbenchMethod = Number(rmbenchMethodSlider.value);

  rmbenchMethods.forEach((method, index) => {
    const marker = document.createElement("span");
    marker.textContent = method.shortLabel;
    marker.classList.toggle("is-active", index === selectedRmbenchMethod);
    rmbenchMethodScale.append(marker);
  });

  const setRmbenchVideo = (
    video,
    card,
    outcome,
    available,
    task,
    method,
    loadVideoNow,
  ) => {
    card.hidden = !available;

    if (!available) {
      clearDeferredVideo(video);
      return;
    }

    const source = `static/videos/rmbench/${method.id}/${rmbenchTaskSelect.value}/${outcome}.mp4`;
    deferVideoSource(video, source, loadVideoNow);
    video.setAttribute(
      "aria-label",
      `${method.label}, ${task.label}, representative ${outcome} rollout`,
    );
  };

  const renderRmbenchRollouts = (loadVideoNow = false) => {
    const taskId = rmbenchTaskSelect.value;
    const task = rmbenchTasks[taskId];
    const method = rmbenchMethods[selectedRmbenchMethod];
    const rate = task.rates[method.id];

    rmbenchMethodName.textContent = method.label;
    rmbenchSuccessRate.textContent = `${rate}% success`;
    rmbenchTaskPrompt.textContent = task.prompt;
    setRmbenchVideo(
      rmbenchSuccessVideo,
      rmbenchSuccessCard,
      "success",
      rate > 0,
      task,
      method,
      loadVideoNow,
    );
    setRmbenchVideo(
      rmbenchFailureVideo,
      rmbenchFailureCard,
      "failure",
      rate < 100,
      task,
      method,
      loadVideoNow,
    );

    [...rmbenchMethodScale.children].forEach((marker, index) => {
      marker.classList.toggle("is-active", index === selectedRmbenchMethod);
    });
  };

  const scheduleRmbenchRender = debounceWithFlush(() => {
    renderRmbenchRollouts(true);
  });

  rmbenchTaskSelect.addEventListener("change", () => {
    renderRmbenchRollouts(true);
  });
  rmbenchMethodSlider.addEventListener("input", () => {
    selectedRmbenchMethod = Number(rmbenchMethodSlider.value);
    rmbenchSuccessVideo.pause();
    rmbenchFailureVideo.pause();
    scheduleRmbenchRender();
  });
  rmbenchMethodSlider.addEventListener("change", scheduleRmbenchRender.flush);

  renderRmbenchRollouts();
}

const robocasaTasks = {
  retrieve_fruit: {
    label: "Retrieve Fruit",
    type: "Memory",
    prompt:
      "Place the {fruit} in the sink; recall which side of the sink it was observed on.",
  },
  retrieve_oil: {
    label: "Retrieve Oil",
    type: "Memory",
    prompt:
      "Pick up the olive-oil bottle; recall which of two bottles is the target after both sides are shown.",
  },
  wash_and_return: {
    label: "Wash and Return (Left / Right)",
    type: "Memory",
    prompt:
      "Wash the fruit and return it to its original container; recall the source container.",
  },
  wash_and_return_same_location: {
    label: "Wash and Return (Same Location)",
    type: "Memory",
    prompt:
      "Wash the fruit and return it to its exact initial location; recall that location.",
  },
  rinse_cutting_board: {
    label: "Rinse Cutting Board",
    type: "Memory",
    prompt:
      "Rinse the board with hot water for ten seconds, then turn off the faucet; track rinse duration.",
  },
  sweeten_hot_chocolate: {
    label: "Sweeten Hot Chocolate",
    type: "Memory",
    prompt:
      "Place the instructed number of sugar cubes in the saucepan with hot chocolate.",
    goalCounts: [
      1, 2, 1, 2, 3, 1, 2, 1, 2, 3,
      1, 2, 3, 1, 2, 1, 2, 3, 1, 2,
      3, 1, 2, 1, 2, 3, 1, 2, 1, 2,
      3, 1, 2, 1, 2, 3, 1, 2, 3, 1,
      2, 1, 2, 3, 1, 2, 1, 2, 1, 2,
    ],
  },
  pan_transfer: {
    label: "Pan Transfer",
    type: "Non-memory",
    prompt:
      "Dump the vegetables from the pan onto the plate and return the pan to the stove.",
  },
  frying_pan_adjustment: {
    label: "Frying Pan Adjustment",
    type: "Non-memory",
    prompt:
      "Move the pan to another burner and turn that burner on.",
  },
  organize_condiments: {
    label: "Organize Condiments",
    type: "Non-memory",
    prompt:
      "Move only the condiments or shakers from the counter into the cabinet.",
  },
  place_equal_ice_cubes: {
    label: "Place Equal Ice Cubes",
    type: "Non-memory",
    prompt:
      "Place two of the four ice cubes into each glass of water.",
  },
  scrub_cutting_board: {
    label: "Scrub Cutting Board",
    type: "Non-memory",
    prompt:
      "Scrub the board with the sponge, then release it.",
  },
  pick_place_counter_to_sink: {
    label: "Move from Counter to Sink",
    type: "Non-memory",
    prompt:
      "Pick the {object} from the counter and place it in the sink.",
  },
};

const robocasaMethods = [
  {
    id: "pi05",
    directory: "pi05",
    label: "π₀.₅",
    shortLabel: "π₀.₅",
    color: "#777F8B",
  },
  {
    id: "action",
    directory: "heuristic_action_expert",
    label: "Heuristic action expert",
    shortLabel: "Action",
    color: "#70B9A5",
  },
  {
    id: "vlm",
    directory: "heuristic_vlm_context",
    label: "Heuristic VLM context",
    shortLabel: "VLM",
    color: "#277D6C",
  },
  {
    id: "full",
    directory: "ours_full",
    label: "Ours (full)",
    shortLabel: "Full",
    color: "#F4A261",
  },
  {
    id: "recurrent",
    directory: "ours_recurrent",
    label: "Ours (recurrent)",
    shortLabel: "Rec.",
    color: "#F47A00",
  },
];

const robocasaExplorer = document.getElementById("robocasa-rollouts");
const robocasaTaskSelect = document.getElementById("robocasa-task-select");
const robocasaMethodSlider = document.getElementById("robocasa-method-slider");
const robocasaMethodScale = document.getElementById("robocasa-method-scale");
const robocasaMethodName = document.getElementById("robocasa-method-name");
const robocasaMethodRate = document.getElementById("robocasa-method-rate");
const robocasaTaskType = document.getElementById("robocasa-task-type");
const robocasaTaskPrompt = document.getElementById("robocasa-task-prompt");
const robocasaRolloutTitle = document.getElementById("robocasa-rollout-title");
const robocasaRolloutVariant = document.getElementById("robocasa-rollout-variant");
const robocasaCurrentOutcome = document.getElementById("robocasa-current-outcome");
const robocasaTrialSlider = document.getElementById("robocasa-trial-slider");
const robocasaTrialOutput = document.getElementById("robocasa-trial-output");
const robocasaTrialGrid = document.getElementById("robocasa-trial-grid");
const robocasaArchiveNote = document.querySelector(".robocasa-archive-note");
const robocasaOutcomeBadges = [
  ...document.querySelectorAll(".robocasa-outcome-badge"),
];
const robocasaVideos = [
  {
    element: document.getElementById("robocasa-video-left"),
    camera: "agentview_left",
    label: "left agent view",
  },
  {
    element: document.getElementById("robocasa-video-right"),
    camera: "agentview_right",
    label: "right agent view",
  },
  {
    element: document.getElementById("robocasa-video-wrist"),
    camera: "eye_in_hand",
    label: "wrist view",
  },
];

if (
  robocasaExplorer &&
  robocasaTaskSelect &&
  robocasaMethodSlider &&
  robocasaMethodScale &&
  robocasaMethodName &&
  robocasaMethodRate &&
  robocasaTaskType &&
  robocasaTaskPrompt &&
  robocasaRolloutTitle &&
  robocasaRolloutVariant &&
  robocasaCurrentOutcome &&
  robocasaTrialSlider &&
  robocasaTrialOutput &&
  robocasaTrialGrid &&
  robocasaArchiveNote &&
  robocasaVideos.every(({ element }) => element)
) {
  let robocasaArchive = null;
  let selectedRobocasaMethod = Number(robocasaMethodSlider.value);
  let selectedRobocasaTrial = Number(robocasaTrialSlider.value);
  let synchronizingRobocasaVideos = false;

  const formatRobocasaVariant = (variant) =>
    variant
      .replace(/^Mem/, "")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .trim();

  const formatRobocasaPrompt = (task, episode) => {
    const goalCount = task.goalCounts?.[episode];

    if (!Number.isInteger(goalCount)) {
      return task.prompt;
    }

    const cubeLabel = goalCount === 1 ? "sugar cube" : "sugar cubes";
    return `Place exactly ${goalCount} ${cubeLabel} in the saucepan with hot chocolate.`;
  };

  const getRobocasaRollouts = () => {
    if (!robocasaArchive) {
      return [];
    }

    const taskRollouts = robocasaArchive.rollouts[robocasaTaskSelect.value];
    const method = robocasaMethods[selectedRobocasaMethod];
    return taskRollouts?.[method.id] || [];
  };

  const synchronizeRobocasaVideos = (source, action) => {
    if (synchronizingRobocasaVideos) {
      return;
    }

    synchronizingRobocasaVideos = true;
    robocasaVideos.forEach(({ element }) => {
      if (element === source) {
        return;
      }

      if (
        Number.isFinite(source.currentTime) &&
        Math.abs(element.currentTime - source.currentTime) > 0.12
      ) {
        element.currentTime = source.currentTime;
      }

      if (action === "play" && element.paused) {
        element.play().catch(() => {});
      } else if (action === "pause" && !element.paused) {
        element.pause();
      }
    });

    window.setTimeout(() => {
      synchronizingRobocasaVideos = false;
    }, 0);
  };

  robocasaVideos.forEach(({ element }) => {
    element.addEventListener("play", () => {
      synchronizeRobocasaVideos(element, "play");
    });
    element.addEventListener("pause", () => {
      synchronizeRobocasaVideos(element, "pause");
    });
    element.addEventListener("seeking", () => {
      synchronizeRobocasaVideos(element, "seek");
    });
  });

  robocasaMethods.forEach((method, index) => {
    const marker = document.createElement("span");
    marker.textContent = method.shortLabel;
    marker.style.setProperty("--marker-color", method.color);
    marker.classList.toggle("is-active", index === selectedRobocasaMethod);
    robocasaMethodScale.append(marker);
  });

  const renderRobocasaTrialGrid = () => {
    const rollouts = getRobocasaRollouts();
    robocasaTrialGrid.replaceChildren();

    rollouts.forEach((rollout, index) => {
      const outcome = rollout[2];
      const button = document.createElement("button");
      button.type = "button";
      button.className = `robocasa-trial-button is-${outcome}`;
      button.classList.toggle("is-active", index === selectedRobocasaTrial);
      button.textContent = String(index + 1).padStart(2, "0");
      button.setAttribute(
        "aria-label",
        `Rollout ${index + 1}, ${outcome}`,
      );
      button.addEventListener("click", () => {
        selectedRobocasaTrial = index;
        robocasaTrialSlider.value = String(index);
        renderRobocasaRollout(true);
      });
      robocasaTrialGrid.append(button);
    });
  };

  const renderRobocasaRollout = (loadVideoNow = false) => {
    const rollouts = getRobocasaRollouts();
    if (!rollouts.length) {
      return;
    }

    selectedRobocasaTrial = Math.min(
      selectedRobocasaTrial,
      rollouts.length - 1,
    );

    const taskId = robocasaTaskSelect.value;
    const task = robocasaTasks[taskId];
    const method = robocasaMethods[selectedRobocasaMethod];
    const [variant, episode, outcome] = rollouts[selectedRobocasaTrial];
    const successCount = rollouts.filter(
      (rollout) => rollout[2] === "success",
    ).length;

    robocasaExplorer.style.setProperty(
      "--robocasa-method-color",
      method.color,
    );
    robocasaExplorer.style.setProperty(
      "--robocasa-trial-color",
      outcome === "success" ? "#15803d" : "#b91c1c",
    );
    robocasaMethodName.textContent = method.label;
    robocasaMethodRate.textContent =
      `Archive: ${successCount} / ${rollouts.length} successes`;
    robocasaTaskType.textContent = `${task.type} task`;
    robocasaTaskPrompt.textContent = formatRobocasaPrompt(task, episode);
    robocasaRolloutTitle.textContent =
      `${task.label} · Rollout ${String(selectedRobocasaTrial + 1).padStart(2, "0")}`;
    robocasaRolloutVariant.textContent =
      `${formatRobocasaVariant(variant)} · episode ${String(episode).padStart(3, "0")}`;
    robocasaTrialOutput.textContent =
      `${String(selectedRobocasaTrial + 1).padStart(2, "0")} / ${rollouts.length}`;
    robocasaCurrentOutcome.textContent = outcome;
    robocasaCurrentOutcome.classList.toggle(
      "is-success",
      outcome === "success",
    );
    robocasaCurrentOutcome.classList.toggle(
      "is-failure",
      outcome === "failure",
    );

    robocasaOutcomeBadges.forEach((badge) => {
      badge.textContent = outcome;
      badge.classList.toggle("is-success", outcome === "success");
      badge.classList.toggle("is-failure", outcome === "failure");
    });

    synchronizingRobocasaVideos = true;
    robocasaVideos.forEach(({ element, camera, label }) => {
      const filename =
        `rollout_${String(episode).padStart(3, "0")}_${camera}_${outcome}.mp4`;
      const source = [
        "static/videos/robocasa",
        taskId,
        method.directory,
        variant,
        filename,
      ]
        .map((part, index) => (index === 0 ? part : encodeURIComponent(part)))
        .join("/");

      element.pause();
      deferVideoSource(element, source, loadVideoNow);
      element.setAttribute(
        "aria-label",
        `${method.label}, ${task.label}, rollout ${selectedRobocasaTrial + 1}, ${label}, ${outcome}`,
      );
    });
    window.setTimeout(() => {
      synchronizingRobocasaVideos = false;
    }, 0);

    [...robocasaMethodScale.children].forEach((marker, index) => {
      marker.classList.toggle("is-active", index === selectedRobocasaMethod);
    });
    [...robocasaTrialGrid.children].forEach((button, index) => {
      button.classList.toggle("is-active", index === selectedRobocasaTrial);
    });
  };

  const scheduleRobocasaRender = debounceWithFlush(() => {
    renderRobocasaRollout(true);
  });

  robocasaTaskSelect.addEventListener("change", () => {
    selectedRobocasaTrial = 0;
    robocasaTrialSlider.value = "0";
    renderRobocasaTrialGrid();
    renderRobocasaRollout(true);
  });

  robocasaMethodSlider.addEventListener("input", () => {
    selectedRobocasaMethod = Number(robocasaMethodSlider.value);
    selectedRobocasaTrial = 0;
    robocasaTrialSlider.value = "0";
    renderRobocasaTrialGrid();
    robocasaVideos.forEach(({ element }) => element.pause());
    scheduleRobocasaRender();
  });
  robocasaMethodSlider.addEventListener(
    "change",
    scheduleRobocasaRender.flush,
  );

  robocasaTrialSlider.addEventListener("input", () => {
    selectedRobocasaTrial = Number(robocasaTrialSlider.value);
    robocasaVideos.forEach(({ element }) => element.pause());
    scheduleRobocasaRender();
  });
  robocasaTrialSlider.addEventListener(
    "change",
    scheduleRobocasaRender.flush,
  );

  fetch("static/data/robocasa-rollouts.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("RoboCasa archive index unavailable.");
      }
      return response.json();
    })
    .then((archive) => {
      robocasaArchive = archive;
      robocasaTaskSelect.disabled = false;
      robocasaMethodSlider.disabled = false;
      robocasaTrialSlider.disabled = false;
      renderRobocasaTrialGrid();
      renderRobocasaRollout();
    })
    .catch(() => {
      robocasaRolloutTitle.textContent = "RoboCasa archive unavailable";
      robocasaRolloutVariant.textContent =
        "The local video archive could not be loaded.";
      robocasaArchiveNote.textContent =
        "The result table remains available above.";
    });
}

const attentionFrame = document.getElementById("attention-frame");
const attentionSlider = document.getElementById("attention-slider");
const attentionStep = document.getElementById("attention-step");
const attentionTabs = [...document.querySelectorAll("[data-attention-method]")];
const attentionExplorer = document.querySelector(".attention-explorer");
const attentionAssetVersion = "20260930-clear-labels";
const attentionMethods = {
  e2e: {
    count: 30,
    label: "E2E",
    description: "end-to-end action supervision",
  },
  frozen: {
    count: 30,
    label: "Frozen",
    description: "frozen bootstrapped memory",
  },
  ours: {
    count: 20,
    label: "Ours",
    description: "jointly adapted IMPRINT",
  },
};

if (
  attentionFrame &&
  attentionSlider &&
  attentionStep &&
  attentionTabs.length &&
  attentionExplorer
) {
  let selectedAttentionMethod = "ours";
  let attentionIsActive = false;

  const renderAttention = () => {
    const method = attentionMethods[selectedAttentionMethod];
    const progress = Number(attentionSlider.value);
    const frameIndex = Math.round((progress / 100) * (method.count - 1));
    const frameNumber = frameIndex + 1;
    const source =
      `static/images/attention/${selectedAttentionMethod}/frame-${String(frameIndex).padStart(2, "0")}.jpg` +
      `?v=${attentionAssetVersion}`;

    attentionFrame.src = source;
    attentionFrame.alt = `Attention visualization for ${method.description}, frame ${frameNumber} of ${method.count}`;
    attentionStep.textContent = `Frame ${frameNumber} / ${method.count}`;

    if (attentionIsActive) {
      [frameIndex - 1, frameIndex + 1]
        .filter((index) => index >= 0 && index < method.count)
        .forEach((index) => {
          const preload = new Image();
          preload.src =
            `static/images/attention/${selectedAttentionMethod}/frame-${String(index).padStart(2, "0")}.jpg` +
            `?v=${attentionAssetVersion}`;
        });
    }
  };

  attentionSlider.addEventListener("input", () => {
    attentionIsActive = true;
    renderAttention();
  });

  attentionTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      attentionIsActive = true;
      selectedAttentionMethod = tab.dataset.attentionMethod;

      attentionTabs.forEach((candidate) => {
        const active = candidate === tab;
        candidate.classList.toggle("is-active", active);
        candidate.setAttribute("aria-selected", String(active));
      });

      renderAttention();
    });
  });

  if ("IntersectionObserver" in window) {
    const attentionObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        attentionIsActive = true;
        renderAttention();
        attentionObserver.disconnect();
      },
      { rootMargin: "360px 0px" },
    );
    attentionObserver.observe(attentionExplorer);
  } else {
    attentionIsActive = true;
    renderAttention();
  }
}
