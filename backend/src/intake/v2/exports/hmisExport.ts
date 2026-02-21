/**
 * HMIS / Coordinated Entry Export — HUD CSV 2024 Format
 *
 * Generates export records conforming to HUD HMIS CSV Specifications 2024
 * for Coordinated Entry reporting.
 *
 * Field mapping per docs/V2_INTK_SPEC.md Section 10:
 *   V2 → HMIS Element #:
 *   first_name         → FirstName        (3.01)
 *   last_name          → LastName         (3.01)
 *   date_of_birth      → DOB             (3.03)
 *   gender             → Gender           (3.06)
 *   race_ethnicity     → Race/Ethnicity   (3.04/3.05)
 *   veteran_status     → VeteranStatus    (3.07)
 *   current_living_situation → LivingSituation (3.917)
 *   fleeing_dv         → DomesticViolenceVictim (4.11)
 *   chronic_conditions → DisablingCondition (3.08)
 *
 * DV-Safe Mode: When active, location-related fields are nullified.
 *
 * @module intake/v2/exports
 */

// ── Types ──────────────────────────────────────────────────────

export interface HMISRecord {
  /** Internal session ID used as personal identifier */
  PersonalID: string;
  FirstName: string | null;
  LastName: string | null;
  DOB: string | null;
  Gender: number | null;
  RaceEthnicity: number | null;
  VeteranStatus: number | null;
  LivingSituation: number | null;
  DomesticViolenceVictim: number | null;
  DisablingCondition: number | null;
  DateOfIntake: string;
  /** V2 totalScore mapped to CE assessment score */
  CEAssessmentScore: number | null;
  /** V2 priorityTier */
  PriorityTier: string | null;
}

export interface HMISExport {
  format: "HMIS_CSV_2024";
  generatedAt: string;
  dvSafeMode: boolean;
  recordCount: number;
  records: HMISRecord[];
}

// ── HMIS Code Mappings ─────────────────────────────────────────
// HUD codes per HMIS Data Dictionary (2024 revision)

/** HUD Gender codes (Element 3.06) */
const GENDER_MAP: Record<string, number> = {
  female: 0,
  male: 1,
  "a gender other than singularly female or male": 4,
  transgender: 5,
  questioning: 6,
  non_binary: 4,
  other: 4,
  declined: 8,
  not_collected: 99,
};

/** HUD Race/Ethnicity codes (Elements 3.04/3.05 combined) */
const RACE_ETHNICITY_MAP: Record<string, number> = {
  american_indian_alaska_native: 1,
  asian: 2,
  black_african_american: 3,
  native_hawaiian_pacific_islander: 4,
  white: 5,
  hispanic_latinx: 6,
  middle_eastern_north_african: 7,
  multiracial: 8,
  declined: 8,
  not_collected: 99,
};

/** HUD Veteran Status codes (Element 3.07) */
const VETERAN_MAP: Record<string | number, number> = {
  true: 1,
  false: 0,
  declined: 8,
  not_collected: 99,
};

/** HUD Living Situation codes (Element 3.917) */
const LIVING_SITUATION_MAP: Record<string, number> = {
  unsheltered: 116,
  vehicle: 116,
  encampment: 116,
  shelter: 101,
  transitional: 118,
  couch_surfing: 112,
  temporary: 114,
  institutional: 106,
  permanent_subsidized: 410,
  permanent_unsubsidized: 411,
  rental: 411,
  owned: 421,
  other: 99,
};

/** HUD Domestic Violence Victim (Element 4.11): 0=No, 1=Yes, 8=Declined, 99=Not collected */
function mapDVStatus(fleeingDv: unknown): number | null {
  if (fleeingDv === true) return 1;
  if (fleeingDv === false) return 0;
  return 99; // not collected
}

/** HUD Disabling Condition (Element 3.08): 0=No, 1=Yes, 8=Declined, 99=Not collected */
function mapDisablingCondition(conditions: unknown): number | null {
  if (Array.isArray(conditions) && conditions.length > 0) return 1;
  if (conditions === true) return 1;
  if (
    conditions === false ||
    (Array.isArray(conditions) && conditions.length === 0)
  )
    return 0;
  return 99; // not collected
}

// ── Export Builder ──────────────────────────────────────────────

export interface SessionData {
  id: string;
  modules: Record<string, Record<string, unknown>>;
  dvSafeMode: boolean;
  totalScore: number | null;
  priorityTier: string | null;
  createdAt: Date | string;
  completedAt: Date | string | null;
}

/**
 * Build a single HMIS record from a completed V2 intake session.
 *
 * @param session - The completed intake session data
 * @returns HMIS-compliant record
 */
export function buildHMISRecord(session: SessionData): HMISRecord {
  const demographics = (session.modules?.demographics ?? {}) as Record<
    string,
    unknown
  >;
  const housing = (session.modules?.housing ?? {}) as Record<string, unknown>;
  const safety = (session.modules?.safety ?? {}) as Record<string, unknown>;
  const health = (session.modules?.health ?? {}) as Record<string, unknown>;

  const dateOfIntake = session.completedAt
    ? new Date(session.completedAt).toISOString().split("T")[0]
    : new Date(session.createdAt).toISOString().split("T")[0];

  const record: HMISRecord = {
    PersonalID: session.id,
    FirstName:
      typeof demographics.first_name === "string"
        ? demographics.first_name
        : null,
    LastName:
      typeof demographics.last_name === "string"
        ? demographics.last_name
        : null,
    DOB:
      typeof demographics.date_of_birth === "string"
        ? demographics.date_of_birth
        : null,
    Gender:
      typeof demographics.gender === "string"
        ? (GENDER_MAP[demographics.gender] ?? 99)
        : null,
    RaceEthnicity:
      typeof demographics.race_ethnicity === "string"
        ? (RACE_ETHNICITY_MAP[demographics.race_ethnicity] ?? 99)
        : null,
    VeteranStatus:
      demographics.veteran_status !== undefined
        ? (VETERAN_MAP[String(demographics.veteran_status)] ?? 99)
        : null,
    LivingSituation:
      typeof housing.current_living_situation === "string"
        ? (LIVING_SITUATION_MAP[housing.current_living_situation] ?? 99)
        : null,
    DomesticViolenceVictim: mapDVStatus(safety.fleeing_dv),
    DisablingCondition: mapDisablingCondition(health.chronic_conditions),
    DateOfIntake: dateOfIntake,
    CEAssessmentScore: session.totalScore,
    PriorityTier: session.priorityTier,
  };

  // DV-Safe Mode: nullify location-related fields
  if (session.dvSafeMode) {
    record.LivingSituation = null;
    record.FirstName = null;
    record.LastName = null;
  }

  return record;
}

/**
 * Build a full HMIS CSV 2024 export from one or more completed sessions.
 *
 * @param sessions - Array of completed session data
 * @returns HMIS export object
 */
export function buildHMISExport(sessions: SessionData[]): HMISExport {
  const anyDvSafe = sessions.some((s) => s.dvSafeMode);
  const records = sessions.map(buildHMISRecord);

  return {
    format: "HMIS_CSV_2024",
    generatedAt: new Date().toISOString(),
    dvSafeMode: anyDvSafe,
    recordCount: records.length,
    records,
  };
}

/**
 * Convert HMIS records to CSV string for file download.
 *
 * @param exportData - HMIS export object
 * @returns CSV string with headers
 */
export function hmisToCSV(exportData: HMISExport): string {
  const headers = [
    "PersonalID",
    "FirstName",
    "LastName",
    "DOB",
    "Gender",
    "RaceEthnicity",
    "VeteranStatus",
    "LivingSituation",
    "DomesticViolenceVictim",
    "DisablingCondition",
    "DateOfIntake",
    "CEAssessmentScore",
    "PriorityTier",
  ];

  const rows = exportData.records.map((record) =>
    headers
      .map((h) => {
        const val = record[h as keyof HMISRecord];
        if (val === null || val === undefined) return "";
        // Escape values with commas or quotes
        const strVal = String(val);
        if (
          strVal.includes(",") ||
          strVal.includes('"') ||
          strVal.includes("\n")
        ) {
          return `"${strVal.replace(/"/g, '""')}"`;
        }
        return strVal;
      })
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}
