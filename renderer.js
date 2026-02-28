/**
 * Canvas renderer with glow effects and fading trajectory trails.
 */
class Renderer {
  constructor(canvas, bodyColors) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.colors = bodyColors;
    // Trail buffer: secondary canvas for fading haze
    this.trailCanvas = document.createElement('canvas');
    this.trailCtx = this.trailCanvas.getContext('2d');
    this.resize();
    this._boundResize = () => this.resize();
    window.addEventListener('resize', this._boundResize);
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.clientWidth * dpr;
    this.canvas.height = this.canvas.clientHeight * dpr;
    this.trailCanvas.width = this.canvas.width;
    this.trailCanvas.height = this.canvas.height;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.trailCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    // Coordinate mapping: simulation space [-1.5, 1.5] maps to canvas
    this.scale = Math.min(this.width, this.height) / 3;
    this.cx = this.width / 2;
    this.cy = this.height / 2;
  }

  /** Convert simulation coords to canvas coords */
  toScreen(x, y) {
    return [this.cx + x * this.scale, this.cy + y * this.scale];
  }

  /** Render a single frame */
  draw(bodies) {
    const ctx = this.ctx;
    const tctx = this.trailCtx;

    // Fade the trail canvas slightly each frame for haze effect
    tctx.globalCompositeOperation = 'destination-out';
    tctx.fillStyle = 'rgba(0, 0, 0, 0.012)';
    tctx.fillRect(0, 0, this.width, this.height);
    tctx.globalCompositeOperation = 'source-over';

    // Draw current positions onto trail canvas as small bright dots
    for (let i = 0; i < bodies.length; i++) {
      const [sx, sy] = this.toScreen(bodies[i].x, bodies[i].y);
      const color = this.colors[i % this.colors.length];
      tctx.beginPath();
      tctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      tctx.fillStyle = color;
      tctx.fill();
    }

    // Clear main canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw trail layer
    ctx.drawImage(this.trailCanvas, 0, 0);

    // Draw bodies with glow
    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];
      const [sx, sy] = this.toScreen(b.x, b.y);
      const color = this.colors[i % this.colors.length];
      const radius = Math.max(3, Math.min(8, 2 + Math.log(b.mass + 1) * 2));

      // Outer glow
      const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius * 5);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.2, this._withAlpha(color, 0.4));
      gradient.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(sx, sy, radius * 5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Bright core
      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // Colored ring
      ctx.beginPath();
      ctx.arc(sx, sy, radius + 1, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  _withAlpha(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  destroy() {
    window.removeEventListener('resize', this._boundResize);
  }
}
