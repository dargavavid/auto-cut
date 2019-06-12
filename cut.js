const robot = require("robotjs");

const app = {
  settings: {
    tresholdX: 1680,
    tresholdY: 500,
    keyboardDelayInMs: 30,
    recordIntervalInMs: 30,
    tresholdColorLookbackNumber: 20,
    falsePositiveTresholdNumber: 3,
    playbackSpeed: 2,
    segmentStartCutMultiplier: 5,
    segmentEndCutMultiplier: 12,
  },
  state: {
    counter: 0,
    defaultTresholdColor: null,
    tresholdColorHistory: [],
    mainIntervalId: null,
    isVoiceSegmentOpen: false,
  },
};

// // Move cursor to treshold for testing.
// robot.moveMouse(app.settings.tresholdX, app.settings.tresholdY);
// return 0;

const setKeyboardDelay = () => {
  const { keyboardDelayInMs } = app.settings;
  robot.setKeyboardDelay(keyboardDelayInMs);
};

const changeWindow = () => {
  robot.keyTap('tab', 'alt');
};

const startPlayback = () => {
  const { playbackSpeed } = app.settings;
  robot.typeString('d'.repeat(playbackSpeed));
  // robot.keyTap('space');
};

const getColorAtTreshold = () => {
  const { tresholdX, tresholdY } = app.settings;

  // Get 10x10 area at treshold
  const img = robot.screen.capture(tresholdX, tresholdY, 10, 10);

  //Get pixel color at 1, 1 of captured treshold area.
  const color = img.colorAt(1, 1);

  return color;
};

const checkCutState = () => {
  const { tresholdColorLookbackNumber, falsePositiveTresholdNumber } = app.settings;
  const { tresholdColorHistory, defaultTresholdColor, isVoiceSegmentOpen } = app.state;
  const latestTresholdColor = tresholdColorHistory[tresholdColorHistory.length - 1];
  const tresholdColorLookback = tresholdColorHistory.slice(tresholdColorHistory.length - tresholdColorLookbackNumber);
  const tresholdColorLookbackOutliers = tresholdColorLookback.filter(color => color !== defaultTresholdColor).length;
  let shouldCut = false;
  let isSegmentStart = false;

  if (!isVoiceSegmentOpen) {
    if (latestTresholdColor !== defaultTresholdColor) {
      const qualifiesAsFalsePositive = tresholdColorLookbackOutliers <= falsePositiveTresholdNumber;
      if (!qualifiesAsFalsePositive) {
        app.state.isVoiceSegmentOpen = true;
        shouldCut = true;
        isSegmentStart = true;
      }
    }
  } else {
    if (tresholdColorLookback.length === tresholdColorLookbackNumber && tresholdColorLookbackOutliers === 0) {
      shouldCut = true;
      // Close segment
      app.state.isVoiceSegmentOpen = false;
      // Truncate treshold color history
      app.state.tresholdColorHistory = [];
    }
  }
  // console.log('latestTresholdColor', latestTresholdColor);
  // console.log('shouldCut', shouldCut);
  return {shouldCut, isSegmentStart};
};

const stepBack = (multiplier = 2) => {
  // const { playbackSpeed } = app.settings;
  robot.typeString('qq'.repeat(multiplier));
}

const cutSegmentStart = () => {
  const { segmentStartCutMultiplier } = app.settings;
  stepBack(segmentStartCutMultiplier);
  robot.keyTap('f');
  startPlayback();
};

const cutSegmentEnd = () => {
  const { segmentEndCutMultiplier } = app.settings;
  stepBack(segmentEndCutMultiplier);
  robot.keyTap('f');
  startPlayback();
};

const initAutomation = (recordDelayInMs = 1000) => {
  const { recordIntervalInMs } = app.settings;
  let cutStatus;
  setKeyboardDelay();
  changeWindow();
  // Get default color of treshold 
  setTimeout(() => {
    app.state.defaultTresholdColor = getColorAtTreshold();
    // console.log(app.state.defaultTresholdColor)
  }, recordDelayInMs / 2);

  // Start recording current color of treshold at specified intervals
  setTimeout(() => {
    startPlayback();
    mainIntervalId = setInterval(() => {
      const currentColorAtTreshold = getColorAtTreshold();
      app.state.tresholdColorHistory.push(currentColorAtTreshold)
      // console.log(app.state.tresholdColorHistory);
      cutStatus = checkCutState();
      if (cutStatus.shouldCut) {
        if (cutStatus.isSegmentStart) {
          cutSegmentStart();
        } else {
          cutSegmentEnd();
        }
      }
    }, recordIntervalInMs)
  }, recordDelayInMs);
};

initAutomation();