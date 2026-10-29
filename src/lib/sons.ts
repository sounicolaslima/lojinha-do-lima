// Sons gerados pelo próprio navegador (Web Audio) — não precisa de arquivo .mp3.
// Navegadores só liberam áudio depois de um toque/clique do usuário,
// por isso existe a função desbloquearAudio().

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

/** Chame dentro de um clique/toque para liberar o áudio da página. */
export function desbloquearAudio() {
  const c = getCtx();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
  // "Acorda" a voz também (necessário no iOS)
  try {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  } catch {}
}

function nota(
  c: AudioContext,
  freq: number,
  inicio: number,
  duracao: number,
  volume = 0.25,
  tipo: OscillatorType = 'sine'
) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = tipo;
  osc.frequency.value = freq;
  const t0 = c.currentTime + inicio;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duracao);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duracao + 0.05);
}

/** Som alegre de "compra feita" para quem está comprando. */
export function somSucesso() {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  // Do - Mi - Sol - Do (agudo)
  nota(c, 523.25, 0.0, 0.25);
  nota(c, 659.25, 0.12, 0.25);
  nota(c, 783.99, 0.24, 0.25);
  nota(c, 1046.5, 0.36, 0.6, 0.3);
}

/** "Ding-ding" de caixa registradora para o painel admin. */
export function somVenda() {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  nota(c, 1318.5, 0.0, 0.35, 0.3, 'triangle');
  nota(c, 1760, 0.15, 0.6, 0.3, 'triangle');
  nota(c, 1318.5, 0.5, 0.35, 0.3, 'triangle');
  nota(c, 1760, 0.65, 0.6, 0.3, 'triangle');
}

export function falar(texto: string) {
  try {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'pt-BR';
    u.rate = 1;
    u.pitch = 1.1;
    const voz = synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith('pt'));
    if (voz) u.voice = voz;
    synth.speak(u);
  } catch {}
}

/** Alerta completo de nova venda: som + voz. */
export function alertaNovaVenda() {
  somVenda();
  setTimeout(() => falar('Olha a compra, Limaaa!'), 1300);
}
