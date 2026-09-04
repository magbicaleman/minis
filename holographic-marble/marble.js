(() => {
    'use strict';

    const card = document.querySelector('.holo-card');
    const stage = document.querySelector('.card-perspective');
    const canvas = document.querySelector('.holo-card__canvas');
    const slider = document.querySelector('#intensity');
    const output = document.querySelector('#intensity-value');
    const motionStatus = document.querySelector('#motion-status');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const textureURL = new URL('./assets/marble-hologram.png', document.currentScript.src);

    let intensity = Number(slider.value) / 100;
    let paused = false;
    let interacting = false;
    let frame = null;
    let previousTime = 0;
    let elapsed = 0;
    let renderer = null;
    const pointer = { x: 0, y: 0 };
    const light = { x: 0, y: 0 };
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

    // Color is refracted in the colored veins, preserving the silver stone's detail.
    const vertexSource = `
        attribute vec2 a_position;
        varying vec2 v_uv;
        void main() {
            v_uv = a_position * 0.5 + 0.5;
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    const fragmentSource = `
        precision mediump float;
        uniform sampler2D u_texture;
        uniform vec2 u_cover;
        uniform vec2 u_light;
        uniform float u_time;
        uniform float u_intensity;
        varying vec2 v_uv;

        vec3 hueRotate(vec3 color, float angle) {
            vec3 axis = normalize(vec3(1.0));
            float c = cos(angle);
            return color * c + cross(axis, color) * sin(angle)
                + axis * dot(axis, color) * (1.0 - c);
        }

        void main() {
            vec2 uv = (v_uv - 0.5) * u_cover + 0.5;
            vec3 marble = texture2D(u_texture, uv).rgb;
            float luminance = dot(marble, vec3(0.2126, 0.7152, 0.0722));
            float high = max(marble.r, max(marble.g, marble.b));
            float low = min(marble.r, min(marble.g, marble.b));
            float vein = smoothstep(0.045, 0.20, high - low);

            vec3 base = mix(vec3(luminance), marble, 0.92);
            base = (base - 0.5) * 1.04 + 0.5;
            float phase = sin(u_time * 0.72 + v_uv.y * 3.2) * 0.55
                + u_light.x * 1.7 - u_light.y * 1.15;
            vec3 refracted = hueRotate(base, phase * u_intensity);
            refracted = mix(vec3(luminance), refracted, 1.0 + u_intensity * 0.55);
            vec3 color = mix(base, refracted, vein);

            vec2 lamp = vec2(0.5) + vec2(u_light.x, -u_light.y) * 0.36;
            vec2 distanceToLight = (v_uv - lamp) * vec2(0.72, 1.0);
            float glow = exp(-dot(distanceToLight, distanceToLight) * 8.0);
            vec3 spectrum = 0.5 + 0.5 * cos(6.28318 *
                (v_uv.x * 0.3 + v_uv.y * 0.22 + phase * 0.1 + vec3(0.0, 0.33, 0.67)));
            color += spectrum * glow * vein * u_intensity * 0.14;
            color += vec3(0.86, 0.95, 1.0) * glow * u_intensity * 0.035;
            gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
        }
    `;

    function createRenderer(gl, image) {
        const resources = [];
        function shader(type, source) {
            const result = gl.createShader(type);
            resources.push(result);
            gl.shaderSource(result, source);
            gl.compileShader(result);
            if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) {
                throw new Error(gl.getShaderInfoLog(result));
            }
            return result;
        }

        const program = gl.createProgram();
        const buffer = gl.createBuffer();
        const texture = gl.createTexture();
        try {
            gl.attachShader(program, shader(gl.VERTEX_SHADER, vertexSource));
            gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentSource));
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                throw new Error(gl.getProgramInfoLog(program));
            }
            gl.useProgram(program);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1
            ]), gl.STATIC_DRAW);
            const position = gl.getAttribLocation(program, 'a_position');
            gl.enableVertexAttribArray(position);
            gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);

            const uniforms = Object.fromEntries(['cover', 'light', 'time', 'intensity']
                .map(name => [name, gl.getUniformLocation(program, `u_${name}`)]));

            return {
                resize() {
                    const ratio = Math.min(window.devicePixelRatio || 1, 2);
                    canvas.width = Math.round(card.clientWidth * ratio);
                    canvas.height = Math.round(card.clientHeight * ratio);
                    gl.viewport(0, 0, canvas.width, canvas.height);
                    const aspect = canvas.width / canvas.height;
                    const imageAspect = image.naturalWidth / image.naturalHeight;
                    gl.uniform2f(uniforms.cover, Math.min(aspect / imageAspect, 1), Math.min(imageAspect / aspect, 1));
                },
                draw() {
                    gl.uniform2f(uniforms.light, light.x, light.y);
                    gl.uniform1f(uniforms.time, elapsed);
                    gl.uniform1f(uniforms.intensity, intensity);
                    gl.drawArrays(gl.TRIANGLES, 0, 6);
                }
            };
        } catch (error) {
            gl.deleteProgram(program);
            gl.deleteBuffer(buffer);
            gl.deleteTexture(texture);
            throw error;
        } finally {
            resources.forEach(resource => gl.deleteShader(resource));
        }
    }

    function requestFrame() {
        if (frame === null && !document.hidden) frame = requestAnimationFrame(animate);
    }

    function animate(now) {
        frame = null;
        const delta = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 1 / 60;
        previousTime = now;
        const automatic = !paused && !reducedMotion.matches;
        if (automatic) elapsed += delta;

        const targetX = interacting ? pointer.x : Math.sin(elapsed * 0.8) * 0.15;
        const targetY = interacting ? pointer.y : Math.sin(elapsed * 0.63 + 0.8) * 0.10;
        const ease = reducedMotion.matches ? 1 : 1 - Math.exp(-delta * 12);
        light.x += (targetX - light.x) * ease;
        light.y += (targetY - light.y) * ease;

        card.style.setProperty('--rotate-x', `${reducedMotion.matches ? 0 : -light.y * 10}deg`);
        card.style.setProperty('--rotate-y', `${reducedMotion.matches ? 0 : light.x * 12}deg`);
        card.style.setProperty('--light-x', `${(light.x + 1) * 50}%`);
        card.style.setProperty('--light-y', `${(light.y + 1) * 50}%`);
        if (renderer) {
            renderer.draw();
            card.classList.add('is-ready');
        }

        const settling = Math.abs(targetX - light.x) + Math.abs(targetY - light.y) > 0.0001;
        if (automatic || settling) requestFrame();
        else previousTime = 0;
    }

    function pointAt(event) {
        // The untransformed parent avoids feedback as the card tilts under the pointer.
        const bounds = stage.getBoundingClientRect();
        pointer.x = clamp((event.clientX - bounds.left) / card.offsetWidth * 2 - 1, -1, 1);
        pointer.y = clamp((event.clientY - bounds.top) / card.offsetHeight * 2 - 1, -1, 1);
        interacting = true;
        requestFrame();
    }

    function release() {
        interacting = false;
        pointer.x = pointer.y = 0;
        requestFrame();
    }

    card.addEventListener('pointermove', pointAt);
    card.addEventListener('pointerdown', event => {
        pointAt(event);
        card.focus({ preventScroll: true });
        if (event.pointerType !== 'mouse') card.setPointerCapture(event.pointerId);
    });
    card.addEventListener('pointerup', event => {
        if (event.pointerType !== 'mouse') release();
    });
    card.addEventListener('pointercancel', release);
    card.addEventListener('pointerleave', release);
    card.addEventListener('blur', release);
    card.addEventListener('keydown', event => {
        const directions = { ArrowLeft: [-0.12, 0], ArrowRight: [0.12, 0], ArrowUp: [0, -0.12], ArrowDown: [0, 0.12] };
        if (directions[event.key]) {
            event.preventDefault();
            interacting = true;
            pointer.x = clamp(pointer.x + directions[event.key][0], -1, 1);
            pointer.y = clamp(pointer.y + directions[event.key][1], -1, 1);
        } else if (event.key === 'Home' || event.key === 'Escape') {
            event.preventDefault();
            interacting = true;
            pointer.x = pointer.y = 0;
        } else if (event.code === 'Space') {
            event.preventDefault();
            if (event.repeat) return;
            paused = !paused;
            motionStatus.textContent = reducedMotion.matches ? 'Reduced motion is enabled.' :
                `Idle animation ${paused ? 'paused' : 'resumed'}.`;
        } else return;
        requestFrame();
    });

    function updateIntensity() {
        const value = Number(slider.value);
        intensity = value / 100;
        output.value = `${value}%`;
        slider.setAttribute('aria-valuetext', `${value} percent`);
        slider.style.setProperty('--fill', `${value}%`);
        card.style.setProperty('--intensity', intensity);
        requestFrame();
    }
    slider.addEventListener('input', updateIntensity);
    updateIntensity();

    function resize() {
        if (renderer) renderer.resize();
        requestFrame();
    }
    new ResizeObserver(resize).observe(card);
    window.addEventListener('resize', resize);
    reducedMotion.addEventListener('change', requestFrame);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(frame);
            frame = null;
            previousTime = 0;
        } else requestFrame();
    });
    window.addEventListener('pagehide', () => {
        cancelAnimationFrame(frame);
        frame = null;
        previousTime = 0;
    });
    window.addEventListener('pageshow', requestFrame);

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false });
    if (!gl) return;

    const image = new Image();
    function initialize() {
        try {
            renderer = createRenderer(gl, image);
            resize();
        } catch (error) {
            renderer = null;
            card.classList.remove('is-ready');
            console.warn('Using the CSS marble lighting fallback.', error.message);
        }
    }
    image.onload = initialize;
    image.src = textureURL.href;

    canvas.addEventListener('webglcontextlost', event => {
        event.preventDefault();
        renderer = null;
        card.classList.remove('is-ready');
    });
    canvas.addEventListener('webglcontextrestored', () => {
        if (image.complete && image.naturalWidth) initialize();
    });
})();
