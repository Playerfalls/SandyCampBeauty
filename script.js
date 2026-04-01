/* ============================================
   SANDY CAMPBELL — LUXURY EDITION · SCRIPT.JS
   ============================================ */

/* ============================================
   ⚙️  CONFIGURAÇÕES EDITÁVEIS
   ============================================ */
const CONFIG = {
  // NÚMERO DO WHATSAPP — apenas dígitos (55 + DDD + número)
  whatsapp: '5524981282793',

  // Nome da profissional (usado na mensagem)
  nomeProfissional: 'Sandy Campbell',

  // Intervalo entre horários (em minutos)
  intervaloMinutos: 60,

  // Horários por dia (0=Dom, 1=Seg, ..., 6=Sáb)
  // null = fechado | {inicio, fim} = aberto (formato 24h)
  horarios: {
    0: null,
    1: { inicio: 7,  fim: 16 },
    2: { inicio: 7,  fim: 19 },
    3: { inicio: 7,  fim: 19 },
    4: { inicio: 7,  fim: 19 },
    5: { inicio: 7,  fim: 19 },
    6: { inicio: 13, fim: 18 },
  },
};

/* ============================================
   LOADER — carregamento simulado com progresso
   ============================================ */

/* ============================================
   CURSOR PERSONALIZADO
   ============================================ */

/* ============================================
   NAVBAR
   ============================================ */
function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const burger  = document.getElementById('hamburger');
  const overlay = document.getElementById('mobileOverlay');
  if (!navbar) return;

  // Scroll: adiciona .scrolled
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Mobile menu
  if (burger && overlay) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      overlay.classList.toggle('open');
      document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
    });

    // Fecha ao clicar nos links
    overlay.querySelectorAll('.mob-link').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Atualiza links de WhatsApp
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.href = `https://wa.me/${CONFIG.whatsapp}`;
  });
}

/* ============================================
   SCROLL REVEAL
   ============================================ */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el  = entry.target;
        const delay = el.dataset.delay || (i * 80);
        setTimeout(() => el.classList.add('visible'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-scale').forEach((el, i) => {
    el.dataset.delay = el.dataset.delay || (i % 4) * 80;
    observer.observe(el);
  });
}

/* ============================================
   ROLETA DE DEPOIMENTOS
   Um card por vez — fade + slide vertical.
   ============================================ */
function initCarousel() {
  const roleta  = document.getElementById('depRoleta');
  const prev    = document.getElementById('depPrev');
  const next    = document.getElementById('depNext');
  const dotsEl  = document.getElementById('depDots');
  const fillEl  = document.getElementById('depProgressFill');
  if (!roleta) return;

  const items   = roleta.querySelectorAll('.dep-item');
  const total   = items.length;
  const DELAY   = 5000;
  const FPS     = 30;

  let current   = 0;
  let direction = 'forward';
  let timer     = null;
  let progTimer = null;
  let progVal   = 0;

  /* Cria dots */
  items.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'dep-dot' + (i === 0 ? ' active' : '');
    btn.setAttribute('aria-label', `Depoimento ${i + 1}`);
    btn.addEventListener('click', () => { direction = i > current ? 'forward' : 'back'; goTo(i); });
    dotsEl.appendChild(btn);
  });

  function goTo(n) {
    if (n === current) return;
    const exitClass = direction === 'forward' ? 'dep-exit-up' : 'dep-exit-down';
    const outgoing  = items[current];
    const incoming  = items[((n % total) + total) % total];

    outgoing.classList.remove('dep-active');
    outgoing.classList.add(exitClass);
    requestAnimationFrame(() => requestAnimationFrame(() => incoming.classList.add('dep-active')));
    setTimeout(() => outgoing.classList.remove(exitClass), 500);

    current = ((n % total) + total) % total;
    dotsEl.querySelectorAll('.dep-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    resetProgress();
  }

  function goNext() { direction = 'forward'; goTo(current + 1); }
  function goPrev() { direction = 'back';    goTo(current - 1); }

  function resetProgress() {
    clearInterval(progTimer); clearTimeout(timer);
    progVal = 0;
    if (fillEl) fillEl.style.width = '0%';
    const step = 100 / (DELAY / (1000 / FPS));
    progTimer = setInterval(() => {
      progVal = Math.min(progVal + step, 100);
      if (fillEl) fillEl.style.width = progVal + '%';
    }, 1000 / FPS);
    timer = setTimeout(() => { direction = 'forward'; goTo(current + 1); }, DELAY);
  }

  prev && prev.addEventListener('click', goPrev);
  next && next.addEventListener('click', goNext);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft')  goPrev();
  });

  let touchX = 0;
  roleta.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  roleta.addEventListener('touchend',   (e) => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) { diff > 0 ? goNext() : goPrev(); }
  });

  roleta.addEventListener('mouseenter', () => { clearTimeout(timer); clearInterval(progTimer); });
  roleta.addEventListener('mouseleave', resetProgress);

  resetProgress();
}

/* ============================================
   CARROSSEL DE SERVIÇOS
   Desliza os 9 artigos horizontalmente.
   ============================================ */

/* ============================================
   DATE PICKER — horários válidos por dia
   ============================================ */
function initDatePicker() {
  const inputData    = document.getElementById('data');
  const selectHorario = document.getElementById('horario');
  if (!inputData || !selectHorario) return;

  // Datas mín/máx
  const hoje = new Date();
  const toISO = (d) => d.toISOString().split('T')[0];
  inputData.min = toISO(hoje);
  const max = new Date(hoje); max.setMonth(max.getMonth() + 3);
  inputData.max = toISO(max);

  inputData.addEventListener('change', () => {
    const [y, m, d] = inputData.value.split('-').map(Number);
    const sel = new Date(y, m - 1, d);
    preencherHorarios(sel.getDay(), sel, selectHorario);
  });
}

function preencherHorarios(diaSemana, dataSel, sel) {
  sel.innerHTML = '<option value="" disabled selected></option>';
  const cfg = CONFIG.horarios[diaSemana];

  if (!cfg) {
    const opt = new Option('Fechado neste dia', '', false, false);
    opt.disabled = true;
    sel.appendChild(opt);
    return;
  }

  const agora  = new Date();
  const ehHoje = dataSel.toDateString() === agora.toDateString();
  const step   = CONFIG.intervaloMinutos;
  let count    = 0;

  for (let h = cfg.inicio; h < cfg.fim; h++) {
    for (let m = 0; m < 60; m += step) {
      if (ehHoje) {
        const slot = new Date(dataSel);
        slot.setHours(h, m, 0, 0);
        if (slot <= agora) continue;
      }
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      sel.appendChild(new Option(`${hh}:${mm}`, `${hh}:${mm}`));
      count++;
    }
  }

  if (count === 0) {
    const opt = new Option('Sem horários disponíveis', '', false, false);
    opt.disabled = true;
    sel.appendChild(opt);
  }
}

/* ============================================
   FORMULÁRIO DE AGENDAMENTO
   ============================================ */
function initForm() {
  const form = document.getElementById('agendamentoForm');
  if (!form) return;

  // Máscara de telefone
  const telInput = document.getElementById('telefone');
  if (telInput) {
    telInput.addEventListener('input', () => {
      let v = telInput.value.replace(/\D/g, '').substring(0, 11);
      if      (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
      else if (v.length > 6)  v = v.replace(/^(\d{2})(\d{4})(\d*)$/, '($1) $2-$3');
      else if (v.length > 2)  v = v.replace(/^(\d{2})(\d*)$/, '($1) $2');
      else if (v.length > 0)  v = `(${v}`;
      telInput.value = v;
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validarForm()) return;

    const nome    = document.getElementById('nome').value.trim();
    const tel     = document.getElementById('telefone').value.trim();
    const servico = document.getElementById('servico').value;
    const data    = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;
    const obs     = document.getElementById('obs').value.trim();

    const [y, m, d] = data.split('-');
    const dataFmt   = `${d}/${m}/${y}`;

    let msg = `Olá, ${CONFIG.nomeProfissional}! Gostaria de agendar.\n\n`;
    msg += `*Nome:* ${nome}\n`;
    msg += `*Telefone:* ${tel}\n`;
    msg += `*Serviço:* ${servico}\n`;
    msg += `*Data:* ${dataFmt}\n`;
    msg += `*Horário:* ${horario}h\n`;
    if (obs) msg += `*Obs:* ${obs}\n`;
    msg += `\nAguardo confirmação! 🌸`;

    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
}

function validarForm() {
  let ok = true;

  const campos = [
    { id: 'nome',     erro: 'erroNome',     test: (v) => v.trim().length >= 2,   msg: 'Informe seu nome completo.' },
    { id: 'telefone', erro: 'erroTelefone', test: (v) => v.replace(/\D/g,'').length >= 10, msg: 'Informe um telefone válido (com DDD).' },
    { id: 'servico',  erro: 'erroServico',  test: (v) => v !== '',               msg: 'Selecione um serviço.' },
    { id: 'data',     erro: 'erroData',     test: validarData,                   msg: 'Selecione uma data válida.' },
    { id: 'horario',  erro: 'erroHorario',  test: (v) => v !== '',               msg: 'Selecione um horário.' },
  ];

  campos.forEach(({ id, erro, test, msg }) => {
    const campo   = document.getElementById(id);
    const spanErr = document.getElementById(erro);
    if (!campo) return;

    if (!test(campo.value)) {
      campo.classList.add('error');
      if (spanErr) spanErr.textContent = msg;
      ok = false;
    } else {
      campo.classList.remove('error');
      if (spanErr) spanErr.textContent = '';
    }
  });

  return ok;
}

function validarData(val) {
  if (!val) return false;
  const [y, m, d] = val.split('-').map(Number);
  const diaSemana = new Date(y, m - 1, d).getDay();
  return !!CONFIG.horarios[diaSemana];
}

/* ============================================
   PARALLAX SUTIL NO HERO (desktop only)
   ============================================ */
function initParallax() {
  if (window.innerWidth <= 768) return;
  const heroImg = document.querySelector('.hero-img');
  if (!heroImg) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroImg.style.transform = `scale(1) translateY(${y * 0.25}px)`;
    }
  }, { passive: true });
}

/* ============================================
   INICIALIZAÇÃO PRINCIPAL
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initCarousel();
  initDatePicker();
  initForm();
  initParallax();
});
