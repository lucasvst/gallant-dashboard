export interface BikeMetrics {
    speed?: number | null;
    avgSpeed?: number | null;
    cadence?: number | null;
    avgCadence?: number | null;
    totalDistance?: number | null;
    resistance?: number | null;
    power?: number | null;
    avgPower?: number | null;
}

export class GallantParser {
    private static readonly CONFIG = {
        SPEED_FACTOR: 0.168,
        POWER_FACTOR: 0.83,
        RPM_FACTOR: 42.7
    };

    static parse(dataView: DataView): Partial<BikeMetrics> {
        const flags = dataView.getUint16(0, true);
        let offset = 2;
        let result: Partial<BikeMetrics> = {};

        // 1. Velocidade é mandatória na especificação
        result.speed = dataView.getUint16(offset, true) / 100;
        offset += 2;

        // Função auxiliar para evitar repetição e tratar offsets dinâmicos
        const readIfPresent = (bit: number, length: number, type = 'uint16') => {
            if (flags & (1 << bit)) {
                let value;
                if (type === 'uint16') value = dataView.getUint16(offset, true);
                else if (type === 'int16') value = dataView.getInt16(offset, true);
                else if (type === 'uint24') {
                    value = dataView.getUint8(offset) + (dataView.getUint8(offset + 1) << 8) + (dataView.getUint8(offset + 2) << 16);
                }
                offset += length;
                return value;
            }
            return null;
        };

        result.avgSpeed = readIfPresent(1, 2);
        result.cadence = readIfPresent(2, 2); // Unidade geralmente é 0.5
        result.avgCadence = readIfPresent(3, 2);
        result.totalDistance = readIfPresent(4, 3, 'uint24');
        result.resistance = readIfPresent(5, 2);
        result.power = readIfPresent(6, 2, 'int16');
        result.avgPower = readIfPresent(7, 2, 'int16');
        // ... pular Expended Energy (bit 8 - 5 bytes) se necessário
        if (flags & (1 << 8)) offset += 5;

        return result;
    }
}
