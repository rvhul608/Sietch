import { HOSPITALS, Hospital } from "./hospital-lookup.data";

export interface HospitalLookupInput {
    insurer: string;
    city?: string;
}

export class HospitalLookupService {
    findHospitals(input: HospitalLookupInput): Hospital[] {
        const insurer = input.insurer.toLowerCase();
        const city = input.city?.toLowerCase();

        return HOSPITALS.filter((hospital) => {
            const insurerMatch = hospital.insuranceProviders.some((provider) =>
                provider.toLowerCase().includes(insurer)
            );

            const cityMatch = city
                ? hospital.city.toLowerCase() === city
                : true;

            return insurerMatch && cityMatch;
        });
    }
}