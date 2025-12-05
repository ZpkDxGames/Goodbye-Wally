/**
 * Simple Confetti Animation
 */

class Confetti {
    constructor() {
        this.canvas = document.getElementById('confetti-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.colors = ['#6c5ce7', '#a29bfe', '#fd79a8', '#00b894', '#ffeaa7'];
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle(x, y, force = 1) {
        const speed = (Math.random() * 8 + 4) * force; // Much faster
        const angle = Math.random() * Math.PI * 2;
        
        return {
            x: x,
            y: y,
            size: (Math.random() * 8 + 4) * (force > 1 ? 1.2 : 0.8),
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            speedX: Math.cos(angle) * speed,
            speedY: Math.sin(angle) * speed - (force * 3), // Stronger upward pop
            gravity: 0.25,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() * 30 - 15) * force
        };
    }

    burst(x, y, count = 200, force = 2.0) { // More particles, more force
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle(x, y, force));
        }
        this.animate();
    }

    animate() {
        if (this.particles.length === 0) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];
            
            p.speedY += p.gravity;
            p.x += p.speedX;
            p.y += p.speedY;
            p.rotation += p.rotationSpeed;

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            this.ctx.restore();

            // Remove particles off screen
            if (p.y > this.canvas.height) {
                this.particles.splice(i, 1);
                i--;
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

const confettiSystem = new Confetti();
