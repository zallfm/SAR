import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { UarReviewIcon } from './icons/UarReviewIcon';
import { DivisionApprovedIcon } from './icons/DivisionApprovedIcon';
import { SoApprovedIcon } from './icons/SoApprovedIcon';
import { CompletedIcon } from './icons/CompletedIcon';
import { uarDivisionProgress, uarDepartmentProgress, uarSystemProgressData } from '../data';
import type { UarProgressData } from '../data';

declare var Chart: any;

interface StatCardProps {
    icon: React.ReactNode;
    value: string;
    label: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => (
    <div className="bg-white flex items-center p-4 rounded-xl shadow-sm border border-gray-200">
        {icon}
        <div className="ml-4">
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-sm text-gray-600">{label}</p>
        </div>
    </div>
);

// New SearchableDropdown component
interface SearchableDropdownProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({ label, value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSearchTerm(value || '');
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm(value || '');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value]);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) {
            return options;
        }
        return options.filter(option =>
            option.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    const handleSelect = (option: string) => {
        onChange(option);
        setSearchTerm(option);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (!isOpen) setIsOpen(true);
        if (e.target.value === '') { // If user clears input, deselect
            onChange('');
        }
    };
    
    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setSearchTerm('');
        setIsOpen(false);
    }

    return (
        <div className="relative w-full sm:w-40" ref={dropdownRef}>
            <div className="relative">
                <input
                    type="text"
                    placeholder={label}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    {value && (
                         <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            aria-label="Clear selection"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {isOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(option => (
                            <li
                                key={option}
                                onMouseDown={() => handleSelect(option)}
                                className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-100 ${value === option ? 'bg-blue-100 text-blue-700' : 'text-gray-800'}`}
                            >
                                {option}
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-2 text-sm text-gray-500">No options found</li>
                    )}
                </ul>
            )}
        </div>
    );
};

const UarProgressChart: React.FC<{ data: UarProgressData[]; selectedItem: string; yAxisRange?: {min: number, max: number}, onBarClick?: (label: string) => void; }> = ({ data, selectedItem, yAxisRange, onBarClick }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);

    const originalColors = {
        total: '#93C5FD',
        approved: '#A7F3D0',
        review: '#FDE047',
        soApproved: '#F9A8D4',
    };
    const grayColor = '#E5E7EB'; // tailwind gray-200

    useEffect(() => {
        if (chartRef.current) {
            const chartInstance = new Chart(chartRef.current, {
                type: 'bar',
                data: {
                    labels: data.map(d => d.label),
                    datasets: [
                        {
                            label: 'Total Progress (%)',
                            data: data.map(d => d.total),
                            backgroundColor: data.map(d => 
                                (selectedItem && d.label !== selectedItem) ? grayColor : originalColors.total
                            ),
                            borderRadius: 4,
                        },
                        {
                            label: 'Approved Progress (%)',
                            data: data.map(d => d.approved),
                            backgroundColor: data.map(d => 
                                (selectedItem && d.label !== selectedItem) ? grayColor : originalColors.approved
                            ),
                             borderRadius: 4,
                        },
                        {
                            label: 'Review Progress (%)',
                            data: data.map(d => d.review),
                            backgroundColor: data.map(d => 
                                (selectedItem && d.label !== selectedItem) ? grayColor : originalColors.review
                            ),
                             borderRadius: 4,
                        },
                        {
                            label: 'SO Approved (%)',
                            data: data.map(d => d.soApproved),
                            backgroundColor: data.map(d => 
                                (selectedItem && d.label !== selectedItem) ? grayColor : originalColors.soApproved
                            ),
                             borderRadius: 4,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    barPercentage: 0.8,
                    categoryPercentage: 0.7,
                    onClick: (event: any, elements: any[]) => {
                        if (onBarClick && elements.length > 0) {
                            const elementIndex = elements[0].index;
                            const label = chartInstance.data.labels[elementIndex];
                            if (typeof label === 'string') {
                                onBarClick(label);
                            }
                        }
                    },
                    onHover: (event: any, chartElement: any[]) => {
                        const canvas = event.native.target;
                        if (canvas) {
                           canvas.style.cursor = onBarClick && chartElement[0] ? 'pointer' : 'default';
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            align: 'start',
                            labels: {
                                usePointStyle: true,
                                boxWidth: 8,
                                padding: 20,
                            }
                        },
                         tooltip: {
                            enabled: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: yAxisRange ? false : true,
                            min: yAxisRange ? yAxisRange.min : 0,
                            max: yAxisRange ? yAxisRange.max : 100,
                            grid: {
                                drawBorder: false,
                            },
                        },
                        x: {
                            grid: {
                                display: false,
                            },
                        },
                    },
                },
            });
            return () => chartInstance.destroy();
        }
    }, [data, selectedItem, yAxisRange, onBarClick]);

    const chartWidth = Math.max(data.length * 160, 600); // Increased width per item for better visibility

    return (
        <div className="overflow-x-auto p-1">
            <div style={{ width: `${chartWidth}px`, height: '300px' }}>
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
};

const UarProgressPage: React.FC = () => {
    const [drilldownDivision, setDrilldownDivision] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState('07-2025');
    const [selectedDivisionFilter, setSelectedDivisionFilter] = useState('');
    const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('');
    const [selectedSystemFilter, setSelectedSystemFilter] = useState('');
    
    const divisionOptions = useMemo(() => [...new Set(uarDivisionProgress.map(d => d.label))], []);

    const departmentOptions = useMemo(() => {
        const relevantDepartments = drilldownDivision 
            ? uarDepartmentProgress.filter(d => d.division === drilldownDivision)
            : uarDepartmentProgress;
        return [...new Set(relevantDepartments.map(d => d.label))];
    }, [drilldownDivision]);

    const systemOptions = useMemo(() => {
        let relevantSystems = uarSystemProgressData;
        if (drilldownDivision) {
            relevantSystems = relevantSystems.filter(d => d.division === drilldownDivision);
        }
        if (selectedDepartmentFilter) {
            relevantSystems = relevantSystems.filter(d => d.department === selectedDepartmentFilter);
        }
        return [...new Set(relevantSystems.map(d => d.label))];
    }, [drilldownDivision, selectedDepartmentFilter]);

    const departmentChartData = useMemo(() => {
        if (!drilldownDivision) return [];
        return uarDepartmentProgress.filter(d => d.division === drilldownDivision);
    }, [drilldownDivision]);

    const systemAppsChartData = useMemo(() => {
        let filteredData = uarSystemProgressData;
        
        if (drilldownDivision) {
            filteredData = filteredData.filter(app => app.division === drilldownDivision);
        }
        
        if (selectedDepartmentFilter) {
            filteredData = filteredData.filter(app => app.department === selectedDepartmentFilter);
        }

        return filteredData;
    }, [drilldownDivision, selectedDepartmentFilter]);

    const handleDivisionBarClick = (divisionLabel: string) => {
        setDrilldownDivision(divisionLabel);
        setSelectedDivisionFilter(divisionLabel);
        setSelectedDepartmentFilter(''); 
        setSelectedSystemFilter('');
    };

    const handleDepartmentBarClick = (departmentLabel: string) => {
        setSelectedDepartmentFilter(prev => prev === departmentLabel ? '' : departmentLabel);
    };

    const handleBackToDivisionView = () => {
        setDrilldownDivision(null);
        setSelectedDivisionFilter('');
        setSelectedDepartmentFilter('');
        setSelectedSystemFilter('');
    };

    const handleDivisionFilterChange = (value: string) => {
        setSelectedDivisionFilter(value);
        setDrilldownDivision(value || null);
        setSelectedDepartmentFilter('');
        setSelectedSystemFilter('');
    };

    const handleDepartmentFilterChange = (value: string) => {
        setSelectedDepartmentFilter(value);
        setSelectedSystemFilter(''); // Reset system filter when department changes
    };

    const mainChartTitle = drilldownDivision 
        ? `UAR Progress by Department (Division: ${drilldownDivision})`
        : 'UAR Progress by Division';
    
    const systemChartTitle = useMemo(() => {
        let title = 'UAR Progress by System Apps';
        if (selectedDepartmentFilter) {
            return `${title} (Department: ${selectedDepartmentFilter})`;
        }
        if (drilldownDivision) {
            // When a division is selected, the data is filtered, but we don't add a subtitle.
            // The context is clear from the Department chart above it.
            return title;
        }
        return `${title} (All)`;
    }, [drilldownDivision, selectedDepartmentFilter]);
    
    const isDrilledDown = !!drilldownDivision;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">UAR Progress</h2>
                    <div className="h-1 w-20 bg-blue-600 rounded mt-1"></div>
                </div>
                <div className="flex gap-4 flex-wrap">
                    <SearchableDropdown 
                        label="Period" 
                        value={selectedPeriod} 
                        onChange={setSelectedPeriod} 
                        options={['07-2025']} 
                    />
                    <SearchableDropdown 
                        label="Division" 
                        value={selectedDivisionFilter} 
                        onChange={handleDivisionFilterChange} 
                        options={divisionOptions}
                    />
                    <SearchableDropdown 
                        label="Department" 
                        value={selectedDepartmentFilter} 
                        onChange={handleDepartmentFilterChange} 
                        options={departmentOptions} 
                    />
                    <SearchableDropdown 
                        label="System" 
                        value={selectedSystemFilter} 
                        onChange={setSelectedSystemFilter} 
                        options={systemOptions} 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<UarReviewIcon />} value="70%" label="UAR Review" />
                <StatCard icon={<DivisionApprovedIcon />} value="49%" label="Division Approved" />
                <StatCard icon={<SoApprovedIcon />} value="89%" label="SO Approved" />
                <StatCard icon={<CompletedIcon />} value="69%" label="Completed" />
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 
                  className={`text-xl font-bold text-gray-800 mb-4 ${isDrilledDown ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                  onClick={isDrilledDown ? handleBackToDivisionView : undefined}
                  aria-label={isDrilledDown ? "Back to Division View" : mainChartTitle}
                  role="button"
                >
                    {mainChartTitle}
                </h3>
                {isDrilledDown ? (
                    <UarProgressChart 
                        data={departmentChartData} 
                        selectedItem={selectedDepartmentFilter} 
                        yAxisRange={{min: 78, max: 92}}
                        onBarClick={handleDepartmentBarClick}
                    />
                ) : (
                    <UarProgressChart data={uarDivisionProgress} selectedItem={selectedDivisionFilter} onBarClick={handleDivisionBarClick} />
                )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{systemChartTitle}</h3>
                <UarProgressChart data={systemAppsChartData} selectedItem={selectedSystemFilter} yAxisRange={{min: 78, max: 92}} />
            </div>
        </div>
    );
};

export default UarProgressPage;