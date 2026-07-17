import hospitalRecords from "./data/hospitalIndex.json";

export interface Hospital {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    phone?: string;
    cashless: boolean;
    insuranceProviders: string[];
}

/**
 * Shape of the raw records in ./data/hospitalIndex.json.
 * This is NOT the same shape as `Hospital` above (hospital_name vs name,
 * insurers_covered vs insuranceProviders, no id/cashless field) — see
 * `toHospital()` below, which is the single place that reconciles the two.
 */
interface RawHospitalRecord {
    hospital_name: string;
    address: string;
    city: string;
    state: string;
    pincode?: string;
    lat?: number;
    lng?: number;
    insurers_covered: string[];
}

/**
 * Maps a raw JSON record onto the `Hospital` shape the rest of the module
 * (service, tools) actually depends on.
 *
 * - `id` isn't present in the source data, so we derive a stable one from
 *   position in the file (hosp_001, hosp_002, ...).
 * - Every hospital in this dataset is a network partner for the insurers
 *   listed under `insurers_covered`, so `cashless` is true for all of them.
 * - `phone` isn't in the source data yet, so it's left undefined (it's
 *   optional on `Hospital`).
 */
function toHospital(record: RawHospitalRecord, index: number): Hospital {
    return {
        id: `hosp_${String(index + 1).padStart(3, "0")}`,
        name: record.hospital_name,
        address: record.address,
        city: record.city,
        state: record.state,
        cashless: true,
        insuranceProviders: record.insurers_covered,
    };
}

export const HOSPITALS: Hospital[] = (hospitalRecords as RawHospitalRecord[]).map(
    toHospital
);