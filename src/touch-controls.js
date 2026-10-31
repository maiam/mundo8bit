// Pointer capture keeps each thumb independent, including outside the controls.
export function createTouchControls() {
  const state = {x: 0, z: 0, running: false};
  const pad = document.querySelector('#joystick');
  const thumb = document.querySelector('#joystick-thumb');
  const run = document.querySelector('#run');
  let padPointer = null;
  let runPointer = null;
  function resetPad() {
    padPointer = null;
    state.x = state.z = 0;
    thumb.style.transform = 'translate(0px, 0px)';
  }
  function resetRun() {
    runPointer = null;
    state.running = false;
    run.classList.remove('pressed');
    run.setAttribute('aria-pressed', 'false');
  }
  function move(event) {
    const rect = pad.getBoundingClientRect();
    const radius = rect.width * .32;
    const dx = event.clientX - rect.left - rect.width / 2;
    const dz = event.clientY - rect.top - rect.height / 2;
    const distance = Math.hypot(dx, dz);
    const scale = distance > radius ? radius / distance : 1;
    thumb.style.transform = `translate(${dx * scale}px, ${dz * scale}px)`;
    const strength = Math.max(0, (Math.min(distance / radius, 1) - .12) / .88);
    state.x = distance ? dx / distance * strength : 0;
    state.z = distance ? dz / distance * strength : 0;
  }
  pad.addEventListener('pointerdown', event => {
    if (padPointer !== null || event.button !== 0) return;
    event.preventDefault();
    padPointer = event.pointerId;
    pad.setPointerCapture(padPointer);
    move(event);
  });
  pad.addEventListener('pointermove', event => {
    if (event.pointerId === padPointer) move(event);
  });
  run.addEventListener('pointerdown', event => {
    if (runPointer !== null || event.button !== 0) return;
    event.preventDefault();
    runPointer = event.pointerId;
    run.setPointerCapture(runPointer);
    state.running = true;
    run.classList.add('pressed');
    run.setAttribute('aria-pressed', 'true');
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    pad.addEventListener(type, event => { if (event.pointerId === padPointer) resetPad(); });
    run.addEventListener(type, event => { if (event.pointerId === runPointer) resetRun(); });
  }
  function reset() { resetPad(); resetRun(); }
  window.addEventListener('blur', reset);
  window.addEventListener('resize', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  return state;
}
