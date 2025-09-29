import React, { useState, useEffect, useMemo, useRef } from 'react';
import Panel from './Panel';
import type { Language, CurrentWeather } from '../types';
import { WeatherCondition } from '../types';
import { TRANSLATIONS } from '../constants';
import { CameraIcon, CameraOffIcon, ShieldCheckIcon, WarningIcon, SpinnerIcon } from './Icons';

interface CameraAutomationPanelProps {
    language: Language;
    currentWeather: CurrentWeather;
}

type Mode = 'off' | 'automatic' | 'manual';
type ManualStatus = 'deployed' | 'docked' | 'deploying' | 'docking';

const CameraAutomationPanel: React.FC<CameraAutomationPanelProps> = ({ language, currentWeather }) => {
    const t = TRANSLATIONS[language];
    const [mode, setMode] = useState<Mode>('off');
    const [startTime, setStartTime] = useState('07:00');
    const [endTime, setEndTime] = useState('08:00');
    const [manualStatus, setManualStatus] = useState<ManualStatus>('docked');
    const [currentTime, setCurrentTime] = useState(new Date());
    const transitionTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60 * 1000); // Update every minute
        return () => {
            clearInterval(timer);
            if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
            }
        };
    }, []);
    
    const { isScheduled, isSafeWeather } = useMemo(() => {
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        const scheduled = (currentHour > startHour || (currentHour === startHour && currentMinute >= startMinute)) &&
                            (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute));

        const safeWeather = currentWeather.condition === WeatherCondition.Sunny || currentWeather.condition === WeatherCondition.Cloudy;
        
        return { isScheduled: scheduled, isSafeWeather: safeWeather };
    }, [currentTime, startTime, endTime, currentWeather.condition]);

    const handleDeploy = () => {
        if (manualStatus === 'docked' && isSafeWeather) {
            setManualStatus('deploying');
            transitionTimeoutRef.current = window.setTimeout(() => {
                setManualStatus('deployed');
                transitionTimeoutRef.current = null;
            }, 2000);
        }
    };

    const handleDock = () => {
        if (manualStatus === 'deployed') {
            setManualStatus('docking');
            transitionTimeoutRef.current = window.setTimeout(() => {
                setManualStatus('docked');
                transitionTimeoutRef.current = null;
            }, 2000);
        }
    };

    const statusInfo = useMemo(() => {
        if (mode === 'off') {
            return {
                status: t.inactive,
                reason: t.statusReason_Off,
                icon: <CameraOffIcon className="w-10 h-10 text-muted-dark" />,
                color: 'text-muted-dark',
            };
        }

        if (mode === 'manual') {
            switch (manualStatus) {
                case 'deploying':
                    return { status: t.deploying, reason: t.statusReason_Manual, icon: <SpinnerIcon className="w-10 h-10 text-blue-500" />, color: 'text-blue-500' };
                case 'docking':
                    return { status: t.docking, reason: t.statusReason_Manual, icon: <SpinnerIcon className="w-10 h-10 text-blue-500" />, color: 'text-blue-500' };
                case 'deployed':
                    return { status: t.deployed, reason: t.statusReason_Manual, icon: <CameraIcon className="w-10 h-10 text-blue-500" />, color: 'text-blue-500' };
                case 'docked':
                    return { status: t.docked, reason: t.statusReason_Manual, icon: <ShieldCheckIcon className="w-10 h-10 text-blue-500" />, color: 'text-blue-500' };
            }
        }

        if (mode === 'automatic') {
            if (!isScheduled) {
                return {
                    status: t.docked,
                    reason: t.statusReason_OffSchedule,
                    icon: <CameraOffIcon className="w-10 h-10 text-muted-dark" />,
                    color: 'text-muted-dark',
                };
            }
            if (isSafeWeather) {
                return {
                    status: t.deployed,
                    reason: t.statusReason_GoodWeather,
                    icon: <CameraIcon className="w-10 h-10 text-green-500" />,
                    color: 'text-green-500',
                };
            } else {
                return {
                    status: t.docked,
                    reason: t.statusReason_BadWeather,
                    icon: <ShieldCheckIcon className="w-10 h-10 text-red-500" />,
                    color: 'text-red-500',
                };
            }
        }
        
        // Fallback
        return { status: t.inactive, reason: '...', icon: <CameraOffIcon className="w-10 h-10 text-muted-dark" />, color: 'text-muted-dark' };

    }, [mode, isScheduled, isSafeWeather, manualStatus, t]);

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

    const isTransitioning = manualStatus === 'deploying' || manualStatus === 'docking';

    return (
        <Panel title={t.cameraModuleAutomation} className="row-span-2">
            <div className="h-full flex flex-col space-y-4">
                {/* Mode Selection */}
                <div className="flex gap-2 p-1 bg-gray-200 dark:bg-slate-900 rounded-lg">
                    <ModeButton type="off" label={t.off} />
                    <ModeButton type="automatic" label={t.automatic} />
                    <ModeButton type="manual" label={t.manual} />
                </div>

                {/* Unsafe Weather Warning */}
                {!isSafeWeather && isScheduled && mode !== 'off' && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/20 text-yellow-400">
                        <WarningIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-500" />
                        <div>
                           <p className="font-bold">{t.weatherUnsafe}</p>
                           <p className="text-sm">{t.unsafeWeatherWarning.replace('{condition}', t[currentWeather.condition] || currentWeather.condition)}</p>
                        </div>
                    </div>
                )}

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
                        {isSafeWeather ? (
                            <div className="flex items-center justify-center gap-2 text-sm text-green-500 bg-green-500/10 p-2 rounded-md">
                                <ShieldCheckIcon className="w-4 h-4" />
                                <span>{t.weatherSafe}</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 text-sm text-red-500 bg-red-500/10 p-2 rounded-md">
                                <WarningIcon className="w-4 h-4" />
                                <span>{t.weatherUnsafe}</span>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={handleDeploy}
                                disabled={isTransitioning || manualStatus === 'deployed' || !isSafeWeather}
                                title={!isSafeWeather ? t.deploymentDisabled : ''}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {t.deployCamera}
                            </button>
                            <button 
                                onClick={handleDock}
                                disabled={isTransitioning || manualStatus === 'docked'}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {t.dockCamera}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Panel>
    );
};

export default CameraAutomationPanel;