# Gravitational Orbit Simulator — Implementation Details

## Overview

The application is a client-side N-body gravitational simulator rendered in real time on an HTML5 canvas. It is structured as three decoupled layers — input/UI, simulation, and rendering — wired together by a thin application controller.

No external dependencies or build tools are used; the entire application runs from five source files loaded directly by the browser.

## File Structure

| File             | Role                                                  |
|------------------|-------------------------------------------------------|
| `index.html`     | Page structure: setup panel, canvas, control buttons   |
| `style.css`      | Visual theme and layout                               |
| `simulation.js`  | Physics engine                                        |
| `renderer.js`    | Canvas drawing and visual effects                     |
| `app.js`         | Application controller (UI wiring, animation loop)    |

---

## Simulation Layer (`simulation.js`)

### Physics Model

The simulation solves the classical N-body gravitational problem where every body exerts a gravitational pull on every other body. The gravitational constant **G** is set to 1 (nondimensionalized units).

The pairwise gravitational acceleration on body *i* due to body *j* is:

    a_i += G * m_j * (r_j - r_i) / (|r_j - r_i|² + ε)^(3/2)

where **ε** is a softening parameter (set to 0.02) that prevents the force from diverging when two bodies come very close together. This is a standard technique in N-body simulations known as **Plummer softening**.

### Integration Method

The simulation uses the **Velocity Verlet** algorithm, a second-order symplectic integrator. It proceeds as:

1. **Half-kick**: update velocities by half a timestep using current accelerations.
2. **Drift**: update positions by a full timestep using the half-kicked velocities.
3. **Recompute accelerations** from the new positions.
4. **Half-kick**: complete the velocity update using the new accelerations.

This scheme is preferred over simpler methods (e.g. Euler) because it is time-reversible and conserves energy much better over long integration periods, which keeps orbits visually stable.

### Sub-stepping

Each animation frame advances the simulation by **8 sub-steps** (configurable via `advance(subSteps)`). This allows the timestep `dt` to remain small (0.002) for accuracy while keeping the visual progression speed reasonable.

### Complexity

Force computation is O(n²) per step, which is perfectly adequate for up to 10 bodies.

---

## Rendering Layer (`renderer.js`)

### Coordinate Mapping

Simulation coordinates are mapped to screen space by centering the origin at the canvas midpoint and scaling so that the range [-1.5, 1.5] fits the smaller canvas dimension. This is recalculated on window resize.

### Trail / Haze Effect

A **secondary offscreen canvas** (`trailCanvas`) accumulates body positions over time. Each frame:

1. The trail canvas is slightly faded by drawing a nearly-transparent black rectangle over it using the `destination-out` composite operation. The fade factor (alpha 0.012) controls how long trails persist.
2. Current body positions are stamped onto the trail canvas as small colored dots.

The main canvas is then cleared to black and the trail canvas is composited onto it before drawing the bodies. This produces the smooth, gradually fading trajectory haze described in the requirements.

### Body Rendering

Each body is drawn as three layers:

1. **Outer glow** — a radial gradient from the body's assigned color to transparent, extending 5× the body radius. This gives the luminous halo effect.
2. **Bright core** — a solid white circle at the body's radius (scaled logarithmically with mass).
3. **Colored ring** — a thin colored stroke just outside the core for definition.

### Device Pixel Ratio

The canvas is sized at `clientWidth × devicePixelRatio` to stay sharp on high-DPI / Retina displays.

---

## Application Controller (`app.js`)

### State Machine

The app has two visual states:

- **Setup**: the setup panel is visible; the user configures planets.
- **Running**: the canvas and controls are visible; the simulation is animating.

Transitions:
- Setup → Running: user clicks "Launch Simulation".
- Running → Paused: user clicks "Stop" (`cancelAnimationFrame`).
- Paused → Running: user clicks "Resume".
- Running/Paused → Setup: user clicks "Reset" (destroys simulation and renderer).

### Animation Loop

The loop uses `requestAnimationFrame` for smooth 60 fps rendering. Each frame calls `simulation.advance(8)` then `renderer.draw(simulation.bodies)`.

### Planet Configuration UI

The "Set" button dynamically generates input field groups for each planet. Each group contains fields for mass, position (X, Y), and velocity (Vel X, Vel Y). Defaults are provided for up to 10 planets, arranged to produce visually interesting orbits out of the box.

### Color Assignment

Ten distinct bright colors are defined. Each planet is assigned a color by index, used consistently for its glow, trail, and ring.

---

## Design Decisions

- **No external dependencies**: keeps the project simple and instantly runnable.
- **Velocity Verlet over RK4**: simpler to implement, symplectic (better energy conservation), and sufficient for visual accuracy.
- **Softened potential**: avoids numerical blow-up from near-collisions without needing collision detection.
- **Offscreen trail canvas**: more performant and visually smoother than storing and redrawing position history arrays.
- **Nondimensionalized units**: users work in abstract units (G = 1), making the input intuitive without needing real physical constants.
