# Copilot Instructions for `planets_animation`

## Build, test, and lint

No build, test, or lint tooling is currently configured in this repository.

## High-level architecture

This repository currently defines product requirements (in `README.txt`) for a gravitational orbit animation generator:

- **Input/UI layer**: user selects the number of point-like entities (planets), then sets each planet mass and nondimensionalized initial position.
- **Simulation layer**: gravitational trajectory simulation runs from those initial conditions.
- **Rendering/controls layer**: animation is shown to the user with stop and reset controls.

The expected visual style is part of the core behavior: black background, bright objects, and a fading trail/haze effect for trajectories.

## Key conventions

- Treat planet initial conditions as **nondimensionalized** values.
- Preserve the control model described in requirements: animation must support **stop** and **reset** actions.
- Keep visuals aligned with the stated aesthetic requirements: **dark background + bright bodies + fading trajectory haze**.
