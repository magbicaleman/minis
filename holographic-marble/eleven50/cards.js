(() => {
    'use strict';
    const card = document.querySelector('.tilt-card');
    const stage = document.querySelector('.card-stage');
    const slider = document.querySelector('#foil');
    const flipButton = document.querySelector('#flip');
    const collectButton = document.querySelector('#collect');
    const motionButton = document.querySelector('#motion');
    const feedback = document.querySelector('.feedback');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const editions = {
        forest: {
            name: 'Forest foil', number: '01', kicker: 'An object of distinction', title: 'Eleven<span>50</span>',
            category: 'Collector’s study', description: 'Deep evergreen, fine contour engraving, and a quiet flash of champagne foil.',
            backKicker: 'A closer look', backTitle: 'Small details.<br><em>Considered.</em>',
            backDescription: 'A spring-loaded, retractable pick. A magnetic hold. The Eleven50 in green.'
        },
        ivory: {
            name: 'The invitation', number: '02', kicker: 'An invitation to', title: 'Eleven<span>50</span>',
            category: 'Coupon concept', description: 'Warm paper, olive ink, and brushed gold. An invitation with something to turn over.',
            backKicker: 'A coupon concept', backTitle: 'A little<br><em>possibility.</em>',
            backDescription: 'A place for a future Eleven50 offer. This preview code demonstrates the experience; it has no redemption value.'
        },
        nocturne: {
            name: 'Nocturne', number: '03', kicker: 'The holographic edition', title: 'Eleven<span>50</span>',
            category: 'Holographic study', description: 'Obsidian, oversized lettering, and a shifting spectrum. A more expressive collectible.',
            backKicker: 'Light, held briefly', backTitle: 'Another<br><em>perspective.</em>',
            backDescription: 'The Eleven50 in green, framed in a changing spectrum. Move the card to explore the finish.'
        }
    };
    const collectionKey = 'minis-eleven50-collection';
    let edition = 'forest';
    let flipped = false;
    let paused = false;
    let interacting = false;
    let activePointer = null;
    let animation = null;
    let lastTime = 0;
    let time = 0;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const clamp = value => Math.max(-1, Math.min(1, value));

    function readCollection() {
        try {
            const result = JSON.parse(localStorage.getItem(collectionKey) || '[]');
            return Array.isArray(result) ? result.filter(item => Object.hasOwn(editions, item)) : [];
        } catch { return []; }
    }

    function updateCollectionButton() {
        const saved = readCollection().includes(edition);
        collectButton.querySelector('span').textContent = edition === 'ivory' ? 'Copy preview code' : saved ? 'Remove from collection' : 'Save to collection';
        if (edition === 'ivory') collectButton.removeAttribute('aria-pressed');
        else collectButton.setAttribute('aria-pressed', String(saved));
    }

    function flip(next = !flipped) {
        flipped = next;
        card.classList.toggle('is-flipped', flipped);
        card.setAttribute('aria-label', `${editions[edition].name} card, ${flipped ? 'back' : 'front'}`);
        flipButton.setAttribute('aria-pressed', String(flipped));
        flipButton.querySelector('span').textContent = flipped ? 'Show front' : 'Turn card over';
        for (const [selector, hidden] of [['.card-front', flipped], ['.card-back', !flipped]]) {
            const face = document.querySelector(selector);
            face.setAttribute('aria-hidden', String(hidden));
            face.inert = hidden;
        }
    }

    function chooseEdition(value, push = false) {
        edition = Object.hasOwn(editions, value) ? value : 'forest';
        const data = editions[edition];
        document.body.dataset.edition = edition;
        document.title = `${data.name} · Eleven50 · Wood & Waters`;
        document.querySelector('#edition-description').textContent = data.description;
        document.querySelector('.front-title .card-kicker').textContent = data.kicker;
        document.querySelector('.front-title h2').innerHTML = data.title;
        document.querySelector('.card-category').textContent = data.category;
        document.querySelectorAll('.design-number').forEach(el => { el.textContent = `No. ${data.number}`; });
        document.querySelector('.back-kicker').textContent = data.backKicker;
        document.querySelector('.back-title').innerHTML = data.backTitle;
        document.querySelector('.back-description').textContent = data.backDescription;
        document.querySelector('.back-edition').textContent = data.name;
        document.querySelector('.coupon-code').hidden = edition !== 'ivory';
        document.querySelectorAll('[data-edition-link]').forEach(link => {
            if (link.dataset.editionLink === edition) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
        feedback.textContent = '';
        updateCollectionButton();
        flip(false);
        if (push) {
            const url = new URL(location.href);
            url.searchParams.set('edition', edition);
            history.pushState({}, '', url);
        }
        requestFrame();
    }

    document.querySelectorAll('[data-edition-link]').forEach(link => {
        link.addEventListener('click', event => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
            event.preventDefault();
            chooseEdition(link.dataset.editionLink, true);
        });
    });
    window.addEventListener('popstate', () => chooseEdition(new URLSearchParams(location.search).get('edition')));
    flipButton.addEventListener('click', () => flip());

    collectButton.addEventListener('click', async () => {
        if (edition === 'ivory') {
            try {
                await navigator.clipboard.writeText('WW-PREVIEW');
                feedback.textContent = 'Preview code copied. No active offer.';
            } catch { feedback.textContent = 'Preview code: WW-PREVIEW. No active offer.'; }
            return;
        }
        const saved = readCollection();
        const exists = saved.includes(edition);
        const updated = exists ? saved.filter(item => item !== edition) : [...saved, edition];
        try {
            localStorage.setItem(collectionKey, JSON.stringify(updated));
            feedback.textContent = exists ? 'Removed from your collection.' : 'Saved to your collection on this device.';
            updateCollectionButton();
        } catch { feedback.textContent = 'Your browser could not save this card. Device storage may be unavailable.'; }
    });
    window.addEventListener('storage', updateCollectionButton);

    function requestFrame() {
        if (animation === null && !document.hidden) animation = requestAnimationFrame(draw);
    }
    function draw(now) {
        animation = null;
        const dt = lastTime ? Math.min((now - lastTime) / 1000, .05) : 1 / 60;
        lastTime = now;
        const automatic = !paused && !reduced.matches;
        if (automatic) time += dt;
        const x = interacting ? target.x : Math.sin(time * .53) * .14;
        const y = interacting ? target.y : Math.cos(time * .42) * .1;
        const easing = reduced.matches ? 1 : 1 - Math.exp(-dt * 13);
        current.x += (x - current.x) * easing;
        current.y += (y - current.y) * easing;
        card.style.setProperty('--rx', `${reduced.matches ? 0 : -current.y * 10}deg`);
        card.style.setProperty('--ry', `${reduced.matches ? 0 : current.x * 13}deg`);
        card.style.setProperty('--mx', `${50 + current.x * 45}%`);
        card.style.setProperty('--my', `${50 + current.y * 45}%`);
        card.style.setProperty('--shine-angle', `${120 + current.x * 50 + current.y * 20}deg`);
        if (automatic || Math.abs(x - current.x) + Math.abs(y - current.y) > .0001) requestFrame();
        else lastTime = 0;
    }

    function pointAt(event) {
        if (activePointer !== null && event.pointerId !== activePointer) return;
        const bounds = stage.getBoundingClientRect();
        const padding = (stage.clientHeight - card.offsetHeight) / 2;
        target.x = clamp((event.clientX - bounds.left) / card.offsetWidth * 2 - 1);
        target.y = clamp((event.clientY - bounds.top - padding) / card.offsetHeight * 2 - 1);
        interacting = true;
        requestFrame();
    }
    function release(event) {
        if (event && activePointer !== null && event.pointerId !== undefined && event.pointerId !== activePointer) return;
        activePointer = null;
        interacting = false;
        target.x = target.y = 0;
        requestFrame();
    }
    card.addEventListener('pointerdown', event => {
        if (activePointer !== null) return;
        activePointer = event.pointerId;
        card.setPointerCapture(event.pointerId);
        card.focus({ preventScroll: true });
        pointAt(event);
    });
    card.addEventListener('pointermove', pointAt);
    card.addEventListener('pointerup', release);
    card.addEventListener('pointercancel', release);
    card.addEventListener('lostpointercapture', release);
    card.addEventListener('pointerleave', event => { if (activePointer === null) release(event); });
    card.addEventListener('blur', release);
    card.addEventListener('keydown', event => {
        const directions = { ArrowLeft: [-.15, 0], ArrowRight: [.15, 0], ArrowUp: [0, -.15], ArrowDown: [0, .15] };
        if (directions[event.key]) {
            event.preventDefault();
            interacting = true;
            target.x = clamp(target.x + directions[event.key][0]);
            target.y = clamp(target.y + directions[event.key][1]);
            requestFrame();
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!event.repeat) flip();
        } else if (event.key === 'Escape') {
            flip(false);
            release();
        }
    });
    slider.addEventListener('input', () => {
        const value = Number(slider.value);
        document.querySelector('#foil-value').value = `${value}%`;
        slider.setAttribute('aria-valuetext', `${value} percent`);
        card.style.setProperty('--foil', value / 100);
    });
    motionButton.addEventListener('click', () => {
        paused = !paused;
        motionButton.setAttribute('aria-pressed', String(paused));
        motionButton.setAttribute('aria-label', paused ? 'Resume idle motion' : 'Pause idle motion');
        motionButton.firstElementChild.textContent = paused ? '▷' : 'Ⅱ';
        feedback.textContent = reduced.matches ? 'Reduced motion is enabled in your device settings.' : `Idle motion ${paused ? 'paused' : 'resumed'}.`;
        requestFrame();
    });
    function stop() { cancelAnimationFrame(animation); animation = null; lastTime = 0; }
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else requestFrame(); });
    window.addEventListener('pagehide', stop);
    window.addEventListener('pageshow', requestFrame);
    reduced.addEventListener('change', requestFrame);
    chooseEdition(new URLSearchParams(location.search).get('edition'));
})();
