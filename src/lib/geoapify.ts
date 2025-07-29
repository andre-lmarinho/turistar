// src/lib/geoapify.ts
import type { CatalogActivity } from '@/types';

type GeoapifyFeature = {
  properties: {
    place_id: string | number;
    name?: string;
    formatted?: string;
    lat: number;
    lon: number;
    categories?: string[];
    rank?: { popularity?: number };
    distance?: number;
  };
};

type GeoapifyResponse = {
  features: GeoapifyFeature[];
};

const SALVADOR = {
  // Ordem exigida pela Geoapify nos filtros: lon,lat
  lat: -12.977749, // Centro histórico aprox.
  lon: -38.501629,
  radiusMeters: 20_000,
};

// Conjunto de categorias focadas em pontos turísticos / lazer.
// Referência de categorias: docs da Geoapify (Places API).
// Evite "tourism" (não existe).
const TOURISM_CATEGORIES = [
  'entertainment.culture',
  'entertainment.culture.theatre',
  'entertainment.museum',
  'entertainment.zoo',
  'entertainment.aquarium',
  'entertainment.planetarium',
  'leisure.park',
  'leisure.spa.public_bath',
  'heritage',
  'national_park',
  'natural.forest',
  'natural.water',
  'natural.mountain',
  'man_made.tower',
  'man_made.bridge',
  'man_made.lighthouse',
].join(',');

/**
 * Busca atividades turísticas na área de Salvador-BA usando Geoapify Places API.
 * Ignora o `dest` por enquanto (bloqueado em Salvador).
 */
export async function fetchGeoapifyCatalog(
  _dest?: string
): Promise<{ activities: CatalogActivity[] }> {
  const key = process.env.GEOAPIFY_KEY;
  if (!key) throw new Error('GEOAPIFY_KEY not set');

  const base = 'https://api.geoapify.com/v2/places';

  const url =
    `${base}?` +
    `categories=${encodeURIComponent(TOURISM_CATEGORIES)}` +
    `&filter=circle:${SALVADOR.lon},${SALVADOR.lat},${SALVADOR.radiusMeters}` +
    `&bias=proximity:${SALVADOR.lon},${SALVADOR.lat}` +
    `&limit=60` +
    `&lang=pt` +
    `&apiKey=${key}`;

  const res = await fetch(url, {
    // Em rotas de API o fetch não é memoizado, mas definimos no-store por segurança.
    cache: 'no-store',
  });

  if (!res.ok) {
    // Tente expor a mensagem de erro da API para depuração
    let detail = '';
    try {
      const text = await res.text();
      detail = text ? ` — ${text}` : '';
    } catch {
      /* ignore */
    }
    throw new Error(`Geoapify request failed: ${res.status}${detail}`);
  }

  const data = (await res.json()) as GeoapifyResponse;

  const activities: CatalogActivity[] = data.features.map((f) => {
    const p = f.properties;
    return {
      id: String(p.place_id),
      name: p.name || p.formatted || 'Ponto turístico',
      description: '',
      duration: 1,
      image_url: '',
      price: '',
      category: p.categories?.[0] ?? 'sight',
      rating: p.rank?.popularity, // Geoapify expõe "rank.popularity" como sinal de relevância.
      latitude: p.lat,
      longitude: p.lon,
      // Se quiser ordenar por proximidade depois:
      // distance: p.distance,
    };
  });

  return { activities };
}
