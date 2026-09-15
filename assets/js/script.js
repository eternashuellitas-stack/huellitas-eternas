(() => {
            "use strict";
            const bar = document.getElementById("loadBar"),
                status = document.getElementById("loadStatus"),
                skip = document.getElementById("skipLoad");
            const messages = [
                "Preparando tu experiencia…",
                "Cuidando cada detalle…",
                "Preparando tu espacio…",
                "Casi listo…",
            ];
            const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
            let finished = false,
                start = performance.now(),
                duration = 4800;
            function go() {
                if (finished) return;
                finished = true;
                location.replace("pages/home.html");
            }
            function tick(now) {
                const p = Math.min(1, (now - start) / duration);
                const eased = 1 - Math.pow(1 - p, 3);
                if (bar) bar.style.width = (eased * 100).toFixed(1) + "%";
                if (status)
                    status.textContent =
                        messages[
                        Math.min(messages.length - 1, Math.floor(p * messages.length))
                        ];
                if (p < 1) requestAnimationFrame(tick);
                else go();
            }
            skip?.addEventListener("click", go);
            window.addEventListener(
                "keydown",
                (e) => {
                    if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
                        e.preventDefault();
                        go();
                    }
                },
                { once: false },
            );
            window.addEventListener(
                "pageshow",
                () => {
                    start = performance.now();
                    requestAnimationFrame(tick);
                },
                { once: true },
            );
        })();