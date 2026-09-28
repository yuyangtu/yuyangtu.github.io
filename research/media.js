(() => {
  const videos = [...document.querySelectorAll('video[autoplay], video[data-play-on-view]')];
  const buttons = [...document.querySelectorAll('[data-preview-toggle]')];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const waiting = new Set(videos.filter(video => video.hasAttribute('data-play-on-view')));
  let paused = motion.matches;
  const sync = () => {
    buttons.forEach(button => {
      button.textContent = paused ? 'Play previews' : 'Pause previews';
      button.dataset.paused = String(paused);
      button.setAttribute('aria-label', paused ? 'Play all demonstration previews' : 'Pause all demonstration previews');
    });
    videos.forEach(video => {
      if (paused || waiting.has(video)) video.pause();
      else video.play().catch(() => {});
    });
  };
  buttons.forEach(button => button.addEventListener('click', () => { paused = !paused; sync(); }));
  motion.addEventListener('change', event => { paused = event.matches; sync(); });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
        waiting.delete(entry.target);
        observer.unobserve(entry.target);
        if (!paused) entry.target.play().catch(() => {});
      });
    }, { threshold: 0.5 });
    waiting.forEach(video => observer.observe(video));
  } else {
    waiting.clear();
  }
  sync();
})();
