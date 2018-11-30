/* SPACE NINJAS

Controls: 
  A, D - Run left and right
  
Goal:
  Dodge the Shurikens!
  Time slows down when you stop moving.
*/

/* CONSTANTS

  These are constants, aka finals, variables whose values are set once and can't be changed.
  Keeping them all here makes it easy to modify them later on. Constant names are ALL-CAPS
  with underscores (_) instead of spaces.
  
*/

// Physics variables
var xPos, yPos, xVel, yVel;            // Player position and velocity
var GRAVITY = 2.0;              // Pulls player down when game starts

var FLOOR = 434;                 // yPos of floor
var PLAYER_SIZE = 32;            // Player's dimensions (32x32 pixels)  
var BULLET_SIZE = 28;            // Bullet's dimensions (28x28 pixels) 
var PLAYER_SIZE_HALF = 16;       // Used for collision  
var BULLET_SIZE_HALF = 14;       // Used for collision 
var HALVES = 30;                 // Used for collision (the above 2 added together)

var WARP_MIN = 0.10;             // Lowest the warp can go
var WARP_MAX = 1.00;             // Highest the warp can go
var WARP_SLOW = 0.40;            // Slows down warp when player isn't moving
var WARP_SPEED = 1.10;           // Speeds up warp when player is moving
var warp;                              // The amount time is slowed down by (0.0 - 1.0)

var RUN_VEL = 20.0;             // Intial vel when running
var RUN_VEL_MAX = 50.0;         // Fastest player can run
var RUN_ACCELERATION = 1.012;   // Speeds up xVel when running
var RUN_FRICTION = 0.965;       // Slows down xVel when not running

var running;                         // If run keys are pressed
var ground;                          // If player is on the ground yet
var facingLeft;                      // Shows direction of player

// Control scheme
var RUN_LEFT_KEY = 'a';    // Press to run left
var RUN_RIGHT_KEY = 'd';   // Press to run right

// Gameplay variables
var DEBUG_MODE = false;           // Whether or not to show hitboxes and player info on screen
var BULLET_LIMIT_INIT = 7.0;       // The fastest a bullet can go
var BULLET_LOWER_INIT = 1.0;       // The slowest a bullet can go
var BULLET_LIMIT_INCREASE = 0.25;  // How much the limit increases each wave
var BULLET_ACCELERATION = 1.010;    // Accelerates bullet
var BULLET_NUM_INIT = 5;              // # of bullets to start with
var TARGET_DISTANCE = 300;            // Distance before angler bullets dive
var TARGET_DIVE = 0.5;              // Speed at which angler bullets dive

var LIVES_INIT = 1;                   // # of lives to start with
var LIVES_MAX = 3;                    // # of lives to start with
var SCORE_NEEDED_INIT = 100;          // The scoreNeeded to pass the first wave
var SCORE_NEEDED_INCREASE = 1.35;  // Increases scoreNeeded each wave

var score, bulletNum, scoreNeeded;          // Score, # of bullets, and score needed to spawn more bullets
var totalScore;                             // Score shown at end of game
var lives;                                  // # of times player can be hit
var lastFrame;                              // Timestamp of last frame
var delta;                                  // Milliseconds since last frame
var bulletSpeedLimit;                     // The fastest a bullet can go
var bulletSpeedLower;                     // The slowest a bullet can go

var bullets = [];                  // Stores all bullets
var DEGREE;       // 1 degree in radians, for rotating bullets

// Colour codes in RGB (https://processing.org/tutorials/color/)
var BACKGROUND_COLOR;
var FLOOR_COLOR;
var TEXT_COLOR;
var SCORE_COLOR;
var FADER_COLOR;
var LIVES_COLOR;
var BULLET_HITBOX_COLOR;
var fader;

// Images and Fonts used in game (https://processing.org/reference/PImage.html)
// These can't be finals, we have to give them a value in setup()
// We don't plan to change their values afterwards so we name them as finals
var NINJA_LEFT, NINJA_RIGHT, BULLET_LEFT, BULLET_RIGHT;
var MAIN_FONT;
var SCORE_Y;

function preload(){
  MAIN_FONT = loadFont('assets/pixelFont.ttf');
  NINJA_LEFT = loadImage('assets/ninja_left.png');
  NINJA_RIGHT = loadImage('assets/ninja_right.png');
  BULLET_LEFT = loadImage('assets/bullet_left.png');
  BULLET_RIGHT = loadImage('assets/bullet_right.png');
}

// Called once at the beginning of the program, sets up display and loads all files
function setup() {
  createCanvas(950, 500);      // Set screen size (Processing doesn't allow using constants for this)
  noStroke();          // No outlines for drawn shapes
  rectMode(CORNERS);   // Rectangles drawn by the corners
  imageMode(CENTER);   // Images drawn by the center

  DEGREE =TWO_PI / 360.0;
  BACKGROUND_COLOR = color(255, 255, 255);
  FLOOR_COLOR = color(100, 100, 100);
  TEXT_COLOR = color(255, 255, 255);
  SCORE_COLOR = color(230, 0, 0);
  FADER_COLOR = color(150, 0, 0);
  LIVES_COLOR = color(0, 230, 0);
  BULLET_HITBOX_COLOR = color(0, 255, 255);
  // Load fonts

  SCORE_Y = (int)((height+FLOOR)/2 + 20);
  
  // Load images

  
  gameReset();
}

function gameReset(){
  // Position player
  xPos = (width - PLAYER_SIZE) / 2; 
  yPos = (height - PLAYER_SIZE) / 2;
  xVel = 0;
  yVel = 0;
  
  running = false;
  ground = false;
  facingLeft = false;
  
  // Misc initializations
  warp = WARP_MAX;
  score = 0;
  totalScore = 0;
  lives = LIVES_INIT;
  lastFrame = 0;
  fader = color(red(FADER_COLOR), green(FADER_COLOR), blue(FADER_COLOR), 0);
  scoreNeeded = SCORE_NEEDED_INIT;
  
  // Spawn bullets
  bulletNum = BULLET_NUM_INIT;
  bulletSpeedLimit = BULLET_LIMIT_INIT;
  bulletSpeedLower = BULLET_LOWER_INIT;
  
  bullets = [];
  for (var i = 0; i < bulletNum-2; i++)
    bullets.push(new Bullet());
  bullets.push(new AnglerBullet());
  bullets.push(new AnglerBullet());
}

// Takes keyboard input, called at the start of draw()
function keyPressed(){
  // Gameplay controls while alive
  if (lives > 0){
    // Check if running, and then start running
    if (key == RUN_LEFT_KEY){
      if (!running){
        xVel = -RUN_VEL;
        facingLeft = true;
        running = true;
      }
    }
    else if (key == RUN_RIGHT_KEY){
      if (!running){
        xVel = RUN_VEL;
        facingLeft = false;
        running = true;
      }
    }
    // No running keys pressed, time to slow down
    else{
      running = false;
    }
  }
  // Takes any key, restarts game
  else {
    gameReset();
    return;
  }
}

function keyReleased(){
  // Check if stopped running
  if ((key == RUN_LEFT_KEY && facingLeft) || (key == RUN_RIGHT_KEY && !facingLeft))
    running = false;
}

// Moves objects, calculates score
function update(){
  // Update player velocity
  
  // Change xVel, make sure you stop running when deded
  if (lives > 0 && running){
    xVel *= RUN_ACCELERATION;
    // Make sure player doesn't run too fast
    if (abs(xVel) > RUN_VEL_MAX)
      xVel = (xVel > 0 ? RUN_VEL_MAX : -RUN_VEL_MAX);
  }
  else{
    xVel *= RUN_FRICTION;
    // If player slows down too much, set velocity to 0
    if (abs(xVel) < 0.005)
      xVel = 0;
  }
  
  // Apply gravity (if player isn't on ground already)
  if (!ground)
    yVel += GRAVITY * (delta/20.0);
  
  // Update warp amount
  if (warp < WARP_MAX && running){
    warp *= WARP_SPEED;
    if (warp > WARP_MAX)
      warp = WARP_MAX;
  }
  else if (warp > WARP_MIN){
    warp *= WARP_SLOW;
    if (warp < WARP_MIN)
      warp = WARP_MIN;
  }
  
  // Move player (velocity scaled down to warp)
  xPos += (xVel * warp) * (delta/10.0);
  if (xPos < 0)
    xPos = width + xPos;
  else if (xPos > width - PLAYER_SIZE_HALF)
    xPos = xPos - (width - PLAYER_SIZE_HALF);

  yPos += yVel * warp * (delta/10.0);
  
  // If touching floor
  if (!ground && yPos + PLAYER_SIZE / 2 > FLOOR){
    yPos = FLOOR - PLAYER_SIZE / 2;
    yVel = 0;
    ground = true;
  }
  
  // If the player has levelled up, add a new bullet
  if (score > scoreNeeded){
    score = 0;
    scoreNeeded = (int)(scoreNeeded * SCORE_NEEDED_INCREASE);
    totalScore += 1000;
    bulletNum++;
    
    // AnglerBullet every 3rd wave
    if (bulletNum % 3 == 0)
      bullets.push(new AnglerBullet());
    else
      bullets.push(new Bullet());
    
    // Prevents bug where player dies and gets extra life from wave bonus
    if (lives > 0 && lives < LIVES_MAX)
      lives++;
  }
  
  if (lives <= 0)
    lives = 0;
}

function draw(){
  delta = millis() - lastFrame;
  
  // Update fader if dead
  if (lives == 0 && alpha(fader) < 255)       
    fader = color(red(fader), green(fader), blue(fader), alpha(fader) + (delta/1000.0));
  // Fade to red when game over
  if (lives == 0){
    fill(fader);
    rect(0, 0, width, height);
    
    // Draw total score and prompt
    textFont(MAIN_FONT,100);
    fill(TEXT_COLOR);
    textAlign(CENTER, CENTER);
    text("SCORE:" + (totalScore), 0, 0, width, height);
    textFont(MAIN_FONT,25);
    text("Press any key to continue...", 0, 130, width, height);
  }
  else{
  // Update objects
  update();
  
  for (let x = 0 ;x < bullets.length; x++)
    bullets[x].update();
  
  // Draw background (and erase everything)
  fill(BACKGROUND_COLOR);
  rect(0, 0, width, FLOOR);
  
  // Draw bullets
  for (let x = 0 ;x < bullets.length; x++)
    bullets[x].display();
  
  // Draw player
  image((facingLeft ? NINJA_LEFT : NINJA_RIGHT), xPos, yPos);
  
  // Draw floor
  fill(FLOOR_COLOR);
  rect(0, FLOOR, width, height);
  
  // Draw wave
  textAlign(RIGHT, BASELINE);
  textFont(MAIN_FONT,50);
  fill(SCORE_COLOR);
  text("" + (bulletNum-BULLET_NUM_INIT+1), width-10, SCORE_Y);
  
  // Draw lives
  textAlign(LEFT, BASELINE);

  textFont(MAIN_FONT,50);
  fill(LIVES_COLOR);
  text("LIVES:" + (lives), 10, SCORE_Y);
  
  // If in debug mode, draw hitboxes and info
  if (DEBUG_MODE){
    stroke(BULLET_HITBOX_COLOR);
    // Disable fill, to only draw outline of hitbox
    noFill();
    for (let x = 0 ;x < bullets.length; x++)
      bullets[x].displayHitbox();
    noStroke();
    
    textFont(MAIN_FONT,25);
    fill(FLOOR_COLOR);
    textAlign(LEFT, BASELINE);
    text("POS(x,y): (" + floor(xPos) + "," + floor(yPos) + ")", 10, 30);
    text("VEL(x,y): (" + floor(xVel) + "," + floor(yVel) + ")", 10, 60);
    text("RUNNING: " + (running ? "true": "false"), 10, 90); 
    text("FACING: " + (facingLeft ? "left": "right"), 10, 120); 
  }
  

  
  lastFrame = millis();
}
}

// Represents a Bullet
class Bullet {
  constructor (){
    this.img = (random(1) < 0.5 ? BULLET_LEFT : BULLET_RIGHT);
    this.x = 0;
    this.y =0;
    this.xVel = 0;
    this.yVel =0;
    this.angle = 0;
    this.angleVel = 0;
    this.mode = 0;
    this.respawn();
  }
  
  respawn(){
    // Choose a mode for the bullet
    this.mode = (int)(random(6));
    
    // Depending on the direction, set the bullet's variables
    switch (this.mode){
      // Regular
      case 0: case 4: case 5:
        this.x = random(width);
        this.y = 0;
        this.xVel = 0;
        this.yVel = random(bulletSpeedLimit, bulletSpeedLower);
        this.angleVel = DEGREE * random(-10, 10);
        this.img = (random(1) < 0.5 ? BULLET_LEFT : BULLET_RIGHT);
        break;
      // Left, angles down
      case 1:
        this.x = width;
        this.y = random(0, bulletNum * 15);
        this.xVel = random(-bulletSpeedLimit, -bulletSpeedLower);
        this.yVel = random(bulletSpeedLower, bulletSpeedLimit);
        this.angleVel = DEGREE * random(-10, 1);
        this.img = BULLET_LEFT;
        break;
      // Right, angles down
      case 2:
        this.x = -BULLET_SIZE;
        this.y = random(0, bulletNum * 15);
        this.xVel = random(bulletSpeedLower, bulletSpeedLimit);
        this.yVel = random(bulletSpeedLower, bulletSpeedLimit);
        this.angleVel = DEGREE * random(1, 10);
        this.img = BULLET_RIGHT;
        break;
      // Down, angles to the side
      case 3:
        this.x = random(width);
        this.y = 0;
        this.xVel = random(-bulletSpeedLimit, bulletSpeedLimit);
        this.yVel = random(bulletSpeedLimit, bulletSpeedLower);
        this.angleVel = DEGREE * random(-10, 10);
        this.img = (random(1) < 0.5 ? BULLET_LEFT : BULLET_RIGHT);
        break;
    }
  }
  
  update(){
    // Move and rotate bullet
    this.xVel *= BULLET_ACCELERATION;
    this.yVel *= BULLET_ACCELERATION;
    this.angleVel *= BULLET_ACCELERATION;
    
    this.x += this.xVel * warp * (delta/10.0);
    this.y += this.yVel * warp * (delta/10.0);
    this.angle += this.angleVel * warp * (delta/10.0);
    
    // If offscreen, respawn and increase points
    if (this.x < -BULLET_SIZE || this.x > width || this.y  >= FLOOR){
      if (lives > 0){
        score += 10;
        totalScore += 10;
        this.respawn();
      }
    }
    
    // If collided with player, reduce lives and respawn
    if (this.collidePlayer()){
      lives--;
      this.respawn();
    }
  }
  
  // Checks if hitbox overlaps with player
  collidePlayer(){
    return (abs(this.x - xPos) < HALVES && abs(this.y - yPos) < HALVES);
  }
  
  // Draw the bullet
  display(){
    translate(this.x, this.y);
    rotate(this.angle);
    image(this.img, 0, 0);
    rotate(-this.angle);
    translate(-this.x, -this.y);
  }
  
  // Draw the hitbox
  displayHitbox(){
    rect(this.x - BULLET_SIZE_HALF, this.y - BULLET_SIZE_HALF, this.x + BULLET_SIZE_HALF, this.y + BULLET_SIZE_HALF);
  }
}

// Variant of bullet that angles downwards when nearby player
class AnglerBullet extends Bullet {
  constructor (){
    super();
    this.respawn();
  }
  
  respawn(){
    this.mode = (int)(random(2));
    // Depending on the direction, set the bullet's variables
    switch (this.mode){
      // Left, angles down
      case 0:
        this.x = width;
        this.y = random(0, bulletNum * 25);
        this.xVel = random(-bulletSpeedLimit, -bulletSpeedLower);
        this.yVel = 0;
        this.angleVel = DEGREE * random(-10, 1);
        this.img = BULLET_LEFT;
        break;
      // Right, angles down
      case 1:
        this.x = -BULLET_SIZE;
        this.y = random(0, bulletNum * 25);
        this.xVel = random(bulletSpeedLower, bulletSpeedLimit);
        this.yVel = 0;
        this.angleVel = DEGREE * random(1, 10);
        this.img = BULLET_RIGHT;
        break;
    }
  }
  
  update(){
    if (abs(xPos - this.x) < TARGET_DISTANCE)
      this.yVel += TARGET_DIVE;
    super.update();
  }
}