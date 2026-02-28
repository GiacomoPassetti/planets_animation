/**
 * Main application: wires UI, simulation, and renderer together.
 */
(function () {
  const PLANET_COLORS = [
    '#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA',
    '#F472B6', '#34D399', '#FB923C', '#60A5FA',
    '#E879F9', '#FACC15',
  ];

  // Default initial conditions for up to 10 planets (nondimensionalized)
  const DEFAULTS = [
    { mass: 10, x: 0,    y: 0,    vx: 0,    vy: 0    },
    { mass: 1,  x: 0.8,  y: 0,    vx: 0,    vy: 3.5  },
    { mass: 1,  x: -0.6, y: 0.4,  vx: -1.5, vy: -2.5 },
    { mass: 0.5,x: 0,    y: -0.9, vx: 3,    vy: 0    },
    { mass: 0.8,x: -0.4, y: -0.5, vx: 2,    vy: -1   },
    { mass: 0.3,x: 1.0,  y: 0.5,  vx: -1,   vy: 2    },
    { mass: 0.6,x: -0.9, y: -0.2, vx: 1,    vy: -2.5 },
    { mass: 0.4,x: 0.3,  y: 1.0,  vx: -2.5, vy: 0.5  },
    { mass: 0.7,x: 0.6,  y: -0.6, vx: 1.5,  vy: 2    },
    { mass: 0.2,x: -1.1, y: 0.8,  vx: 0.5,  vy: -1.5 },
  ];

  // DOM elements
  const setupPanel = document.getElementById('setup-panel');
  const simView = document.getElementById('simulation-view');
  const canvas = document.getElementById('canvas');
  const planetCountInput = document.getElementById('planet-count');
  const btnGenerate = document.getElementById('btn-generate-fields');
  const btnStart = document.getElementById('btn-start');
  const btnStop = document.getElementById('btn-stop');
  const btnResume = document.getElementById('btn-resume');
  const btnReset = document.getElementById('btn-reset');
  const fieldsContainer = document.getElementById('planet-fields');

  let simulation = null;
  let renderer = null;
  let animFrameId = null;
  let running = false;

  // Generate planet input fields
  function generateFields() {
    const n = Math.max(2, Math.min(10, parseInt(planetCountInput.value) || 3));
    planetCountInput.value = n;
    fieldsContainer.innerHTML = '';

    for (let i = 0; i < n; i++) {
      const d = DEFAULTS[i] || { mass: 1, x: 0, y: 0, vx: 0, vy: 0 };
      const group = document.createElement('div');
      group.className = 'planet-group';
      group.innerHTML = `
        <h3><span class="color-dot" style="background:${PLANET_COLORS[i]}"></span> Planet ${i + 1}</h3>
        <div class="fields">
          <div class="field">
            <label>Mass</label>
            <input type="number" class="p-mass" step="0.1" min="0.01" value="${d.mass}">
          </div>
          <div class="field">
            <label>Vel X</label>
            <input type="number" class="p-vx" step="0.1" value="${d.vx}">
          </div>
          <div class="field">
            <label>Vel Y</label>
            <input type="number" class="p-vy" step="0.1" value="${d.vy}">
          </div>
        </div>
        <div class="fields-pos">
          <div class="field">
            <label>Pos X</label>
            <input type="number" class="p-x" step="0.1" value="${d.x}">
          </div>
          <div class="field">
            <label>Pos Y</label>
            <input type="number" class="p-y" step="0.1" value="${d.y}">
          </div>
        </div>
      `;
      fieldsContainer.appendChild(group);
    }
  }

  function readBodies() {
    const groups = fieldsContainer.querySelectorAll('.planet-group');
    return Array.from(groups).map(g => ({
      mass: parseFloat(g.querySelector('.p-mass').value) || 1,
      x: parseFloat(g.querySelector('.p-x').value) || 0,
      y: parseFloat(g.querySelector('.p-y').value) || 0,
      vx: parseFloat(g.querySelector('.p-vx').value) || 0,
      vy: parseFloat(g.querySelector('.p-vy').value) || 0,
    }));
  }

  function startSimulation() {
    const bodies = readBodies();
    if (bodies.length < 2) return;

    setupPanel.classList.add('hidden');
    simView.classList.remove('hidden');
    btnStop.classList.remove('hidden');
    btnResume.classList.add('hidden');

    simulation = new Simulation(bodies);
    renderer = new Renderer(canvas, PLANET_COLORS.slice(0, bodies.length));
    running = true;
    animate();
  }

  function animate() {
    if (!running) return;
    simulation.advance(8);
    renderer.draw(simulation.bodies);
    animFrameId = requestAnimationFrame(animate);
  }

  function stopSimulation() {
    running = false;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    btnStop.classList.add('hidden');
    btnResume.classList.remove('hidden');
  }

  function resumeSimulation() {
    if (!simulation) return;
    running = true;
    btnStop.classList.remove('hidden');
    btnResume.classList.add('hidden');
    animate();
  }

  function resetSimulation() {
    running = false;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (renderer) renderer.destroy();
    simulation = null;
    renderer = null;

    simView.classList.add('hidden');
    setupPanel.classList.remove('hidden');
  }

  // Event listeners
  btnGenerate.addEventListener('click', generateFields);
  btnStart.addEventListener('click', startSimulation);
  btnStop.addEventListener('click', stopSimulation);
  btnResume.addEventListener('click', resumeSimulation);
  btnReset.addEventListener('click', resetSimulation);

  // Initialize with default fields
  generateFields();
})();
