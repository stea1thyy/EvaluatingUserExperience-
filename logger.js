class DataLogger {
  constructor() {
    if (DataLogger.instance) return DataLogger.instance;
    this.strokes = 0;
    this.pathLength = 0;
    this.startTime = 0;
    this.endTime = 0;
    this.condition = "";
    DataLogger.instance = this;
  }

  reset(condition) {
    this.strokes = 0;
    this.pathLength = 0;
    this.startTime = millis();
    this.endTime = 0;
    this.condition = condition;
  }

  recordStroke() { this.strokes++; }
  recordPath(len) { this.pathLength += len; }

  stop() { this.endTime = millis(); }

  print() {
    const duration = (this.endTime - this.startTime) / 1000;
    const summary = {
      condition: this.condition,
      strokes: this.strokes,
      pathLength: Math.round(this.pathLength),
      durationSeconds: parseFloat(duration.toFixed(1))
    };
    console.log("=== DATA LOG ===");
    console.log(JSON.stringify(summary));
    console.log("================");
    return summary;
  }
}
let logger;