/* =========================================================
           CONFIGURACIÓN GENERAL
        ========================================================= */

        document.addEventListener("DOMContentLoaded", () => {

            inicializarPantallaCarga();
            inicializarMenu();
            inicializarNavegacion();
            inicializarSecciones();
            inicializarGaleria();
            inicializarVideos();
            inicializarContador();
            inicializarBotonArriba();
            iniciarHuellas();

        });


        /* =========================================================
           PANTALLA DE CARGA
        ========================================================= */

        function inicializarPantallaCarga() {

            const pantalla = document.getElementById("pantallaCarga");

            window.addEventListener("load", () => {

                setTimeout(() => {

                    pantalla.classList.add("oculta");

                }, 700);

            });

        }


        /* =========================================================
           MENÚ MÓVIL
        ========================================================= */

        function inicializarMenu() {

            const boton = document.getElementById("botonMenu");
            const enlaces = document.getElementById("navEnlaces");

            if (!boton || !enlaces) return;

            boton.addEventListener("click", () => {

                const abierto = enlaces.classList.toggle("abierto");

                boton.setAttribute(
                    "aria-expanded",
                    String(abierto)
                );

                document.body.classList.toggle(
                    "menu-abierto",
                    abierto
                );

                boton.textContent = abierto ? "×" : "☰";

            });

            document.querySelectorAll(".nav-link").forEach(link => {

                link.addEventListener("click", () => {

                    enlaces.classList.remove("abierto");

                    document.body.classList.remove(
                        "menu-abierto"
                    );

                    boton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    boton.textContent = "☰";

                });

            });

        }


        /* =========================================================
           NAVEGACIÓN Y SCROLL
        ========================================================= */

        function inicializarNavegacion() {

            const navegacion =
                document.getElementById("navegacion");

            const enlaces =
                document.querySelectorAll(".nav-link");

            const secciones =
                document.querySelectorAll(
                    "header[id], main section[id]"
                );

            function actualizarNavegacion() {

                const scrollActual =
                    window.scrollY + 180;

                if (window.scrollY > 70) {

                    navegacion.classList.add("compacta");

                } else {

                    navegacion.classList.remove("compacta");

                }

                let actual = "inicio";

                secciones.forEach(seccion => {

                    if (scrollActual >= seccion.offsetTop) {

                        actual = seccion.id;

                    }

                });

                enlaces.forEach(link => {

                    link.classList.remove("activo");

                    if (
                        link.getAttribute("href") ===
                        "#" + actual
                    ) {
                        link.classList.add("activo");
                    }

                });

            }

            window.addEventListener(
                "scroll",
                actualizarNavegacion,
                { passive: true }
            );

            actualizarNavegacion();

        }


        /* =========================================================
           APARICIÓN DE SECCIONES
        ========================================================= */

        function inicializarSecciones() {

            const secciones =
                document.querySelectorAll(".seccion");

            const observer =
                new IntersectionObserver(
                    entries => {

                        entries.forEach(entry => {

                            if (entry.isIntersecting) {

                                entry.target.classList.add(
                                    "visible"
                                );

                                observer.unobserve(
                                    entry.target
                                );

                            }

                        });

                    },
                    {
                        threshold: 0.12
                    }
                );

            secciones.forEach(seccion => {

                observer.observe(seccion);

            });

        }


        /* =========================================================
           GALERÍA / LIGHTBOX
        ========================================================= */

        function inicializarGaleria() {

            const modal =
                document.getElementById("modalImagen");

            const imagenAmpliada =
                document.getElementById("imagenAmpliada");

            const cerrar =
                document.getElementById("cerrarModal");

            const fotos =
                document.querySelectorAll(".foto img");

            fotos.forEach(img => {

                img.addEventListener("click", () => {

                    imagenAmpliada.src = img.src;
                    imagenAmpliada.alt = img.alt;

                    modal.classList.add("abierto");

                    document.body.style.overflow =
                        "hidden";

                });

            });

            function cerrarImagen() {

                modal.classList.remove("abierto");

                document.body.style.overflow = "";

            }

            cerrar.addEventListener(
                "click",
                cerrarImagen
            );

            modal.addEventListener("click", event => {

                if (event.target === modal) {

                    cerrarImagen();

                }

            });

            document.addEventListener("keydown", event => {

                if (
                    event.key === "Escape" &&
                    modal.classList.contains("abierto")
                ) {

                    cerrarImagen();

                }

            });

        }


        /* =========================================================
           CONTROL DE VIDEOS
           Solo permite reproducir un video a la vez.
        ========================================================= */

        function inicializarVideos() {

            const videos =
                document.querySelectorAll("video");

            videos.forEach(video => {

                video.addEventListener("play", () => {

                    videos.forEach(otroVideo => {

                        if (otroVideo !== video) {

                            otroVideo.pause();

                        }

                    });

                });

            });

        }


        /* =========================================================
           CONTADOR DE RECUERDOS
        ========================================================= */

        function inicializarContador() {

            const elemento =
                document.getElementById(
                    "contadorRecuerdos"
                );

            const destino = 6;

            let actual = 0;

            const duracion = 1200;

            const intervalo = 40;

            const paso = destino /
                (duracion / intervalo);

            function contar() {

                actual += paso;

                if (actual >= destino) {

                    elemento.textContent = destino;
                    return;

                }

                elemento.textContent =
                    Math.floor(actual);

                setTimeout(contar, intervalo);

            }

            contar();

        }


        /* =========================================================
           BOTÓN VOLVER ARRIBA
        ========================================================= */

        function inicializarBotonArriba() {

            const boton =
                document.getElementById("btnArriba");

            function actualizar() {

                if (window.scrollY > 500) {

                    boton.classList.add("visible");

                } else {

                    boton.classList.remove("visible");

                }

            }

            window.addEventListener(
                "scroll",
                actualizar,
                { passive: true }
            );

            boton.addEventListener("click", () => {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            });

            actualizar();

        }


        /* =========================================================
           GENERADOR DE HUELLITAS
        ========================================================= */

        function iniciarHuellas() {

            const contenedor =
                document.getElementById(
                    "contenedorHuellas"
                );

            const reducirMovimiento =
                window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches;

            if (reducirMovimiento) return;

            function crearHuella() {

                const huella =
                    document.createElement("div");

                huella.className = "huella";
                huella.textContent = "🐾";

                const izquierda =
                    Math.random() * 100;

                const duracion =
                    8 + Math.random() * 10;

                const retraso =
                    Math.random() * 2;

                huella.style.left =
                    izquierda + "%";

                huella.style.bottom =
                    "-50px";

                huella.style.animationDuration =
                    duracion + "s";

                huella.style.animationDelay =
                    retraso + "s";

                huella.style.fontSize =
                    (0.8 + Math.random() * 1.2) + "rem";

                contenedor.appendChild(huella);

                setTimeout(() => {

                    huella.remove();

                }, (duracion + retraso + 1) * 1000);

            }

            setInterval(crearHuella, 1800);

            for (let i = 0; i < 5; i++) {

                crearHuella();

            }

        }


        /* =========================================================
           PREVENCIÓN DE ERRORES VISUALES EN IMÁGENES
        ========================================================= */

        document.querySelectorAll("img").forEach(img => {

            img.addEventListener("error", () => {

                img.style.objectFit = "contain";
                img.style.padding = "30px";

                img.alt =
                    "Imagen pendiente de agregar";

            });

        });