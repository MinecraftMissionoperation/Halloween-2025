// Halloween 2025: Escape the Haunted House
// Core game engine in JavaScript

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// --- ASSETS ---
// Replace below with your image paths in `/images/` folder
const survivorImg = new Image();
survivorImg.src = "images/Player-removebg-preview.png";   // <- change to your survivor sprite
const ghostImg = new Image();
ghostImg.src = "images/ghost-removebg-preview.png";         // <- change to your ghost sprite
const powerupImg = new Image();
powerupImg.src = "images/powerup-removebg-preview.png";     // <- change to your powerup (shield)

// --- GAME OBJECTS ---

class Player {
  constructor(x, y, id) {
    this.x = x;
    this.y = y;
    this.size = 32;
    this.speed = 3;
    this.lives = 3;
    this.id = id;
    this.poweredUp = false;
    this.color = "blue";
  }
  move(input) {
    if (input["ArrowUp"]) this.y -= this.speed;
    if (input["ArrowDown"]) this.y += this.speed;
    if (input["ArrowLeft"]) this.x -= this.speed;
    if (input["ArrowRight"]) this.x += this.speed;

    this.x = Math.max(0, Math.min(WIDTH - this.size, this.x));
    this.y = Math.max(0, Math.min(HEIGHT - this.size, this.y));
  }
  draw() {
    if (survivorImg.complete) {
      ctx.drawImage(survivorImg, this.x, this.y, this.size, this.size);
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }
    if(this.poweredUp){
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.size, this.size);
    }
  }
}

class Ghost {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 32;
    this.speed = 2;
    this.abilityCooldown = 0;
    this.color = "red";
  }
  update(players) {
    // Basic chase AI
    let target = players[0]; 
    let minDist = Infinity;
    for (let p of players) {
      if (p.lives > 0) {
        let d = Math.hypot(p.x - this.x, p.y - this.y);
        if (d < minDist) {
          minDist = d;
          target = p;
        }
      }
    }
    if (target) {
      if (target.x > this.x) this.x += this.speed;
      if (target.x < this.x) this.x -= this.speed;
      if (target.y > this.y) this.y += this.speed;
      if (target.y < this.y) this.y -= this.speed;
    }
    if (this.abilityCooldown > 0) this.abilityCooldown--;
  }
  draw() {
    if (ghostImg.complete) {
      ctx.drawImage(ghostImg, this.x, this.y, this.size, this.size);
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }
  }
}

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.size = 24;
    this.type = type; // "shield", "speed", "rage"
  }
  draw() {
    if (powerupImg.complete) {
      ctx.drawImage(powerupImg, this.x, this.y, this.size, this.size);
    } else {
      ctx.fillStyle = "gold";
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }
  }
}
// --- SETUP ---

const input = {};
const players = [new Player(100, 100, 0)];
const ghosts = [new Ghost(400, 300), new Ghost(600, 500), new Ghost(800, 100)];
const powerups = [new PowerUp(300, 200, "shield"), new PowerUp(700, 400, "rage")];

// --- EVENT HANDLING ---
document.addEventListener("keydown", e => input[e.key] = true);
document.addEventListener("keyup", e => input[e.key] = false);

// --- MAIN LOOP ---
function update() {
  // Update player
  for (let p of players) {
    if (p.lives > 0) p.move(input);
  }

  // Update ghosts
  for (let g of ghosts) g.update(players);

  // Collision: ghost hits player
  for (let g of ghosts) {
    for (let p of players) {
      if (collide(g, p) && !p.poweredUp) {
        p.lives--;
        p.x = 50; p.y = 50; // reset position
      }
    }
  }

  // Powerup pickup
  for (let i = powerups.length - 1; i >= 0; i--) {
    let pu = powerups[i];
    for (let p of players) {
      if(collide(pu, p)){
        if(pu.type === "shield") p.poweredUp = true;
        if(pu.type === "speed") p.speed += 2;
        if(pu.type === "rage"){ // ghost buff
          for (let g of ghosts) g.speed += 1;
        }
        powerups.splice(i, 1);
      }
    }
  }
}

function draw() {
  ctx.fillStyle = "#1e1e2f";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  for (let p of players) p.draw();
  for (let g of ghosts) g.draw();
  for (let pu of powerups) pu.draw();

  // HUD
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Lives: " + players[0].lives, 20, 30);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();

// --- COLLISION HELPER ---
function collide(a, b){
  return a.x < b.x + b.size &&
         a.x + a.size > b.x &&
         a.y < b.y + b.size &&
         a.y + a.size > b.y;
}
