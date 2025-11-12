let triangles: Triangle[] = [];
const MAX_TRIANGLES = 25;
const BASE_SPEED = 0.2;
const BASE_RADIUS = 20;

interface Triangle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    angle: number;
    spin: number;
}

function createTriangle(canvas: HTMLCanvasElement): Triangle {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * BASE_SPEED,
        vy: (Math.random() - 0.5) * BASE_SPEED,
        radius: BASE_RADIUS + Math.random() * 20,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.01,
    };
}

function draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, gradient: CanvasGradient) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    triangles.forEach(t => {
        // Update position
        t.x += t.vx;
        t.y += t.vy;
        t.angle += t.spin;

        // Wall bouncing
        if (t.x - t.radius < 0 || t.x + t.radius > canvas.width) t.vx *= -1;
        if (t.y - t.radius < 0 || t.y + t.radius > canvas.height) t.vy *= -1;

        // Draw triangle
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.angle);
        ctx.beginPath();
        ctx.moveTo(0, -t.radius);
        ctx.lineTo(t.radius * Math.cos(Math.PI / 6), t.radius * Math.sin(Math.PI / 6));
        ctx.lineTo(-t.radius * Math.cos(Math.PI / 6), t.radius * Math.sin(Math.PI / 6));
        ctx.closePath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    });
}

export function startAnimation(canvas: HTMLCanvasElement): number {
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      triangles = [];
      for (let i = 0; i < MAX_TRIANGLES; i++) {
          triangles.push(createTriangle(canvas));
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#34d399'); // emerald-400
    gradient.addColorStop(0.5, '#4ade80'); // green-400
    gradient.addColorStop(1, '#86efac'); // green-300

    let animationFrameId: number;
    const animate = () => {
        draw(ctx, canvas, gradient);
        animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    
    return animationFrameId;
}

export function stopAnimation(animationFrameId: number | null, canvas: HTMLCanvasElement) {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    const ctx = canvas.getContext('2d');
    if(ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}
