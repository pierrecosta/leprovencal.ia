import type {
  Article,
  ArticlePayload,
  Mot,
  MotPayload,
  Histoire,
  Carte,
  CartePayload,
  MenuHistoires,
} from '@/types';

// ===== Normalizers for API payloads and responses =====

// Article normalizers
export function normalizeArticlePayload(payload: Partial<ArticlePayload> = {}): Partial<ArticlePayload> {
  const result: Partial<ArticlePayload> = {};
  
  if (payload.titre != null) result.titre = payload.titre;
  if (payload.description != null) result.description = payload.description;
  if (payload.imageUrl != null) result.imageUrl = payload.imageUrl;
  if (payload.sourceUrl != null) result.sourceUrl = payload.sourceUrl;
  
  return result;
}

export function normalizeArticleOut(a: any): Article {
  return {
    id: a.id,
    titre: a.titre ?? '',
    description: a.description ?? '',
    imageUrl: a.imageUrl ?? a.image_url ?? a.src ?? '',
    sourceUrl: a.sourceUrl ?? a.source_url ?? '',
    dateAjout: a.dateAjout ?? a.date_ajout ?? '',
    imageStored: a.imageStored ?? a.image_stored ?? false,
    createdAt: a.createdAt ?? a.created_at,
    updatedAt: a.updatedAt ?? a.updated_at,
  };
}

// Dictionary normalizers
export function normalizeDictionnairePayload(payload: Partial<MotPayload> = {}): Partial<MotPayload> {
  const result: Partial<MotPayload> = {};
  
  if (payload.theme != null) result.theme = payload.theme;
  if (payload.categorie != null) result.categorie = payload.categorie;
  if (payload.description != null) result.description = payload.description;
  if (payload.motsFrancais != null) result.motsFrancais = payload.motsFrancais;
  if (payload.motsProvencal != null) result.motsProvencal = payload.motsProvencal;
  if (payload.synonymesFrancais != null) result.synonymesFrancais = payload.synonymesFrancais;
  if (payload.egProvencal != null) result.egProvencal = payload.egProvencal;
  if (payload.dProvencal != null) result.dProvencal = payload.dProvencal;
  if (payload.aProvencal != null) result.aProvencal = payload.aProvencal;
  
  return result;
}

export function normalizeMotOut(m: any): Mot {
  return {
    id: m.id,
    theme: m.theme ?? '',
    categorie: m.categorie ?? '',
    description: m.description ?? '',
    motsFrancais: m.motsFrancais ?? m.mots_francais ?? '',
    motsProvencal: m.motsProvencal ?? m.mots_provencal ?? '',
    synonymesFrancais: m.synonymesFrancais ?? m.synonymes_francais ?? '',
    egProvencal: m.egProvencal ?? m.eg_provencal ?? '',
    dProvencal: m.dProvencal ?? m.d_provencal ?? '',
    aProvencal: m.aProvencal ?? m.a_provencal ?? '',
  };
}

// Histoire normalizers
export function normalizeHistoireOut(h: any): Histoire {
  return {
    id: h.id,
    titre: h.titre ?? '',
    typologie: h.typologie ?? '',
    periode: h.periode ?? '',
    descriptionCourte: h.descriptionCourte ?? h.description_courte ?? '',
    descriptionLongue: h.descriptionLongue ?? h.description_longue ?? '',
    sourceUrl: h.sourceUrl ?? h.source_url ?? '',
    createdAt: h.createdAt ?? h.created_at,
    updatedAt: h.updatedAt ?? h.updated_at,
  };
}

export function normalizeMenuItemOut(item: any) {
  return {
    id: item.id,
    titre: item.titre ?? '',
    descriptionCourte: item.descriptionCourte ?? item.description_courte ?? '',
  };
}

export function normalizeMenuHistoiresOut(menu: any): MenuHistoires {
  if (!menu || typeof menu !== 'object') return {};

  const out: MenuHistoires = {};
  
  for (const [typologie, periodes] of Object.entries(menu)) {
    const periodesObj = periodes && typeof periodes === 'object' ? periodes : {};
    out[typologie] = {};

    for (const [periode, items] of Object.entries(periodesObj as any)) {
      out[typologie][periode] = Array.isArray(items) 
        ? items.map(normalizeMenuItemOut) 
        : [];
    }
  }
  
  return out;
}

// Carte normalizers
export function normalizeCarteOut(c: any): Carte {
  return {
    id: c.id,
    titre: c.titre ?? '',
    iframeUrl: c.iframeUrl ?? c.iframe_url ?? null,
    legende: c.legende ?? '',
    imageStored: c.imageStored ?? c.image_stored ?? false,
    createdAt: c.createdAt ?? c.created_at,
    updatedAt: c.updatedAt ?? c.updated_at,
  };
}

export function normalizeCartePayload(payload: Partial<CartePayload> = {}): Partial<CartePayload> {
  const result: Partial<CartePayload> = {};
  
  if (payload.titre != null) result.titre = payload.titre;
  if (payload.legende != null) result.legende = payload.legende;
  
  if ('iframeUrl' in payload) {
    const rawIframe = payload.iframeUrl;
    const hasIframe = typeof rawIframe === 'string' ? rawIframe.trim() !== '' : rawIframe != null;
    result.iframeUrl = hasIframe 
      ? (typeof rawIframe === 'string' ? rawIframe.trim() : rawIframe) 
      : null;
  }
  
  return result;
}
