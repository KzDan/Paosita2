const canvas = document.getElementById('heartCanvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
      const scale = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Star {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speed = Math.random() * 0.2 + 0.05;
        this.alpha = Math.random() * 0.5 + 0.3;
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
    for (let i = 0; i < 500; i++) stars.push(new Star());

    let heartScale = 70;

    function heart3DPoint() {
      let t = Math.random() * Math.PI * 2;
      let s = (Math.random() - 0.5) * 0.8;
      let x = 16 * Math.pow(Math.sin(t), 3);
      let y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      let z = s * 350;
      return { x: x * heartScale, y: y * heartScale, z: z };
    }

    class Particle {
      constructor(distanceNorm) {
        this.target = heart3DPoint();
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.size = Math.random() * 2.2 + 1;
        this.baseColor = '#FF4040';
        this.distanceNorm = distanceNorm;
      }

      update(progress) {
        let p = Math.max(0, (progress - this.distanceNorm) / (1 - this.distanceNorm + 0.0001));
        p = Math.min(p, 1);
        let speed = 0.001 + 0.001 * p;

        this.x += (this.target.x - this.x) * speed;
        this.y += (this.target.y - this.y) * speed;
        this.z += (this.target.z - this.z) * speed;
      }

      draw(rotation, heartbeat) {
        let cosY = Math.cos(rotation);
        let sinY = Math.sin(rotation);
        let xRot = this.x * cosY - this.z * sinY;
        let zRot = this.x * sinY + this.z * cosY;

        let scale = (700 / (zRot + 1800)) * heartbeat;
        let screenX = xRot * scale + canvas.width / 2;
        let screenY = this.y * scale + canvas.height / 2;

        let alpha = Math.max(0.3, Math.min(1, 1.8 - zRot / 900));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.baseColor;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.size * scale * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    let rawPoints = [];
    let maxDist = 0;
    for (let i = 0; i < 700; i++) {
      let p = heart3DPoint();
      rawPoints.push(p);
      let dist = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
      if (dist > maxDist) maxDist = dist;
    }

    let particles = [];
    for (let i = 0; i < rawPoints.length; i++) {
      let distNorm = Math.sqrt(rawPoints[i].x ** 2 + rawPoints[i].y ** 2 + rawPoints[i].z ** 2) / maxDist;
      let particle = new Particle(distNorm);
      particle.target = rawPoints[i];
      particles.push(particle);
    }

    let rotation = 0;
    let formationProgress = 0;
    let time = 0;
    let heartbeat = 1;
    const baseRotationSpeed = 0.002;

    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(s => { s.update(); s.draw(); });

      if (formationProgress < 1) {
        formationProgress += 0.01;
      } else {
        time += 0.01;
        rotation += baseRotationSpeed + Math.sin(time) * 0.001;
        heartbeat = 1 + 0.05 * Math.sin(time * 6); // ✨ latido
      }

      particles.forEach(p => {
        p.update(formationProgress);
        p.draw(rotation, heartbeat);
      });

      requestAnimationFrame(animate);
    }

    animate();
