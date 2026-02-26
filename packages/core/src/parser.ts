export interface BikeMetrics {
    speed: number;
    cadence: number;
    power: number;
    timestamp: Date;
}

export class GallantParser {
    private static readonly CONFIG = {
        SPEED_FACTOR: 0.168,
        POWER_FACTOR: 0.83,
        RPM_FACTOR: 42.7
    };

    static parse(dataView: DataView): Partial<BikeMetrics> {
        const byteLength = dataView.byteLength;

        // 18 bytes (Speed and Power)
        if (byteLength === 18) {
            const rawSpeed = dataView.getUint16(2, true);
            const rawPower = dataView.getInt16(9, true);

            return {
                speed: Number((rawSpeed * this.CONFIG.SPEED_FACTOR).toFixed(1)),
                power: Math.round(rawPower * this.CONFIG.POWER_FACTOR),
                timestamp: new Date()
            };
        }

        // 6 bytes (Cadence)
        if (byteLength === 6) {
            const rawCad = dataView.getUint16(2, true);

            return {
                cadence: Math.round(rawCad / this.CONFIG.RPM_FACTOR),
                timestamp: new Date()
            };
        }

        return {};
    }
}
