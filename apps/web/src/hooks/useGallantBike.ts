import { useState, useCallback, useRef } from 'react';
import { GallantParser, BikeMetrics } from '@mono/core';

export type BikeStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export function useGallantBike() {
    const [status, setStatus] = useState<BikeStatus>('disconnected');
    const [metrics, setMetrics] = useState<Partial<BikeMetrics>>({ speed: 0, cadence: 0, power: 0 });
    const [error, setError] = useState<string | null>(null);
    const [buffer, setBuffer] = useState<Partial<BikeMetrics>[]>([]);

    const deviceRef = useRef<BluetoothDevice | null>(null);

    const connect = useCallback(async () => {
        try {
            setStatus('connecting');
            setError(null);

            const device = await navigator.bluetooth.requestDevice({
                filters: [{ namePrefix: 'GLT' }, { namePrefix: 'Gallant' }],
                optionalServices: [0x1826]
            });

            device.addEventListener('gattserverdisconnected', onDisconnected);

            const server = await device.gatt?.connect();
            const service = await server?.getPrimaryService(0x1826);
            const characteristic = await service?.getCharacteristic(0x2AD2);

            await characteristic?.startNotifications();

            characteristic?.addEventListener('characteristicvaluechanged', (event: any) => {
                const rawData = event.target.value;
                const parsed = GallantParser.parse(rawData);

                setMetrics(prev => ({ ...prev, ...parsed }));

                if (parsed.speed || parsed.power || parsed.cadence) {
                    setBuffer(prev => [...prev, parsed]);
                }
            });

            deviceRef.current = device;
            setStatus('connected');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha na conexão');
            setStatus('error');
        }
    }, []);

    const onDisconnected = () => {
        setStatus('disconnected');
    };

    const disconnect = useCallback(() => {
        if (deviceRef.current?.gatt?.connected) {
            deviceRef.current.gatt.disconnect();
        }
    }, []);

    return { status, metrics, error, buffer, connect, disconnect };
}
