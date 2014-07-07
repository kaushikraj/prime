function MouseInputManager() {
  this.events = {};

  if (window.navigator.msPointerEnabled) {
    //Internet Explorer 10 style
    this.eventTouchstart    = "MSPointerDown";
    this.eventTouchmove     = "MSPointerMove";
    this.eventTouchend      = "MSPointerUp";
  } else {
    this.eventTouchstart    = "touchstart";
    this.eventTouchmove     = "touchmove";
    this.eventTouchend      = "touchend";
  }

  this.listen();
}

MouseInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

MouseInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

MouseInputManager.prototype.listen = function () {

  var self = this;

  // Respond to button presses
  this.bindButtonPress(".retry-button", this.restart);
  this.bindButtonPress(".restart-button", this.restart);
  this.bindButtonPress(".alert-button", this.alertDismiss); 
};

MouseInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};

MouseInputManager.prototype.alertDismiss = function (event) {
  event.preventDefault();
  this.emit("alertDismiss");
  this.emit("keepPlaying");
};

MouseInputManager.prototype.bindCellPress = function (cell){
    var self = this;
    cell.addEventListener("click", self.select.bind(self));
}

MouseInputManager.prototype.select = function(event){
  var target = event.target;  
  this.emit("select", target);
}

MouseInputManager.prototype.bindButtonPress = function (selector, fn) {
  var button = document.querySelector(selector);
  button.addEventListener("click", fn.bind(this));
  button.addEventListener(this.eventTouchend, fn.bind(this));
};

