(() => {
  "use strict";

  /* Pega aquí tu Access Key de Web3Forms.
     El Access Key es el que vincula los formularios con tu correo. */
  window.HUELLITAS_WEB3FORMS_KEY = "c5a8284f-b10a-435b-a254-2a8ccc3dbe83";

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const isRealKey = () => {
    const key = String(window.HUELLITAS_WEB3FORMS_KEY || "").trim();
    return key.length > 20 && !key.includes("PON_AQUI") && !key.includes("YOUR_ACCESS");
  };

  function toast(message, kind="info") {
    let stack = $(".he-toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "he-toast-stack";
      stack.style.cssText = "position:fixed;right:18px;top:88px;z-index:950;display:grid;gap:10px;width:min(380px,calc(100vw - 36px))";
      document.body.appendChild(stack);
    }
    const item = document.createElement("div");
    item.textContent = message;
    item.style.cssText = "padding:13px 15px;border:1px solid var(--line);border-radius:14px;background:var(--surface-solid);color:var(--text);box-shadow:var(--shadow);font-weight:750";
    if (kind === "success") item.style.borderColor = "#4e9b7b55";
    if (kind === "error") item.style.borderColor = "#bd5d7255";
    stack.appendChild(item);
    setTimeout(() => item.remove(), 4200);
  }
  window.heToast = window.heToast || toast;

  function ensureStatus(form) {
    let status = $(".he-form-status", form.parentElement || form);
    if (!status) {
      status = document.createElement("div");
      status.className = "he-form-status";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      form.appendChild(status);
    }
    return status;
  }

  function setStatus(form, message, type="loading") {
    const status = ensureStatus(form);
    status.className = `he-form-status show ${type}`;
    status.textContent = message;
  }

  function hidden(form, name, value) {
    let el = form.querySelector(`input[name="${name}"]`);
    if (!el) { el = document.createElement("input"); el.type="hidden"; el.name=name; form.appendChild(el); }
    el.value = value;
    return el;
  }

  function fieldValue(form, selectors) {
    for (const sel of selectors) {
      const el = form.querySelector(sel);
      if (el && String(el.value || "").trim()) return String(el.value).trim();
    }
    return "";
  }

  async function submitWeb3Form(form) {
    if (!isRealKey()) {
      setStatus(form, "El formulario ya está preparado, pero falta colocar el Access Key de Web3Forms en assets/js/mejoras.js.", "error");
      toast("Falta configurar la Access Key de Web3Forms.", "error");
      return;
    }

    if (!form.reportValidity()) return;
    const submit = form.querySelector('button[type="submit"],input[type="submit"]');
    const original = submit?.textContent || submit?.value || "Enviar";
    if (submit) { submit.disabled = true; submit.textContent = "Enviando…"; }
    setStatus(form, "Enviando tu mensaje…", "loading");

    hidden(form, "access_key", window.HUELLITAS_WEB3FORMS_KEY);
    hidden(form, "botcheck", "");
    if (!form.querySelector('input[name="subject"]')) {
      hidden(form, "subject", form.id === "customForm" ? "Nueva personalización — Huellitas Eternas" : "Nuevo mensaje de contacto — Huellitas Eternas");
    }
    if (!form.querySelector('input[name="from_name"]')) hidden(form, "from_name", fieldValue(form,["[name='name']","#contactName"]) || "Visitante de Huellitas Eternas");
    if (!form.querySelector('input[name="page_source"]')) hidden(form, "page_source", location.pathname);

    const data = Object.fromEntries(new FormData(form).entries());
    delete data.botcheck;

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.success !== false) {
        setStatus(form, result.message || "¡Listo! Tu mensaje fue enviado correctamente.", "success");
        toast("Mensaje enviado correctamente ✓", "success");
        form.reset();
        form.querySelectorAll("[aria-invalid='true']").forEach(el => el.removeAttribute("aria-invalid"));
        window.dispatchEvent(new CustomEvent("huellitas:form-sent", { detail: { form: form.id } }));
      } else {
        throw new Error(result.message || "No fue posible enviar el formulario.");
      }
    } catch (error) {
      setStatus(form, "No pudimos enviar el mensaje. Revisa tu conexión.", "error");
      toast("No se pudo enviar el formulario.", "error");
      console.error("Web3Forms:", error);
    } finally {
      if (submit) { submit.disabled = false; submit.textContent = original; }
    }
  }

  function upgradeForms() {
    $$('form[data-web3forms], #contactForm, #customForm').forEach(form => {
      if (form.dataset.web3Bound === "1") return;
      form.dataset.web3Bound = "1";
      form.setAttribute("novalidate", "false");
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        await submitWeb3Form(form);
      });
    });
  }

  function addFormDetails() {
    const contact = $("#contactForm");
    if (contact && !$(".he-privacy-check", contact)) {
      const wrap = document.createElement("label");
      wrap.className = "he-privacy-check";
      wrap.innerHTML = `<input type="checkbox" required name="privacy_consent" value="Sí"><span>Acepto que Huellitas Eternas use estos datos únicamente para responder a mi solicitud. Revisa la <a href="politica-privacidad.html">política de privacidad</a>.</span>`;
      contact.insertBefore(wrap, contact.querySelector('button[type="submit"]'));
    }
    const custom = $("#customForm");
    if (custom && !$(".he-privacy-check", custom)) {
      const wrap = document.createElement("label");
      wrap.className = "he-privacy-check";
      wrap.innerHTML = `<input type="checkbox" required name="privacy_consent" value="Sí"><span>Acepto que estos datos se utilicen para revisar mi propuesta de personalización.</span>`;
      custom.insertBefore(wrap, custom.querySelector('button[type="submit"]'));
    }
  }

  function rememberDrafts() {
    const forms = [$("#contactForm"), $("#customForm")].filter(Boolean);
    forms.forEach(form => {
      const key = `he-draft-${form.id}`;
      try {
        const saved = JSON.parse(localStorage.getItem(key) || "null");
        if (saved && !form.dataset.noDraft) Object.entries(saved).forEach(([name,value]) => { const el=form.elements.namedItem(name); if(el && typeof value === "string" && !el.value) el.value=value; });
        form.addEventListener("input", () => {
          const data = {};
          [...form.elements].forEach(el => { if (el.name && ["text","email","textarea","select-one"].includes(el.type || el.tagName.toLowerCase())) data[el.name]=el.value; });
          localStorage.setItem(key, JSON.stringify(data));
        });
        window.addEventListener("huellitas:form-sent", e => { if (e.detail.form === form.id) localStorage.removeItem(key); });
      } catch (_) {}
    });
  }

  function pageUtilities() {
    document.body.classList.add("he-ready");
    const offline = document.createElement("div");
    offline.className = "he-offline";
    offline.textContent = "Sin conexión. Algunas funciones pueden esperar a recuperar internet.";
    document.body.appendChild(offline);
    const updateNetwork = () => offline.classList.toggle("show", !navigator.onLine);
    window.addEventListener("offline", updateNetwork);
    window.addEventListener("online", () => { updateNetwork(); toast("Conexión recuperada ✓", "success"); });
    updateNetwork();

    // Marca automáticamente el enlace de navegación actual.
    const current = location.pathname.split("/").pop() || "home.html";
    $$('nav.nav a').forEach(a => {
      const href = (a.getAttribute("href") || "").split("#")[0].split("/").pop();
      if (href === current) a.classList.add("active");
    });

    // Escape abre/solicita menos sorpresas: cierra menú y modales externos si existen.
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        $(".nav.open")?.classList.remove("open");
        $(".he-modal.show")?.classList.remove("show");
      }
    });
  }

  function loader() {
    const bar = $("#loadBar");
    const status = $("#loadStatus");
    const skip = $("#skipLoad");
    if (!bar || !status) return;
    const tips = [
      "Tus recuerdos merecen un espacio bonito, seguro y cercano.",
      "Una fotografía puede convertirse en una historia.",
      "Una huellita también puede vivir para siempre.",
      "Casi listo… abrimos la puerta a tus recuerdos."
    ];
    const messages = ["Preparando tu experiencia…","Cuidando cada detalle…","Organizando tus recuerdos…","Casi listo…"];
    const target = "pages/home.html";
    let done = false;
    const started = performance.now();
    const duration = reduce ? 400 : 3600;
    const go = () => { if(done)return; done=true; location.replace(target); };
    skip?.addEventListener("click", go);
    window.addEventListener("keydown", e => { if(["Enter"," ","Escape"].includes(e.key)){e.preventDefault();go();} }, {once:false});
    const tick = now => {
      const p=Math.min(1,(now-started)/duration), eased=1-Math.pow(1-p,3);
      bar.style.width=`${(eased*100).toFixed(1)}%`;
      const i=Math.min(messages.length-1,Math.floor(p*messages.length));
      status.textContent=messages[i];
      const tip=$("#loaderTip"); if(tip) tip.textContent=tips[i];
      if(p<1) requestAnimationFrame(tick); else go();
    };
    requestAnimationFrame(tick);
  }


  function globalEnhancements() {
    document.querySelectorAll("img:not([loading]), iframe:not([loading])").forEach(el => el.setAttribute("loading", "lazy"));
    document.querySelectorAll("img").forEach(img => { if (!img.decoding) img.decoding = "async"; });
    document.querySelectorAll('a[href^="http"]:not([href*="huellitas-eternas.com.pe"])').forEach(a => {
      a.target = "_blank";
      const rel = new Set((a.getAttribute("rel") || "").split(" ").filter(Boolean));
      rel.add("noopener"); rel.add("noreferrer"); a.setAttribute("rel", [...rel].join(" "));
    });
    document.querySelectorAll('[data-copy-link]').forEach(btn => btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(location.href); toast("Enlace copiado ✓", "success"); }
      catch { toast("No se pudo copiar el enlace automáticamente.", "error"); }
    }));
    document.querySelectorAll('[data-print]').forEach(btn => btn.addEventListener('click', () => window.print()));
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('invalid', () => { const bad=form.querySelector(':invalid'); if(bad) bad.setAttribute('aria-invalid','true'); }, true);
      form.querySelectorAll('input,select,textarea').forEach(field => field.addEventListener('input',()=>field.removeAttribute('aria-invalid'),{passive:true}));
    });
    document.querySelectorAll('#year').forEach(el => el.textContent = new Date().getFullYear());
  }

  loader();
  pageUtilities();
  addFormDetails();
  upgradeForms();
  rememberDrafts();
  globalEnhancements();
})();
