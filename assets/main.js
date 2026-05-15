/* ============================================
   ICEDRY.CO.UK — Main JavaScript
   Version: 2.0
   ============================================ */

// ─── CONFIGURATION ──────────────────────────────────────────────────────────
// To enable AI chat, add your Anthropic API key below OR set up a backend proxy
// See README.md for full setup instructions
const CONFIG = {
  ANTHROPIC_API_KEY: '',      // For demo/internal use only
  API_ENDPOINT: '',           // Your backend proxy e.g. '/.netlify/functions/ask'
  USE_DIRECT_API: true,
};

const SYSTEM_PROMPT = `You are the IceDry AI assistant — a knowledgeable, professional specialist in dry ice blasting and CO₂ cleaning services. You work for IceDry, a division of Sentrex Services UK Ltd, based in Manchester and operating UK-wide.

Your role is to:
- Answer questions about dry ice blasting honestly and accurately
- Help users assess whether dry ice blasting is suitable for their application
- Explain the science, process, benefits and limitations clearly
- Provide guidance on safety considerations (always recommend professional assessment for critical applications)
- Share information about IceDry's services, areas covered, and process
- Guide interested customers toward requesting a quote or site survey

Key facts about IceDry:
- Based in Manchester, North West England
- Covers: Manchester, Cheshire, Lancashire, Yorkshire, Midlands, Merseyside, London, and UK-wide
- Services: dry ice blasting, CO₂ cleaning, in-place machinery cleaning, electrical switchgear cleaning, food production cleaning, heritage restoration, fire/smoke damage restoration
- Out-of-hours and weekend service available
- Part of Sentrex Services UK Ltd (sentrex.co.uk)
- Email: info@icedry.co.uk | Phone: 0800 XXX XXXX

Key technical facts:
- CO₂ pellets operate at approximately −78°C
- Process: kinetic impact + thermal shock + sublimation
- No blast media residue — CO₂ converts to gas
- No water, no added chemicals
- Non-conductive — suitable for electrical equipment when properly isolated and de-energised
- Safe for food environments (no chemical additives)
- Can often clean in-place without dismantling
- CO₂ used is typically reclaimed from industrial processes

Always be helpful, accurate, and honest about limitations. If something requires a professional assessment, say so clearly and encourage them to contact IceDry. Keep responses concise but thorough. Use **bold** for key points. Do not make up facts or invent specific pricing — for quotes, always direct them to contact IceDry directly.`;

let chatHistory = [];

// ─── DOM READY ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  initParticles();
  initScrollEffects();
  initNavScroll();
});

// ─── PARTICLES ───────────────────────────────────────────────────────────────
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 35; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const x = Math.random() * 100, y = Math.random() * 100;
    p.style.cssText = `left:${x}%;top:${y}%;width:${Math.random()*2+1}px;height:${Math.random()*2+1}px;--dx:${(Math.random()-.5)*300}px;--dy:-${Math.random()*250+80}px;animation-duration:${Math.random()*6+5}s;animation-delay:${Math.random()*12}s`;
    container.appendChild(p);
  }
}

// ─── SCROLL FADE ─────────────────────────────────────────────────────────────
function initScrollEffects() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ─── NAV SCROLL ──────────────────────────────────────────────────────────────
function initNavScroll() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const answer = btn.nextElementSibling;
  const isOpen = item.classList.toggle('active');
  answer.classList.toggle('open', isOpen);
  btn.setAttribute('aria-expanded', isOpen);
}

// ─── CHAT ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('chat-input');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) sendMessage();
    });
  }
});

function sendQuick(text) {
  const input = document.getElementById('chat-input');
  if (input) { input.value = text; sendMessage(); }
}

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatReply(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

function scrollChat() {
  const msgs = document.getElementById('chat-messages');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const msgs = document.getElementById('chat-messages');
  const fallback = document.getElementById('chat-fallback');
  const sendBtn = document.getElementById('chat-send-btn');
  if (!input || !msgs) return;

  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  if (sendBtn) sendBtn.disabled = true;
  if (fallback) fallback.style.display = 'none';

  msgs.innerHTML += `<div class="msg user"><div class="msg-avatar user" aria-hidden="true">You</div><div class="msg-bubble">${esc(text)}</div></div>`;
  scrollChat();

  const tid = 'typing_' + Date.now();
  msgs.innerHTML += `<div class="msg ai" id="${tid}"><div class="msg-avatar ai" aria-hidden="true">AI</div><div class="typing-indicator" aria-label="AI is typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
  scrollChat();

  chatHistory.push({ role: 'user', content: text });

  try {
    let reply;

    if (CONFIG.API_ENDPOINT) {
      const res = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, history: chatHistory })
      });
      if (!res.ok) throw new Error('proxy_error');
      const data = await res.json();
      reply = data.answer || data.content || data.response || 'No response received.';

    } else if (CONFIG.ANTHROPIC_API_KEY && CONFIG.USE_DIRECT_API) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CONFIG.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          system: SYSTEM_PROMPT,
          messages: chatHistory
        })
      });
      if (!res.ok) throw new Error('api_error');
      const data = await res.json();
      reply = data.content?.[0]?.text || 'No response received.';

    } else {
      const notice = document.getElementById('api-notice');
      if (notice) notice.style.display = 'block';
      document.getElementById(tid)?.remove();
      if (sendBtn) sendBtn.disabled = false;
      chatHistory.pop();
      return;
    }

    chatHistory.push({ role: 'assistant', content: reply });
    document.getElementById(tid)?.remove();
    const fmt = formatReply(reply);
    msgs.innerHTML += `<div class="msg ai"><div class="msg-avatar ai" aria-hidden="true">AI</div><div class="msg-bubble"><p>${fmt}</p></div></div><div class="ai-cta-inline">Want a quote? <a href="#contact">Contact our team →</a></div>`;

  } catch(err) {
    chatHistory.pop();
    document.getElementById(tid)?.remove();
    if (fallback) fallback.style.display = 'block';
    console.error('Chat error:', err);
  }

  scrollChat();
  if (sendBtn) sendBtn.disabled = false;
  input.focus();
}

// ─── CONTACT FORM ────────────────────────────────────────────────────────────
function handleFormSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (form) form.style.display = 'none';
  if (success) { success.style.display = 'block'; success.focus(); }
}
