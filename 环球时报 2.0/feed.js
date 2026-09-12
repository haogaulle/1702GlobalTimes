(() => {
  'use strict';
  const PAGE_SIZE = 10;
  const feed = document.getElementById('feed');
  const count = document.getElementById('feed-count');
  const pagination = document.querySelector('.pagination');
  const status = document.getElementById('page-status');
  const previous = document.getElementById('previous-page');
  const next = document.getElementById('next-page');
  let posts = [];
  let page = 1;
  let generation = 0;

  async function read(url) {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response;
  }

  function message(text, retry) {
    const box = document.createElement('div');
    box.className = 'feed-message';
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    box.append(paragraph);
    if (retry) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = '重新加载';
      button.addEventListener('click', retry);
      box.append(button);
    }
    return box;
  }

  async function loadPost(post, index) {
    const url = new URL(post.file, document.baseURI);
    try {
      const html = await (await read(url)).text();
      const documentPost = new DOMParser().parseFromString(html, 'text/html');
      const article = documentPost.querySelector('main article');
      if (!article) throw new Error('博文缺少 article');
      // Each HTML remains independently readable. Only its article enters the feed.
      article.querySelectorAll('script').forEach(node => node.remove());
      const ids = new Map();
      [article, ...article.querySelectorAll('[id]')].forEach(node => {
        if (!node.id) return;
        const old = node.id;
        node.id = `feed-${index + 1}-${old}`;
        ids.set(old, node.id);
      });
      for (const node of [article, ...article.querySelectorAll('*')]) {
        for (const attribute of ['aria-labelledby', 'aria-describedby', 'aria-controls', 'for', 'headers']) {
          if (node.hasAttribute(attribute)) {
            node.setAttribute(attribute, node.getAttribute(attribute).split(/\s+/).map(id => ids.get(id) || id).join(' '));
          }
        }
        for (const attribute of ['href', 'src', 'poster']) {
          if (!node.hasAttribute(attribute)) continue;
          const value = node.getAttribute(attribute);
          if (value.startsWith('#') && ids.has(value.slice(1))) {
            node.setAttribute(attribute, `#${ids.get(value.slice(1))}`);
          } else {
            node.setAttribute(attribute, new URL(value, url).href);
          }
        }
      }
      const title = article.querySelector('.post-title');
      if (title && !title.querySelector('a')) {
        const link = document.createElement('a');
        link.href = url.href;
        link.append(...title.childNodes);
        title.append(link);
      }
      return article;
    } catch (error) {
      const box = message(`“${post.title}”暂时无法加载。`, () => render());
      const link = document.createElement('a');
      link.href = url.href;
      link.textContent = '打开独立博文';
      box.append(' ', link);
      return box;
    }
  }

  async function render() {
    const currentGeneration = ++generation;
    const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
    const url = new URL(location.href);
    const requested = Number(url.searchParams.get('page') || 1);
    page = Math.min(totalPages, Math.max(1, Number.isSafeInteger(requested) ? requested : 1));
    if (url.searchParams.has('page')) {
      url.searchParams.set('page', page);
      history.replaceState(null, '', url);
    }
    count.textContent = `全部博文 · ${posts.length} 条`;
    status.textContent = `第 ${page} / ${totalPages} 页 · 每页 ${PAGE_SIZE} 条`;
    pagination.hidden = posts.length === 0;
    previous.disabled = page === 1;
    next.disabled = page === totalPages;
    feed.setAttribute('aria-busy', 'true');
    feed.replaceChildren(message('正在加载博文…'));
    const start = (page - 1) * PAGE_SIZE;
    const articles = await Promise.all(posts.slice(start, start + PAGE_SIZE).map((post, offset) => loadPost(post, start + offset)));
    // Ignore earlier requests when the reader changes pages quickly.
    if (currentGeneration !== generation) return;
    feed.replaceChildren(...(articles.length ? articles : [message('暂无博文。')]));
    feed.setAttribute('aria-busy', 'false');
  }

  function turnPage(offset) {
    const url = new URL(location.href);
    url.searchParams.set('page', page + offset);
    url.hash = '';
    history.pushState(null, '', url);
    render();
    feed.scrollIntoView({ block: 'start' });
  }

  async function init() {
    feed.setAttribute('aria-busy', 'true');
    try {
      const list = await (await read('./posts.json')).json();
      if (!Array.isArray(list) || !list.every(post => typeof post.file === 'string' && typeof post.title === 'string')) {
        throw new Error('博文清单格式错误');
      }
      posts = list;
      await render();
    } catch (error) {
      count.textContent = '博文清单暂时无法加载';
      pagination.hidden = true;
      feed.replaceChildren(message('无法读取博文清单，请重试。', init));
      feed.setAttribute('aria-busy', 'false');
    }
  }

  previous.addEventListener('click', () => turnPage(-1));
  next.addEventListener('click', () => turnPage(1));
  window.addEventListener('popstate', render);
  init();
})();
