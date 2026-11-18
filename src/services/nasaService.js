const endpoint = 'https://api.nasa.gov/planetary/apod';
const timeoutMs = 15000;

class ApodError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function invalidResponse() {
  return new ApodError(502, 'A NASA retornou uma resposta inválida. Tente novamente mais tarde.');
}

function publicUrl(value, apiKey) {
  if (typeof value !== 'string') {
    return undefined;
  }

  try {
    const url = new URL(value);
    const hasApiKeyParam = [...url.searchParams.keys()].some(
      (name) => name.toLowerCase() === 'api_key',
    );
    if (url.protocol === 'https:' && !url.username && !url.password &&
        !hasApiKeyParam && !decodeURIComponent(url.href).includes(apiKey)) {
      return url.href;
    }
  } catch {
    // Endereços malformados ou com codificação inválida são descartados.
  }
  return undefined;
}

function plainText(value) {
  return value
    .replace(/<\s*\/?\s*(?:br|p|div)\b[^>]*>/gi, '\n')
    .replace(/<\s*\/?\s*[a-z](?:[^>"']|"[^"]*"|'[^']*')*>/gi, '')
    .replace(/&(amp|lt|gt|quot|apos|nbsp|#\d{1,7}|#x[0-9a-f]{1,6});/gi, (entity, name) => {
      if (name.startsWith('#')) {
        const code = /^#x/i.test(name) ? parseInt(name.slice(2), 16) : Number(name.slice(1));
        return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
      }
      return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }[name.toLowerCase()];
    })
    .trim();
}

function normalize(payload, requestedDate, apiKey) {
  const { title, date, explanation, media_type } = payload ?? {};
  if (typeof title !== 'string' || typeof explanation !== 'string' ||
      typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      (requestedDate !== undefined && date !== requestedDate) ||
      !['image', 'video', 'iframe', 'other'].includes(media_type)) {
    throw invalidResponse();
  }

  const url = publicUrl(payload.url, apiKey) ?? publicUrl(payload.permalink, apiKey);
  const hdurl = publicUrl(payload.hdurl, apiKey);
  const apod = { title: plainText(title), date, explanation: plainText(explanation), media_type, url };
  if (hdurl) apod.hdurl = hdurl;

  if (!apod.title || !apod.explanation || !url ||
      Object.values(apod).some((value) => value.includes(apiKey))) {
    throw invalidResponse();
  }
  return apod;
}

async function getApod(date) {
  const apiKey = process.env.NASA_API_KEY?.trim();
  if (!apiKey) {
    throw new ApodError(503, 'A consulta ao APOD está indisponível no momento.');
  }

  const url = new URL(endpoint);
  url.searchParams.set('api_key', apiKey);
  if (date !== undefined) url.searchParams.set('date', date);

  const signal = AbortSignal.timeout(timeoutMs);
  let payload;
  try {
    const response = await fetch(url, { signal, redirect: 'error' });
    if (!response.ok) {
      if (response.status === 404) {
        throw new ApodError(404, 'Não há uma publicação APOD disponível para essa consulta.');
      }
      if (response.status === 429) {
        throw new ApodError(429, 'O limite de consultas à NASA foi atingido. Tente mais tarde.');
      }
      throw new ApodError(502, 'A NASA não conseguiu atender à consulta. Tente mais tarde.');
    }

    try {
      payload = await response.json();
    } catch (error) {
      if (error instanceof SyntaxError) throw invalidResponse();
      throw error;
    }
  } catch (error) {
    if (error instanceof ApodError) throw error;
    if (signal.aborted) {
      throw new ApodError(504, 'A NASA demorou para responder. Tente novamente.');
    }
    throw new ApodError(502, 'Não foi possível se conectar à NASA. Tente novamente.');
  }

  return normalize(payload, date, apiKey);
}

module.exports = { getApod, ApodError };
