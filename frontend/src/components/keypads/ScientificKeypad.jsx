import React from 'react';
import CalculatorButton from '../CalculatorButton';

const ScientificKeypad = ({ onKeyPress }) => {
    const keys = [
        ['sin', 'cos', 'tan', 'C', 'DEL'],
        ['log', 'ln', 'e', 'π', '÷'],
        ['x²', '^', '√', '(', ')'],
        ['7', '8', '9', '!', '×'],
        ['4', '5', '6', '%', '-'],
        ['1', '2', '3', '.', '+'],
        ['0', '=']
    ];

    return (
        <div className="grid grid-cols-5 gap-2">
            {keys.flat().map((key) => {
                let variant = 'default';
                let colSpan = 1;

                if (['C', 'DEL', '(', ')', '%'].includes(key)) variant = 'action';
                if (['÷', '×', '-', '+', '^', '√', '!'].includes(key)) variant = 'operator';
                if (['sin', 'cos', 'tan', 'log', 'ln', 'e', 'π', 'x²'].includes(key)) {
                    variant = 'action';
                }
                if (key === '=') { variant = 'accent'; colSpan = 3; }
                if (key === '0') colSpan = 2;

                return (
                    <CalculatorButton
                        key={`${key}_sc`}
                        label={key}
                        variant={variant}
                        colSpan={colSpan}
                        className={`h-12 ${colSpan > 1 ? 'text-2xl' : 'text-sm'} font-semibold`}
                        onClick={onKeyPress}
                    />
                );
            })}
        </div>
    );
};

export default ScientificKeypad;
