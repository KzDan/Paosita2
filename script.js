const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');

function isMobile() {
  return window.matchMedia("(max-width: 768px)").matches;
}

let heartScale = isMobile() ? 30 : 20;  // tamaño mayor en móviles

function resizeCanvas() {
  const scale = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * scale * 0.7;
  canvas.height = window.innerHeight * scale * 0.7;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';

  // Ajustar heartScale en caso de que el tamaño cambie (ej: rotación pantalla)
  heartScale = isMobile() ? 30 : 20;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ------- Fondo de estrellas -------
class Star {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 1 + 0.3;
    this.speed = Math.random() * 0.15 + 0.03;
    this.alpha = Math.random() * 0.8 + 0.2;
  }
  update() { 
    this.y += this.speed; 
    if (this.y > canvas.height) this.reset(); 
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

let stars = [];
for (let i = 0; i < 50; i++) stars.push(new Star());

// ------- Corazón 3D -------
function heart3DPoint() {
  let t = Math.random() * Math.PI * 2;
  let s = (Math.random() - 0.5) * 0.4;
  let scale = heartScale;
  let x = 16 * Math.pow(Math.sin(t), 3);
  let y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  let z = s * 150;
  return { x: x * scale, y: y * scale, z: z };
}

class Particle {
  constructor() {
    this.target = heart3DPoint();
    this.x = (Math.random() - 0.5) * canvas.width * 1.5;
    this.y = (Math.random() - 0.5) * canvas.height * 1.5;
    this.z = (Math.random() - 0.5) * 1000;
    this.size = Math.random() * 1 + 1.5;
    this.color = '#FF4040';
  }
  update(progress, rotation) {
    this.x += (this.target.x - this.x) * 0.05 * progress;
    this.y += (this.target.y - this.y) * 0.05 * progress;
    this.z += (this.target.z - this.z) * 0.05 * progress;

    if (progress >= 1) {
      let cosY = Math.cos(rotation);
      let sinY = Math.sin(rotation);
      let x = this.target.x * cosY - this.target.z * sinY;
      let z = this.target.x * sinY + this.target.z * cosY;
      this.x = x;
      this.y = this.target.y;
      this.z = z;
    }
  }
  draw() {
    let scale = 400 / (this.z + 1400);
    let screenX = this.x * scale + canvas.width / 2;
    let screenY = this.y * scale + canvas.height / 2;
    ctx.save();
    ctx.globalAlpha = Math.max(0.3, Math.min(1, scale * 1.2));
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.size * scale * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

let particles = [];
for (let i = 0; i < 600; i++) particles.push(new Particle());

let rotation = 0;
let formationProgress = 0;
let time = 0;
const baseRotationSpeed = 0.002;

function animate() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  stars.forEach(s => { s.update(); s.draw(); });

  if (formationProgress < 1) {
    formationProgress += 0.015;
  } else {
    time += 0.01;
    let dynamicSpeed = baseRotationSpeed + Math.sin(time) * 0.001;
    rotation += dynamicSpeed;
  }

  particles.forEach(p => { p.update(formationProgress, rotation); p.draw(); });

  requestAnimationFrame(animate);
}
animate();
