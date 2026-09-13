(() => {
  'use strict';
  const dialog = document.createElement('dialog');
  if (typeof dialog.showModal !== 'function') return;
  dialog.className = 'avatar-preview';
  dialog.setAttribute('aria-label', '头像大图');
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'avatar-preview-close';
  close.textContent = '关闭';
  const image = document.createElement('img');
  dialog.append(close, image);
  document.body.append(dialog);
  let trigger;
  let previousOverflow;

  // Delegation also covers posts loaded later by the paginated feed.
  document.addEventListener('click', event => {
    const avatar = event.target.closest('a.avatar');
    if (!avatar || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const thumbnail = avatar.querySelector('img');
    if (!thumbnail) return;
    event.preventDefault();
    trigger = avatar;
    image.src = avatar.href;
    image.alt = thumbnail.alt;
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = previousOverflow;
    image.removeAttribute('src');
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  });
})();
