class Firework {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
        this.targetY = Math.random() * (canvas.height * 0.5);
        this.speed = 5 + Math.random() * 5;
        this.angle = -Math.PI / 2 + (Math.random() * 0.2 - 0.1);
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.hue = Math.random() * 360;
        this.particles = [];
        this.exploded = false;
        this.dead = false;
    }

    update() {
        if (!this.exploded) {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.05; // gravity

            if (this.vy >= 0 || this.y <= this.targetY) {
                this.explode();
            }
        } else {
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].update();
                if (this.particles[i].alpha <= 0) {
                    this.particles.splice(i, 1);
                }
            }
            if (this.particles.length === 0) {
                this.dead = true;
            }
        }
    }

    draw() {
        if (!this.exploded) {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
            this.ctx.fill();
        } else {
            for (const p of this.particles) {
                p.draw();
            }
        }
    }

    explode() {
        this.exploded = true;
        for (let i = 0; i < 100; i++) {
            this.particles.push(new Particle(this.x, this.y, this.hue, this.ctx));
        }
    }
}

class Particle {
    constructor(x, y, hue, ctx) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
        this.hue = hue;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 5 + 1;
        this.friction = 0.95;
        this.gravity = 0.1;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.005;
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }

    draw() {
        this.ctx.save();
        this.ctx.globalAlpha = this.alpha;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
        this.ctx.fill();
        this.ctx.restore();
    }
}

const canvas = document.getElementById('fireworks-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let fireworks = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Trails
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (Math.random() < 0.05) {
            fireworks.push(new Firework(canvas, ctx));
        }

        for (let i = fireworks.length - 1; i >= 0; i--) {
            fireworks[i].update();
            fireworks[i].draw();
            if (fireworks[i].dead) {
                fireworks.splice(i, 1);
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}
