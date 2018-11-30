var PARTICLES = [];
var tempPart = 0;
var sx, sy, tw, ti;
var c1 = 0;
var c2 = 0;
var c3 = 0;
var hpGreen, hpYellow, hpOrange, hpRed;
var paddleH = 35;
var healRate = 0.01;

var slowLast = 250;
var slowEffect = 0.5;

var fade = 0, fadeStart = false;
var bottomText = "PRESS SPACE TO SKIP", bottomFade = 255;

var p1Hero = ' ', p2Hero = ' ';
var hG = 0, hR = 0, hT = 0, hS = 0, hY = 0;
var colList = [hG, hR, hT, hS, hY];

var titleFont, charPickFont, msgFont;
var ninjas = [0, 0, 0, 0, 0];

var charCycle = 0;
var charNames = [
  "GOTTLUM", "REID", "THRAWN", "SLOAN", "YVEN"
  ];
var charKey = ['g', 'r', 't', 's', 'y'];
var charText = [
  "THE BRUTE\nSTYLE - DEFENSE\nHAS MORE HEALTH\nBUT LESS SPEED",
  "THE DUELIST\nSTYLE - FRENZIED\nFAST...\nTOO FAST",
  "THE VENGEFUL\nSTYLE - CLUTCH\nHITS HARDER\nWHEN HURT",
  "THE SAGE\nSTYLE - PATIENT\nHEALS WHEN\nSTANDING STILL",
  "THE DRUID\nSTYLE - OUTLAST\nSLOWS ENEMY\nAFTER HITS"
];
var tLong = [
  "THE BRUTE", "THE DUELIST", "THE VENGEFUL", "THE SAGE", "THE DRUID"
  ];

var STATE = 's'; // s - setup, m - menu, g - gameplay, r - result

function preload(){
  titleFont = loadFont('assets/full Pack 2025.ttf');
  msgFont = loadFont('assets/Inversionz Unboxed.ttf');
  charPickFont = msgFont;
  //charPickFont = loadFont('assets/Inversionz.ttf');
  //print("worked");
  // g r t s y
  ninjas[0] = loadImage('assets/ninjaG.png');
  ninjas[1] = loadImage('assets/ninjaR.png');
  ninjas[2] = loadImage('assets/ninjaT.png');
  ninjas[3] = loadImage('assets/ninjaS.png');
  ninjas[4] = loadImage('assets/ninjaY.png');
}

function Particle (){
  this.x = 0.0;
  this.y = 0.0;
  this.xVel = 0.0;
  this.yVel = 0.0;
  //this.angle = 0.0;
  //this.angleVel = 0.0;
  this.friction = 0.9;
  this.col = 0;
  this.lifetime = 0.0;
  this.dead = false;
  this.alphaScale = 0;
  this.rScale = 0;
  this.alphaa = 0;
  this.rad = 0.0;
  this.index = 0;
  
  this.create = function(X, Y, xVelMin, xVelMax, yVelMin, yVelMax, lifet, rada, colo){
    this.x = X;
    this.y = Y;
    this.xVel = random(xVelMin, xVelMax);
    this.yVel = random(yVelMin, yVelMax);
    //this.angle = random(360);
    //this.angleVel = random(-30,30);
    this.friction = 0.99;
    this.dead = false;
    this.rad = rada;
    this.rScale = (rada * 0.9) / lifet;
    this.col = colo;
    this.lifetime = lifet;
    this.alphaScale = 255.0 / lifet;
    this.alphaa = 255.0 + this.alphaScale;
    //print("making particle");
    PARTICLES.push(this);
    this.index = PARTICLES.length - 1;
  };
  this.drawParticle = function(){
    rectMode(RADIUS);
    fill(this.col);
    rect(this.x,this.y,this.rad,this.rad);
  };
  this.setIndex = function(i){
    this.index = i;
  }
  this.kill = function(){
    PARTICLES[this.index] = PARTICLES[PARTICLES.length - 1];
    PARTICLES[this.index].setIndex(this.index);
    PARTICLES.pop(PARTICLES.length - 1);
  };
  this.update = function(){
    // Decay life
    this.lifetime-=1;
    if (this.lifetime <= 0)
      this.dead = true;
    else {
      with (this){
      // Move
      x += xVel + random(-2,2); 
      y += yVel + random(-2,2);
      //angle += angleVel;
      // Apply friction
      xVel *= friction; yVel *= friction; //angleVel *= friction;
      rad -= rScale;
      alphaa -= alphaScale;
      col.setAlpha(alphaa);
      }
    }
  };
}

var WIDTH_H, HEIGHT_H, MAX_X, MIN_Y, MAX_Y, MARGIN = 40;
var START_X_VEL = 7, START_Y_VEL = 4, BLAST_X_VEL = 11; 
var mini = 0.2; var maxi = 1.00;
var ballCol;
var shakeX = 0, shakeY = 0, shakeDecay = 0.9;

function collidePaddle(b, p){
  return (abs(b.x - p.x) < (b.rad+p.w) && abs(b.y - p.y) < (b.rad+p.h));
}

function shake(sax, say){
  shakeX += sax;
  shakeY += say;
  //print("shakeX:"+sax);print("shakeY:"+say);
}

var p1 = {
  slowTick : 0,
  moving : false,
  h : paddleH,
  w : 10,
  hpMax : 0.0,
  hp    : 0.0,
  atk   : 0.0,
  spd   : 0.0,
  friction  : 0.0,
  x     : 10,
  y     : 0.0,
  yVel  : 0.0,
  col : 200,
  hpCol : 0,
  hpRoll : 0,
  hero : ' ',  // g-Gottlum, r-Reid, t-Thrawn, s-Sloan, y-Yven
  
  create : function(h, sx){
    this.hero = h;
    this.x = sx;
    this.hpCol = hpGreen;
    if (this.hero === 'g'){
        this.hpMax = 150;
        this.hp = this.hpMax;
        this.atk = 20;
        this.spd = 4.75;
        this.friction = 0;
        this.col = hG;
    } else if (this.hero === 'r'){
        this.hpMax = 100;
        this.hp = this.hpMax;
        this.atk = 20;
        this.spd = 9;
        this.friction = 0.9;
        this.col = hR;
    } else if (this.hero === 't'){
        this.hpMax = 100;
        this.hp = this.hpMax;
        this.atk = 20;
        this.spd = 7;
        this.friction = 0.0;
        this.col = hT;
    } else if (this.hero === 's'){
        this.hpMax = 100;
        this.hp = this.hpMax;
        this.atk = 20;
        this.spd = 7;
        this.friction = 0.0;
        this.col = hS;
   } else if (this.hero === 'y'){
        this.hpMax = 100;
        this.hp = this.hpMax;
        this.atk = 20;
        this.spd = 7;
        this.friction = 0.0;
        this.col = hY;
    }
    this.moving = false;
    this.hpRoll = this.hpMax;
  },
  
  respawn : function(){
    this.y = HEIGHT_H;
    this.yVel = 0.0;
    this.moving = false;
    this.slowTick = 0;
  },
  
  takeDamage : function(dam){
    this.hp -= dam;
    if (this.hero === 't')
      this.atk += 2;
    if (p2.hero === 'y')
      this.slowTick = 100;
    if (this.hp <= 0){
      this.hp = 0;
      fadeStart = true;
    }
    else if (this.hp < this.hpMax / 6.0)
      this.hpCol = hpRed;
    else if (this.hp < this.hpMax / 3.0)
      this.hpCol = hpOrange;
    else if (this.hp < this.hpMax / 2.0)
      this.hpCol = hpYellow;
    else
      this.hpCol = hpGreen;
  },
  
  drawHealth : function(){
    if (this.hpRoll > this.hp)
      this.hpRoll-=1;
    stroke(0);
    rectMode(CORNER);
    fill(ballCol);
    rect(10, 10, this.hpMax, 20);
    fill((this.slowTick > 0 ? hpSlow : this.hpCol));
    rect(10, 10, this.hpRoll, 20);
    noStroke();
    
    textAlign(LEFT,CENTER);
    textFont(msgFont);
    textSize(25);
    fill(255);
    text(Math.floor(this.hpRoll), 15, 20);
  },
  
  drawPaddle : function(){
    rectMode(RADIUS);
    fill(this.col);
    rect(this.x, this.y, this.w, this.h);
  },
  
  update : function(){
    if (this.moving){
      if (this.slowTick > 0){
        this.slowTick--;
        this.y += this.yVel * slowEffect;
      }
      else
        this.y += this.yVel;  
    }
    else if (this.hero === 'r'){
      this.y += this.yVel;
      this.yVel *= this.friction;
    }
    else if (this.hero === 's'){
      if (this.hp < this.hpMax){
        this.hp += healRate;
        this.hpRoll = this.hp;
      }
    }
  
    // Limit to edges
    if (this.y <= MARGIN+paddleH){
      //print ("top");
      this.yVel = 0;
      this.y = MARGIN+paddleH+1;
      shake(1.5,2.8);
    }
    else if (this.y >= height-MARGIN-paddleH){
      //print ("bottom");
      this.yVel = 0;
      this.y = height-MARGIN-paddleH-1;
      shake(1.5,2.8);
    }
  }
}

var p2 = {
  moving : false,
  h : paddleH,
  w : 10,
  hpMax : 0.0,
  hp    : 0.0,
  atk   : 0.0,
  spd   : 0.0,
  friction  : 0.0,
  x     : 0,
  y     : 0.0,
  yVel  : 0.0,
  col : 200,
  hpCol : 0,
  hpRoll : 0,
  hero : ' ',  // g-Gottlum, r-Reid, t-Thrawn, s-Sloan, y-Yven
  
  create : function(h, sx){
    this.hero = h;
    this.x = sx;
    this.hpCol = hpGreen;
    if (this.hero === 'g'){
        this.hpMax = 150;
        this.hp = this.hpMax;
        this.atk = 20;
        this.spd = 4.75;
        this.friction = 0;
        this.col = hG;
    } else if (this.hero === 'r'){
        this.hpMax = 100;
        this.hp = this.hpMax;
        this.atk = 20;
        this.spd = 9;
        this.friction = 0.9;
        this.col = hR;
    } else if (this.hero === 't'){
        this.hpMax = 100;
        this.hp = this.hpMax;
        this.atk = 20;
        this.spd = 7;
        this.friction = 0.0;
        this.col = hT;
    } else if (this.hero === 's'){
        this.hpMax = 100;
        this.hp = this.hpMax;
        this.atk = 20;
        this.spd = 7;
        this.friction = 0.0;
        this.col = hS;
   } else if (this.hero === 'y'){
        this.hpMax = 100;
        this.hp = this.hpMax;
        this.atk = 20;
        this.spd = 7;
        this.friction = 0.0;
        this.col = hY;
    }
    this.moving = false;
    this.hpRoll = this.hpMax;
  },
  
  takeDamage : function(dam){
    this.hp -= dam;
    if (this.hero === 't')
      this.atk += 2;
    if (p1.hero === 'y')
      this.slowTick = 100;
    if (this.hp <= 0){
      this.hp = 0;
      fadeStart = true;
    }
    else if (this.hp < this.hpMax / 6.0)
      this.hpCol = hpRed;
    else if (this.hp < this.hpMax / 3.0)
      this.hpCol = hpOrange;
    else if (this.hp < this.hpMax / 2.0)
      this.hpCol = hpYellow;
    else
      this.hpCol = hpGreen;
  },
  
  drawHealth : function(){
    if (this.hpRoll > this.hp)
      this.hpRoll-= 1;
    
    stroke(0);
    rectMode(CORNER);
    fill((this.slowTick > 0 ? hpSlow : this.hpCol));
    rect(width-10-this.hpMax, 10, this.hpMax, 20);
    fill(ballCol);
    rect(width-10-this.hpMax, 10, this.hpMax-this.hpRoll, 20);
    noStroke();
    
    textAlign(RIGHT,CENTER);
    textFont(msgFont);
    textSize(25);
    fill(255);
    text(Math.floor(this.hpRoll), width-10, 20);
  },
  
  respawn : function(){
    this.y = HEIGHT_H;
    this.yVel = 0.0;
    this.moving = false;
    maxi = 1.00;
    this.slowTick = 0;
  },
  
  drawPaddle : function(){
    rectMode(RADIUS);
    fill(this.col);
    //print("color:"+this.col);
    rect(this.x, this.y, this.w, this.h);
  },
  
  update : function(){
    if (this.moving){
      if (this.slowTick > 0){
        this.slowTick--;
        this.y += this.yVel * slowEffect;
      }
      else
        this.y += this.yVel;  
    }
    else if (this.hero === 'r'){
      this.y += this.yVel;
      this.yVel *= this.friction;
    }
    else if (this.hero === 's'){
      if (this.hp < this.hpMax){
        this.hp += healRate;
        this.hpRoll = this.hp;
      }
    }
  
    // Limit to edges
    if (this.y <= MARGIN + paddleH){
      //print ("top");
      this.yVel = 0;
      this.y = MARGIN + paddleH+1;
      shake(1.5,2.8);
    }
    else if (this.y >= height-MARGIN-paddleH){
      //print ("bottom");
      this.yVel = 0;
      this.y = height-MARGIN-paddleH-1;
      shake(1.5,2.8);
    }
  }
}

var temp;
var ball = {
  rad   : 10,
  x     : 0.0,
  y     : 0.0,
  xVel  : 0.0, 
  yVel  : 0.0,
  
  respawn : function(goRight){
    this.x = WIDTH_H;
    this.y = HEIGHT_H;
    mini = 0.2;
    maxi = 1.00;
    
    this.yVel = 0;
    /*
    if (random(1) < 0.5)
      this.yVel = random(START_Y_VEL * mini, START_Y_VEL);
    else
      this.yVel = -random(START_Y_VEL * mini, START_Y_VEL);*/
    
    if (goRight)
      this.xVel = random(START_X_VEL * mini, START_X_VEL * 0.8);
    else
      this.xVel = -random(START_X_VEL * mini, START_X_VEL * 0.8);
  },
  
  drawBall : function(){
    rectMode(RADIUS);
    fill(ballCol);
    rect(this.x, this.y, this.rad, this.rad);
  },
  
  update : function(){
    this.x += this.xVel * maxi;
    this.y += this.yVel * maxi;
    maxi += 0.0012;
    
    // Create trail
    for (ti = 8; ti < abs(this.xVel); ti++){
    tempPart = new Particle();
      tempPart.create(this.x, this.y, 
                    -this.xVel * 0.25, -this.xVel, 
                    -this.yVel * 0.25, -this.yVel, random(1,10), random(1,4), 
        color(random(150),0,0));
      tempPart = new Particle();
      tempPart.create(this.x, this.y, 
                    -this.xVel * 0.25, -this.xVel, 
                    -this.yVel * 0.25, -this.yVel, random(1,7), random(1,2.5), 
        color(random(red(p1.col)),random(green(p1.col)),random(blue(p1.col))));
          tempPart = new Particle();
      tempPart.create(this.x, this.y, 
                    -this.xVel * 0.25, -this.xVel, 
                    -this.yVel * 0.25, -this.yVel, random(1,7), random(1,2.5),
        color(random(red(p2.col)),random(green(p2.col)),random(blue(p2.col))));
    }
  
    // Collision with paddles
    if (collidePaddle(this, p1)){
      temp = (p1.y - this.y);
      this.x = p1.x + (p1.w + this.rad);
      
      shake(2,1.2);
      
      if (temp < 20 || (this.hero === 'r')){  // Precision shots go faster
        this.xVel = random(START_X_VEL * 1.2, BLAST_X_VEL);
        shake(5,3);
      }
      else
        this.xVel = random(START_X_VEL * mini, START_X_VEL);
        
      this.yVel = temp/7.0;  // Temp determines angle of ball
      mini += 0.1;
      maxi = 1.00;
      
      for (ti = 0; ti < abs(this.xVel) * 2; ti++){
      tempPart = new Particle();
      tempPart.create(p1.x, p1.y, 
                    -this.xVel, -1, 
                    -this.xVel*0.5, this.xVel*0.5, random(5,10), random(5,8), 
        color(random(red(p1.col)),random(green(p1.col)),random(blue(p1.col))));
      }
    }
    else if (collidePaddle(this, p2)){
      temp = (p2.y - this.y);
      this.x = p2.x - (p2.w + this.rad) - 1;
      
      shake(2,1.2);
      
      if (temp < 20 || (this.hero === 'r')){  // Precision shots go faster
        this.xVel = -random(START_X_VEL * 1.2, BLAST_X_VEL);
        shake(5,3);
      }
      else
        this.xVel = -random(START_X_VEL * mini, START_X_VEL);
        
      this.yVel = temp/7.0;
      mini += 0.1;
      maxi = 1.00;
      
      for (ti = 0; ti < abs(this.xVel) * 2; ti++){
      tempPart = new Particle();
      tempPart.create(p2.x, p2.y, 
                    1, -this.xVel, 
                    this.xVel*0.5, -this.xVel*0.5, random(5,10), random(5,8), 
        color(random(red(p2.col)),random(green(p2.col)),random(blue(p2.col))));
      }
    }
    // Collision with walls
    else if (this.x <= this.rad){// || this.x >= MAX_X){
      p1.takeDamage(p2.atk);
      shake(8,8);
      bottomText = random(scoreText) +"P2 SCORED";
      bottomFade = 255;
      for (ti = 0; ti < 75; ti++){
      tempPart = new Particle();
      tempPart.create(
        WIDTH_H, HEIGHT_H, 
        -5, 5, -5, 5, 
        random(5,50), random(1,4), 
        color(random(red(p2.col)),random(green(p2.col)),random(blue(p2.col))))
        ;
        /*
        tempPart.create(
        this.x, HEIGHT_H, 
        1, 5, -5, 5, 
        random(5,20), random(1,4), 
        color(random(255),0,0))
        ;*/
      }
      this.respawn((p2.hp < p1.hp));
    }
    else if (this.x >= MAX_X){
      p2.takeDamage(p1.atk);
      shake(8,8);
      bottomText = random(scoreText) +"P1 SCORED";
      bottomFade = 255;
      for (ti = 0; ti < 75; ti++){
      tempPart = new Particle();
      tempPart.create(
        WIDTH_H, HEIGHT_H, 
        -5, 5, -5, 5, 
        random(5,50), random(1,4), 
        color(random(red(p1.col)),random(green(p1.col)),random(blue(p1.col)))
        );
        /*
      tempPart.create(
        this.x, HEIGHT_H, 
        -1, -5, -5, 5, 
        random(5,20), random(1,4), 
        color(random(255),0,0))
        ;*/
      }
      this.respawn((p2.hp < p1.hp));
    }
    else if (this.y <= MIN_Y){
      
      this.yVel = -this.yVel;
      for (ti = 0; ti < abs(this.xVel) * 2; ti++){
      tempPart = new Particle();
      tempPart.create(this.x, MIN_Y, 
                    -8, 8, 
                    0.1, 3, random(5,20), random(2,5), color(abs(this.xVel)*10,0,0));
      }
      this.y += this.yVel;
      
      shake(1,2);
    }
    else if (this.y >= MAX_Y){
      
      this.yVel = -this.yVel;
      for (ti = 0; ti < abs(this.xVel) * 2; ti++){
      tempPart = new Particle();
      tempPart.create(this.x, MAX_Y, 
                    -8, 8, 
                    -0.1, -3, random(5,20), random(2,5), color(random(abs(this.xVel)*10),0,0));
      }
      this.y += this.yVel;
      
      shake(1,2);
    }
  }
}

var tutFade = 0, tutIn = true, tutCycle = 0, gameStart = false;
var scoreText = [
  "OOF! ", "VICIOUS! ", "BAM! ", "OUCH! ","OW! ", "CRUEL! ", "BOOM! ",
  "WILD! ", "PRECISE! ", "OOPS! ", "SAVAGE! ", "SLAMMED! ", "DARN! ",
  "BRUISED! ", "RAGING! ", ":GNAD: ", "DAB ON IT - ", "FLIPPIN! ",
  "MAD! ", "CALLOUS! ", "COLD! ", "JACKED! ", "BLOOD! ", "SNAP! "
  ]
var tutorialText = [
  "WELCOME TO ARENA",
  "YOUR GOAL:\nDESTROY THE OTHER",
  "THE BARS\nSHOW HEALTH",
  "P1 MOVES WITH W/S",
  "P2 MOVES WITH\nTHE ARROW KEYS",
  "YOU MAY BEGIN."
  ]
function restartGame(){
  // Set up paddles and tutorial
  tutFade = 0; tutIn = true; tutCycle = 0; gameStart = false;
  bottomText = "PRESS SPACE TO SKIP";

  p1.create(p1Hero,40);
  p1.respawn();
  p2.create(p2Hero,width-40);
  p2.respawn();
  
  STATE = 'g';
}

function startGame(){
  p1.create(p1Hero,40);
  p1.respawn();
  p2.create(p2Hero,width-40);
  p2.respawn();
  ball.respawn(true);
  gameStart = true;
}

var tx, xx1, xx2, xx3, xx4;
function setup() {
  // Graphics and files
  createCanvas(600,350);
  angleMode(DEGREES);
  noStroke();
  rectMode(RADIUS);
  
  tx = titleFont.textBounds("A R E N A", 0, 0, 50);
  xx1 = (width - tx.w)/2+50;
  xx2 = (width - tx.w)/2-67;
  xx3 = width - xx2;
  xx4 = width - xx1;
  
  PARTICLES = [];
  
  // Constants
  MAX_X = width - 10;// ball rad
  MIN_Y = MARGIN + 10;
  MAX_Y = height - MARGIN - 10;
  
  WIDTH_H = width / 2;
  HEIGHT_H = height / 2;
  
  //make colors
  ballCol = color(150,0,0);
  c1 = color(255,255,255);
  c2 = color(0,0,0);
  c3 = color(200,0,0);
  
  hG = color(191,62,255);
  hR = color(255,165,0);
  hT = color(255,0,0);
  hS = color(0,240,0);
  hY = color(170,255,255);
  
  colList = [hG, hS, hT, hY, hR];
  colList1 = [hG, hR, hT, hS, hY];
  
  hpGreen = color(0,240,0);
  hpYellow = color(255,225,5);
  hpOrange = color(255,165,0);
  hpRed = color(200,10,10);
  hpSlow = hY;
  
  STATE = 's';
}

function keyPressed(){
  if (STATE === 'g'){
    if (!gameStart && !tutIn && key === ' ')
      tutFade = 1;
    if (gameStart){
      if (key === 'w' || key === 'W'){
        p1.yVel = -p1.spd;
        p1.moving = true;
      }
      else if (key === 's' || key === 'S'){
        p1.yVel = p1.spd;
        p1.moving = true;
      }
      if (keyCode === UP_ARROW){
        p2.yVel = -p2.spd;
        p2.moving = true;
      }
      else if (keyCode === DOWN_ARROW){
        p2.yVel = p2.spd;
        p2.moving = true;
      }
    }
  }
  else if (STATE === 's'){
    fadeStart = true;
  }
  else if (STATE === 'm'){
    if (menuMode === 0){
      if (key === 'w' || key === 'W'){
        charCycle++;
        if (charCycle === 5) charCycle = 0;
      }
      else if (key === 's' || key === 'S'){
        charCycle--;
        if (charCycle === -1) charCycle = 4;
      }
      else if (key === ' '){
        fadeStart = true;
        fade = 0;
      }
    }
    else if (menuMode === 1){
      if (keyCode === UP_ARROW){
        charCycle++;
        if (charCycle === 5) charCycle = 0;
      }
      else if (keyCode === DOWN_ARROW){
        charCycle--;
        if (charCycle === -1) charCycle = 4;
      }
      else if (key === ' '){
        fadeStart = true;
        fade = 0;
      }
    }
  }

  return false;
}

function keyReleased(){
  if (STATE === 'g'){
    if (key === 'w' || key === 'W' || key === 's' || key === 'S'){
      if (p1.hero !== 'r')
        p1.yVel = 0;
      p1.moving = false;
    }
    if (keyCode === UP_ARROW || keyCode === DOWN_ARROW){
      if (p2.hero !== 'r')
        p2.yVel = 0;
      p2.moving = false;
    }
  }
  return false;
}

var menuMode = 0;
var tempY;
var box = 0;
var flashTime = 50, flashTick = 0, flashTog = true; flashCol = 0;
function draw() {
  if (STATE === 's'){
    flashTick++;
    if (flashTick === flashTime){
      flashTog = !flashTog;
      flashCol = random(colList);
      flashTick = 0;
    }
    
    noStroke();
    background(0);
    textFont(titleFont);
    textSize(50);
    rectMode(CORNER)
    for (tempY = 0; tempY < 5; tempY++){
      fill(colList[tempY]);
      rect(0, tempY * (height/5), WIDTH_H, height/5);
      fill(colList[4-tempY]);
      rect(WIDTH_H, tempY * (height/5), WIDTH_H, height/5);
    }
    
    for (ti = 0; ti < 2; ti++){
      tempPart = new Particle();
      tempPart.create(
        random(xx1), HEIGHT_H, 
        0, 0, -5, 5, 
        random(5,40), random(7), hT);
      
      tempPart = new Particle();
      tempPart.create(
        random(xx4), height*0.9, 
        0, 0, -5, 5, 
        random(5,40), random(7), colList[4]);
      
      tempPart = new Particle();
      tempPart.create(
        random(xx3,width), height*0.9, 
        0, 0, -5, 5, 
        random(5,40), random(7), colList[0]);
      
      tempPart = new Particle();
      tempPart.create(
        random(xx1), height*0.1, 
        0, 0, -5, 5, 
        random(5,40), random(7), colList[0]);
      
      tempPart = new Particle();
      tempPart.create(
        random(xx4,width), height*0.1, 
        0, 0, -5, 5, 
        random(5,40), random(7), colList[4]);
     
      tempPart = new Particle();
      tempPart.create(
        random(xx4,width), HEIGHT_H, 
        0, 0, -5, 5, 
        random(5,40), random(7), hT);
    }
    
    // Update and draw particles
    for (ti = 0; ti < PARTICLES.length; ti++){
      PARTICLES[ti].update();
      PARTICLES[ti].drawParticle();
    }
    wi = 0;
    while (wi < PARTICLES.length){
      if (PARTICLES[wi].dead)
        PARTICLES[wi].kill();
      else
        wi++;
    }
    
    textAlign(CENTER,CENTER);
    
    fill(0);
    quad(xx1,0,xx3,0,xx4,height,xx2,height);
    
    fill((flashTog ? 255 :flashCol));
    text("A R E N A",WIDTH_H, HEIGHT_H);
    textFont(msgFont);
    textSize(25);
    fill((flashTog ? flashCol : 255));
    text("press any key to begin",WIDTH_H-15, HEIGHT_H+50);
    
    if (fadeStart){
      fade+=10;
      background(0,0,0,fade);
      if (fade >= 255){
        restartGame();
        STATE = 'm';
        menuMode = 0;
        fadeStart = false;
        fade = 0;
      }
    }
  }
  else if (STATE === 'm'){
    if (menuMode == 0){
      background(150);
      rectMode(CORNER);
      fill(0);
      rect(0,0,width,MARGIN);
      rect(0,height-MARGIN,width,MARGIN);
      textAlign(CENTER,TOP);
      textFont(titleFont);
      textSize(20);
      fill(colList1[charCycle]);
      text("PLAYER 1 - " + charNames[charCycle],WIDTH_H, 12);
      textAlign(CENTER,BOTTOM);
      text("W and S TO VIEW, SPACE TO PICK",WIDTH_H, height-12);
      
      imageMode(CENTER);
      image(ninjas[charCycle],WIDTH_H*0.5,HEIGHT_H);
      textFont(charPickFont);
      textSize(30);
      textAlign(LEFT,TOP);
      box = charPickFont.textBounds(tLong[charCycle],WIDTH_H, HEIGHT_H-ninjas[0].height/2);
      rect(box.x-10,box.y-10,box.w+20,box.h+20);
      fill(255);
      text(charText[charCycle], WIDTH_H, HEIGHT_H-ninjas[0].height/2);
      p1Hero = charKey[charCycle];
      if (fadeStart){
        fade+=10;
        background(0,0,0,fade);
        if (fade >= 255){
          menuMode =1;
          fadeStart = false;
          fade = 0;
        }
      }
    }
    else if (menuMode == 1){
      background(150);
      rectMode(CORNER);
      fill(0);
      rect(0,0,width,MARGIN);
      rect(0,height-MARGIN,width,MARGIN);
      textAlign(CENTER,TOP);
      textFont(titleFont);
      textSize(20);
      fill(colList1[charCycle]);
      text("PLAYER 2 - " + charNames[charCycle],WIDTH_H, 12);
      textAlign(CENTER,BOTTOM);
      text("ARROW KEYS TO VIEW, SPACE TO PICK",WIDTH_H, height-12);
      
      imageMode(CENTER);
      image(ninjas[charCycle],WIDTH_H*0.5,HEIGHT_H);
      textFont(charPickFont);
      textSize(30);
      textAlign(LEFT,TOP);
      box = charPickFont.textBounds(tLong[charCycle],WIDTH_H, HEIGHT_H-ninjas[0].height/2);
      rect(box.x-10,box.y-10,box.w+20,box.h+20);
      fill(255);
      text(charText[charCycle], WIDTH_H, HEIGHT_H-ninjas[0].height/2);
      p2Hero = charKey[charCycle];
      if (fadeStart){
        fade+=10;
        background(0,0,0,fade);
        if (fade >= 255){
          restartGame();
          STATE = 'g';
          fadeStart = false;
          fade = 0;
        }
      }
    }
  }
  else if (STATE === 'g'){
    background(200);
    
    p1.col.setAlpha(255);
    p2.col.setAlpha(255);
    
    if (!gameStart){
      //tutFade = 0; tutIn = true; tutCycle = 0; gameStart = false;
      textAlign(CENTER,CENTER);
      textFont(msgFont);
      textSize(40);
      fill(255,255,255,tutFade);
      text(tutorialText[tutCycle],WIDTH_H, HEIGHT_H);
      
      if (tutIn){
        tutFade += 15;
        if (tutFade >= 255)
          tutIn = false;
      }
      else{
        tutFade -= 1;
        if (tutFade <= 0){
          tutIn = true;
          tutFade = 0
          tutCycle++;
          if (tutCycle === 6)
            startGame();
        }
      }
    }

    // Translate for screen shake
    sx = random(-shakeX,shakeX);
    sy = random(-shakeY,shakeY);

    //tempPart = new Particle();
    //tempPart.create(WIDTH_H, 10, -15, 15, -15, 15, 50, 5, c1);

    translate(sx, sy);

    // Update and draw particles
    for (ti = 0; ti < PARTICLES.length; ti++){
      //print("m");
      PARTICLES[ti].update();
      PARTICLES[ti].drawParticle();
    }
    wi = 0;
    while (wi < PARTICLES.length){
      if (PARTICLES[wi].dead)
        PARTICLES[wi].kill();
      else
        wi++;
    }

    // Draw ball
    if (gameStart){
      ball.update();
      ball.drawBall();
    }

    // Draw paddles
    if (tutCycle > 2){
      p1.update();
      p1.drawPaddle();
    }
    if (tutCycle > 3){
      p2.update();
      p2.drawPaddle();
    }

    // Draw margins
    rectMode(CORNER);
    fill(0);
    translate(-sx,-sy);
    rect(0,0,width,MARGIN+sy);
    rect(0,height-MARGIN-sy,width,MARGIN+sy);
    
    translate(sx,sy);
    
    if (bottomFade > 0){
      textAlign(CENTER,CENTER);
      textFont(msgFont);
      textSize(40);
      fill(255,255,255,bottomFade);
      text(bottomText,WIDTH_H, height-MARGIN/2);
      bottomFade -= 3;
    }
    
    if (gameStart || tutCycle > 1){
      p1.drawHealth();
      p2.drawHealth();
    }
    translate(-sx,-sy);

    shakeX *= shakeDecay;
    shakeY *= shakeDecay;
    if (shakeX < 0.005) shakeX = 0.0;
    if (shakeY < 0.005) shakeY = 0.0;
    
    if (fadeStart){
        fade+=5;
        background(0,0,0,fade);
        if (fade >= 255){
          STATE = 's';
          fadeStart = false;
          fade = 0;
        }
      }
  }
}