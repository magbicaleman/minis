# Orbit Bloom

A playful Three.js particle playground with three modes:

- Local audio-reactive particles (true FFT analysis via Web Audio API)
- Live tab-audio visualizer (capture any browser tab audio and react in real time)
- Bass & Brackets Live (locked in-site DJ set with direct visual reactivity)

## Run

From `/Users/magbicaleman/tiiny-stuff/orbit-bloom`:

```bash
npx serve .
```

Then open:

- <http://localhost:3000>

## Notes

- In `Tab Audio Visualizer` mode, click `Capture Tab Audio`, pick a browser tab, and enable `Share audio`.
- Browser security limits direct access to iframe/service audio, so tab capture is the reliable live-reactive path.
- In `Bass & Brackets Live` mode:
  - Click `Play Bass & Brackets` to start the locked setlist.
  - Use `Next Track` and `Stop Music` to control playback.
  - Visuals react directly to the Bass & Brackets output without tab capture.
