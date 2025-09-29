import React, { useState, useEffect, useMemo } from 'react';
import Panel from './Panel';
import type { Language, CurrentWeather, KeyMetric } from '../types';
import { WeatherCondition } from '../types';
import { TRANSLATIONS } from '../constants';
import { SprinklerIcon, DropletIcon, WarningIcon, ShieldCheckIcon } from './Icons';

interface IrrigationControlPanelProps {
    language: Language;
    currentWeather: CurrentWeather;
    soilMoisture: KeyMetric;
}

type Mode = 'off' | 'automatic' | 'manual';
type ManualStatus = 'on' | 'off';

const HIGH_MOISTURE_THRESHOLD = 70; // %

const IrrigationControlPanel: React.FC<IrrigationControlPanelProps> = ({ language, currentWeather, soilMoisture }) => {
    const t = TRANSLATIONS[language];
    const [mode, setMode] = useState<Mode>('automatic');
    const [startTime, setStartTime] = useState('05:00');
    const [endTime, setEndTime] = useState('06:00');
    const [manualStatus, setManualStatus] = useState<ManualStatus>('off');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60 * 1000);
        return () => clearInterval(timer);
    }, []);

    const { isScheduled, isRaining, isSaturated } = useMemo(() => {
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        const scheduled = (currentHour > startHour || (currentHour === startHour && currentMinute >= startMinute)) &&
                            (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute));

        const raining = currentWeather.condition === WeatherCondition.Rainy || currentWeather.condition === WeatherCondition.Stormy;
        const saturated = soilMoisture.value > HIGH_MOISTURE_THRESHOLD;

        return { isScheduled: scheduled, isRaining: raining, isSaturated: saturated };
    }, [currentTime, startTime, endTime, currentWeather.condition, soilMoisture.value]);

    const statusInfo = useMemo(() => {
        if (mode === 'off') {
            return {
                status: t.off,
                reason: t.statusReason_Off,
                icon: <SprinklerIcon className="w-10 h-10 text-muted-dark" />,
                color: 'text-muted-dark',
            };
        }

        if (mode === 'automatic') {
            if (!isScheduled) {
                return {
                    status: t.inactive,
                    reason: t.statusReason_OffSchedule,
                    icon: <SprinklerIcon className="w-10 h-10 text-muted-dark" />,
                    color: 'text-muted-dark',
                };
            }
            if (isRaining) {
                return {
                    status: t.suspended,
                    reason: t.statusReason_Rain,
                    icon: <ShieldCheckIcon className="w-10 h-10 text-yellow-500" />,
                    color: 'text-yellow-500',
                };
            }
            if (isSaturated) {
                 return {
                    status: t.suspended,
                    reason: t.statusReason_Saturated,
                    icon: <ShieldCheckIcon className="w-10 h-10 text-blue-400" />,
                    color: 'text-blue-400',
                };
            }
            return {
                status: t.irrigating,
                reason: t.statusReason_Scheduled,
                icon: <DropletIcon className="w-10 h-10 text-green-500 animate-pulse" />,
                color: 'text-green-500',
            };
        }
        
        // Manual mode
        if (manualStatus === 'on') {
            return {
                status: t.irrigating,
                reason: t.statusReason_ManualOn,
                icon: <DropletIcon className="w-10 h-10 text-blue-500 animate-pulse" />,
                color: 'text-blue-500',
            };
        }
        return {
            status: t.idle,
            reason: t.statusReason_ManualOff,
            icon: <SprinklerIcon className="w-10 h-10 text-blue-500" />,
            color: 'text-blue-500',
        };
        
    }, [mode, isScheduled, isRaining, isSaturated, manualStatus, t]);
    
    const manualStartDisabled = manualStatus === 'on' || isRaining || isSaturated;
    
    const getManualWarning = () => {
        if (isRaining) return t.rainWarning;
        if (isSaturated) return t.saturatedWarning;
        return '';
    }

    const ModeButton: React.FC<{ type: Mode; label: string; }> = ({ type, label }) => (
        <button
            onClick={() => setMode(type)}
            className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                mode === type
                ? 'bg-primary text-white'
                : 'bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
        >
            {label}
        </button>
    );

    return (
        <Panel title={t.irrigationControl} className="row-span-2">
            <div className="h-full flex flex-col space-y-4">
                {/* Mode Selection */}
                <div className="flex gap-2 p-1 bg-gray-200 dark:bg-slate-900 rounded-lg">
                    <ModeButton type="off" label={t.off} />
                    <ModeButton type="automatic" label={t.automatic} />
                    <ModeButton type="manual" label={t.manual} />
                </div>

                {/* Timer Settings */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-muted-light dark:text-muted-dark">{t.startTime}</label>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full mt-1 p-2 bg-background-light dark:bg-background-dark border border-gray-300 dark:border-slate-600 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-light dark:text-muted-dark">{t.endTime}</label>
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full mt-1 p-2 bg-background-light dark:bg-background-dark border border-gray-300 dark:border-slate-600 rounded-md"
                        />
                    </div>
                </div>

                {/* Status Display */}
                <div className="flex-grow flex flex-col items-center justify-center p-4 bg-background-light dark:bg-background-dark rounded-lg text-center">
                    {statusInfo.icon}
                    <p className={`mt-2 font-bold text-lg ${statusInfo.color}`}>{statusInfo.status}</p>
                    <p className="text-base text-text-light dark:text-text-dark mt-1 px-2">{statusInfo.reason}</p>
                </div>
                
                {/* Manual Controls */}
                {mode === 'manual' && (
                    <div className="space-y-2">
                        {manualStartDisabled && manualStatus === 'off' && (
                            <div className="flex items-center justify-center gap-2 text-sm text-yellow-500 bg-yellow-500/10 p-2 rounded-md">
                                <WarningIcon className="w-4 h-4" />
                                <span>{getManualWarning()}</span>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => setManualStatus('on')}
                                disabled={manualStartDisabled}
                                title={getManualWarning()}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {t.startIrrigation}
                            </button>
                            <button 
                                onClick={() => setManualStatus('off')}
                                disabled={manualStatus === 'off'}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {t.stopIrrigation}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Panel>
    );
};

export default IrrigationControlPanel;