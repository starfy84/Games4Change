var AVOCADOS = [];
var AVOCADOS_F = [];
var MOUSE_CONTROLS = true;
var tempPart = 0,
  tempAvo = 0;
var fadeVel = 0;
var tempAvo = 0;
var spawnNext = 0;
var spawnTicks = 0;

var timeString = "";
var resultCycle = 0;
var resultFade = 0;
var resultRoll = 0;

// Avocado images
var bodyImg = [0,0,0,0,0];
var happyImg = 0;//[0,0,0,0,0];
var blehImg = 0;//[0,0,0,0,0];
var sadImg = 0;//[0,0,0,0,0];
var madImg = 0;//[0,0,0,0,0];
var wowImg = 0;//[0,0,0,0,0];

var burstImg = [];
var hamImg1, hamImg2;

var colBlack, colRed, colWhite, colGreen1;
var timeCol = 0,
  hpGreen, hpYellow, hpOrange, hpRed;

var fade = 0,
  fadeStart = false,
  fadeIn = true;

var regFont, boldFont, numFont;
var bottomText, bottomFade;
//"Avocados Whacked", "Power Whacks", "Combo", "Longest Combo", "Highest Multiplier", "Total Score"
var time = 0,
  timeRounded = 0,
  score = 0,
  multHigh = 0,
  whackCount = 0,
  powerCount = 0,
  comboCurrent = 0,
  comboLongest = 0,
  multiplier = 1.0;
var comboTicks = 0,
  comboCool = 3;
var COOLDOWN_TIME = 25;

var STATE = 's'; // s - setup, g - gameplay, r - result

function preload() {
  regFont = loadFont('assets/TheSkinny.otf');
  boldFont = loadFont('assets/TheSkinny-bold.otf');
  numFont = loadFont('assets/JennaSue.ttf');

  hamImg1 = loadImage('assets/Hammer Happy.png');
  hamImg2 = loadImage('assets/Hammer Pop3.png');
  
  bodyImg[0] = loadImage('assets/Avocado BG.png');
  bodyImg[1] = loadImage('assets/Avocado G.png');
  bodyImg[2] = loadImage('assets/Avocado LG.png');
  bodyImg[3] = loadImage('assets/Avocado RG.png');
  bodyImg[4] = loadImage('assets/Avocado YG.png');
  
  happyImg = loadImage('assets/Happy 1.png');
  
  /*
  happyImg[0] = loadImage('assets/Happy 1.png');
  happyImg[1] = loadImage('assets/Happy 2.png');
  happyImg[2] = loadImage('assets/Happy 3.png');
  happyImg[3] = loadImage('assets/Happy 4.png');
  happyImg[4] = loadImage('assets/Happy 5.png');
  
  blehImg[0] = loadImage('assets/Bleh 1.png');
  blehImg[1] = loadImage('assets/Bleh 2.png');
  blehImg[2] = loadImage('assets/Bleh 3.png');
  blehImg[3] = loadImage('assets/Bleh 4.png');
  blehImg[4] = loadImage('assets/Bleh 5.png');
  
  sadImg[0] = loadImage('assets/Sad 1.png');
  sadImg[1] = loadImage('assets/Sad 2.png');
  sadImg[2] = loadImage('assets/Sad 3.png');
  sadImg[3] = loadImage('assets/Sad 4.png');
  sadImg[4] = loadImage('assets/Sad 5.png');
  
  madImg[0] = loadImage('assets/Mad 1.png');
  madImg[1] = loadImage('assets/Mad 2.png');
  madImg[2] = loadImage('assets/Mad 3.png');
  madImg[3] = loadImage('assets/Mad 4.png');
  madImg[4] = loadImage('assets/Mad 5.png');*/
}

var tr = 0.0, ti = 0.0, wi = 0.0;
function Avocado() {
  this.x = 0.0;
  this.y = 0.0;
  this.wh = 0.0;
  this.hh = 0.0;
  this.scale = 0.0;
  this.img = 0.0;
  this.faceImg = 0.0;
  this.w = 0.0;
  this.h = 0.0;
  this.fw = 0.0;
  this.fh = 0.0;

  this.lifetime = 0.0;
  this.dead = false;
  this.remove = false;
  this.alphaa = 255;

  this.create = function(X, Y, LIFE, SCALE) {
    this.x = X;
    this.y = Y;
    this.fx = this.x + 10*SCALE;
    this.fy = this.y - 40*SCALE;
    this.scale = SCALE; 
    this.img = random(bodyImg);
    this.faceImg = happyImg;
    
    this.w = this.img.width * this.scale;
    this.h = this.img.height * this.scale;
    this.wh = this.w/2;
    this.hh = this.h/2;
    this.fw = this.faceImg.width * this.scale;
    this.fh = this.faceImg.height * this.scale;
    this.lifetime = LIFE;

    AVOCADOS.push(this);
    this.index = AVOCADOS.length - 1;
  };
  this.drawAvo = function() {
    imageMode(CENTER);
    if (this.dead){
      tint(255,255,255,this.alphaa);
      image(this.img, this.x, this.y, this.w, this.h);
      image(this.faceImg, this.fx, this.fy, this.fw, this.fh);
      noTint();
    }
    else{
      image(this.img, this.x, this.y, this.w, this.h);
      image(this.faceImg, this.fx, this.fy, this.fw, this.fh);
    }
  };
  this.setIndex = function(i) {
    this.index = i;
  }
  this.fade = function(smacked) {
    AVOCADOS[this.index] = AVOCADOS[AVOCADOS.length - 1];
    AVOCADOS[this.index].setIndex(this.index);
    AVOCADOS.pop(AVOCADOS.length - 1);
    AVOCADOS_F.push(this);
    this.index = AVOCADOS_F.length - 1;
    this.lifetime = (smacked ? 2 : 2);
    this.alphaa = 255;
  };
  this.smack = function(f) {
    if (f){
      AVOCADOS[this.index] = AVOCADOS[AVOCADOS.length - 1];
      AVOCADOS[this.index].setIndex(this.index);
      AVOCADOS.pop(AVOCADOS.length - 1);
    }
    else
      this.kill();
  };
  this.kill = function() {
    AVOCADOS_F[this.index] = AVOCADOS_F[AVOCADOS_F.length - 1];
    AVOCADOS_F[this.index].setIndex(this.index);
    AVOCADOS_F.pop(AVOCADOS_F.length - 1);
  };
  this.update = function() {
    this.lifetime -= 1/frameRate(-1);
    if (this.dead){
      if (this.lifetime <= 0)
        this.remove = true;
      this.alphaa-=15;
    }
    else{
      // Decay life
      if (this.lifetime <= 0)
        this.dead = true;
    }
  };
}

var WIDTH_H, HEIGHT_H, MAX_X, MIN_Y, MAX_Y;
var shakeX = 0, shakeY = 0, shakeDecay = 0.9;

function shake(sax, say) {
  shakeX += sax;
  shakeY += say;
}

var hammer = {
  x: 0.0, wh : 0, hh : 0,
  xVel: 0,
  y: 0.0,
  yVel: 0,
  shx: 0.0,
  shy: 0.0,
  charge: 0.0, // time player holds down before release
  cooldown: 0.0, // time until able to use again
  cooling: false, // if cooling down
  charging: false, // if mouse is being held down
  fullyCharged: false,
  img: 0,
  
  collide : function(avo) {
    return (abs(avo.x - this.x) < (avo.wh + this.wh) && abs(avo.y - this.y) < (avo.hh + this.hh));
  },

  respawn: function() {
    if (!gameStart) {
      this.x = width / 2;
      this.y = height * 0.3;
    }
    this.charge = 0;
    this.cooldown = 0;
    this.charging = false;
    this.cooling = false;
    this.img = hamImg1;
    this.wh = 20;
    this.hh = 20;
  },
  drawHammer: function() {
    if (this.fullyCharged) {
      shx = random(-2, 2);
      shy = random(-2, 2);
      translate(shx, shy);
      tint(255, 0, 0);
    }

    imageMode(CENTER);
    image(this.img, this.x, this.y, 50, 50);
    if (this.fullyCharged) {
      translate(-shx, -shy);
      noTint();
    }
  },
  update: function() {
    if ((STATE === 's' || tutCycle > 2 || STATE === 'r') && !this.cooling) { // Flies to mouse
      this.x += (mouseX - this.x) * 0.2;
      this.y += (mouseY - this.y) * 0.2;
    }

    // Charge and Cool the hammer
    if (this.charging) {
      this.charge += 1 / frameRate(-1);
      if (this.charge >= 1) {
        this.charge = 1;
        this.fullyCharged = true;
      }
    } else if (this.cooling) {
      this.cooldown -= 1 / frameRate(-1);
      if (this.cooldown <= 0) {
        this.cooldown = 0;
        this.cooling = false;
        this.img = hamImg1;
      }
    }
    
    if (this.charge >= 1) {
      this.charge = 1;
      this.fullyCharged = true;
    } else {
      this.fullyCharged = false;
    }
  }
}

function mousePressed() {
  if (STATE === 'g') {
    if (gameStart || tutCycle > 2)
      if (!hammer.cooling)
        hammer.charging = true;
    tutFade = 1;
  } else if (STATE === 's') {
    fadeStart = true;
    fadeVel = 1.5;
  } else if (STATE === 'r') {
    if (resultCycle < 5 && resultRoll < score)
      resultFade = 255;
    else{
      fadeStart = true;
      fadeVel = 1.02;
    }
  }
  return false;
}

function mouseReleased() {
  if (STATE === 'g') {
    if (hammer.charging) {
      hammer.charging = false;
      hammer.cooling = true;
      hammer.cooldown = (hammer.fullyCharged ? 0.5 : 0.15);
      hammer.img = hamImg2;
      hammer.charge = 0;
      shakeX = 0;
      shakeY = 0;
      shake(2 + hammer.charge, 2 + hammer.charge);
      
      // Check for collision with avocados
      for (ti = 0; ti < AVOCADOS.length; ti++){
        if (hammer.collide(AVOCADOS[ti])){
          shake(1,1);
          whackCount++;
          AVOCADOS[ti].smack(true);
          comboCurrent++;
          if (comboCurrent > comboLongest)
            comboLongest = comboCurrent;
          comboTicks = comboCool;
          if (hammer.fullyCharged){
            multiplier = round((multiplier + 0.1) * 10) / 10;
            powerCount++;
            if (multiplier > multHigh)
              multHigh = multiplier;
          }
        }
      }
    }
  }
  return false;
}

var tutFade = 0,tutIn = true,tutCycle = 0,gameStart = false;
var flashTime = 50,flashTick = 0,flashTog = true;flashCol = 0;
var ti; var tiFadeIn = 255; var tmFadeIn = 255;

var tutorialText = [
  "WELCOME TO\nGWACK A MOLE",
  "THIS IS HAMMY",
  "MOVE HIM WITH YOUR MOUSE",
  "CLICK TO WHACK\nTHE AVOCADOS",
  "EACH WHACK ADDS\nTO YOUR SCORE",
  "HOLD AND RELEASE TO\nUNLEASH POWER WHACKS",
  "CHAINING WHACKS BOOSTS\nYOUR SCORE MULTIPLIER",
  "YOU HAVE ONE MINUTE",
  "GOOD LUCK"
];

var resultText = [
  "Avocados Whacked (x100) - ", "Power Whacks (x250) - ", "Combo (x100) - ", "Longest Combo (x75) - ", "Highest Multiplier - ", "Total Score - "
];
var resultValues = [];

function restartGame() {
  // Set up hammer and tutorial
  AVOCADOS = [];
  AVOCADOS_F = [];
  tutFade = 0;
  tutIn = true;
  tutCycle = 0;
  gameStart = false;
  STATE = 'g';
  hammer.respawn();

  time = 0;
  timeRounded = 60;
  timeCol = colBlack;
  score = 0;
  multiplier = 1.0;
  tiFadeIn = 255;
  tmFadeIn = 255;
  comboTicks = 0.0;
}

//"Avocados Whacked", "Power Whacks", "Combo", "Longest Combo", "Highest Multiplier", "Total Score"
function startGame() {
  gameStart = true;
  hammer.respawn();
  AVOCADOS = [];
  AVOCADOS_F = [];
  time = 0;
  timeRounded = 60;
  timeCol = colBlack;
  score = 0;
  multiplier = 1.0;

  multHigh = 1.0;
  whackCount = 0;
  powerCount = 0;
  comboCurrent = 0;
  comboLongest = 0;

  comboTicks = 0.0;
  spawnNext = 0.0;
  spawnTicks = 0.0;
}

function setup() {
  // Graphics and files
  createCanvas(600, 350);

  noStroke();
  rectMode(RADIUS);

  PARTICLES = [];

  // Constants
  WIDTH_H = width / 2;
  HEIGHT_H = height / 2;

  //make colors (maybe not needed)
  colBlack = color(0);
  colRed = color(255, 0, 0);
  colWhite = color(255);
  colGreen1 = color(189, 237, 177);

  hpOrange = color(255, 165, 0);
  hpRed = color(225, 10, 10);
  
  /*
  STATE = 'g';
  restartGame();*/
  
  STATE = 's';
  //resultValues = [100,200,300,400,12,500];
  fadeIn = true;
  fadeVel = 1;
  fade = 255;
  hammer.respawn();
}

var tb = 0;
/*
var time = 0,
  timeRounded = 0,
  score = 0,
  multHigh = 0,
  whackCount = 0,
  powerCount = 0,
  multiplier = 1.0;*/

function draw() {
  if (STATE === 's') {
    noStroke();
    background(colGreen1);

    sx = random(-shakeX, shakeX);
    sy = random(-shakeY, shakeY);
    translate(sx, sy);

    textAlign(CENTER, CENTER);
    fill(colWhite);
    textFont(boldFont);
    textSize(100);
    text("GWACK A MOLE", WIDTH_H, HEIGHT_H - 25);
    textFont(regFont);
    textSize(25);
    fill(colWhite);
    text("click to begin", WIDTH_H, HEIGHT_H + 80);

    hammer.update();
    hammer.drawHammer();

    translate(-sx, -sy);

    shakeX *= 0.90;
    shakeY *= 0.90;
    if (shakeX < 0.00001) shakeX = 0.0;
    if (shakeY < 0.00001) shakeY = 0.0;

    if (fadeStart) {
      fade += fadeVel;
      fadeVel *= 1.06;
      background(255, 255, 255, fade);
      if (fade >= 255) {
        restartGame();
        STATE = 'g';
        fadeStart = false;
        fadeIn = true;
        fade = 255;
        fadeVel = 1;
      }
    } else if (fadeIn) {
      fade -= fadeVel;
      fadeVel *= 1.06;
      background(255, 255, 255, fade);
      if (fade <= 0) {
        fadeIn = false;
        fadeVel = 1;
      }
    }
  } 
  else if (STATE === 'g') {
    background(colWhite);

    sx = random(-shakeX, shakeX);
    sy = random(-shakeY, shakeY);
    translate(sx, sy);

    if (!gameStart) {
      //tutFade = 0; tutIn = true; tutCycle = 0; gameStart = false;
      textAlign(CENTER, CENTER);
      textFont(regFont);
      textSize(60);
      fill(0, 0, 0, tutFade);
      text(tutorialText[tutCycle], WIDTH_H, HEIGHT_H);

      if (tutIn) {
        tutFade += 15;
        if (tutFade >= 255)
          tutIn = false;
      } else {
        tutFade -= 1;
        if (tutFade <= 0) {
          tutIn = true;
          tutFade = 0
          tutCycle++;
          if (tutCycle === 9)
            startGame();
        }
      }
    } 
    else{
      spawnTicks += 1/frameRate(-1);
      if (spawnTicks > spawnNext){
        tempAvo = new Avocado();
        tempAvo.create(
          random(width*0.35-timeRounded*2,width*0.65+timeRounded*2),
          random(height*0.3,height*0.7), 
          random(0.5,3-(timeRounded/60.0)), random(0.2,0.35));
        spawnTicks = 0;
        spawnNext = random(0.5,1.5-(timeRounded/60.0));
      }
    }
    
    // Draw live avocados
    for (ti = 0; ti < AVOCADOS.length; ti++){
      AVOCADOS[ti].update();
      AVOCADOS[ti].drawAvo();
    }
    wi = 0;
    while (wi < AVOCADOS.length){
      if (AVOCADOS[wi].dead)
        AVOCADOS[wi].fade(false);
      else
        wi++;
    }
    
    // Draw fading avocados
    for (ti = 0; ti < AVOCADOS_F.length; ti++){
      AVOCADOS_F[ti].update();
      AVOCADOS_F[ti].drawAvo();
    }
    wi = 0;
    while (wi < AVOCADOS_F.length){
      if (AVOCADOS_F[wi].remove)
        AVOCADOS_F[wi].kill();
      else
        wi++;
    }

    if (tutCycle > 0) {
      hammer.drawHammer();
      if (tutCycle > 1) {
        hammer.update();
        if (tutCycle > 3) {
          // show score
          if (tutCycle > 5) {
            // show multiplier
            textAlign(CENTER, BOTTOM);
            textFont(numFont);
            textSize(40+timeRounded*0.3);
            fill(0,0,0,(gameStart ? 60+65*comboTicks : 255));
            text("x" + multiplier, WIDTH_H, height * 0.9);
            
            if (tmFadeIn > 0) {
              tb = numFont.textBounds("x" + multiplier, WIDTH_H, height * 0.1, 40);
              fill(255, 255, 255, tmFadeIn);
              rectMode(CORNER)
              rect(tb.x, tb.y, tb.w, tb.h);
              tmFadeIn -= 5;
            }
            
            if (tutCycle > 6) {
              // Update time
              if (gameStart) {
                time += 1 / frameRate(-1);
                if (time >= 1) {
                  timeRounded--;
                  time = 0;

                  if (timeRounded === 60) {
                    timeString = "1:00";
                    timeCol = colBlack;
                  } else if (timeRounded > 9) {
                    timeString = "0:" + timeRounded;
                    timeCol = colBlack;
                  } else if (timeRounded > 0) {
                    timeString = "0:0" + timeRounded;
                    timeCol = (timeRounded > 5 ? colBlack : hpRed);
                  } else if (timeRounded === 0) {
                    fadeStart = true;
                    fadeVel = 1.0;
                    resultCycle = 0;
                    resultFade = 0;
                    resultRoll = 0;
                  }
                }
              } else {
                timeString = "1:00";
                timeCol = colBlack;
              }

              textAlign(CENTER, TOP);
              textFont(numFont);
              textSize(40+timeRounded*0.3);
              fill(timeCol);
              text("" + timeString, WIDTH_H, height * 0.1);

              // Fade in
              if (tiFadeIn > 0) {
                tb = numFont.textBounds(timeString, WIDTH_H, height * 0.1, 40);
                fill(255, 255, 255, tiFadeIn);
                rectMode(CORNER)
                rect(tb.x, tb.y, tb.w, tb.h);
                tiFadeIn -= 5;
              }
            }
          }
        }
      }
    }
    
    if (comboTicks > 0){
      comboTicks -= 1/frameRate();
      if (comboTicks < 0){
        comboTicks = 0;
        comboCurrent = 0;
        multiplier = 1.0;
      }
    }
  
    // Reverse and reduce screen shake
    translate(-sx, -sy);
    shakeX *= 0.95;
    shakeY *= 0.95;
    if (shakeX < 0.00001) shakeX = 0.0;
    if (shakeY < 0.00001) shakeY = 0.0;

    // Fade to results
    if (fadeStart) {
      fade += fadeVel;
      fadeVel *= 1.02;
      background(255, 255, 255, fade);
      
      textAlign(CENTER, CENTER);
      textFont(boldFont);
      textSize(40+fade*0.25);
      fill(255,0,0,255-fade);
      text("YOUR TIME IS UP", WIDTH_H, HEIGHT_H);
      
      if (fade >= 255) {
        STATE = 'r';
        fadeStart = false;
        fadeIn = true;
        fadeVel = 1.2;
        fade = 0;

        score = whackCount * 100 + powerCount * 250;
        score += comboCurrent * 100 + comboLongest * 75;
        score *= round(multHigh);
        resultValues = [whackCount, powerCount, comboCurrent, comboLongest, multHigh*10, score];
      }
    }
    else if (fadeIn) {
      fade -= fadeVel;
      fadeVel *= 1.02;
      background(255, 255, 255, fade);
      if (fade <= 0) {
        fadeIn = false;
        fadeVel = 1;
      }
    }
  }
  else if (STATE === 'r') {
    noStroke();
    background(255);

    sx = random(-shakeX, shakeX);
    sy = random(-shakeY, shakeY);
    translate(sx, sy);

    textAlign(CENTER, TOP);
    fill(colGreen1);
    rectMode(CORNER);
    rect(0, height*0.1, width, 100);
    
    resultFade+=1;
    if (resultRoll < resultValues[resultCycle]){
      resultRoll+= 5;
      if (resultRoll > resultValues[resultCycle]){
        resultRoll = resultValues[resultCycle];
      }
    }
    if (resultFade === 255 || resultFade > 255){
      if (resultCycle !== 5){
        resultCycle++;
        resultRoll = 0;
        resultFade = 0;
        shake(2,2);
      }
    }
    
    fill(colWhite);
    textFont(boldFont);
    textSize(75);
    text("PERFORMANCE RECAP", WIDTH_H, height*0.1+5);
    textAlign(CENTER, CENTER);
    textFont(numFont);
    textSize(30);
    for (ti = 0; ti <= resultCycle; ti++){
      if (ti < resultCycle){
        fill(colBlack);
              if(ti < 3){
        text(
          resultText[ti]+(
            ti === 4 ? resultValues[ti] / 10 : resultValues[ti]),
          width*0.3, HEIGHT_H + 45 * ti);
      } 
      else{
        text(
          resultText[ti]+(
            ti === 4 ? resultValues[ti] / 10 : resultValues[ti]),
          width*0.7, HEIGHT_H + 45 * (ti-3));
      }
      }
      else{
        fill(255,0,0,resultFade);
              if(ti < 3){
        text(
          resultText[ti]+(
            ti === 4 ? resultRoll / 10 : resultRoll),
          width*0.3, HEIGHT_H + 45 * ti);
      } 
      else{
        text(
          resultText[ti]+(
            ti === 4 ? resultRoll / 10 : resultRoll),
          width*0.7, HEIGHT_H + 45 * (ti-3));
      }
      }
    }

    hammer.update();
    hammer.drawHammer();

    translate(-sx, -sy);

    shakeX *= 0.90;
    shakeY *= 0.90;
    if (shakeX < 0.00001) shakeX = 0.0;
    if (shakeY < 0.00001) shakeY = 0.0;

    if (fadeStart) {
      fade += fadeVel;
      fadeVel *= 1.06;
      background(255, 255, 255, fade);
      if (fade >= 255) {
        STATE = 's';
        fadeStart = false;
        fadeIn = true;
        fade = 255;
        fadeVel = 1;
      }
    } else if (fadeIn) {
      fade -= fadeVel;
      fadeVel *= 1.06;
      background(255, 255, 255, fade);
      if (fade <= 0) {
        fadeIn = false;
        fadeVel = 1;
      }
    }
  } 
}