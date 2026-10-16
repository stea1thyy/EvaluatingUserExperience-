// ============================================================
// Colour vs Monochrome Drawing Study
// P5.js prototype for Week 4 demo
// ============================================================

let mode = "mono";          // mono or colour
let timer = 150;            // 2.5 minutes
let armed = false;
let started = false;
let finished = false;
let wasPressed = false;
let lastFrameTick = 0;
let brushColour = "#ff0000";

const CONDITION_LABEL = document.getElementById("condition-label");
const TIMER_LABEL = document.getElementById("timer-label");
const STATUS = document.getElementById("status");
const START_BTN = document.getElementById("start-btn");
const END_BTN = document.getElementById("end-btn");
const TOGGLE_BTN = document.getElementById("toggle-btn");
const RESET_BTN = document.getElementById("reset-btn");
const COLOUR_PICKER = document.getElementById("colour-picker");
const BRUSH_COLOUR_INPUT = document.getElementById("brush-colour");
const SWATCHES = document.querySelectorAll(".swatch");

function setup() {
  const canvas = createCanvas(900, 600);
  canvas.parent("canvas-holder");
  background(255);
  textFont("monospace");
  logger = new DataLogger();
  logger.reset(mode);

  START_BTN.addEventListener("click", armStudy);
  END_BTN.addEventListener("click", endEarly);
  TOGGLE_BTN.addEventListener("click", toggleCondition);
  RESET_BTN.addEventListener("click", resetStudy);

  BRUSH_COLOUR_INPUT.addEventListener("input", (e) => {
    brushColour = e.target.value;
    updateColourPreview();
    updateSelectedSwatch();
  });

  SWATCHES.forEach((swatch) => {
    swatch.addEventListener("click", () => {
      brushColour = swatch.dataset.colour;
      BRUSH_COLOUR_INPUT.value = brushColour;
      updateColourPreview();
      updateSelectedSwatch();
    });
  });

  updateConditionUI();
  updateColourPreview();
  updateSelectedSwatch();
}

function draw() {
  handleTimer();

  if (finished) {
    drawTimeUp();
    return;
  }

  drawHUD();
  handleDrawing();
}

// ---------- Timer ----------
function handleTimer() {
  if (!started || finished) return;

  const now = millis();
  if (now - lastFrameTick >= 1000) {
    lastFrameTick = now;
    timer--;
    updateTimerLabel();

    if (timer <= 0) {
      timer = 0;
      finishStudy();
    }
  }
}

function armStudy() {
  if (armed || started || finished) return;
  armed = true;
  STATUS.textContent = "Ready — start drawing to begin the timer.";
  START_BTN.disabled = true;
  END_BTN.disabled = false;
}

function beginTimer() {
  started = true;
  lastFrameTick = millis();
  logger.reset(mode);
  STATUS.textContent = "Recording...";
}

function endEarly() {
  if (!armed || finished) return;
  finishStudy();
}

function finishStudy() {
  finished = true;
  started = false;
  armed = false;
  if (logger.startTime !== 0) {
    logger.stop();
    logger.print();
  }
  STATUS.textContent = "Time's up. Data logged to console.";
  START_BTN.disabled = true;
  END_BTN.disabled = true;
}

function resetStudy() {
  background(255);
  timer = 150;
  armed = false;
  started = false;
  finished = false;
  wasPressed = false;
  lastFrameTick = 0;
  logger.reset(mode);
  STATUS.textContent = "";
  START_BTN.disabled = false;
  END_BTN.disabled = true;
  updateTimerLabel();
  loop();
}

function toggleCondition() {
  mode = mode === "mono" ? "colour" : "mono";
  updateConditionUI();
  resetStudy();
}

function updateConditionUI() {
  CONDITION_LABEL.textContent = "Condition: " + mode.toUpperCase();
  COLOUR_PICKER.style.display = mode === "colour" ? "block" : "none";
  updateColourPreview();
  updateSelectedSwatch();
}

function updateTimerLabel() {
  TIMER_LABEL.textContent = "Time: " + timer + "s";
}

function updateColourPreview() {
  const preview = document.getElementById("current-colour-preview");
  if (preview) preview.style.background = brushColour;
}

function updateSelectedSwatch() {
  SWATCHES.forEach((swatch) => {
    if (swatch.dataset.colour.toLowerCase() === brushColour.toLowerCase()) {
      swatch.classList.add("selected");
    } else {
      swatch.classList.remove("selected");
    }
  });
}

// ---------- HUD ----------
function drawHUD() {
  noStroke();
  fill(255);
  rect(0, 0, 260, 70);

  fill(0);
  textSize(20);
  textAlign(LEFT);
  text("Time: " + timer + "s", 15, 30);
  text("Condition: " + mode.toUpperCase(), 15, 58);
}

// ---------- Drawing ----------
function handleDrawing() {
  if (!mouseIsPressed || finished) {
    wasPressed = false;
    return;
  }

  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    wasPressed = false;
    return;
  }

  if (armed && !started) {
    beginTimer();
  }

  if (!started) return;

  const speed = dist(mouseX, mouseY, pmouseX, pmouseY);
  const weight = map(speed, 0, 50, 1, 12, true);

  if (mode === "mono") {
    stroke(0);
  } else {
    stroke(brushColour);
  }

  strokeWeight(weight);
  strokeCap(ROUND);
  line(pmouseX, pmouseY, mouseX, mouseY);

  logger.recordPath(speed);
  if (!wasPressed) {
    logger.recordStroke();
    wasPressed = true;
  }
}

// ---------- End screen ----------
function drawTimeUp() {
  noStroke();
  fill(200, 0, 0);
  textSize(48);
  textAlign(CENTER, CENTER);
  text("TIME'S UP", width / 2, height / 2);
  noLoop();
}

// ---------- Keyboard shortcuts ----------
function keyPressed() {
  if (key === "c" || key === "C") toggleCondition();
  if (key === "r" || key === "R") resetStudy();
}