import React, { memo } from 'react';
import CalculatorButton from '../CalculatorButton';

const ProgrammerKeypad = ({ onKeyPress, base, setBase, conversions }) => {
    const bitwiseKeys = ['AND', 'OR', 'XOR', 'NOT', '<<', '>>'];
    const hexKeys = ['A', 'B', 'C', 'D', 'E', 'F'];
    const basicKeys = [
        ['C', 'DEL', '(', ')'],
        ['7', '8', '9', '÷'],
        ['4', '5', '6', '×'],
        ['1', '2', '3', '-'],
        ['0', '=', '+']
    ];

    // Determine disabled keys based on base
    const isDisabled = (key) => {
        if (base === 'BIN' && !['0', '1', 'C', 'DEL', '=', '+', '-', '×', '÷', 'AND', 'OR', 'XOR', 'NOT', '<<', '>>', '(', ')'].includes(key)) return true;
        if (base === 'OCT' && ['8', '9', 'A', 'B', 'C', 'D', 'E', 'F'].includes(key)) return true;
        if (base === 'DEC' && ['A', 'B', 'C', 'D', 'E', 'F'].includes(key)) return true;
        return false;
    };

    return (
        <div className="flex flex-col gap-[clamp(0.25rem,1vh,0.75rem)]">
            {/* Live conversions */}
            <div className="grid grid-cols-4 gap-[clamp(0.2rem,0.5vh,0.5rem)] mb-[clamp(0.2rem,0.5vh,0.5rem)] p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-border">
                {['HEX', 'DEC', 'OCT', 'BIN'].map(b => (
                    <div
                        key={b}
                        onClick={() => setBase(b)}
                        className={`text-xs p-1 rounded cursor-pointer transition-colors ${base === b ? 'bg-primary text-white scale-105 shadow-md font-bold' : 'hover:bg-black/10 dark:hover:bg-white/10 opacity-70'}`}
                    >
                        <span className="opacity-70 mr-1">{b}</span>
                        <span className="block truncate font-mono">{conversions[b] || '0'}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-6 gap-2">
                {/* Hex Column */}
                <div className="col-span-1 flex flex-col gap-2">
                    {hexKeys.map(k => (
                        <CalculatorButton
                            key={k} label={k} variant="action"
                            className={`h-[clamp(2.5rem,6vh,3rem)] text-sm ${isDisabled(k) ? 'opacity-30 pointer-events-none' : ''}`}
                            onClick={onKeyPress}
                        />
                    ))}
                </div>

                {/* Main Keys */}
                <div className="col-span-5 flex flex-col gap-2">
                    <div className="grid grid-cols-6 gap-2">
                        {bitwiseKeys.map(k => (
                            <CalculatorButton
                                key={k} label={k} variant="operator"
                                className="h-[clamp(2.5rem,6vh,3rem)] text-[10px] sm:text-xs shadow-sm bg-secondary"
                                onClick={onKeyPress}
                            />
                        ))}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {basicKeys.flat().map((key) => {
                            let variant = 'default';
                            let colSpan = 1;
                            if (['C', 'DEL', '(', ')'].includes(key)) variant = 'action';
                            if (['÷', '×', '-', '+'].includes(key)) variant = 'operator';
                            if (key === '=') { variant = 'accent'; colSpan = 2; }
                            if (key === '0') colSpan = 1;

                            return (
                                <CalculatorButton
                                    key={`prog_${key}`}
                                    label={key}
                                    variant={variant}
                                    colSpan={colSpan}
                                    className={`h-[clamp(2.5rem,6vh,3rem)] text-[clamp(1rem,2vh,1.25rem)] font-semibold ${isDisabled(key) ? 'opacity-30 pointer-events-none' : ''}`}
                                    onClick={onKeyPress}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(ProgrammerKeypad);
