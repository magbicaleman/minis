# Orbit Bloom

A playful Three.js particle playground with two modes:

- Local audio-reactive particles (true FFT analysis via Web Audio API)
- YouTube sync particles (time/BPM-driven, with embedded YouTube player)

## Run

From `/Users/magbicaleman/tiiny-stuff`:

```bash
node -e "require('http').createServer((req,res)=>{require('fs').createReadStream('.'+(req.url==='/'?'/orbit-bloom/index.html':req.url)).pipe(res)}).listen(8080)"
```

Then open:

- <http://localhost:8080/orbit-bloom/index.html>

If you already have a static server, use that instead.
