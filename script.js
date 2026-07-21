/* ============================================
   1. Barra de progresso de scroll
   ============================================ */
const scrollProgress = document.getElementById('scroll-progress');
function updateScrollProgress(){
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = pct + '%';
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

/* ============================================
   2. Reveal on scroll (IntersectionObserver)
   ============================================ */
const revealEls = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      const delay = entry.target.dataset.revealDelay || 0;
      setTimeout(() => entry.target.classList.add('is-visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

/* ============================================
   3. Efeito terminal (texto digitado) no hero
   ============================================ */
const terminalText = document.getElementById('terminal-text');
const terminalPhrase = 'iniciando diagnóstico em Rio de Janeiro, RJ';
let terminalIndex = 0;
function typeTerminal(){
  if(!terminalText) return;
  if(terminalIndex <= terminalPhrase.length){
    terminalText.textContent = terminalPhrase.slice(0, terminalIndex);
    terminalIndex++;
    setTimeout(typeTerminal, 38);
  }
}
typeTerminal();

/* ============================================
   4. Grid de fundo animada no hero (canvas)
   ============================================ */
const canvas = document.getElementById('grid-canvas');
if(canvas){
  const ctx = canvas.getContext('2d');
  const hero = canvas.closest('.hero');
  let w, h;
  const cell = 42;
  let t = 0;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
    w = canvas.width = hero.offsetWidth;
    h = canvas.height = hero.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function drawGrid(){
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(42,171,226,0.14)';
    ctx.lineWidth = 1;

    for(let x = 0; x < w + cell; x += cell){
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for(let y = 0; y < h + cell; y += cell){
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    /* pontos de "pulso" na grade, lembrando pontos de rede/circuito */
    const pulseCount = 6;
    for(let i = 0; i < pulseCount; i++){
      const px = ((Math.sin(t * 0.3 + i * 2.1) + 1) / 2) * w;
      const py = ((Math.cos(t * 0.22 + i * 1.7) + 1) / 2) * h;
      const alpha = (Math.sin(t + i) + 1) / 2 * 0.5;
      ctx.fillStyle = `rgba(255,204,0,${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    t += 0.01;
    if(!prefersReducedMotion){
      requestAnimationFrame(drawGrid);
    }
  }
  drawGrid();
}

/* ============================================
   5. Mostrar CTA fixo no mobile após rolar
   ============================================ */
const stickyCta = document.querySelector('.sticky-cta');
if(stickyCta){
  function toggleStickyCta(){
    if(window.scrollY > 400){
      stickyCta.classList.add('is-visible');
    } else {
      stickyCta.classList.remove('is-visible');
    }
  }
  window.addEventListener('scroll', toggleStickyCta, { passive: true });
  toggleStickyCta();
}

/* ============================================
   6. Validação e envio do formulário de contato
   ============================================ */
const form = document.getElementById('contact-form');
const msg = document.getElementById('form-msg');

function validatePhone(v){
  const digits = v.replace(/\D/g, '');
  return digits.length >= 10;
}

if(form){
  form.addEventListener('submit', function(e){
    e.preventDefault();
    let valid = true;

    const nomeField = form.querySelector('[data-field="nome"]');
    const nome = document.getElementById('nome').value.trim();
    nomeField.classList.toggle('error', nome.length < 2);
    if(nome.length < 2) valid = false;

    const telField = form.querySelector('[data-field="telefone"]');
    const telefone = document.getElementById('telefone').value.trim();
    telField.classList.toggle('error', !validatePhone(telefone));
    if(!validatePhone(telefone)) valid = false;

    const servField = form.querySelector('[data-field="servico"]');
    const servico = document.getElementById('servico').value;
    servField.classList.toggle('error', servico === '');
    if(servico === '') valid = false;

    const msgField = form.querySelector('[data-field="mensagem"]');
    const mensagem = document.getElementById('mensagem').value.trim();
    msgField.classList.toggle('error', mensagem.length < 5);
    if(mensagem.length < 5) valid = false;

    if(!valid){
      msg.classList.remove('ok');
      msg.style.display = 'none';
      return;
    }

    /* AQUI: envie os dados para seu backend, planilha (Google Sheets),
       ou dispare direto para o WhatsApp com os dados preenchidos. */
    const texto = encodeURIComponent(
      `Olá! Meu nome é ${nome}.\nServiço: ${servico}\nProblema: ${mensagem}\nMeu telefone: ${telefone}`
    );
    msg.classList.add('ok');
    msg.style.display = 'block';
    form.reset();

    window.open(`https://wa.me/5521988765586?text=${texto}`, '_blank');
  });
}
