/**
 * Ko'p tillli nomlarga ega entitylar uchun baza interfeyslari.
 * C# dagi LocalizableEntity<TId> ga mos keladi.
 *
 *   nameUz     — O'zbek (lotin)        required
 *   nameUzCyrl — O'zbek (kirill)       required (DB da null bo'lishi mumkin — eski yozuvlar)
 *   nameRu     — Rus tili              required
 *   nameEn     — Ingliz tili           ixtiyoriy
 *   nameKk     — Qoraqalpog'on tili    ixtiyoriy
 */

// ── API javoblari (backend null qaytarishi mumkin) ────────────────────────────
export interface LocalizableNameDto {
  nameUz:     string;
  nameUzCyrl: string | null;
  nameRu:     string;
  nameEn:     string | null;
  nameKk:     string | null;
}

// ── Create/Update so'rovlari (ixtiyoriy maydonlar) ───────────────────────────
export interface LocalizableNameRequest {
  nameUz:      string;
  nameUzCyrl?: string;
  nameRu:      string;
  nameEn?:     string;
  nameKk?:     string;
}

// ── Pipe va LocaleService uchun (hammasi ixtiyoriy/null) ─────────────────────
export interface LocalizableNamePartial {
  nameUz?:     string | null;
  nameUzCyrl?: string | null;
  nameRu?:     string | null;
  nameEn?:     string | null;
  nameKk?:     string | null;
}
