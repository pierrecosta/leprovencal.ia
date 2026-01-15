// services/normalizers.js
// Extracted normalizers for payload/response normalization and testing

export function normalizeArticlePayload(payload = {}) {
  return {
    ...(payload.titre != null || payload.title != null ? { titre: payload.titre ?? payload.title } : {}),
    ...(payload.description != null ? { description: payload.description } : {}),
    ...(payload.imageUrl != null || payload.image_url != null || payload.src != null
      ? { imageUrl: payload.imageUrl ?? payload.image_url ?? payload.src }
      : {}),
    ...(payload.sourceUrl != null || payload.source_url != null ? { sourceUrl: payload.sourceUrl ?? payload.source_url } : {}),
  };
}

export function normalizeDictionnairePayload(payload = {}) {
  return {
    ...(payload.theme != null ? { theme: payload.theme } : {}),
    ...(payload.categorie != null ? { categorie: payload.categorie } : {}),
    ...(payload.description != null ? { description: payload.description } : {}),
    ...(payload.motsFrancais != null || payload.mots_francais != null ? { motsFrancais: payload.motsFrancais ?? payload.mots_francais } : {}),
    ...(payload.motsProvencal != null || payload.mots_provencal != null ? { motsProvencal: payload.motsProvencal ?? payload.mots_provencal } : {}),
    ...(payload.synonymesFrancais != null || payload.synonymes_francais != null ? { synonymesFrancais: payload.synonymesFrancais ?? payload.synonymes_francais } : {}),
    ...(payload.egProvencal != null || payload.eg_provencal != null ? { egProvencal: payload.egProvencal ?? payload.eg_provencal } : {}),
    ...(payload.dProvencal != null || payload.d_provencal != null ? { dProvencal: payload.dProvencal ?? payload.d_provencal } : {}),
    ...(payload.aProvencal != null || payload.a_provencal != null ? { aProvencal: payload.aProvencal ?? payload.a_provencal } : {}),
  };
}

export function normalizeArticleOut(a = {}) {
  return {
    ...a,
    imageUrl: a.imageUrl ?? a.image_url ?? a.src ?? '',
    sourceUrl: a.sourceUrl ?? a.source_url ?? '',
    imageStored: a.imageStored ?? a.image_stored ?? false,
  };
}

export function normalizeMotOut(m = {}) {
  return {
    ...m,
    motsFrancais: m.motsFrancais ?? m.mots_francais ?? '',
    motsProvencal: m.motsProvencal ?? m.mots_provencal ?? '',
    synonymesFrancais: m.synonymesFrancais ?? m.synonymes_francais ?? '',
    egProvencal: m.egProvencal ?? m.eg_provencal ?? '',
    dProvencal: m.dProvencal ?? m.d_provencal ?? '',
    aProvencal: m.aProvencal ?? m.a_provencal ?? '',
  };
}

export function normalizeHistoireOut(h = {}) {
  return {
    ...h,
    descriptionCourte: h.descriptionCourte ?? h.description_courte ?? '',
    descriptionLongue: h.descriptionLongue ?? h.description_longue ?? '',
    sourceUrl: h.sourceUrl ?? h.source_url ?? '',
  };
}

export function normalizeMenuItemOut(item = {}) {
  return {
    ...item,
    descriptionCourte: item.descriptionCourte ?? item.description_courte ?? '',
  };
}

export function normalizeCarteOut(c = {}) {
  return {
    ...c,
    iframeUrl: c.iframeUrl ?? c.iframe_url ?? '',
    legende: c.legende ?? c.legende ?? '',
    imageStored: c.imageStored ?? c.image_stored ?? false,
  };
}

export function normalizeCartePayload(payload = {}) {
  const rawIframe = payload.iframeUrl ?? payload.iframe_url;
  const hasIframe = typeof rawIframe === 'string' ? rawIframe.trim() !== '' : rawIframe != null;
  return {
    ...(payload.titre != null ? { titre: payload.titre } : {}),
    ...(payload.iframeUrl != null || payload.iframe_url != null
      ? { iframeUrl: hasIframe ? (typeof rawIframe === 'string' ? rawIframe.trim() : rawIframe) : null }
      : {}),
    ...(payload.legende != null ? { legende: payload.legende } : {}),
  };
}

export function normalizeMenuHistoiresOut(menu = {}) {
  if (!menu || typeof menu !== 'object') return {};

  const out = {};
  for (const [typologie, periodes] of Object.entries(menu)) {
    const periodesObj = periodes && typeof periodes === 'object' ? periodes : {};
    out[typologie] = {};

    for (const [periode, items] of Object.entries(periodesObj)) {
      out[typologie][periode] = Array.isArray(items) ? items.map(normalizeMenuItemOut) : [];
    }
  }
  return out;
}
