const robot = require("robotjs");

const app = {
  settings: {
    tresholdX: 1650,
    tresholdY: 500,
    keyboardDelayInMs: 100,
    jumpIntervalInMs: 200,
  },
  state: {
    counter: 0,
    defaultTresholdColor: null,
    tresholdColorHistory: [],
    mainIntervalId: null,
    isVoiceSegmentOpen: false,
  },
};

const setKeyboardDelay = () => {
  const { keyboardDelayInMs } = app.settings;
  robot.setKeyboardDelay(keyboardDelayInMs);
};

const changeWindow = () => {
  robot.keyTap('tab', 'alt');
};

const jumpToNextSegment = () => {
  robot.keyTap('down', 'control');
  robot.keyTap('down', 'control');
};

const pasteAttributes = () => {
  robot.keyTap('g');
  robot.keyTap('enter');
};

const initAutomation = (recordDelayInMs = 1000) => {
  const { jumpIntervalInMs } = app.settings;
  setKeyboardDelay();
  changeWindow();
  setTimeout(() => {
    mainIntervalId = setInterval(() => {
      jumpToNextSegment();
      pasteAttributes();
    }, jumpIntervalInMs)
  }, recordDelayInMs);
};

initAutomation();