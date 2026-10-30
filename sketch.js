// --- STATE VARIABLES ---
let mode = "mono";          
let timer = 300;            // 5 minutes
let armed = false;
let started = false;
let finished = false;
let wasPressed = false;
let lastFrameTick = 0;
let brushColour = "#ff0000";

// Variable to store the randomly selected image number (1-5)
let randomImageNumber = 1; 

// --- DOM ---
const STATUS = document.getElementById("status");
const START_BTN = document.getElementById("start-btn");
const TOGGLE_BTN = document.getElementById("toggle-btn");
const RESET_BTN = document.getElementById("reset-btn");
const COLOUR_PICKER = document.getElementById("colour-picker");
const BRUSH_COLOUR_INPUT = document.getElementById("brush-colour");
const SWATCHES = document.querySelectorAll(".swatch");
const IMAGE_CONTAINER = document.getElementById("image-container");
const IMAGE_COUNTER = document.getElementById("image-counter");

function setup() {
  const canvas = createCanvas(850, 650);
  canvas.parent("canvas-holder");
  background(255);
  
  logger = new DataLogger();
  logger.reset(mode);

  START_BTN.addEventListener("click", armStudy);
  TOGGLE_BTN.addEventListener("click", toggleCondition);
  RESET_BTN.addEventListener("click", resetStudy);

  BRUSH_COLOUR_INPUT.addEventListener("input", (e) => {
    brushColour = e.target.value;
    updateSelectedSwatch();
  });

  SWATCHES.forEach((swatch) => {
    swatch.addEventListener("click", () => {
      brushColour = swatch.dataset.colour;
      BRUSH_COLOUR_INPUT.value = brushColour;
      updateSelectedSwatch();
    });
  });

  updateConditionUI();
}

function draw() {
  handleTimer();
  if (finished) return; 
  handleDrawing();
}

function handleTimer() {
  if (!started || finished) return;
  const now = millis();
  
  if (now - lastFrameTick >= 1000) {
    lastFrameTick = now;
    timer--;
    if (timer <= 0) {
      timer = 0;
      finishStudy();
    }
  }
}

function armStudy() {
  if (armed || started || finished) return;
  armed = true;
  STATUS.textContent = "Recording... Waiting for first stroke.";
  START_BTN.disabled = true;
}

function beginTimer() {
  started = true;
  lastFrameTick = millis();
  logger.reset(mode);
  STATUS.textContent = "Timer running...";

  // Pick a random number between 1 and 5
  randomImageNumber = Math.floor(Math.random() * 5) + 1; 
  
  // Display the image
  showImage(randomImageNumber);
  
  // Log which image they got
  console.log("Participant assigned to sketch image: " + randomImageNumber);
}

function finishStudy() {
  finished = true;
  started = false;
  armed = false;
  
  if (logger.startTime !== 0) {
    logger.stop();
    logger.print(); 
  }
  
  let filename = 'DoodleStudy_' + mode + '_Img' + randomImageNumber + '_' + Date.now();
  saveCanvas(filename, 'png');
  
  STATUS.textContent = "Time's up. Data logged and image downloaded.";
  START_BTN.disabled = true;
}

function resetStudy() {
  background(255);
  timer = 300; 
  armed = false;
  started = false;
  finished = false;
  wasPressed = false;
  lastFrameTick = 0;
  logger.reset(mode);
  STATUS.textContent = "";
  START_BTN.disabled = false;
  IMAGE_CONTAINER.innerHTML = `<p style="color:#aaa;">Waiting to start...</p>`;
  IMAGE_COUNTER.textContent = "A random image will appear here.";
  loop();
}

function toggleCondition() {
  mode = mode === "mono" ? "colour" : "mono";
  updateConditionUI();
  resetStudy();
}

function updateConditionUI() {
  COLOUR_PICKER.style.display = mode === "colour" ? "flex" : "none";
  updateSelectedSwatch();
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

// --- IMAGE DISPLAY ---
function showImage(imageNumber) {
  IMAGE_CONTAINER.innerHTML = `<img src="images/image${imageNumber}.jpg" alt="Sketch Reference">`;
  IMAGE_COUNTER.textContent = "Sketch the image on the right.";
}

// --- DRAWING ---
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

function keyPressed() {
  if (key === "c" || key === "C") toggleCondition();
  if (key === "r" || key === "R") resetStudy();
}