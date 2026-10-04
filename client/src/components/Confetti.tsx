import confetti from 'canvas-confetti';

export function fireConfetti() {
  confetti({
    particleCount: 70,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#00e5ff', '#ff007f', '#ffb703', '#00ff66', '#9d4edd'],
  });
}

export function fireHighscoreCelebration() {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 40 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: 0.2, y: 0.6 } });
    confetti({ ...defaults, particleCount, origin: { x: 0.8, y: 0.6 } });
  }, 250);
}
