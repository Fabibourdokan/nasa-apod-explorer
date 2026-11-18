const form = document.querySelector('#search');
const dateInput = document.querySelector('#date');
const todayButton = document.querySelector('#today');
const retryButton = document.querySelector('#retry');
const status = document.querySelector('#status');
const errorPanel = document.querySelector('#error-panel');
const errorMessage = document.querySelector('#error');
const publication = document.querySelector('#publication');
const published = document.querySelector('#published');
const title = document.querySelector('#title');
const media = document.querySelector('#media');
const explanation = document.querySelector('#explanation');
const credit = document.querySelector('#credit');

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' });
const errorMessages = {
  400: 'Selecione uma data válida dentro do período do acervo.',
  404: 'O acervo não tem uma publicação disponível para esta data. Escolha outra data.',
  429: 'O limite de consultas foi atingido. Aguarde um pouco e tente novamente.',
  503: 'A consulta ao acervo está temporariamente indisponível.',
  504: 'A NASA demorou para responder. Tente novamente.',
};

let activeRequest;
let requestedDate;

function localToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function calendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value);
  return date.toJSON()?.slice(0, 10) === value ? date : null;
}

function safeUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    const hasKey = [...url.searchParams.keys()].some((name) => name.toLowerCase() === 'api_key');
    if (url.protocol === 'https:' && !url.username && !url.password && !hasKey) return url;
  } catch {
    // Uma URL inválida será tratada como mídia indisponível.
  }
  return null;
}

function isEmbeddable(url) {
  if (!url) return false;
  if (['https://www.youtube.com', 'https://www.youtube-nocookie.com'].includes(url.origin)) {
    return /^\/embed\/[\w-]{11}\/?$/.test(url.pathname);
  }
  return url.origin === 'https://player.vimeo.com' && /^\/video\/\d+\/?$/.test(url.pathname);
}

function mediaLink(url, label) {
  const link = document.createElement('a');
  link.href = url.href;
  link.rel = 'noreferrer';
  link.textContent = label;
  return link;
}

function showMediaFallback(url) {
  const fallback = document.createElement('div');
  fallback.className = 'media-fallback';
  const message = document.createElement('span');
  message.textContent = 'Mídia indisponível para visualização nesta página.';
  fallback.append(message);
  if (url) {
    fallback.append(mediaLink(url, 'Abrir a publicação ou mídia original'));
  }
  media.replaceChildren(fallback);
}

function renderMedia(apod) {
  const url = safeUrl(apod.url);
  const hdurl = safeUrl(apod.hdurl);
  const imageUrl = hdurl ?? (url && /\.(avif|gif|jpe?g|png|webp|svg)$/i.test(url.pathname) ? url : null);

  if (apod.media_type === 'image' && imageUrl) {
    const image = document.createElement('img');
    image.alt = apod.title;
    image.referrerPolicy = 'no-referrer';
    image.addEventListener('error', () => {
      if (media.contains(image)) showMediaFallback(url);
    }, { once: true });
    media.replaceChildren(image);
    if (url && url.href !== imageUrl.href) {
      const link = mediaLink(url, 'Abrir a publicação ou mídia original');
      link.className = 'media-link';
      media.append(link);
    }
    image.src = imageUrl.href;
    return;
  }

  if (['video', 'iframe'].includes(apod.media_type) && isEmbeddable(url)) {
    const iframe = document.createElement('iframe');
    iframe.title = `Vídeo: ${apod.title}`;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
    iframe.allow = 'fullscreen; picture-in-picture';
    iframe.src = url.href;
    const link = mediaLink(url, 'Abrir o vídeo no provedor');
    link.className = 'media-link';
    media.replaceChildren(iframe, link);
    return;
  }

  showMediaFallback(url);
}

function renderPublication(apod) {
  const date = calendarDate(apod?.date);
  if (!date || typeof apod.title !== 'string' || typeof apod.explanation !== 'string') return false;

  title.textContent = apod.title;
  published.dateTime = apod.date;
  published.textContent = dateFormatter.format(date);
  explanation.textContent = apod.explanation;
  credit.textContent = typeof apod.copyright === 'string' ? apod.copyright : '';
  credit.hidden = !credit.textContent;
  renderMedia(apod);
  publication.hidden = false;
  if (!dateInput.value) dateInput.value = apod.date;
  return true;
}

function clearError() {
  errorMessage.textContent = '';
  errorPanel.hidden = true;
  retryButton.hidden = true;
}

function showError(message, canRetry = false) {
  errorPanel.hidden = false;
  retryButton.hidden = !canRetry;
  errorMessage.textContent = message;
}

async function loadApod(date) {
  if (document.activeElement === retryButton) {
    (date ? form.querySelector('[type="submit"]') : todayButton).focus();
  }
  activeRequest?.abort();
  const request = new AbortController();
  activeRequest = request;
  requestedDate = date;
  const timeout = AbortSignal.timeout(20000);

  clearError();
  publication.hidden = true;
  media.replaceChildren();
  status.dataset.loading = '';
  status.textContent = 'Carregando publicação…';

  try {
    const endpoint = date ? `/api/apod?${new URLSearchParams({ date })}` : '/api/apod';
    const response = await fetch(endpoint, {
      signal: AbortSignal.any([request.signal, timeout]),
      redirect: 'error',
    });

    if (!response.ok) {
      if (!request.signal.aborted) {
        showError(errorMessages[response.status] ?? 'Não foi possível consultar a publicação. Tente novamente.', response.status !== 400 && response.status !== 404);
      }
      return;
    }

    const apod = await response.json();
    if (request.signal.aborted) return;

    if (renderPublication(apod)) {
      status.textContent = 'Publicação carregada.';
    } else {
      showError('O acervo retornou uma publicação inválida. Tente novamente.', true);
    }
  } catch {
    if (request.signal.aborted) return;
    const message = timeout.aborted
      ? 'A consulta demorou para responder. Tente novamente.'
      : 'Não foi possível carregar a publicação. Verifique a conexão e tente novamente.';
    showError(message, true);
  } finally {
    if (activeRequest === request) {
      activeRequest = undefined;
      delete status.dataset.loading;
      if (publication.hidden) status.textContent = '';
    }
  }
}

dateInput.max = localToday();

dateInput.addEventListener('input', () => {
  if (dateInput.hasAttribute('aria-invalid')) clearError();
  dateInput.removeAttribute('aria-invalid');
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  dateInput.max = localToday();
  const date = dateInput.value;
  if (!calendarDate(date) || !dateInput.validity.valid) {
    activeRequest?.abort();
    dateInput.setAttribute('aria-invalid', 'true');
    showError('Escolha uma data entre 16/06/1995 e hoje.');
    dateInput.focus();
    return;
  }
  dateInput.removeAttribute('aria-invalid');
  loadApod(date);
});

todayButton.addEventListener('click', () => {
  dateInput.value = '';
  dateInput.removeAttribute('aria-invalid');
  dateInput.max = localToday();
  loadApod();
});

retryButton.addEventListener('click', () => loadApod(requestedDate));

loadApod();
