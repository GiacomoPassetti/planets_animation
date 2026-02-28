/**
 * N-body gravitational simulation using Velocity Verlet integration.
 * All values are nondimensionalized (G = 1).
 */
class Simulation {
  constructor(bodies) {
    // Deep copy so we keep originals for reset
    this.bodies = bodies.map(b => ({
      mass: b.mass,
      x: b.x,
      y: b.y,
      vx: b.vx || 0,
      vy: b.vy || 0,
      ax: 0,
      ay: 0,
    }));
    this.G = 1;
    this.softening = 0.02; // softening length squared to avoid singularities
    this.dt = 0.002;
    this._computeAccelerations();
  }

  _computeAccelerations() {
    const bodies = this.bodies;
    const n = bodies.length;

    for (let i = 0; i < n; i++) {
      bodies[i].ax = 0;
      bodies[i].ay = 0;
    }

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = bodies[j].x - bodies[i].x;
        const dy = bodies[j].y - bodies[i].y;
        const distSq = dx * dx + dy * dy + this.softening;
        const dist = Math.sqrt(distSq);
        const force = this.G / (distSq * dist); // force / (mi * mj)

        bodies[i].ax += force * bodies[j].mass * dx;
        bodies[i].ay += force * bodies[j].mass * dy;
        bodies[j].ax -= force * bodies[i].mass * dx;
        bodies[j].ay -= force * bodies[i].mass * dy;
      }
    }
  }

  /** Advance one Velocity Verlet step */
  step() {
    const dt = this.dt;
    const bodies = this.bodies;

    // Half-step velocity + full-step position
    for (const b of bodies) {
      b.vx += 0.5 * b.ax * dt;
      b.vy += 0.5 * b.ay * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
    }

    // New accelerations
    this._computeAccelerations();

    // Complete velocity step
    for (const b of bodies) {
      b.vx += 0.5 * b.ax * dt;
      b.vy += 0.5 * b.ay * dt;
    }
  }

  /** Run multiple sub-steps per frame for accuracy */
  advance(subSteps = 8) {
    for (let i = 0; i < subSteps; i++) {
      this.step();
    }
  }
}
