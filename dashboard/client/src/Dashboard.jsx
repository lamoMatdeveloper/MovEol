import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Zap, Fan, Activity, Battery, Wifi, WifiOff } from 'lucide-react';

const socket = io('http://localhost:3000');

export default function Dashboard() {
    const [data, setData] = useState({ voltage: 0, current: 0, power: 0, rpm: 0 });
    const [history, setHistory] = useState([]);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));

        socket.on('turbine-data', (newData) => {
            setData(newData);
            setHistory(prev => {
                const newHistory = [...prev, { ...newData, time: new Date().toLocaleTimeString() }];
                if (newHistory.length > 20) newHistory.shift();
                return newHistory;
            });
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('turbine-data');
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 md:p-12 font-sans select-none">
            {/* Header */}
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-xl">
                        <Fan className="w-8 h-8 text-primary animate-spin-slow" style={{ animationDuration: '3s' }} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                        MovEol Monitor
                    </h1>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${connected ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
                    {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                    <span className="text-sm font-medium">{connected ? 'Connected' : 'Disconnected'}</span>
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Generated Power"
                    value={data.power}
                    unit="W"
                    icon={<Zap className="w-5 h-5 text-yellow-400" />}
                    color="yellow"
                />
                <StatCard
                    title="Voltage"
                    value={data.voltage}
                    unit="V"
                    icon={<Battery className="w-5 h-5 text-blue-400" />}
                    color="blue"
                />
                <StatCard
                    title="Current"
                    value={data.current}
                    unit="A"
                    icon={<Activity className="w-5 h-5 text-green-400" />}
                    color="green"
                />
                <StatCard
                    title="Turbine Speed"
                    value={data.rpm}
                    unit="RPM"
                    icon={<Fan className="w-5 h-5 text-purple-400" />}
                    color="purple"
                />
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-semibold mb-6 text-slate-300">Power Output History</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 12 }} interval={4} />
                                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fbbf24' }}
                                />
                                <Area type="monotone" dataKey="power" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorPower)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-1 bg-slate-800/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col justify-center items-center">
                    <h3 className="text-lg font-semibold mb-6 text-slate-300 w-full text-left">Efficiency Status</h3>
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        {/* Simple Circular Gauge using multiple divs or SVG */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="50%" cy="50%" r="70" className="stroke-slate-700" strokeWidth="12" fill="none" />
                            <circle
                                cx="50%" cy="50%" r="70"
                                className="stroke-primary transition-all duration-500 ease-out"
                                strokeWidth="12"
                                fill="none"
                                strokeDasharray="440"
                                strokeDashoffset={440 - (440 * (data.rpm / 600))} // Assuming 600 is max RPM
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-bold">{Math.round(data.rpm)}</span>
                            <span className="text-xs text-slate-400">RPM</span>
                        </div>
                    </div>
                    <p className="mt-6 text-sm text-slate-400 text-center">
                        Turbine is operating at {Math.round((data.rpm / 600) * 100)}% capacity.
                    </p>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, unit, icon, color }) {
    return (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl hover:bg-slate-800/70 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-700/50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
                {/* <span className={`text-xs font-semibold px-2 py-1 rounded bg-${color}-500/10 text-${color}-400`}>
                    Live
                </span> */}
                {/* Tailwind dynamic classes in string interp is risky without safelist. Hardcoding for now or using style */}
            </div>
            <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                <h2 className="text-3xl font-bold tracking-tight text-white">
                    {value} <span className="text-lg text-slate-500 font-normal">{unit}</span>
                </h2>
            </div>
        </div>
    )
}
