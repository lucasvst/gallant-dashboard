import { useState } from 'react';
import { useGallantBike } from './hooks/useGallantBike';
import { Activity, Zap, Play, Square, Pause, Bluetooth, BluetoothConnected, Loader2 } from 'lucide-react';

function App() {
    const { status, metrics, error, connect, buffer } = useGallantBike();
    const [sessionState, setSessionState] = useState<'IDLE' | 'RECORDING' | 'PAUSED' | 'FINISHED'>('IDLE');
    const [sessionId, setSessionId] = useState<string | null>(null);

    const startSession = async () => {
        try {
            const res = await fetch('http://localhost:3000/v1/workouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startTime: new Date().toISOString() })
            });
            const data = await res.json();
            setSessionId(data.id);
            setSessionState('RECORDING');
        } catch (e) {
            console.error(e);
            alert('Error starting session. Make sure API is running on :3000');
        }
    };

    const stopSession = async () => {
        setSessionState('FINISHED');
        if (!sessionId) return;

        const avgPower = buffer.reduce((acc, curr) => acc + (curr.power || 0), 0) / (buffer.length || 1);

        try {
            await fetch(`http://localhost:3000/v1/workouts/${sessionId}/finish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endTime: new Date().toISOString(),
                    avgPower,
                    totalDistance: 0
                })
            });
            alert('Workout saved successfully!');
        } catch (e) {
            console.error(e);
            alert('Error saving session to API');
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 font-sans selection:bg-cyan-500/30">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex justify-between items-center bg-gray-900/50 p-6 rounded-3xl border border-gray-800 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-cyan-500/10 rounded-2xl">
                            <Activity className="w-8 h-8 text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                Gallant Dash
                            </h1>
                            <p className="text-sm text-gray-400 font-medium tracking-wide">Indoor Cycle Telemetry</p>
                        </div>
                    </div>

                    <button
                        onClick={connect}
                        disabled={status === 'connected' || status === 'connecting'}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${status === 'connected'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : status === 'connecting'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-cyan-500 hover:bg-cyan-400 text-gray-950 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                            }`}
                    >
                        {status === 'connected' ? <BluetoothConnected className="w-5 h-5" /> : status === 'connecting' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bluetooth className="w-5 h-5" />}
                        {status === 'connected' ? 'Connected' : status === 'connecting' ? 'Connecting...' : 'Connect Bike'}
                    </button>
                </header>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
                        {error}
                    </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap className="w-24 h-24 text-cyan-400" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-2">Speed</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-7xl font-black text-white tracking-tighter shadow-cyan-500/10 drop-shadow-2xl">
                                    {metrics.speed?.toFixed(1) || '0.0'}
                                </span>
                                <span className="text-gray-500 font-medium">km/h</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 relative overflow-hidden group hover:border-fuchsia-500/30 transition-colors">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Activity className="w-24 h-24 text-fuchsia-400" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-2">Cadence</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-7xl font-black text-white tracking-tighter">
                                    {metrics.cadence || 0}
                                </span>
                                <span className="text-gray-500 font-medium">rpm</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap className="w-24 h-24 text-amber-400" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-2">Power</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-7xl font-black text-white tracking-tighter">
                                    {metrics.power || 0}
                                </span>
                                <span className="text-gray-500 font-medium">watts</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 backdrop-blur-sm flex justify-center gap-6">
                    {sessionState === 'IDLE' || sessionState === 'FINISHED' ? (
                        <button
                            onClick={startSession}
                            disabled={status !== 'connected'}
                            className="flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-2xl font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                        >
                            <Play className="w-6 h-6 fill-current" />
                            Start Workout
                        </button>
                    ) : (
                        <>
                            <button
                                className="flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-gray-950 rounded-2xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                            >
                                <Pause className="w-6 h-6 fill-current" />
                                Pause
                            </button>
                            <button
                                onClick={stopSession}
                                className="flex items-center gap-3 px-8 py-4 bg-red-500 hover:bg-red-400 text-white rounded-2xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                            >
                                <Square className="w-6 h-6 fill-current" />
                                Stop & Save
                            </button>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}

export default App;
