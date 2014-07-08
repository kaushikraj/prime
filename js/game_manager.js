function GameManager(size, InputManager, Actuator, StorageManager) {
  this.level1Intro = "Select a <strong>prime</strong>";
  this.levelNIntro = "Select {0} numbers to get a <strong>prime</strong>";
  
  this.size           = size; // Size of the grid
  this.inputManager   = new InputManager;
  this.storageManager = new StorageManager;
  this.actuator       = new Actuator(this.inputManager);

  this.startTiles     = 16;

  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));
  this.inputManager.on("alertDismiss", this.alertDismiss.bind(this));
  this.inputManager.on("select", this.select.bind(this));
  
  //default level & score
  this.level = 1;
  this.score = 0;
  this.attempts	 = 0;
  
  this.setup();
    
  this.selectedValues = [];
}

// Restart the game
GameManager.prototype.restart = function () {
  this.storageManager.clearGameState();
  this.level = 1;
  this.score = 0;
  this.attempts	 = 0;
  this.actuator.continueGame(); // Clear the game won/lost message
  this.setup();
};

// keep playing
GameManager.prototype.keepPlaying = function () {
      
  this.storageManager.clearGameState();
  this.setup();
  
};

// dismisses alert
GameManager.prototype.alertDismiss = function() {	
	this.actuator.continueGame();
}

// Return true if the game is lost, or has won and the user hasn't kept playing
GameManager.prototype.isGameTerminated = function () {
  return this.over || this.won;
};

// Set up the game
GameManager.prototype.setup = function () {
  var previousState = this.storageManager.getGameState();

  // Reload the game from a previous game if present
  if (previousState) {
    this.grid        = new Grid(previousState.grid.size,
                                previousState.grid.cells); // Reload grid
    this.score       = previousState.score;
    this.over        = previousState.over;
    this.won         = previousState.won;	
    this.keepPlaying = previousState.keepPlaying;
	this.level		 = previousState.level;
	this.attempts	 = previousState.attempts;
	this.alert		 = previousState.alert;
  } else {
    this.grid        = new Grid(this.size);
    this.over        = false;
    this.won         = false;
	this.keepPlaying = false;
	this.alert       = "";

	// generate new numbers
	this.tileValues = this.generateTileValues();
	
    // Add the initial tiles
    this.addTiles();
  }
  
  // Update the actuator
  this.actuate();
  
};

// Set up the initial tiles to start the game with
GameManager.prototype.addTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
	
	var value = this.tileValues[i];
	var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
  }
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  if (this.storageManager.getBestScore() < this.score) {
    this.storageManager.setBestScore(this.score);
  }

  // Clear the state when the game is over (game over only, not win)
  if (this.over) {
    this.storageManager.clearGameState();
  } else {
    this.storageManager.setGameState(this.serialize());
  }
  
  var intro = null;
  if (this.level === 1){
	intro = this.level1Intro;
  }else{
	intro = this.levelNIntro.format(this.level);
  }

  this.actuator.actuate(this.grid, {
    score:      this.score,
    over:       this.over,
    won:        this.won,
	level:      this.level,
	alert:      this.alert,
	next:		this.next,
	intro:		intro,
    bestScore:  this.storageManager.getBestScore(),
    terminated: this.isGameTerminated()
  });
  
};

// Represent the current game as an object
GameManager.prototype.serialize = function () {
  return {
    grid:        this.grid.serialize(),
    score:       this.score,
    over:        this.over,
    won:         this.won,
	level:		 this.level,
	alert:       this.alert,
	attempts:    this.attempts,
    keepPlaying: this.keepPlaying
  };
};

GameManager.prototype.select = function (target) {

	//reset alert
	this.alert = "";

	// toggle selected
	this.actuator.toggleSelected(target.parentNode);
	
	var value = null;
	
	if (document.all) {
	  value = target.innerText;
	}else{
	  value = target.textContent;
	}
	
	// convert to int
	value = parseInt(value);
	
	var index = this.selectedValues.indexOf(value);
	
	if ( index == -1) {
		this.selectedValues[this.selectedValues.length] = value;
			
		if (this.selectedValues.length == this.level) {
		
		   var prime = new Prime(this.level);
		   var flag = prime.isSumPrime(this.selectedValues);
		   
		   if (flag){
				this.won = true;
				this.over = false;
				
				this.score = this.score + this.level;
				
				this.level++;
				this.attempts = 0;
				
				if ( this.level == 6) {
					this.terminated = true;
				} else {
					this.alert = "Level done.";
					this.keepPlaying = true;
				}
		   }else{
		   
				this.attempts++;
				
				if (this.attempts == this.level) {
					// all attempts have been exhausted.
					this.won = false;
					this.over = true;					
				}else{
					this.won = false;
					this.keepPlaying = true;
					this.alert = "Attempts left: " + (this.level-this.attempts);
				}
		   }
	
			this.actuate();
	
		    // game over
			this.selectedValues = [];
		}
	}else{
		this.selectedValues.splice(index, 1);
	}
	
};

GameManager.prototype.generateTileValues = function() {
	var prime = new Prime(this.level);	
	var p = prime.get();
	return prime.generateSumNumbers(p, this.startTiles);
};

