import { useState, useEffect, useMemo, useRef } from 'react';
// @ts-ignore
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import Loader from '@/components/ui/Loader';

export interface LocationValue {
    address: string;
    lat: number;
    lng: number;
    placeId?: string;
    city?: string;
    country?: string;
}

interface LocationPickerProps {
    value?: LocationValue | null;
    onChange: (value: LocationValue) => void;
    error?: string;
    label?: string;
}

export function LocationPicker({ value, onChange, error, label = "Location" }: LocationPickerProps) {
    const [inputValue, setInputValue] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Use a ref to track if the current input value matches the selected value
    // This helps prevent re-searching when selecting an item
    const isSelectionUpdate = useRef(false);

    const provider = useMemo(() => new OpenStreetMapProvider(), []);
    const debouncedQuery = useDebounce(inputValue, 500);

    // Sync internal input with prop value
    useEffect(() => {
        if (value && value.address !== inputValue) {
            // Only update if significantly different to avoid cursor jumping if we were typing
            // But since value usually comes from selection, strictly syncing 'address' is safer
            // We use the ref to know if we should ignore the effect of input change
            if (!isSelectionUpdate.current) {
                setInputValue(value.address);
            }
        }
    }, [value]); // careful with deps

    // Search Effect
    useEffect(() => {
        const search = async () => {
            // If this update was triggered by a selection, don't search
            if (isSelectionUpdate.current) {
                isSelectionUpdate.current = false;
                return;
            }

            if (!debouncedQuery || debouncedQuery.length < 3) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const searchResults = await provider.search({ query: debouncedQuery });
                setResults(searchResults);
                setShowResults(true);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        search();
    }, [debouncedQuery, provider]);

    const handleSelect = (result: any) => {
        isSelectionUpdate.current = true;

        const { x, y, label, raw } = result;
        const city = raw.address?.city || raw.address?.town || raw.address?.village || '';
        const country = raw.address?.country || '';

        const newVal = {
            address: label,
            lat: Number(y),
            lng: Number(x),
            city,
            country
        };

        setInputValue(label);
        onChange(newVal);
        setShowResults(false);
    };

    const handleManualInput = () => {
        // Use current input as address with dummy coords or 0,0
        // Ideally we might want to geocode this on blur, but for "force" use:
        isSelectionUpdate.current = true;
        onChange({
            address: inputValue,
            lat: 0,
            lng: 0,
            city: '',
            country: ''
        });
        setShowResults(false);
    }

    return (
        <div className="space-y-2 relative">
            <Label className="flex items-center justify-between">
                <span>{label} <span className="text-red-500">*</span></span>
            </Label>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isLoading ? (
                        <Loader variant="inline" size="sm" className="m-0 p-0" />
                    ) : (
                        <MapPin className="h-4 w-4 text-slate-400" />
                    )}
                </div>
                <input
                    type="text"
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    placeholder="Search for institution location..."
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => {
                        if (results.length > 0) setShowResults(true);
                    }}
                    // Delay hiding results to allow click event
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                />
            </div>

            {showResults && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-slate-200 max-h-[300px] overflow-auto">
                    {results.length > 0 ? (
                        <ul className="py-1">
                            {results.map((result: any, idx: number) => (
                                <li
                                    key={idx}
                                    className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-start gap-2 text-sm text-slate-700"
                                    onMouseDown={(e) => {
                                        e.preventDefault(); // Prevent blur before click
                                        handleSelect(result);
                                    }}
                                >
                                    <MapPin className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                                    <span>{result.label}</span>
                                </li>
                            ))}
                        </ul>
                    ) : !isLoading && inputValue.length > 2 && (
                        <div className="p-4 text-center">
                            <p className="text-sm text-slate-500 mb-2">No exact matches found.</p>
                            <button
                                type="button"
                                className="text-xs flex items-center justify-center gap-1 mx-auto text-indigo-600 font-medium hover:underline"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleManualInput();
                                }}
                            >
                                <Navigation className="w-3 h-3" />
                                Use "{inputValue}" anyway
                            </button>
                        </div>
                    )}
                </div>
            )}

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            {value && value.lat !== 0 && (
                <p className="text-xs text-slate-400">
                    <span className="font-medium">Selected:</span> {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
                </p>
            )}
        </div>
    );
}
