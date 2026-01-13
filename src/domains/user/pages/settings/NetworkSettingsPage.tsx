import {useContext, useState} from "react";
import {useMountEffect, useIntervalEffect} from "@react-hookz/web";
import {HugeiconsIcon} from "@hugeicons/react";
import {Wifi01Icon, WifiDisconnected01Icon, Loading01Icon} from "@hugeicons-pro/core-twotone-rounded";
import {Wifi01Icon as Wifi01SolidIcon} from "@hugeicons-pro/core-solid-rounded";
import {NDKContext, RelayInfo} from "../../../../lib/ndk/NDKProvider";

const getStatusConfig = (status: RelayInfo['status']) => {
    switch (status) {
        case 'connected':
            return {
                icon: Wifi01SolidIcon,
                iconColor: 'text-green-500 dark:text-green-400',
                badgeClasses: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
                label: 'Connected'
            };
        case 'connecting':
            return {
                icon: Loading01Icon,
                iconColor: 'text-yellow-500 dark:text-yellow-400 animate-spin',
                badgeClasses: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
                label: 'Connecting'
            };
        case 'disconnected':
        default:
            return {
                icon: WifiDisconnected01Icon,
                iconColor: 'text-red-500 dark:text-red-400',
                badgeClasses: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
                label: 'Disconnected'
            };
    }
};

const NetworkSettingsPage = () => {
    const {getRelays} = useContext(NDKContext) as NDKContext;
    const [relays, setRelays] = useState<RelayInfo[]>([]);

    // Initial load
    useMountEffect(() => {
        setRelays(getRelays());
    });

    // Poll for status updates every 3 seconds
    useIntervalEffect(() => {
        setRelays(getRelays());
    }, 3000);

    const connectedCount = relays.filter(r => r.status === 'connected').length;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-base font-semibold leading-7 text-slate-900 dark:text-slate-100">Network</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Configure your relay connections.
                </p>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">Connected Relays</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Your connection to the Nostr network.
                        </p>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        {connectedCount}/{relays.length} connected
                    </span>
                </div>

                {relays.length === 0 ? (
                    <div className="text-center py-8">
                        <HugeiconsIcon icon={Wifi01Icon} className="mx-auto text-slate-400 dark:text-slate-500" size={32} />
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No relays configured</p>
                    </div>
                ) : (
                    <ul className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
                        {relays.map((relay) => {
                            const config = getStatusConfig(relay.status);
                            return (
                                <li key={relay.url} className="flex items-center justify-between px-4 py-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <HugeiconsIcon
                                            icon={config.icon}
                                            className={config.iconColor}
                                            size={20}
                                        />
                                        <span className="text-sm text-slate-700 dark:text-slate-300 font-mono truncate">
                                            {relay.url}
                                        </span>
                                    </div>
                                    <span className={`shrink-0 ml-2 text-xs px-2 py-1 rounded-full ${config.badgeClasses}`}>
                                        {config.label}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {/* Future: Add Custom Relay button - currently hidden */}
                {/* <div className="mt-4">
                    <button className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300">
                        + Add Custom Relay
                    </button>
                </div> */}
            </div>
        </div>
    );
};

export default NetworkSettingsPage;
