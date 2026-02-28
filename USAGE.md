# Gravitational Orbit Simulator — User Guide

## Requirements

A modern web browser (Chrome, Firefox, Edge, or Safari). No installation or build step needed.

## Getting Started

1. Open `index.html` in your browser (double-click the file or drag it into a browser window).
2. On the setup screen, choose the number of planets (2–10) and click **Set**.
3. Adjust each planet's **mass**, **position** (X, Y), and **velocity** (Vel X, Vel Y) as desired. Sensible defaults are pre-filled.
4. Click **Launch Simulation** to start the animation.

## Controls

| Button      | Action                                              |
|-------------|-----------------------------------------------------|
| ⏸ Stop      | Pause the simulation                                |
| ▶ Resume    | Continue from where it was paused                   |
| ↺ Reset     | Return to the setup screen to change initial values |

## Tips

- A heavy central body (mass ≈ 10) with lighter orbiting planets (mass ≈ 0.3–1) produces stable-looking orbits.
- All values are nondimensionalized — experiment freely with different scales.
- The window can be resized at any time; the canvas adapts automatically.
