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

const heroRolloutVideo = document.querySelector(".hero-rollout-grid");
const heroPlaybackFallback = document.querySelector(".hero-playback-fallback");
let heroPlaybackCheckTimer = null;

const setHeroPlaybackFallbackVisible = (isVisible) => {
  if (heroPlaybackFallback) {
    heroPlaybackFallback.hidden = !isVisible;
  }
};

const scheduleHeroPlaybackCheck = (delay = 1800) => {
  if (!heroRolloutVideo) {
    return;
  }

  window.clearTimeout(heroPlaybackCheckTimer);
  heroPlaybackCheckTimer = window.setTimeout(() => {
    if (heroRolloutVideo.paused && !document.hidden) {
      setHeroPlaybackFallbackVisible(true);
    }
  }, delay);
};

const attemptHeroPlayback = () => {
  if (
    !heroRolloutVideo ||
    !heroRolloutVideo.getAttribute("src") ||
    document.hidden
  ) {
    return;
  }

  heroRolloutVideo.muted = true;
  heroRolloutVideo.defaultMuted = true;
  heroRolloutVideo.playsInline = true;

  let playRequest;

  try {
    playRequest = heroRolloutVideo.play();
  } catch {
    scheduleHeroPlaybackCheck(300);
    return;
  }

  scheduleHeroPlaybackCheck();

  if (playRequest && typeof playRequest.then === "function") {
    playRequest
      .then(() => {
        window.clearTimeout(heroPlaybackCheckTimer);
        setHeroPlaybackFallbackVisible(false);
      })
      .catch(() => {
        scheduleHeroPlaybackCheck(300);
      });
  }
};

if (heroRolloutVideo) {
  heroRolloutVideo.muted = true;
  heroRolloutVideo.defaultMuted = true;
  heroRolloutVideo.playsInline = true;

  heroRolloutVideo.addEventListener("canplay", attemptHeroPlayback);
  heroRolloutVideo.addEventListener("playing", () => {
    window.clearTimeout(heroPlaybackCheckTimer);
    setHeroPlaybackFallbackVisible(false);
  });
  heroRolloutVideo.addEventListener("error", () => {
    setHeroPlaybackFallbackVisible(true);
  });

  heroPlaybackFallback?.addEventListener("click", () => {
    setHeroPlaybackFallbackVisible(false);
    attemptHeroPlayback();
  });

  const resumeHeroAfterInteraction = () => {
    if (heroRolloutVideo.paused) {
      attemptHeroPlayback();
    }
  };

  document.addEventListener("pointerdown", resumeHeroAfterInteraction, {
    passive: true,
  });
  document.addEventListener("keydown", resumeHeroAfterInteraction);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && heroRolloutVideo.paused) {
      attemptHeroPlayback();
    }
  });
  window.addEventListener("focus", resumeHeroAfterInteraction);
  window.addEventListener("pageshow", resumeHeroAfterInteraction);
}

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

  if (!source) {
    return;
  }

  if (video.getAttribute("src") === source) {
    if (video === heroRolloutVideo && video.paused) {
      attemptHeroPlayback();
    }
    return;
  }

  video.preload = video.dataset.preload || "auto";
  video.setAttribute("src", source);
  video.load();

  if (video === heroRolloutVideo) {
    attemptHeroPlayback();
  }
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
  deferVideoSource(
    video,
    video.dataset.src,
    video === heroRolloutVideo,
  );
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

const methodExplorer = document.getElementById("method-explorer");
const methodDemoVideo = document.getElementById("method-demo-video");
const methodDemoSlider = null;
const methodDemoTime = null;
const methodDemoToggle = document.getElementById("method-demo-toggle");
const methodDemoToggleIcon = document.getElementById("method-demo-toggle-icon");
const methodDemoToggleLabel = document.getElementById("method-demo-toggle-label");
const methodProgressValue = document.getElementById("method-progress-value");
const methodProgressBar = document.getElementById("method-progress-bar");
const methodCurrentObservation = null;
const methodPolicyMemoryLabel = document.getElementById(
  "method-policy-memory-label",
);
const methodExplorerStatus = document.getElementById("method-explorer-status");

if (
  methodExplorer &&
  methodDemoVideo &&
  methodDemoSlider &&
  methodDemoTime &&
  methodDemoToggle &&
  methodDemoToggleIcon &&
  methodDemoToggleLabel &&
  methodProgressValue &&
  methodProgressBar &&
  methodCurrentObservation &&
  methodPolicyMemoryLabel &&
  methodExplorerStatus
) {
  const methodStageTabs = [
    ...methodExplorer.querySelectorAll("[data-method-stage]"),
  ];
  const methodStageContents = [
    ...methodExplorer.querySelectorAll("[data-method-content]"),
  ];
  const methodStreamButtons = [
    ...methodExplorer.querySelectorAll("[data-method-stream]"),
  ];
  const methodHistoryButtons = [
    ...methodExplorer.querySelectorAll("[data-method-progress]"),
  ];
  const methodMemoryTokens = [
    ...methodExplorer.querySelectorAll("[data-memory-stream]"),
  ];
  const methodOutputTrack = methodExplorer.querySelector(
    ".method-output-track",
  );
  const methodMemoryNode = methodExplorer.querySelector(".method-memory-node");
  const methodProgressObjective = methodExplorer.querySelector(
    ".method-progress-objective",
  );
  const methodCanvasContext = methodCurrentObservation.getContext("2d");
  const methodStreamNames = {
    visual: "visual",
    action: "action",
    state: "state",
  };
  const activeMethodStreams = new Set(
    methodStreamButtons
      .filter((button) => button.getAttribute("aria-pressed") === "true")
      .map((button) => button.dataset.methodStream),
  );
  let selectedMethodStage = methodExplorer.dataset.stage || "memory";
  let methodDemoIsVisible = false;
  let methodDemoPausedByUser = false;

  const formatMethodTime = (seconds) => {
    const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
    const minutes = Math.floor(safeSeconds / 60);
    const remainder = Math.floor(safeSeconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  };

  const drawMethodCurrentObservation = () => {
    if (!methodCanvasContext || methodDemoVideo.readyState < 2) {
      return;
    }

    try {
      methodCanvasContext.drawImage(
        methodDemoVideo,
        0,
        0,
        methodCurrentObservation.width,
        methodCurrentObservation.height,
      );
    } catch {
      // The video frame will be drawn on the next media event.
    }
  };

  const renderMethodTimeline = () => {
    const duration = Number.isFinite(methodDemoVideo.duration)
      ? methodDemoVideo.duration
      : 0;
    const currentTime = Number.isFinite(methodDemoVideo.currentTime)
      ? methodDemoVideo.currentTime
      : 0;
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const boundedProgress = Math.min(100, Math.max(0, progress));

    methodDemoSlider.value = String(boundedProgress);
    methodDemoTime.textContent =
      `${formatMethodTime(currentTime)} / ${formatMethodTime(duration || 27)}`;
    methodProgressValue.textContent = `${Math.round(boundedProgress)}%`;
    methodProgressBar.style.width = `${boundedProgress}%`;

    let nearestHistoryButton = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    methodHistoryButtons.forEach((button) => {
      const distance = Math.abs(
        Number(button.dataset.methodProgress) - boundedProgress,
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestHistoryButton = button;
      }
    });
    methodHistoryButtons.forEach((button) => {
      button.classList.toggle("is-active", button === nearestHistoryButton);
    });

    drawMethodCurrentObservation();
  };

  const updateMethodPlaybackControl = () => {
    const isPaused = methodDemoVideo.paused;
    methodDemoToggleIcon.textContent = isPaused ? "▶" : "Ⅱ";
    methodDemoToggleLabel.textContent = isPaused ? "Play" : "Pause";
    methodDemoToggle.setAttribute(
      "aria-label",
      `${isPaused ? "Play" : "Pause"} the folding demonstration`,
    );
  };

  const playMethodDemo = () => {
    if (!methodDemoIsVisible || methodDemoPausedByUser) {
      return;
    }

    const playRequest = methodDemoVideo.play();
    if (playRequest && typeof playRequest.catch === "function") {
      playRequest.catch(() => {
        updateMethodPlaybackControl();
      });
    }
  };

  const renderMethodStatus = () => {
    const activeNames = Object.keys(methodStreamNames)
      .filter((stream) => activeMethodStreams.has(stream))
      .map((stream) => methodStreamNames[stream]);

    if (!activeNames.length) {
      methodExplorerStatus.textContent =
        "Select at least one history stream to populate the latent memory.";
      return;
    }

    if (activeNames.length < 3) {
      methodExplorerStatus.textContent =
        `Tracing ${activeNames.join(" + ")} history through the memory encoder.`;
      return;
    }

    methodExplorerStatus.textContent =
      selectedMethodStage === "memory"
        ? "All three histories shape the latent memory before policy adaptation."
        : "Memory, language, and the current observation jointly condition the VLA.";
  };

  const renderMethodStreams = () => {
    methodStreamButtons.forEach((button) => {
      const stream = button.dataset.methodStream;
      const isActive = activeMethodStreams.has(stream);
      const state = button.querySelector(".method-stream-state");
      const flow = methodExplorer.querySelector(
        `[data-method-flow="${stream}"]`,
      );
      const output = methodExplorer.querySelector(
        `[data-method-output="${stream}"]`,
      );

      button.classList.toggle("is-disabled", !isActive);
      button.setAttribute("aria-pressed", String(isActive));
      if (state) {
        state.textContent = isActive ? "On" : "Off";
      }
      flow?.classList.toggle("is-disabled", !isActive);
      output?.classList.toggle("is-disabled", !isActive);
    });

    methodMemoryTokens.forEach((token) => {
      const stream = token.dataset.memoryStream;
      const isActive =
        stream === "mixed"
          ? activeMethodStreams.size > 0
          : activeMethodStreams.has(stream);
      token.classList.toggle("is-muted", !isActive);
    });

    const hasActiveStreams = activeMethodStreams.size > 0;
    methodExplorer.classList.toggle("has-no-streams", !hasActiveStreams);
    methodMemoryNode?.classList.toggle("is-empty", !hasActiveStreams);
    methodOutputTrack?.classList.toggle("is-disabled", !hasActiveStreams);
    methodProgressObjective?.classList.toggle(
      "is-disabled",
      !hasActiveStreams,
    );

    const activeLabels = Object.keys(methodStreamNames)
      .filter((stream) => activeMethodStreams.has(stream))
      .map((stream) => methodStreamNames[stream]);
    methodPolicyMemoryLabel.textContent = activeLabels.length
      ? `${activeLabels.join(" + ")} memory`
      : "No history memory selected";

    renderMethodStatus();
  };

  const selectMethodStage = (stage) => {
    selectedMethodStage = stage;
    methodExplorer.dataset.stage = stage;

    methodStageTabs.forEach((tab) => {
      const isActive = tab.dataset.methodStage === stage;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
    methodStageContents.forEach((content) => {
      content.hidden = content.dataset.methodContent !== stage;
    });

    renderMethodStatus();
    if (stage === "policy") {
      drawMethodCurrentObservation();
    }
  };

  methodStageTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      selectMethodStage(tab.dataset.methodStage);
    });
  });

  methodStreamButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const stream = button.dataset.methodStream;
      if (activeMethodStreams.has(stream)) {
        activeMethodStreams.delete(stream);
      } else {
        activeMethodStreams.add(stream);
      }
      renderMethodStreams();
    });
  });

  methodHistoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const duration = Number.isFinite(methodDemoVideo.duration)
        ? methodDemoVideo.duration
        : 0;
      const progress = Number(button.dataset.methodProgress);
      if (duration > 0) {
        methodDemoVideo.currentTime = Math.min(
          (progress / 100) * duration,
          Math.max(0, duration - 0.05),
        );
      }
      renderMethodTimeline();
    });
  });

  methodDemoSlider.addEventListener("input", () => {
    const duration = Number.isFinite(methodDemoVideo.duration)
      ? methodDemoVideo.duration
      : 0;
    if (duration > 0) {
      methodDemoVideo.currentTime = Math.min(
        (Number(methodDemoSlider.value) / 100) * duration,
        Math.max(0, duration - 0.05),
      );
    }
    renderMethodTimeline();
  });

  methodDemoToggle.addEventListener("click", () => {
    if (methodDemoVideo.paused) {
      methodDemoPausedByUser = false;
      playMethodDemo();
    } else {
      methodDemoPausedByUser = true;
      methodDemoVideo.pause();
    }
    updateMethodPlaybackControl();
  });

  methodDemoVideo.addEventListener("loadedmetadata", renderMethodTimeline);
  methodDemoVideo.addEventListener("loadeddata", () => {
    renderMethodTimeline();
    playMethodDemo();
  });
  methodDemoVideo.addEventListener("canplay", playMethodDemo);
  methodDemoVideo.addEventListener("timeupdate", renderMethodTimeline);
  methodDemoVideo.addEventListener("seeked", renderMethodTimeline);
  methodDemoVideo.addEventListener("play", updateMethodPlaybackControl);
  methodDemoVideo.addEventListener("pause", updateMethodPlaybackControl);

  if ("IntersectionObserver" in window) {
    const methodExplorerObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        methodDemoIsVisible = Boolean(entry?.isIntersecting);
        methodExplorer.classList.toggle(
          "is-animated",
          methodDemoIsVisible,
        );

        if (methodDemoIsVisible) {
          activateDeferredVideo(methodDemoVideo);
          playMethodDemo();
        } else {
          methodDemoVideo.pause();
        }
      },
      { threshold: 0.12, rootMargin: "120px 0px" },
    );
    methodExplorerObserver.observe(methodExplorer);
  } else {
    methodDemoIsVisible = true;
    methodExplorer.classList.add("is-animated");
    activateDeferredVideo(methodDemoVideo);
    playMethodDemo();
  }

  selectMethodStage(selectedMethodStage);
  renderMethodStreams();
  renderMethodTimeline();
  updateMethodPlaybackControl();
}

const methodRolloutVideo = document.getElementById("method-rollout-video");
const methodExampleShowcase = document.getElementById("method-example");
const methodRolloutSlider = document.getElementById("method-rollout-slider");
const methodRolloutTime = document.getElementById("method-rollout-time");
const methodRolloutClock = document.getElementById("method-rollout-clock");
const methodRolloutToggle = document.getElementById("method-rollout-toggle");
const methodRolloutToggleIcon = document.getElementById(
  "method-rollout-toggle-icon",
);
const methodRolloutToggleLabel = document.getElementById(
  "method-rollout-toggle-label",
);
const methodHistoryReadout = document.getElementById("method-history-readout");
const methodHistoryMeter = document.getElementById("method-history-meter");
const methodNextPrediction = document.getElementById(
  "method-next-prediction",
);
const methodPolicyActionLabel = document.getElementById(
  "method-policy-action-label",
);
const methodPolicyObservation = document.getElementById(
  "method-policy-observation",
);
const methodEvidenceChip = document.getElementById("method-evidence-chip");
const methodEvidenceLabel = document.getElementById("method-evidence-label");
const methodEvidenceScore = document.getElementById("method-evidence-score");
const methodEvidenceDelta = document.getElementById("method-evidence-delta");
const methodEvidenceNote = document.getElementById("method-evidence-note");
const methodTaskChart = document.getElementById("method-task-chart");
const methodRecipeOptions = document.getElementById("method-recipe-options");

if (
  methodExplorer &&
  methodDemoVideo &&
  methodDemoToggle &&
  methodDemoToggleIcon &&
  methodDemoToggleLabel &&
  methodProgressValue &&
  methodProgressBar &&
  methodPolicyMemoryLabel &&
  methodExplorerStatus &&
  methodRolloutVideo &&
  methodExampleShowcase &&
  methodRolloutSlider &&
  methodRolloutTime &&
  methodRolloutClock &&
  methodRolloutToggle &&
  methodRolloutToggleIcon &&
  methodRolloutToggleLabel &&
  methodHistoryReadout &&
  methodHistoryMeter &&
  methodNextPrediction &&
  methodPolicyActionLabel &&
  methodEvidenceChip &&
  methodEvidenceLabel &&
  methodEvidenceScore &&
  methodEvidenceDelta &&
  methodEvidenceNote &&
  methodTaskChart &&
  methodRecipeOptions
) {
  const methodStageTabsV2 = [
    ...methodExplorer.querySelectorAll("[data-method-stage]"),
  ];
  const methodStageContentsV2 = [
    ...methodExplorer.querySelectorAll("[data-method-content]"),
  ];
  const methodStreamButtonsV2 = [
    ...methodExplorer.querySelectorAll("[data-method-stream]"),
  ];
  const methodObjectiveButtons = [
    ...methodExplorer.querySelectorAll("[data-method-objective]"),
  ];
  const methodEvidenceTabs = [
    ...methodExplorer.querySelectorAll("[data-method-evidence]"),
  ];
  const methodRecipeButtons = [
    ...methodExplorer.querySelectorAll("[data-method-recipe]"),
  ];
  const methodRolloutFrames = [
    ...methodExampleShowcase.querySelectorAll(
      "[data-method-rollout-progress]",
    ),
  ];
  const methodMemoryTokensV2 = [
    ...methodExplorer.querySelectorAll("[data-memory-stream]"),
  ];
  const methodPolicyMemoryTokens = [
    ...methodExplorer.querySelectorAll("[data-policy-memory-stream]"),
  ];
  const methodOutputTrackV2 = methodExplorer.querySelector(
    ".method-output-track",
  );
  const methodMemoryNodeV2 = methodExplorer.querySelector(
    ".method-memory-node",
  );
  const activeMethodStreamsV2 = new Set(
    methodStreamButtonsV2
      .filter((button) => button.getAttribute("aria-pressed") === "true")
      .map((button) => button.dataset.methodStream),
  );
  const activeMethodObjectives = new Set(
    methodObjectiveButtons
      .filter((button) => button.getAttribute("aria-pressed") === "true")
      .map((button) => button.dataset.methodObjective),
  );
  const streamOrder = ["visual", "action", "state"];
  const objectiveOrder = ["visual", "action", "state", "progress"];
  const streamLabels = {
    visual: "Visual",
    action: "Action",
    state: "State",
  };
  const objectiveLabels = {
    visual: "Visual",
    action: "Action",
    state: "State",
    progress: "Progress",
  };
  const rmbenchTasks = [
    { short: "Obs. / Pick", full: "Observe / Pick" },
    { short: "Rearrange", full: "Rearrange" },
    { short: "Put Back", full: "Put Back" },
    { short: "Swap Blocks", full: "Swap Blocks" },
    { short: "Swap T", full: "Swap T" },
    { short: "Battery", full: "Battery" },
    { short: "Ranking", full: "Ranking" },
    { short: "Cover", full: "Cover Blocks" },
    { short: "Press", full: "Press Button" },
  ];
  const inputAblations = {
    visual: {
      label: "Vision only",
      average: 60.6,
      values: [9, 93, 100, 81, 45, 30, 80, 100, 7],
    },
    "visual+action": {
      label: "Vision + Action",
      average: 68.4,
      values: [6, 100, 100, 100, 99, 38, 72, 83, 18],
    },
    "visual+state": {
      label: "Vision + State",
      average: 60.9,
      values: [9, 94, 100, 98, 99, 28, 46, 70, 4],
    },
    "visual+action+state": {
      label: "Vision + Action + State (IMPRINT)",
      average: 72.7,
      values: [9, 100, 100, 100, 100, 41, 83, 100, 21],
    },
  };
  const objectiveAblations = {
    visual: {
      label: "Visual only",
      average: 66.9,
      values: [6, 78, 100, 89, 99, 30, 85, 100, 15],
    },
    "action+state": {
      label: "Action + state",
      average: 62.7,
      values: [5, 100, 100, 89, 98, 36, 61, 52, 23],
    },
    "visual+action+state": {
      label: "Without progress",
      average: 68.7,
      values: [6, 91, 100, 90, 97, 35, 73, 100, 26],
    },
    "visual+action+state+progress": {
      label: "All objectives (IMPRINT)",
      average: 72.7,
      values: [9, 100, 100, 100, 100, 41, 83, 100, 21],
    },
  };
  const recipeAblations = {
    e2e: {
      label: "End-to-end learning",
      average: 50.8,
      values: [12, 90, 100, 90, 45, 27, 73, 15, 5],
    },
    frozen: {
      label: "Memory learned, then frozen",
      average: 58.8,
      values: [7, 99, 100, 99, 99, 20, 68, 35, 2],
    },
    joint: {
      label: "Joint memory–policy adaptation",
      average: 72.7,
      values: [9, 100, 100, 100, 100, 41, 83, 100, 21],
    },
  };
  const rolloutPredictions = [
    {
      start: 0,
      full: "Move both grippers toward the near towel corners.",
      short: "Reach toward the towel",
    },
    {
      start: 18,
      full: "Close both grippers on the near towel corners.",
      short: "Grasp both near corners",
    },
    {
      start: 36,
      full: "Lift the near edge and initiate the first fold.",
      short: "Lift and begin the fold",
    },
    {
      start: 55,
      full: "Carry the folded edge across the towel.",
      short: "Move the folded edge across",
    },
    {
      start: 74,
      full: "Align the folded layers and refine the final shape.",
      short: "Align the folded layers",
    },
    {
      start: 90,
      full: "Release the towel and withdraw both grippers.",
      short: "Release and withdraw",
    },
  ];
  let selectedMethodStageV2 = methodExplorer.dataset.stage || "memory";
  let selectedEvidenceMode = "objectives";
  let selectedRecipe = "joint";
  let methodExampleIsVisible = false;
  let demoPausedByUser = false;
  let rolloutPausedByUser = true;

  const formatMethodTimeV2 = (seconds) => {
    const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
    const minutes = Math.floor(safeSeconds / 60);
    const remainder = Math.floor(safeSeconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  };

  const canonicalSelection = (activeValues, order) =>
    order.filter((value) => activeValues.has(value)).join("+");

  const describeSelection = (activeValues, order, labels) => {
    const names = order
      .filter((value) => activeValues.has(value))
      .map((value) => labels[value]);
    return names.length ? names.join(" + ") : "No components selected";
  };

  const currentRolloutPrediction = (progress) => {
    let prediction = rolloutPredictions[0];
    rolloutPredictions.forEach((candidate) => {
      if (progress >= candidate.start) {
        prediction = candidate;
      }
    });
    return prediction;
  };

  const updateDemoPlaybackControlV2 = () => {
    const isPaused = methodDemoVideo.paused;
    methodDemoToggleIcon.textContent = isPaused ? "▶" : "Ⅱ";
    methodDemoToggleLabel.textContent = isPaused ? "Play" : "Pause";
    methodDemoToggle.setAttribute(
      "aria-label",
      `${isPaused ? "Play" : "Pause"} the folding demonstration`,
    );
  };

  const playMethodDemoV2 = () => {
    if (!methodExampleIsVisible || demoPausedByUser) {
      return;
    }

    const request = methodDemoVideo.play();
    request?.catch?.(updateDemoPlaybackControlV2);
  };

  const updateRolloutPlaybackControl = () => {
    const isPaused = methodRolloutVideo.paused;
    methodRolloutToggleIcon.textContent = isPaused ? "▶" : "Ⅱ";
    methodRolloutToggleLabel.textContent = isPaused ? "Play" : "Pause";
    methodRolloutToggle.setAttribute(
      "aria-label",
      `${isPaused ? "Play" : "Pause"} the real-world rollout`,
    );
  };

  const renderRolloutTimeline = () => {
    const duration = Number.isFinite(methodRolloutVideo.duration)
      ? methodRolloutVideo.duration
      : 29.87;
    const currentTime = Number.isFinite(methodRolloutVideo.currentTime)
      ? methodRolloutVideo.currentTime
      : 0;
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const boundedProgress = Math.min(100, Math.max(0, progress));
    const prediction = currentRolloutPrediction(boundedProgress);

    methodRolloutSlider.value = String(boundedProgress);
    methodRolloutSlider.style.setProperty(
      "--progress",
      `${boundedProgress}%`,
    );
    methodRolloutTime.textContent =
      `${formatMethodTimeV2(currentTime)} / ${formatMethodTimeV2(duration)}`;
    methodRolloutClock.textContent = `t = ${formatMethodTimeV2(currentTime)}`;
    methodHistoryReadout.textContent =
      `${Math.round(boundedProgress)}% · ${currentTime.toFixed(1)} s`;
    methodHistoryMeter.style.width = `${boundedProgress}%`;
    methodProgressValue.textContent = `${Math.round(boundedProgress)}%`;
    methodProgressBar.style.width = `${boundedProgress}%`;
    methodNextPrediction.textContent = prediction.full;

    let nearestFrame = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    methodRolloutFrames.forEach((button) => {
      const frameProgress = Number(button.dataset.methodRolloutProgress);
      const distance = Math.abs(frameProgress - boundedProgress);
      button.classList.toggle(
        "is-complete",
        frameProgress <= boundedProgress,
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestFrame = button;
      }
    });
    methodRolloutFrames.forEach((button) => {
      button.classList.toggle("is-active", button === nearestFrame);
    });

    const nearestFrameImage = nearestFrame?.querySelector("img");
    const nearestFrameSource = nearestFrameImage?.getAttribute("src");
    if (
      methodPolicyObservation &&
      nearestFrameSource &&
      methodPolicyObservation.getAttribute("src") !== nearestFrameSource
    ) {
      methodPolicyObservation.src = nearestFrameSource;
    }
  };

  const playMethodRollout = () => {
    if (!methodExampleIsVisible || rolloutPausedByUser) {
      return;
    }

    if (
      Number.isFinite(methodRolloutVideo.duration) &&
      methodRolloutVideo.currentTime >= methodRolloutVideo.duration - 0.08
    ) {
      methodRolloutVideo.currentTime = 0;
    }

    const request = methodRolloutVideo.play();
    request?.catch?.(updateRolloutPlaybackControl);
  };

  const renderMethodStatusV2 = () => {
    const streamDescription = describeSelection(
      activeMethodStreamsV2,
      streamOrder,
      streamLabels,
    ).toLowerCase();

    if (!activeMethodStreamsV2.size) {
      methodExplorerStatus.textContent =
        "Select at least one history stream to populate latent memory.";
      return;
    }

    methodExplorerStatus.textContent =
      selectedMethodStageV2 === "memory"
        ? `${streamDescription} history is compressed before policy adaptation.`
        : "The selected memory, task instruction, and current observation condition the VLA.";
  };

  const selectEvidenceMode = (mode) => {
    selectedEvidenceMode = mode;
    methodEvidenceTabs.forEach((tab) => {
      const isActive = tab.dataset.methodEvidence === mode;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
    renderMethodEvidence();
  };

  const renderMethodStreamsV2 = (showEvidence = false) => {
    methodStreamButtonsV2.forEach((button) => {
      const stream = button.dataset.methodStream;
      const isActive = activeMethodStreamsV2.has(stream);
      const state = button.querySelector(".method-stream-state");
      const flow = methodExplorer.querySelector(
        `[data-method-flow="${stream}"]`,
      );

      button.classList.toggle("is-disabled", !isActive);
      button.setAttribute("aria-pressed", String(isActive));
      if (state) {
        state.textContent = isActive ? "On" : "Off";
      }
      flow?.classList.toggle("is-disabled", !isActive);
    });

    methodMemoryTokensV2.forEach((token) => {
      const stream = token.dataset.memoryStream;
      const isActive =
        stream === "mixed"
          ? activeMethodStreamsV2.size > 0
          : activeMethodStreamsV2.has(stream);
      token.classList.toggle("is-muted", !isActive);
    });
    methodPolicyMemoryTokens.forEach((token) => {
      token.classList.toggle(
        "is-muted",
        !activeMethodStreamsV2.has(token.dataset.policyMemoryStream),
      );
    });

    const hasStreams = activeMethodStreamsV2.size > 0;
    methodExplorer.classList.toggle("has-no-streams", !hasStreams);
    methodMemoryNodeV2?.classList.toggle("is-empty", !hasStreams);
    methodOutputTrackV2?.classList.toggle("is-disabled", !hasStreams);
    methodPolicyMemoryLabel.textContent = activeMethodStreamsV2.size
      ? streamOrder
          .filter((stream) => activeMethodStreamsV2.has(stream))
          .map((stream) => streamLabels[stream])
          .join(" · ")
      : "No history selected";
    renderMethodStatusV2();

    if (showEvidence) {
      selectEvidenceMode("inputs");
    }
  };

  const renderMethodObjectives = (showEvidence = false) => {
    methodObjectiveButtons.forEach((button) => {
      const objective = button.dataset.methodObjective;
      const isActive = activeMethodObjectives.has(objective);
      const state = button.querySelector(".method-objective-state");
      button.classList.toggle("is-disabled", !isActive);
      button.setAttribute("aria-pressed", String(isActive));
      if (state) {
        state.textContent = isActive ? "On" : "Off";
      }
    });

    if (showEvidence) {
      selectEvidenceMode("objectives");
    }
  };

  const renderTaskChart = (row) => {
    methodTaskChart.replaceChildren();

    if (!row) {
      const empty = document.createElement("div");
      empty.className = "method-task-chart-empty";
      empty.innerHTML =
        "<strong>This combination was not reported.</strong>" +
        "<span>Select a configuration represented by an exact appendix row.</span>";
      methodTaskChart.append(empty);
      return;
    }

    rmbenchTasks.forEach((task, index) => {
      const value = row.values[index];
      const item = document.createElement("div");
      const heading = document.createElement("div");
      const label = document.createElement("span");
      const score = document.createElement("strong");
      const track = document.createElement("span");
      const fill = document.createElement("span");

      item.className = "method-task-result";
      heading.className = "method-task-result-heading";
      label.textContent = task.short;
      label.title = task.full;
      score.textContent = `${value}%`;
      track.className = "method-task-result-track";
      fill.style.width = `${value}%`;
      track.append(fill);
      heading.append(label, score);
      item.append(heading, track);
      methodTaskChart.append(item);
    });
  };

  function renderMethodEvidence() {
    let row = null;
    let requestedLabel = "";

    if (selectedEvidenceMode === "inputs") {
      const key = canonicalSelection(activeMethodStreamsV2, streamOrder);
      row = inputAblations[key] || null;
      requestedLabel = describeSelection(
        activeMethodStreamsV2,
        streamOrder,
        streamLabels,
      );
    } else if (selectedEvidenceMode === "objectives") {
      const key = canonicalSelection(activeMethodObjectives, objectiveOrder);
      row = objectiveAblations[key] || null;
      requestedLabel = describeSelection(
        activeMethodObjectives,
        objectiveOrder,
        objectiveLabels,
      );
    } else {
      row = recipeAblations[selectedRecipe];
      requestedLabel = row.label;
    }

    methodRecipeOptions.hidden = selectedEvidenceMode !== "recipe";
    methodRecipeButtons.forEach((button) => {
      const isActive = button.dataset.methodRecipe === selectedRecipe;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (!row) {
      methodEvidenceChip.textContent = "No matching appendix row";
      methodEvidenceLabel.textContent = requestedLabel;
      methodEvidenceScore.textContent = "—";
      methodEvidenceDelta.textContent = "Not reported";
      methodEvidenceNote.textContent =
        "The paper does not report this exact combination, so no value is inferred or interpolated.";
      renderTaskChart(null);
      return;
    }

    const difference = 72.7 - row.average;
    methodEvidenceChip.textContent = "Exact appendix row";
    methodEvidenceLabel.textContent = row.label;
    methodEvidenceScore.textContent = `${row.average.toFixed(1)}%`;
    methodEvidenceDelta.textContent =
      Math.abs(difference) < 0.05
        ? "Best reported configuration"
        : `${difference.toFixed(1)} points below full IMPRINT`;
    methodEvidenceNote.textContent =
      "Per-task RMBench success (%). Every value below is copied from the corresponding appendix row.";
    renderTaskChart(row);
  }

  const selectMethodStageV2 = (stage) => {
    selectedMethodStageV2 = stage;
    methodExplorer.dataset.stage = stage;
    methodStageTabsV2.forEach((tab) => {
      const isActive = tab.dataset.methodStage === stage;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
    methodStageContentsV2.forEach((content) => {
      content.hidden = content.dataset.methodContent !== stage;
    });
    renderMethodStatusV2();

    if (stage === "memory") {
      selectEvidenceMode("objectives");
    } else {
      selectedRecipe = "joint";
      selectEvidenceMode("recipe");
    }
  };

  methodStageTabsV2.forEach((tab) => {
    tab.addEventListener("click", () => {
      selectMethodStageV2(tab.dataset.methodStage);
    });
  });

  methodStreamButtonsV2.forEach((button) => {
    button.addEventListener("click", () => {
      const stream = button.dataset.methodStream;
      if (activeMethodStreamsV2.has(stream)) {
        activeMethodStreamsV2.delete(stream);
      } else {
        activeMethodStreamsV2.add(stream);
      }
      renderMethodStreamsV2(true);
    });
  });

  methodObjectiveButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const objective = button.dataset.methodObjective;
      if (activeMethodObjectives.has(objective)) {
        activeMethodObjectives.delete(objective);
      } else {
        activeMethodObjectives.add(objective);
      }
      renderMethodObjectives(true);
    });
  });

  methodEvidenceTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      selectEvidenceMode(tab.dataset.methodEvidence);
    });
  });

  methodRecipeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedRecipe = button.dataset.methodRecipe;
      renderMethodEvidence();
    });
  });

  methodRolloutFrames.forEach((button) => {
    button.addEventListener("click", () => {
      const duration = Number.isFinite(methodRolloutVideo.duration)
        ? methodRolloutVideo.duration
        : 0;
      const progress = Number(button.dataset.methodRolloutProgress);
      rolloutPausedByUser = true;
      methodRolloutVideo.pause();
      if (duration > 0) {
        methodRolloutVideo.currentTime = Math.min(
          (progress / 100) * duration,
          Math.max(0, duration - 0.05),
        );
      }
      renderRolloutTimeline();
      updateRolloutPlaybackControl();
    });
  });

  methodRolloutSlider.addEventListener("input", () => {
    const duration = Number.isFinite(methodRolloutVideo.duration)
      ? methodRolloutVideo.duration
      : 0;
    rolloutPausedByUser = true;
    methodRolloutVideo.pause();
    if (duration > 0) {
      methodRolloutVideo.currentTime = Math.min(
        (Number(methodRolloutSlider.value) / 100) * duration,
        Math.max(0, duration - 0.05),
      );
    }
    renderRolloutTimeline();
    updateRolloutPlaybackControl();
  });

  methodDemoToggle.addEventListener("click", () => {
    if (methodDemoVideo.paused) {
      demoPausedByUser = false;
      playMethodDemoV2();
    } else {
      demoPausedByUser = true;
      methodDemoVideo.pause();
    }
    updateDemoPlaybackControlV2();
  });

  methodRolloutToggle.addEventListener("click", () => {
    if (methodRolloutVideo.paused) {
      rolloutPausedByUser = false;
      playMethodRollout();
    } else {
      rolloutPausedByUser = true;
      methodRolloutVideo.pause();
    }
    updateRolloutPlaybackControl();
  });

  methodDemoVideo.addEventListener("loadeddata", playMethodDemoV2);
  methodDemoVideo.addEventListener("canplay", playMethodDemoV2);
  methodDemoVideo.addEventListener("play", updateDemoPlaybackControlV2);
  methodDemoVideo.addEventListener("pause", updateDemoPlaybackControlV2);
  methodRolloutVideo.addEventListener("loadedmetadata", renderRolloutTimeline);
  methodRolloutVideo.addEventListener("loadeddata", renderRolloutTimeline);
  methodRolloutVideo.addEventListener("timeupdate", renderRolloutTimeline);
  methodRolloutVideo.addEventListener("seeked", renderRolloutTimeline);
  methodRolloutVideo.addEventListener("play", updateRolloutPlaybackControl);
  methodRolloutVideo.addEventListener("pause", updateRolloutPlaybackControl);
  methodRolloutVideo.addEventListener("ended", () => {
    rolloutPausedByUser = true;
    updateRolloutPlaybackControl();
  });

  if ("IntersectionObserver" in window) {
    const methodPipelineObserver = new IntersectionObserver(
      (entries) => {
        methodExplorer.classList.toggle(
          "is-animated",
          Boolean(entries[0]?.isIntersecting),
        );
      },
      { threshold: 0.08, rootMargin: "160px 0px" },
    );
    methodPipelineObserver.observe(methodExplorer);

    const methodExampleObserver = new IntersectionObserver(
      (entries) => {
        methodExampleIsVisible = Boolean(entries[0]?.isIntersecting);

        if (methodExampleIsVisible) {
          activateDeferredVideo(methodDemoVideo);
          activateDeferredVideo(methodRolloutVideo);
          playMethodDemoV2();
          playMethodRollout();
        } else {
          methodDemoVideo.pause();
          methodRolloutVideo.pause();
        }
      },
      { threshold: 0.08, rootMargin: "160px 0px" },
    );
    methodExampleObserver.observe(methodExampleShowcase);
  } else {
    methodExampleIsVisible = true;
    methodExplorer.classList.add("is-animated");
    activateDeferredVideo(methodDemoVideo);
    activateDeferredVideo(methodRolloutVideo);
    playMethodDemoV2();
  }

  selectMethodStageV2(selectedMethodStageV2);
  renderMethodStreamsV2();
  renderMethodObjectives();
  renderRolloutTimeline();
  updateDemoPlaybackControlV2();
  updateRolloutPlaybackControl();
}

const methodHistorySliderV13 = document.getElementById("method-history-slider");
const methodHistoryTimeV13 = document.getElementById("method-history-time");

if (
  methodExplorer &&
  methodHistorySliderV13 &&
  methodHistoryTimeV13 &&
  methodProgressValue &&
  methodProgressBar &&
  methodPolicyMemoryLabel &&
  methodPolicyObservation &&
  methodExplorerStatus &&
  methodEvidenceChip &&
  methodEvidenceLabel &&
  methodEvidenceScore &&
  methodEvidenceDelta &&
  methodEvidenceNote &&
  methodTaskChart &&
  methodRecipeOptions
) {
  const methodStageTabsV13 = [
    ...methodExplorer.querySelectorAll("[data-method-stage]"),
  ];
  const methodStageContentsV13 = [
    ...methodExplorer.querySelectorAll("[data-method-content]"),
  ];
  const methodStreamButtonsV13 = [
    ...methodExplorer.querySelectorAll("[data-method-stream]"),
  ];
  const methodObjectiveButtonsV13 = [
    ...methodExplorer.querySelectorAll("[data-method-objective]"),
  ];
  const methodEvidenceTabsV13 = [
    ...methodExplorer.querySelectorAll("[data-method-evidence]"),
  ];
  const methodRecipeButtonsV13 = [
    ...methodExplorer.querySelectorAll("[data-method-recipe]"),
  ];
  const methodHistorySamplesV13 = [
    ...methodExplorer.querySelectorAll("[data-method-history-point]"),
  ];
  const methodVisualHistorySlotsV17 = [
    ...methodExplorer.querySelectorAll("[data-method-visual-slot]"),
  ];
  const methodMemoryTokensV13 = [
    ...methodExplorer.querySelectorAll("[data-memory-stream]"),
  ];
  const methodPolicyMemoryTokensV13 = [
    ...methodExplorer.querySelectorAll("[data-policy-memory-stream]"),
  ];
  const methodOutputTrackV13 = methodExplorer.querySelector(
    ".method-output-track",
  );
  const methodMemoryNodeV13 = methodExplorer.querySelector(
    ".method-memory-node",
  );
  const methodMemoryCaptionV13 = methodExplorer.querySelector(
    ".method-memory-caption",
  );
  const activeMethodStreamsV13 = new Set(
    methodStreamButtonsV13
      .filter((button) => button.getAttribute("aria-pressed") === "true")
      .map((button) => button.dataset.methodStream),
  );
  const activeMethodObjectivesV13 = new Set(
    methodObjectiveButtonsV13
      .filter((button) => button.getAttribute("aria-pressed") === "true")
      .map((button) => button.dataset.methodObjective),
  );
  const streamOrderV13 = ["visual", "action", "state"];
  const objectiveOrderV13 = ["visual", "action", "state", "progress"];
  const streamLabelsV13 = {
    visual: "Visual",
    action: "Action",
    state: "State",
  };
  const objectiveLabelsV13 = {
    visual: "Visual",
    action: "Action",
    state: "State",
    progress: "Progress",
  };
  const rmbenchTasksV13 = [
    { short: "Obs. / Pick", full: "Observe / Pick" },
    { short: "Rearrange", full: "Rearrange" },
    { short: "Put Back", full: "Put Back" },
    { short: "Swap Blocks", full: "Swap Blocks" },
    { short: "Swap T", full: "Swap T" },
    { short: "Battery", full: "Battery" },
    { short: "Ranking", full: "Ranking" },
    { short: "Cover", full: "Cover Blocks" },
    { short: "Press", full: "Press Button" },
  ];
  const inputAblationsV13 = {
    visual: {
      label: "Vision only",
      average: 60.6,
      values: [9, 93, 100, 81, 45, 30, 80, 100, 7],
    },
    "visual+action": {
      label: "Vision + Action",
      average: 68.4,
      values: [6, 100, 100, 100, 99, 38, 72, 83, 18],
    },
    "visual+state": {
      label: "Vision + State",
      average: 60.9,
      values: [9, 94, 100, 98, 99, 28, 46, 70, 4],
    },
    "visual+action+state": {
      label: "Vision + Action + State (IMPRINT)",
      average: 72.7,
      values: [9, 100, 100, 100, 100, 41, 83, 100, 21],
    },
  };
  const objectiveAblationsV13 = {
    visual: {
      label: "Visual only",
      average: 66.9,
      values: [6, 78, 100, 89, 99, 30, 85, 100, 15],
    },
    "action+state": {
      label: "Action + state",
      average: 62.7,
      values: [5, 100, 100, 89, 98, 36, 61, 52, 23],
    },
    "visual+action+state": {
      label: "Without progress",
      average: 68.7,
      values: [6, 91, 100, 90, 97, 35, 73, 100, 26],
    },
    "visual+action+state+progress": {
      label: "All objectives (IMPRINT)",
      average: 72.7,
      values: [9, 100, 100, 100, 100, 41, 83, 100, 21],
    },
  };
  const recipeAblationsV13 = {
    e2e: {
      label: "End-to-end learning",
      average: 50.8,
      values: [12, 90, 100, 90, 45, 27, 73, 15, 5],
    },
    frozen: {
      label: "Memory learned, then frozen",
      average: 58.8,
      values: [7, 99, 100, 99, 99, 20, 68, 35, 2],
    },
    joint: {
      label: "Joint memory–policy adaptation",
      average: 72.7,
      values: [9, 100, 100, 100, 100, 41, 83, 100, 21],
    },
  };
  const methodDustDurationV13 = 68.8;
  const methodDustFrameCountV17 = 69;
  const methodVisualHistoryOffsetsV23 = [
    { seconds: 0, label: "initial observation" },
    { secondsBeforeT: 2, label: "observation two steps before t" },
    { secondsBeforeT: 1, label: "observation one step before t" },
  ];
  let selectedMethodStageV13 = methodExplorer.dataset.stage || "memory";
  let selectedEvidenceModeV13 = "objectives";
  let selectedRecipeV13 = "joint";
  let selectedCapacityEvidenceV13 = null;

  const canonicalSelectionV13 = (activeValues, order) =>
    order.filter((value) => activeValues.has(value)).join("+");

  const describeSelectionV13 = (activeValues, order, labels) => {
    const names = order
      .filter((value) => activeValues.has(value))
      .map((value) => labels[value]);
    return names.length ? names.join(" + ") : "No components selected";
  };

  const formatMethodTimeV13 = (seconds) => {
    const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
    const minutes = Math.floor(safeSeconds / 60);
    const remainder = Math.floor(safeSeconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  };

  const methodDustFrameSourceV17 = (seconds) => {
    const frameNumber = Math.min(
      methodDustFrameCountV17,
      Math.max(1, Math.round(seconds) + 1),
    );
    return `static/images/method-dust/history-sequence/frame-${String(frameNumber).padStart(3, "0")}.jpg`;
  };

  const renderMethodTimelineV13 = () => {
    const progress = Math.min(
      100,
      Math.max(0, Number(methodHistorySliderV13.value)),
    );
    const currentSeconds = (progress / 100) * methodDustDurationV13;
    let nearestPoint = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    methodHistorySliderV13.style.setProperty("--progress", `${progress}%`);
    methodHistoryTimeV13.textContent =
      `t = ${formatMethodTimeV13(currentSeconds)} / ${formatMethodTimeV13(methodDustDurationV13)}`;
    methodExplorer.style.setProperty("--history-progress", `${progress}%`);
    methodProgressValue.textContent = `${Math.round(progress)}%`;
    methodProgressBar.style.width = `${progress}%`;

    methodHistorySamplesV13.forEach((sample) => {
      const sampleProgress = Number(sample.dataset.methodHistoryPoint);
      const distance = Math.abs(sampleProgress - progress);
      sample.classList.toggle("is-encoded", sampleProgress <= progress);
      sample.classList.toggle("is-future", sampleProgress > progress);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestPoint = sampleProgress;
      }
    });
    methodHistorySamplesV13.forEach((sample) => {
      sample.classList.toggle(
        "is-current",
        Number(sample.dataset.methodHistoryPoint) === nearestPoint,
      );
    });

    methodVisualHistorySlotsV17.forEach((slot, index) => {
      const slotDefinition = methodVisualHistoryOffsetsV23[index];
      const sampleSeconds =
        "seconds" in slotDefinition
          ? slotDefinition.seconds
          : Math.max(0, currentSeconds - slotDefinition.secondsBeforeT);
      const frameSource = methodDustFrameSourceV17(sampleSeconds);
      const image = slot.querySelector("img");

      if (image && image.getAttribute("src") !== frameSource) {
        image.src = frameSource;
      }
      if (image) {
        image.alt =
          `Dust Table head-camera ${slotDefinition.label}, sampled at ${formatMethodTimeV13(sampleSeconds)}`;
      }
    });

    const frameSource = methodDustFrameSourceV17(currentSeconds);
    if (methodPolicyObservation.getAttribute("src") !== frameSource) {
      methodPolicyObservation.src = frameSource;
    }
    methodPolicyObservation.alt =
      `Dust Table head-camera observation at ${Math.round(progress)} percent episode progress`;

    if (methodMemoryCaptionV13) {
      methodMemoryCaptionV13.textContent =
        `Latent history encoded from 0 → t (${Math.round(progress)}%)`;
    }
  };

  const renderMethodStatusV13 = () => {
    if (!activeMethodStreamsV13.size) {
      methodExplorerStatus.textContent =
        "Select at least one history stream to populate latent memory.";
      return;
    }

    const streamDescription = describeSelectionV13(
      activeMethodStreamsV13,
      streamOrderV13,
      streamLabelsV13,
    ).toLowerCase();
    methodExplorerStatus.textContent =
      selectedMethodStageV13 === "memory"
        ? `${streamDescription} history from timestep 0 through t is compressed into latent memory.`
        : "The encoded 0→t history, current observation, and task instruction jointly condition the VLA.";
  };

  const renderTaskChartV13 = (row) => {
    methodTaskChart.replaceChildren();

    if (!row) {
      const empty = document.createElement("div");
      empty.className = "method-task-chart-empty";
      empty.innerHTML =
        "<strong>This combination was not reported.</strong>" +
        "<span>Select a configuration represented by an exact appendix row.</span>";
      methodTaskChart.append(empty);
      return;
    }

    rmbenchTasksV13.forEach((task, index) => {
      const value = row.values[index];
      const item = document.createElement("div");
      const heading = document.createElement("div");
      const label = document.createElement("span");
      const score = document.createElement("strong");
      const track = document.createElement("span");
      const fill = document.createElement("span");

      item.className = "method-task-result";
      heading.className = "method-task-result-heading";
      label.textContent = task.short;
      label.title = task.full;
      score.textContent = `${value}%`;
      track.className = "method-task-result-track";
      fill.style.width = `${value}%`;
      track.append(fill);
      heading.append(label, score);
      item.append(heading, track);
      methodTaskChart.append(item);
    });
  };

  const renderMethodEvidenceV13 = () => {
    let row = null;
    let requestedLabel = "";

    if (selectedEvidenceModeV13 === "inputs") {
      const key = canonicalSelectionV13(
        activeMethodStreamsV13,
        streamOrderV13,
      );
      row = inputAblationsV13[key] || null;
      requestedLabel = describeSelectionV13(
        activeMethodStreamsV13,
        streamOrderV13,
        streamLabelsV13,
      );
    } else if (selectedEvidenceModeV13 === "objectives") {
      const key = canonicalSelectionV13(
        activeMethodObjectivesV13,
        objectiveOrderV13,
      );
      row = objectiveAblationsV13[key] || null;
      requestedLabel = describeSelectionV13(
        activeMethodObjectivesV13,
        objectiveOrderV13,
        objectiveLabelsV13,
      );
    } else if (selectedEvidenceModeV13 === "capacity") {
      row = selectedCapacityEvidenceV13;
      requestedLabel = row?.label || "Memory bottleneck capacity";
    } else {
      row = recipeAblationsV13[selectedRecipeV13];
      requestedLabel = row.label;
    }

    methodRecipeOptions.hidden = selectedEvidenceModeV13 !== "recipe";
    methodRecipeButtonsV13.forEach((button) => {
      const isActive = button.dataset.methodRecipe === selectedRecipeV13;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (!row) {
      methodEvidenceChip.textContent = "No matching appendix row";
      methodEvidenceLabel.textContent = requestedLabel;
      methodEvidenceScore.textContent = "—";
      methodEvidenceDelta.textContent = "Not reported";
      methodEvidenceNote.textContent =
        "The paper does not report this exact combination, so no value is inferred or interpolated.";
      renderTaskChartV13(null);
      return;
    }

    const difference = 72.7 - row.average;
    methodEvidenceChip.textContent = "Exact appendix row";
    methodEvidenceLabel.textContent = row.label;
    methodEvidenceScore.textContent = `${row.average.toFixed(1)}%`;
    if (Math.abs(difference) < 0.05) {
      methodEvidenceDelta.textContent = "Best reported configuration";
    } else {
      methodEvidenceDelta.textContent = selectedEvidenceModeV13 === "capacity"
        ? `${difference.toFixed(1)} points below B = 256`
        : `${difference.toFixed(1)} points below full IMPRINT`;
    }
    methodEvidenceNote.textContent = row.note ||
      "Per-task RMBench success (%). Every value below is copied from the corresponding appendix row.";
    renderTaskChartV13(row);
  };

  const selectEvidenceModeV13 = (mode) => {
    selectedEvidenceModeV13 = mode;
    methodEvidenceTabsV13.forEach((tab) => {
      const isActive = tab.dataset.methodEvidence === mode;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
    renderMethodEvidenceV13();
  };

  const renderMethodStreamsV13 = (showEvidence = false) => {
    methodStreamButtonsV13.forEach((button) => {
      const stream = button.dataset.methodStream;
      const isActive = activeMethodStreamsV13.has(stream);
      const state = button.querySelector(".method-stream-state");
      const flow = methodExplorer.querySelector(
        `[data-method-flow="${stream}"]`,
      );

      button.classList.toggle("is-disabled", !isActive);
      button.setAttribute("aria-pressed", String(isActive));
      if (state) {
        state.textContent = isActive ? "On" : "Off";
      }
      flow?.classList.toggle("is-disabled", !isActive);
    });

    methodMemoryTokensV13.forEach((token) => {
      token.classList.toggle(
        "is-muted",
        !activeMethodStreamsV13.has(token.dataset.memoryStream),
      );
    });
    methodPolicyMemoryTokensV13.forEach((token) => {
      token.classList.toggle(
        "is-muted",
        !activeMethodStreamsV13.has(token.dataset.policyMemoryStream),
      );
    });

    const hasStreams = activeMethodStreamsV13.size > 0;
    methodExplorer.classList.toggle("has-no-streams", !hasStreams);
    methodMemoryNodeV13?.classList.toggle("is-empty", !hasStreams);
    methodOutputTrackV13?.classList.toggle("is-disabled", !hasStreams);
    methodPolicyMemoryLabel.textContent = hasStreams
      ? streamOrderV13
          .filter((stream) => activeMethodStreamsV13.has(stream))
          .map((stream) => streamLabelsV13[stream])
          .join(" · ")
      : "No history selected";
    renderMethodStatusV13();

    if (showEvidence) {
      selectEvidenceModeV13("inputs");
    }
  };

  const renderMethodObjectivesV13 = (showEvidence = false) => {
    methodObjectiveButtonsV13.forEach((button) => {
      const objective = button.dataset.methodObjective;
      const isActive = activeMethodObjectivesV13.has(objective);
      const state = button.querySelector(".method-objective-state");

      button.classList.toggle("is-disabled", !isActive);
      button.setAttribute("aria-pressed", String(isActive));
      if (state) {
        state.textContent = isActive ? "On" : "Off";
      }
    });

    if (showEvidence) {
      selectEvidenceModeV13("objectives");
    }
  };

  const selectMethodStageV13 = (stage) => {
    selectedMethodStageV13 = stage;
    methodExplorer.dataset.stage = stage;
    methodStageTabsV13.forEach((tab) => {
      const isActive = tab.dataset.methodStage === stage;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
    methodStageContentsV13.forEach((content) => {
      content.hidden = content.dataset.methodContent !== stage;
    });
    renderMethodStatusV13();

    if (stage === "memory") {
      selectEvidenceModeV13("objectives");
    } else {
      selectedRecipeV13 = "joint";
      selectEvidenceModeV13("recipe");
    }
  };

  methodStageTabsV13.forEach((tab) => {
    tab.addEventListener("click", () => {
      selectMethodStageV13(tab.dataset.methodStage);
    });
  });
  methodStreamButtonsV13.forEach((button) => {
    button.addEventListener("click", () => {
      const stream = button.dataset.methodStream;
      if (activeMethodStreamsV13.has(stream)) {
        activeMethodStreamsV13.delete(stream);
      } else {
        activeMethodStreamsV13.add(stream);
      }
      renderMethodStreamsV13(true);
    });
  });
  methodObjectiveButtonsV13.forEach((button) => {
    button.addEventListener("click", () => {
      const objective = button.dataset.methodObjective;
      if (activeMethodObjectivesV13.has(objective)) {
        activeMethodObjectivesV13.delete(objective);
      } else {
        activeMethodObjectivesV13.add(objective);
      }
      renderMethodObjectivesV13(true);
    });
  });
  methodEvidenceTabsV13.forEach((tab) => {
    tab.addEventListener("click", () => {
      selectEvidenceModeV13(tab.dataset.methodEvidence);
    });
  });
  methodRecipeButtonsV13.forEach((button) => {
    button.addEventListener("click", () => {
      selectedRecipeV13 = button.dataset.methodRecipe;
      renderMethodEvidenceV13();
    });
  });
  methodHistorySliderV13.addEventListener("input", renderMethodTimelineV13);
  methodExplorer.addEventListener("method-capacity-change", ({ detail }) => {
    if (
      !detail ||
      !Number.isFinite(detail.average) ||
      !Array.isArray(detail.values) ||
      detail.values.length !== rmbenchTasksV13.length
    ) {
      return;
    }

    selectedCapacityEvidenceV13 = {
      label: `Memory bottleneck · B = ${detail.capacity}`,
      average: detail.average,
      values: detail.values,
      note: `Per-task RMBench success (%) for B = ${detail.capacity}, copied from the exact appendix row.`,
    };
    selectEvidenceModeV13("capacity");
  });

  selectMethodStageV13(selectedMethodStageV13);
  renderMethodStreamsV13();
  renderMethodObjectivesV13();
  renderMethodTimelineV13();
}

const methodStyleExampleV13 = document.getElementById("method-example");
const methodStyleRolloutGridV13 = document.getElementById(
  "method-style-rollout-grid",
);
const methodStyleRolloutTitleV13 = document.getElementById(
  "method-style-rollout-title",
);
const methodStyleRolloutSummaryV13 = document.getElementById(
  "method-style-rollout-summary",
);

if (
  methodStyleExampleV13 &&
  methodStyleRolloutGridV13 &&
  methodStyleRolloutTitleV13 &&
  methodStyleRolloutSummaryV13
) {
  const styleDemoFiguresV13 = [
    ...methodStyleExampleV13.querySelectorAll("[data-method-demo-style]"),
  ];
  const styleDemoVideosV13 = [
    ...methodStyleExampleV13.querySelectorAll(".method-style-demo-video"),
  ];
  const styleExecutionsV13 = {
    Orange: {
      1: { trial: 2, successful: true },
      2: { trial: 4, successful: true },
      3: { trial: 5, successful: true },
      4: { trial: 7, successful: true },
    },
    "Dark blue": {
      1: { trial: 9, successful: false },
      2: { trial: 11, successful: true },
      3: { trial: 13, successful: true },
      4: { trial: 15, successful: true },
    },
    Blue: {
      1: { trial: 17, successful: true },
      2: { trial: 19, successful: true },
      3: { trial: 21, successful: true },
      4: { trial: 23, successful: false },
    },
    Pink: {
      1: { trial: 25, successful: false },
      2: { trial: 27, successful: true },
      3: { trial: 29, successful: true },
      4: { trial: 31, successful: true },
    },
  };
  const exactOodExecutionsV18 = {
    Orange: {
      1: { trial: 2, towelColor: "Light gray", successful: true },
      2: { trial: 3, towelColor: "Light gray", successful: false },
      3: { trial: 5, towelColor: "Light gray", successful: true },
      4: { trial: 7, towelColor: "Light gray", successful: false },
    },
    "Dark blue": {
      1: { trial: 9, towelColor: "Purple", successful: true },
      2: { trial: 12, towelColor: "Purple", successful: true },
      3: { trial: 13, towelColor: "Purple", successful: false },
      4: { trial: 15, towelColor: "Purple", successful: true },
    },
    Blue: {
      1: { trial: 17, towelColor: "Charcoal", successful: true },
      2: { trial: 19, towelColor: "Charcoal", successful: false },
      3: { trial: 21, towelColor: "Charcoal", successful: false },
      4: { trial: 23, towelColor: "Charcoal", successful: true },
    },
    Pink: {
      1: { trial: 25, towelColor: "Striped", successful: false },
      2: { trial: 27, towelColor: "Striped", successful: true },
      3: { trial: 29, towelColor: "Striped", successful: false },
      4: { trial: 31, towelColor: "Striped", successful: false },
    },
  };
  const reducedMotionV13 = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let selectedColorV13 = "Orange";
  let selectedStyleV13 = 1;
  let methodStyleExampleVisibleV13 = false;

  const playVisibleStyleVideosV13 = () => {
    if (!methodStyleExampleVisibleV13 || reducedMotionV13) {
      return;
    }

    [
      ...styleDemoVideosV13,
      ...methodStyleRolloutGridV13.querySelectorAll("video"),
    ].forEach((video) => {
      activateDeferredVideo(video);
      video.play()?.catch?.(() => {});
    });
  };

  const renderStyleExecutionV13 = () => {
    const execution =
      styleExecutionsV13[selectedColorV13][selectedStyleV13];
    const trialId = String(execution.trial).padStart(2, "0");
    const exactOodExecution =
      exactOodExecutionsV18[selectedColorV13]?.[selectedStyleV13];
    const oodExecution = exactOodExecution
      ? {
          ...exactOodExecution,
          demoColor: selectedColorV13,
          exactMatch: true,
        }
      : null;
    const oodTrialId = oodExecution
      ? String(oodExecution.trial).padStart(2, "0")
      : "";
    methodStyleRolloutGridV13
      .querySelectorAll("video")
      .forEach((video) => video.pause());
    methodStyleRolloutGridV13.replaceChildren();
    methodStyleRolloutGridV13.classList.toggle(
      "has-ood-comparison",
      Boolean(oodExecution),
    );
    methodStyleRolloutTitleV13.textContent =
      `${selectedColorV13} towel · Style ${selectedStyleV13} ${oodExecution ? "executions" : "execution"}`;
    methodStyleRolloutSummaryV13.textContent =
      oodExecution
        ? "The selected IMPRINT and matched OOD executions use the same demonstration; badges mark each outcome."
        : "Only the selected IMPRINT execution is available for this demonstration.";

    const createExecutionCardV18 = ({
      titleText,
      successful,
      poster,
      source,
      ariaLabel,
      cameraLabel,
      note,
      ood = false,
    }) => {
      const card = document.createElement("article");
      const heading = document.createElement("div");
      const title = document.createElement("strong");
      const badge = document.createElement("span");
      const videoFrame = document.createElement("div");
      const video = document.createElement("video");
      const camera = document.createElement("span");
      const detail = document.createElement("p");

      card.className =
        `method-style-rollout-card ${successful ? "is-success" : "is-failure"}${ood ? " is-ood" : ""}`;
      heading.className = "method-style-rollout-card-heading";
      title.textContent = titleText;
      badge.textContent = ood
        ? successful
          ? "OOD success"
          : "OOD failure"
        : successful
          ? "Success"
          : "Failure";
      videoFrame.className = "method-style-rollout-video";
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "none";
      video.poster = poster;
      video.setAttribute("aria-label", ariaLabel);
      deferVideoSource(video, source, methodStyleExampleVisibleV13);
      camera.textContent = cameraLabel;
      detail.className = "method-style-rollout-note";
      detail.textContent = note;

      heading.append(title, badge);
      videoFrame.append(video, camera);
      card.append(heading, videoFrame, detail);
      return card;
    };

    const selectedCard = createExecutionCardV18({
      titleText:
        `In-distribution · ${selectedColorV13} towel · Style ${selectedStyleV13}`,
      successful: execution.successful,
      poster: `static/images/method-style-rollouts/trial-${trialId}.jpg`,
      source:
        `static/videos/rollouts/ours/fold-cloth/trial-${trialId}.mp4` +
        "?v=20261010-combination-execution",
      ariaLabel:
        `${selectedColorV13} towel, Style ${selectedStyleV13}, ${execution.successful ? "successful" : "failed"} IMPRINT execution, external view`,
      cameraLabel: "IMPRINT · External view",
      note:
        `Conditioned on the selected ${selectedColorV13} towel, Style ${selectedStyleV13} demonstration.`,
    });
    methodStyleRolloutGridV13.append(selectedCard);

    if (oodExecution) {
      const oodCard = createExecutionCardV18({
        titleText:
          `OOD · ${oodExecution.towelColor} towel · Style ${selectedStyleV13}`,
        successful: oodExecution.successful,
        poster:
          `static/images/method-style-rollouts-ood/trial-${oodTrialId}.jpg`,
        source:
          `static/videos/rollouts/ours-ood/fold-cloth/trial-${oodTrialId}.mp4` +
          "?v=20261011-complete-ood-comparison",
        ariaLabel:
          `${oodExecution.towelColor} OOD towel, Style ${selectedStyleV13}, ${oodExecution.successful ? "successful" : "failed"} IMPRINT OOD execution conditioned on the selected ${oodExecution.demoColor} towel demonstration, external view`,
        cameraLabel: "IMPRINT OOD · External view",
        note:
          `Conditioned on the selected ${oodExecution.demoColor} towel, Style ${selectedStyleV13} demonstration.`,
        ood: true,
      });
      methodStyleRolloutGridV13.append(oodCard);
    }

    playVisibleStyleVideosV13();
  };

  const selectStyleCombinationV13 = (color, style) => {
    selectedColorV13 = color;
    selectedStyleV13 = style;
    styleDemoFiguresV13.forEach((figure) => {
      const figureColor =
        figure.closest("[data-method-demo-color]")?.dataset.methodDemoColor;
      const isActive =
        figureColor === color &&
        Number(figure.dataset.methodDemoStyle) === style;
      figure.classList.toggle("is-selected-combination", isActive);
      figure.setAttribute("aria-pressed", String(isActive));
    });
    renderStyleExecutionV13();
  };

  styleDemoFiguresV13.forEach((figure) => {
    const color =
      figure.closest("[data-method-demo-color]")?.dataset.methodDemoColor;
    const style = Number(figure.dataset.methodDemoStyle);
    figure.setAttribute("role", "button");
    figure.setAttribute("tabindex", "0");
    figure.setAttribute(
      "aria-label",
      `Select ${color} towel, Style ${style}`,
    );
    figure.addEventListener("click", () => {
      selectStyleCombinationV13(color, style);
    });
    figure.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      selectStyleCombinationV13(color, style);
    });
  });

  if ("IntersectionObserver" in window) {
    const styleExampleObserverV13 = new IntersectionObserver(
      (entries) => {
        methodStyleExampleVisibleV13 = Boolean(entries[0]?.isIntersecting);
        if (methodStyleExampleVisibleV13) {
          playVisibleStyleVideosV13();
        } else {
          [
            ...styleDemoVideosV13,
            ...methodStyleRolloutGridV13.querySelectorAll("video"),
          ].forEach((video) => video.pause());
        }
      },
      { threshold: 0.04, rootMargin: "180px 0px" },
    );
    styleExampleObserverV13.observe(methodStyleExampleV13);
  } else {
    methodStyleExampleVisibleV13 = true;
  }

  selectStyleCombinationV13(selectedColorV13, selectedStyleV13);
}

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
    prompt: "Follow the example to fold the towel.",
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
      `static/videos/in-context/external/${colorSlug}/style-${details.style}.mp4` +
      "?v=20261010-external-only";

    foldContextTitle.textContent =
      `${details.demoColor} towel · Style ${details.style} demonstration`;
    foldContextSummary.textContent =
      details.demoColor === details.rolloutColor
        ? `Matched to the selected ${details.rolloutColor} towel rollout.`
        : `${details.demoColor} demonstration paired with the selected ${details.rolloutColor} OOD towel rollout.`;
    foldContextCaption.textContent =
      `${details.demoColor} towel · Style ${details.style} · External camera view`;
    foldContextVideo.setAttribute(
      "aria-label",
      `${details.demoColor} towel, folding style ${details.style} in-context demonstration, external camera view`,
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

  const setRobocasaVideoState = (video, state, message) => {
    const frame = video.closest(".robocasa-video-frame");
    const statusText = frame?.querySelector(".robocasa-video-status-text");
    const retryButton = frame?.querySelector(".robocasa-video-retry");

    if (!frame || !statusText || !retryButton) {
      return;
    }

    frame.dataset.videoState = state;
    video.setAttribute("aria-busy", String(state === "loading"));
    statusText.textContent = message;
    retryButton.hidden = state !== "error";
  };

  const retryRobocasaVideo = (video) => {
    if (!video.dataset.src) {
      return;
    }

    setRobocasaVideoState(video, "loading", "Loading rollout…");
    video.removeAttribute("src");
    video.load();

    window.requestAnimationFrame(() => {
      activateDeferredVideo(video);
    });
  };

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
    const retryButton = element
      .closest(".robocasa-video-frame")
      ?.querySelector(".robocasa-video-retry");

    setRobocasaVideoState(element, "loading", "Loading rollout…");

    element.addEventListener("loadstart", () => {
      setRobocasaVideoState(element, "loading", "Loading rollout…");
    });
    element.addEventListener("loadeddata", () => {
      setRobocasaVideoState(element, "ready", "");
    });
    element.addEventListener("canplay", () => {
      setRobocasaVideoState(element, "ready", "");
    });
    element.addEventListener("error", () => {
      setRobocasaVideoState(
        element,
        "error",
        "This rollout could not be loaded.",
      );
    });
    retryButton?.addEventListener("click", () => {
      retryRobocasaVideo(element);
    });

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
      setRobocasaVideoState(element, "loading", "Loading rollout…");
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

  const loadRobocasaArchive = () => {
    if (window.IMPRINT_ROBOCASA_ARCHIVE) {
      return Promise.resolve(window.IMPRINT_ROBOCASA_ARCHIVE);
    }

    return fetch("static/data/robocasa-rollouts.json").then((response) => {
      if (!response.ok) {
        throw new Error("RoboCasa archive index unavailable.");
      }
      return response.json();
    });
  };

  loadRobocasaArchive()
    .then((archive) => {
      robocasaArchive = archive;
      robocasaTaskSelect.disabled = false;
      robocasaMethodSlider.disabled = false;
      robocasaTrialSlider.disabled = false;
      renderRobocasaTrialGrid();
      renderRobocasaRollout(true);
    })
    .catch((error) => {
      console.error("Unable to initialize the RoboCasa rollout archive.", error);
      robocasaVideos.forEach(({ element }) => {
        setRobocasaVideoState(
          element,
          "error",
          "The rollout archive could not be loaded.",
        );
      });
      robocasaRolloutTitle.textContent = "RoboCasa archive unavailable";
      robocasaRolloutVariant.textContent =
        "The local video archive could not be loaded.";
      robocasaArchiveNote.textContent =
        "The result table remains available above.";
    });
}

const attentionVisualization = document.getElementById(
  "attention-visualization",
);
const attentionHeatmap = document.getElementById("attention-heatmap");
const attentionSlider = document.getElementById("attention-slider");
const attentionStep = document.getElementById("attention-step");
const attentionTabs = [...document.querySelectorAll("[data-attention-method]")];
const attentionExplorer = document.querySelector(".attention-explorer");
const attentionSelectedMethod = document.getElementById(
  "attention-selected-method",
);
const attentionSelectedScore = document.getElementById(
  "attention-selected-score",
);
const attentionSelectedDescription = document.getElementById(
  "attention-selected-description",
);
const attentionProgressLabel = document.getElementById(
  "attention-progress-label",
);
const attentionFrameCaption = document.getElementById(
  "attention-frame-caption",
);
const attentionPlayButton = document.getElementById("attention-play-button");
const attentionPlayLabel = document.getElementById("attention-play-label");
const attentionActionStep = document.getElementById("attention-action-step");
const attentionHistoryEnd = document.getElementById("attention-history-end");
const attentionData = window.IMPRINT_ATTENTION_DATA?.methods || {};
const attentionAssetVersion =
  window.IMPRINT_ATTENTION_DATA?.version || "20261011-web-native-v1";
const attentionStreamNames = ["head", "left", "right", "action", "state"];
const attentionMassNames = ["latent", "recent", "action", "state"];
const attentionStreamUi = Object.fromEntries(
  attentionStreamNames.map((stream) => [
    stream,
    {
      weight: document.getElementById(`attention-weight-${stream}`),
      step: document.getElementById(`attention-history-step-${stream}`),
      bar: document.getElementById(`attention-weight-bar-${stream}`),
      marker: document.querySelector(`[data-attention-marker="${stream}"]`),
    },
  ]),
);
const attentionMassUi = Object.fromEntries(
  attentionMassNames.map((source) => [
    source,
    {
      value: document.getElementById(`attention-mass-${source}`),
      bar: document.getElementById(`attention-mass-bar-${source}`),
    },
  ]),
);
const attentionMethods = {
  e2e: {
    count: 30,
    label: "E2E",
    description: "end-to-end action supervision",
    summary: "Memory + policy from scratch",
    score: "15%",
  },
  frozen: {
    count: 30,
    label: "Frozen",
    description: "frozen pretrained memory",
    summary: "Pretrained memory kept fixed",
    score: "35%",
  },
  ours: {
    count: 20,
    label: "Ours",
    description: "jointly adapted IMPRINT",
    summary: "Joint memory-policy adaptation",
    score: "100%",
  },
};

if (
  attentionVisualization &&
  attentionHeatmap &&
  attentionSlider &&
  attentionStep &&
  attentionTabs.length &&
  attentionExplorer
) {
  let selectedAttentionMethod = "ours";
  let attentionIsActive = false;
  let attentionPlaybackTimer = null;
  let lastAttentionSprite = "";
  let lastAttentionHeatmap = "";

  const clampAttentionValue = (value, minimum, maximum) =>
    Math.min(maximum, Math.max(minimum, value));

  const versionAttentionAsset = (source) => {
    const assetUrl = new URL(source, document.baseURI);
    assetUrl.searchParams.set("v", attentionAssetVersion);
    return assetUrl.href;
  };

  const getAttentionFrames = () =>
    attentionData[selectedAttentionMethod]?.frames || [];

  const getAttentionCount = () => {
    const frames = getAttentionFrames();
    return frames.length || attentionMethods[selectedAttentionMethod].count;
  };

  const formatAttentionHistoryStep = (stream) => {
    if (!stream) {
      return "History unavailable";
    }
    if (stream.start === stream.end) {
      return `History step ${stream.start}`;
    }
    return `History steps ${stream.start}–${stream.end}`;
  };

  const setAttentionPlaybackState = (isPlaying) => {
    if (!attentionPlayButton || !attentionPlayLabel) {
      return;
    }

    attentionPlayButton.classList.toggle("is-playing", isPlaying);
    attentionPlayButton.setAttribute("aria-pressed", String(isPlaying));
    attentionPlayLabel.textContent = isPlaying ? "Pause trace" : "Play trace";
  };

  const stopAttentionPlayback = () => {
    if (attentionPlaybackTimer !== null) {
      window.clearInterval(attentionPlaybackTimer);
      attentionPlaybackTimer = null;
    }
    setAttentionPlaybackState(false);
  };

  const renderAttentionDetail = (frameData, method) => {
    if (!frameData) {
      return;
    }

    const spriteSource = versionAttentionAsset(frameData.sprite);
    const heatmapSource = versionAttentionAsset(frameData.heatmap);
    if (spriteSource !== lastAttentionSprite) {
      attentionVisualization.style.setProperty(
        "--attention-sprite",
        `url("${spriteSource}")`,
      );
      lastAttentionSprite = spriteSource;
    }
    if (heatmapSource !== lastAttentionHeatmap) {
      attentionHeatmap.src = heatmapSource;
      lastAttentionHeatmap = heatmapSource;
    }

    attentionHeatmap.alt =
      `Attention over retained history for ${method.description} at action step ${frameData.step}`;
    if (attentionActionStep) {
      attentionActionStep.textContent = `Action step ${frameData.step}`;
    }
    if (attentionHistoryEnd) {
      attentionHistoryEnd.textContent = `Episode step ${frameData.step}`;
    }

    const validStreams = attentionStreamNames
      .map((stream) => frameData.streams?.[stream])
      .filter(Boolean);
    const peakWeight = Math.max(
      0.000001,
      ...validStreams.map((stream) => Number(stream.weight) || 0),
    );
    const historyDenominator = Math.max(1, Number(frameData.step) || 0);

    attentionStreamNames.forEach((streamName) => {
      const stream = frameData.streams?.[streamName];
      const ui = attentionStreamUi[streamName];
      if (!stream || !ui) {
        return;
      }

      const weight = Number(stream.weight) || 0;
      if (ui.weight) {
        ui.weight.textContent = `w = ${weight.toFixed(4)}`;
      }
      if (ui.step) {
        ui.step.textContent = formatAttentionHistoryStep(stream);
      }
      if (ui.bar) {
        ui.bar.style.width = `${clampAttentionValue(
          (weight / peakWeight) * 100,
          3,
          100,
        )}%`;
      }
      if (ui.marker) {
        const startPercent = clampAttentionValue(
          (Number(stream.start) / historyDenominator) * 100,
          0,
          100,
        );
        const endPercent = clampAttentionValue(
          (Number(stream.end) / historyDenominator) * 100,
          startPercent,
          100,
        );
        const isPoint = Number(stream.start) === Number(stream.end);
        const centerPercent = clampAttentionValue(
          (startPercent + endPercent) / 2,
          0.5,
          99.5,
        );
        ui.marker.classList.toggle("is-point", isPoint);
        ui.marker.style.left = isPoint
          ? `${centerPercent}%`
          : `${startPercent}%`;
        ui.marker.style.width = isPoint
          ? "8px"
          : `${Math.max(0.7, endPercent - startPercent)}%`;
        ui.marker.title =
          `${formatAttentionHistoryStep(stream)} · w = ${weight.toFixed(4)}`;
      }
    });

    attentionMassNames.forEach((source) => {
      const value = Number(frameData.mass?.[source]) || 0;
      const ui = attentionMassUi[source];
      const percentage = clampAttentionValue(value * 100, 0, 100);
      if (ui?.value) {
        ui.value.textContent = `${percentage.toFixed(1)}%`;
      }
      if (ui?.bar) {
        ui.bar.style.width = `${percentage}%`;
      }
    });
  };

  const renderAttention = () => {
    const method = attentionMethods[selectedAttentionMethod];
    const frames = getAttentionFrames();
    const count = getAttentionCount();
    const progress = Number(attentionSlider.value);
    const frameIndex = Math.round((progress / 100) * (count - 1));
    const frameNumber = frameIndex + 1;
    const frameData = frames[frameIndex];
    const actionStep = frameData?.step;

    renderAttentionDetail(frameData, method);
    attentionStep.textContent = actionStep === undefined
      ? `Frame ${frameNumber} / ${count}`
      : `Step ${actionStep} · frame ${frameNumber} / ${count}`;
    attentionSlider.style.setProperty(
      "--attention-progress",
      `${Math.round(progress)}%`,
    );
    attentionExplorer.dataset.attentionActive = selectedAttentionMethod;

    if (attentionSelectedMethod) {
      attentionSelectedMethod.textContent = method.label;
    }
    if (attentionSelectedScore) {
      attentionSelectedScore.textContent = method.score;
    }
    if (attentionSelectedDescription) {
      attentionSelectedDescription.textContent =
        `${method.summary} · task success`;
    }
    if (attentionProgressLabel) {
      attentionProgressLabel.textContent = actionStep === undefined
        ? `${Math.round(progress)}% through episode`
        : `${Math.round(progress)}% · action step ${actionStep}`;
    }
    if (attentionFrameCaption) {
      attentionFrameCaption.textContent = actionStep === undefined
        ? `${method.label} · frame ${frameNumber} of ${count}`
        : `${method.label} · action step ${actionStep} · frame ${frameNumber} of ${count}`;
    }

    if (attentionIsActive && frames.length) {
      [frameIndex - 1, frameIndex + 1]
        .filter((index) => index >= 0 && index < frames.length)
        .forEach((index) => {
          [frames[index].sprite, frames[index].heatmap].forEach((source) => {
            const preload = new Image();
            preload.src = versionAttentionAsset(source);
          });
        });
    }
  };

  attentionSlider.addEventListener("input", () => {
    stopAttentionPlayback();
    attentionIsActive = true;
    renderAttention();
  });

  attentionTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      stopAttentionPlayback();
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

  if (attentionPlayButton) {
    attentionPlayButton.addEventListener("click", () => {
      if (attentionPlaybackTimer !== null) {
        stopAttentionPlayback();
        return;
      }

      const currentProgress = Number(attentionSlider.value);
      if (currentProgress >= 100) {
        attentionSlider.value = "0";
        renderAttention();
      }

      attentionIsActive = true;
      setAttentionPlaybackState(true);
      attentionPlaybackTimer = window.setInterval(() => {
        const count = getAttentionCount();
        const progress = Number(attentionSlider.value);
        const frameIndex = Math.round((progress / 100) * (count - 1));
        const nextFrameIndex = frameIndex + 1;

        if (nextFrameIndex >= count) {
          attentionSlider.value = "100";
          renderAttention();
          stopAttentionPlayback();
          return;
        }

        attentionSlider.value = String(
          Math.round((nextFrameIndex / (count - 1)) * 100),
        );
        renderAttention();
      }, 720);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAttentionPlayback();
      }
    });
  }

  renderAttention();

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

// Interactive memory-capacity ablation within the shared Method evidence panel.
const methodCapacityControl = document.querySelector(
  ".method-memory-capacity-control",
);
const methodCapacityButtons = [
  ...document.querySelectorAll("[data-attention-capacity]"),
];
const methodCapacityTokens = [
  ...document.querySelectorAll(".method-memory-token-grid [data-capacity-token]"),
];
const methodMemoryCapacityCaption = document.getElementById(
  "method-memory-capacity-caption",
);
const methodCapacityTables = [
  ...document.querySelectorAll("#capacity-values .data-table"),
];

if (
  methodCapacityControl &&
  methodCapacityButtons.length &&
  methodCapacityTokens.length &&
  methodCapacityTables.length
) {
  const capacitySuccessTable = methodCapacityTables[0];
  const capacityColumns = new Map();
  [...capacitySuccessTable.tHead.rows[0].cells].forEach((cell, index) => {
    const match = cell.textContent.trim().match(/^(\d+)/);
    if (match) {
      capacityColumns.set(match[1], index);
    }
  });

  const capacityRows = [...capacitySuccessTable.tBodies[0].rows];
  const capacityRowsByName = new Map(
    capacityRows.map((row) => [row.cells[0].textContent.trim(), row]),
  );
  const capacityTaskRows = capacityRows.filter((row) =>
    row.cells[1].textContent.trim() === "RMBench" &&
    !row.cells[0].textContent.includes("average"),
  );
  const capacityVisualCounts = {
    1: 1,
    4: 4,
    16: 8,
    64: 12,
    256: 18,
    1024: 24,
  };

  const getCapacityValue = (rowName, capacity) => {
    const row = capacityRowsByName.get(rowName);
    const column = capacityColumns.get(capacity);
    return row && column !== undefined
      ? Number(row.cells[column].textContent.trim())
      : Number.NaN;
  };

  const renderCapacity = (capacity) => {
    const column = capacityColumns.get(capacity);
    if (column === undefined) {
      return;
    }

    methodCapacityControl.dataset.capacity = capacity;
    methodCapacityButtons.forEach((button) => {
      const isActive = button.dataset.attentionCapacity === capacity;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    const visibleTokens = capacityVisualCounts[capacity] || 1;
    methodCapacityTokens.forEach((token, index) => {
      token.classList.toggle("is-capacity-hidden", index >= visibleTokens);
    });
    if (methodMemoryCapacityCaption) {
      methodMemoryCapacityCaption.textContent =
        `Schematic token view · B = ${capacity}`;
    }

    const average = getCapacityValue("RMBench average", capacity);
    const values = capacityTaskRows.map((row) =>
      Number(row.cells[column].textContent.trim()),
    );
    if (methodExplorer && Number.isFinite(average)) {
      methodExplorer.dispatchEvent(
        new CustomEvent("method-capacity-change", {
          detail: { capacity, average, values },
        }),
      );
    }
  };

  methodCapacityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      renderCapacity(button.dataset.attentionCapacity);
    });
  });

  renderCapacity("256");
}

// Connected section navigation and scroll progress.
const sectionRail = document.getElementById("section-rail");
const sectionRailToggle = document.getElementById("section-rail-toggle");
const sectionRailScrim = document.getElementById("section-rail-scrim");
const sectionRailProgress = document.getElementById("section-rail-progress");
const sectionRailLinks = [
  ...document.querySelectorAll("[data-section-nav]"),
];

if (
  sectionRail &&
  sectionRailToggle &&
  sectionRailScrim &&
  sectionRailProgress &&
  sectionRailLinks.length
) {
  const sectionRailEntries = sectionRailLinks
    .map((link) => ({
      id: link.dataset.sectionNav,
      link,
      section: document.getElementById(link.dataset.sectionNav),
    }))
    .filter((entry) => entry.section);
  const sectionRailMobile = window.matchMedia("(max-width: 1320px)");
  let activeSectionId = "";
  let sectionRailFrame = null;

  const setSectionRailOpen = (open) => {
    const shouldOpen = Boolean(open && sectionRailMobile.matches);
    document.body.classList.toggle("section-rail-open", shouldOpen);
    sectionRailToggle.setAttribute("aria-expanded", String(shouldOpen));
    sectionRailScrim.hidden = !shouldOpen;
    if (sectionRailMobile.matches) {
      sectionRail.toggleAttribute("inert", !shouldOpen);
      sectionRail.setAttribute("aria-hidden", String(!shouldOpen));
    } else {
      sectionRail.removeAttribute("inert");
      sectionRail.removeAttribute("aria-hidden");
    }
  };

  const setActiveSection = (id) => {
    if (!id || id === activeSectionId) {
      return;
    }
    activeSectionId = id;
    const activeIndex = sectionRailEntries.findIndex((entry) => entry.id === id);

    sectionRailEntries.forEach((entry, index) => {
      const isActive = entry.id === id;
      entry.link.classList.toggle("is-active", isActive);
      entry.link.classList.toggle("is-passed", index < activeIndex);
      if (isActive) {
        entry.link.setAttribute("aria-current", "location");
      } else {
        entry.link.removeAttribute("aria-current");
      }
    });
  };

  const updateSectionRail = () => {
    sectionRailFrame = null;
    if (!sectionRailEntries.length) {
      return;
    }

    const viewportMarker = Math.min(260, window.innerHeight * 0.34);
    let activeEntry = sectionRailEntries[0];
    sectionRailEntries.forEach((entry) => {
      if (entry.section.getBoundingClientRect().top <= viewportMarker) {
        activeEntry = entry;
      }
    });

    const documentHeight = document.documentElement.scrollHeight;
    if (window.scrollY + window.innerHeight >= documentHeight - 4) {
      activeEntry = sectionRailEntries[sectionRailEntries.length - 1];
    }
    setActiveSection(activeEntry.id);

    const activeIndex = sectionRailEntries.indexOf(activeEntry);
    const nextEntry = sectionRailEntries[activeIndex + 1];
    let narrativeProgress = 100;
    if (nextEntry) {
      const currentTop = activeEntry.section.getBoundingClientRect().top;
      const nextTop = nextEntry.section.getBoundingClientRect().top;
      const sectionDistance = Math.max(1, nextTop - currentTop);
      const sectionFraction = Math.min(
        1,
        Math.max(0, (viewportMarker - currentTop) / sectionDistance),
      );
      narrativeProgress =
        ((activeIndex + sectionFraction) / (sectionRailEntries.length - 1)) * 100;
    }
    sectionRail.style.setProperty(
      "--section-rail-progress",
      `${narrativeProgress.toFixed(2)}%`,
    );
  };

  const scheduleSectionRailUpdate = () => {
    if (sectionRailFrame !== null) {
      return;
    }
    sectionRailFrame = window.requestAnimationFrame(updateSectionRail);
  };

  sectionRailToggle.addEventListener("click", () => {
    setSectionRailOpen(
      sectionRailToggle.getAttribute("aria-expanded") !== "true",
    );
  });
  sectionRailScrim.addEventListener("click", () => {
    setSectionRailOpen(false);
  });

  sectionRailLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveSection(link.dataset.sectionNav);
      setSectionRailOpen(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setSectionRailOpen(false);
    }
  });

  sectionRailMobile.addEventListener?.("change", () => {
    setSectionRailOpen(false);
    scheduleSectionRailUpdate();
  });

  window.addEventListener("scroll", scheduleSectionRailUpdate, { passive: true });
  window.addEventListener("resize", scheduleSectionRailUpdate);
  window.addEventListener("pageshow", scheduleSectionRailUpdate);
  setSectionRailOpen(false);
  updateSectionRail();
}
