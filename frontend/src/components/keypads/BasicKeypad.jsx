import React, { memo } from 'react';
import CalculatorButton from '../CalculatorButton';

const BasicKeypad = ({ onKeyPress }) => {
    const keys = [
        ['C', 'DEL', '%', '÷'],
        ['7', '8', '9', '×'],
        ['4', '5', '6', '-'],
        ['1', '2', '3', '+'],
        ['0', '.', '=']
    ];

    return (
        <div className="grid grid-cols-4 gap-3">
            {keys.flat().map((key) => {
                let variant = 'default';
                let colSpan = 1;
                if (['C', 'DEL', '%'].includes(key)) variant = 'action';
                if (['÷', '×', '-', '+'].includes(key)) variant = 'operator';
                if (key === '=') { variant = 'accent'; colSpan = 2; }
                if (key === '0') colSpan = 2;

                return (
                    <CalculatorButton
                        key={key}
                        label={key}
                        variant={variant}
                        colSpan={colSpan}
                        className="h-16 text-2xl font-semibold"
                        onClick={onKeyPress}
                    />
                );
            })}
        </div>
    );
};

export default memo(BasicKeypad);
