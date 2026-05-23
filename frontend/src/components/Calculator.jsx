import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as math from 'mathjs';
import { Mic, MicOff, Download, Share2, Camera } from 'lucide-react';
import html2canvas from 'html2canvas';
import RobotAssistant from './RobotAssistant';
import { useAuth } from '../context/AuthContext';
import { solveAlgebraEquation } from '../utils/algebraSolver';

const ImageSolverModal = lazy(() => import('./ImageSolverModal'));

import BasicKeypad from './keypads/BasicKeypad';
import ScientificKeypad from './keypads/ScientificKeypad';
import ProgrammerKeypad from './keypads/ProgrammerKeypad';

const Calculator = () => {
    const { api } = useAuth();
    const displayRef = useRef(null);

    const [mode, setMode] = useState('basic');
    const [expr, setExpr] = useState('');
    const [result, setResult] = useState('');
    const [robotState, setRobotState] = useState('idle');
    const [robotMsg, setRobotMsg] = useState('Ready!');

    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [equationSteps, setEquationSteps] = useState(null);

    const [insightBadge, setInsightBadge] = useState(null);
    const badgeTimeoutRef = useRef(null);

    const [base, setBase] = useState('DEC');
    const [conversions, setConversions] = useState({ HEX: '0', DEC: '0', OCT: '0', BIN: '0' });

    const isPrime = (num) => {
        if (num <= 1 || !Number.isInteger(num)) return false;
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) return false;
        }
        return true;
    };
    const isPerfectSquare = (n) => n > 0 && Number.isInteger(Math.sqrt(n));
    const isFibonacci = (n) => {
        if (n <= 0 || !Number.isInteger(n)) return false;
        const check1 = 5 * n * n + 4;
        const check2 = 5 * n * n - 4;
        return isPerfectSquare(check1) || isPerfectSquare(check2);
    };
    const isPowerOf2 = (n) => n > 0 && Number.isInteger(n) && (n & (n - 1)) === 0;

    const handleInput = (val) => {
        setExpr((prev) => prev + val);
        setRobotState('idle');
        setRobotMsg('Hmm...');
        setEquationSteps(null);
    };

    const handleClear = () => {
        setExpr('');
        setResult('');
        setRobotState('idle');
        setRobotMsg('Cleared!');
        setInsightBadge(null);
        setEquationSteps(null);
        if (mode === 'programmer') {
            setConversions({ HEX: '0', DEC: '0', OCT: '0', BIN: '0' });
        }
    };

    const handleDelete = () => {
        setExpr((prev) => prev.slice(0, -1));
    };

    const saveToHistory = async (expression, resultStr) => {
        try {
            if (!navigator.onLine) {
                const offlines = JSON.parse(localStorage.getItem('calcnova_offlines') || '[]');
                offlines.push({ expression, result: resultStr, mode });
                localStorage.setItem('calcnova_offlines', JSON.stringify(offlines));
            } else {
                await api.post('/history', { expression, result: resultStr, mode });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const formatExpressionForMathJs = (str) => {
        return str
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/π/g, 'pi')
            .replace(/√/g, 'sqrt(')
            .replace(/ln/g, 'log(')
            .replace(/log/g, 'log10(')
            .replace(/AND/g, '&')
            .replace(/OR/g, '|')
            .replace(/XOR/g, '^')
            .replace(/NOT/g, '~');
    };

    useEffect(() => {
        if (mode === 'programmer' && result && !isNaN(result)) {
            const dec = Math.floor(Number(result));
            setConversions({
                DEC: dec.toString(10),
                HEX: (dec >>> 0).toString(16).toUpperCase(),
                OCT: (dec >>> 0).toString(8),
                BIN: (dec >>> 0).toString(2)
            });
        }
    }, [result, mode]);

    const handleEquals = () => {
        try {
            setEquationSteps(null);

            // Algebra Intercept
            if (expr.includes('=') && /[a-zA-Z]/.test(expr)) {
                const solveResult = solveAlgebraEquation(expr);
                if (solveResult.success) {
                    setResult(solveResult.result);
                    setEquationSteps(solveResult.steps);
                    setRobotState('nerd');
                    setRobotMsg('Nice! Algebra solved.');
                    saveToHistory(expr, solveResult.result);
                    return;
                } else {
                    setResult('Error');
                    setRobotState('confused');
                    setRobotMsg('Unable to solve this equation');
                    return;
                }
            }

            const evalExpr = formatExpressionForMathJs(expr);
            const res = math.evaluate(evalExpr);

            let resStr = res.toString();
            if (typeof res === 'number') {
                resStr = Number(res.toFixed(10)).toString();
            }

            setResult(resStr);

            const numRes = Number(res);
            if (!isNaN(numRes)) {
                if (numRes > 1000000) {
                    setRobotState('excited');
                    setRobotMsg('Big brain move!');
                } else if (isPrime(numRes)) {
                    setRobotState('prime');
                    setRobotMsg('Prime power!');
                } else if (expr.length > 8 || expr.includes('sin') || expr.includes('cos') || expr.includes('log') || (expr.match(/[\+\-\*\/]/g) || []).length >= 3) {
                    setRobotState('curious');
                    setRobotMsg('Interesting pattern!');
                } else {
                    setRobotState('happy');
                    setRobotMsg('Nice one!');
                }

                // Insights
                if (isPrime(numRes)) setInsightBadge('Prime');
                else if (isFibonacci(numRes)) setInsightBadge('Fibonacci');
                else if (isPowerOf2(numRes)) setInsightBadge('Power of 2');
                else if (isPerfectSquare(numRes)) setInsightBadge('Perfect Square');
                else setInsightBadge(null);

                if (badgeTimeoutRef.current) clearTimeout(badgeTimeoutRef.current);
                badgeTimeoutRef.current = setTimeout(() => setInsightBadge(null), 4000);
            }

            saveToHistory(expr, resStr);
        } catch (err) {
            setResult('Error');
            setRobotState('confused');
            setRobotMsg('Invalid syntax!');
        }
    };

    const handleShare = async () => {
        if (!expr || !result || result === 'Error') return;
        try {
            const res = await api.post('/history/share', { expression: expr, result, mode });
            const shareUrl = `${window.location.origin}/share/${res.data.id}`;
            navigator.clipboard.writeText(shareUrl);
            alert(`Link copied to clipboard: ${shareUrl}`);
        } catch (err) {
            console.error('Failed to share', err);
        }
    };

    const handleExportPNG = async () => {
        if (!displayRef.current) return;
        const canvas = await html2canvas(displayRef.current, {
            backgroundColor: null,
            scale: 2,
        });
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `calcnova-export-${Date.now()}.png`;
        link.href = url;
        link.click();
    };

    const toggleVoiceInput = () => {
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Voice recognition not supported in your browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        // recognition.lang = 'en-US'; // Uses browser default if unset

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event) => {
            let transcript = event.results[0][0].transcript.toLowerCase();
            const parsed = transcript
                .replace(/times/g, '*')
                .replace(/multiplied by/g, '*')
                .replace(/plus/g, '+')
                .replace(/minus/g, '-')
                .replace(/divided by/g, '/')
                .replace(/over/g, '/')
                .replace(/power/g, '^')
                .replace(/percent/g, '%')
                .replace(/equals/g, '=')
                .replace(/\s+/g, '');

            if (parsed.includes('=')) {
                const finalParsed = parsed.replace('=', '');
                setExpr(prev => prev + finalParsed);
                setTimeout(() => document.getElementById('hidden-equals-btn')?.click(), 100);
            } else {
                setExpr(prev => prev + parsed);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const handleOcrSolve = (extractedExpression) => {
        const cleaned = extractedExpression.replace(/\s+/g, '');
        setExpr(cleaned);
        setTimeout(() => {
            const btn = document.getElementById('hidden-equals-btn');
            if (btn) btn.click();
        }, 150);
    };

    const handleKeyPress = (key) => {
        if (key === '=') handleEquals();
        else if (key === 'C') handleClear();
        else if (key === 'DEL') handleDelete();
        else {
            if (['sin', 'cos', 'tan', 'log', 'ln', '√'].includes(key)) {
                handleInput(key + '(');
            } else {
                handleInput(key);
            }
        }
    };

    // Keyboard support (numpad + regular digits)
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Prevent interference with input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const keyMap = {
                'Enter': '=',
                '=': '=',
                'Backspace': 'DEL',
                'Delete': 'C',
                'Escape': 'C',
                '*': '×',
                '/': '÷',
                '+': '+',
                '-': '-'
            };

            // Detect numbers (including numpad which resolves as e.key='1', etc)
            if (/^[0-9.]$/.test(e.key)) {
                e.preventDefault();
                handleKeyPress(e.key);
            } else if (keyMap[e.key]) {
                e.preventDefault();
                handleKeyPress(keyMap[e.key]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [expr]); // expr dependency inside handles prevents stale states

    // Global keyboard listener
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            // Ignore if active element is an input or textarea
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

            const keyMap = {
                'Enter': '=',
                '=': '=',
                'Backspace': 'DEL',
                'Delete': 'C',
                'Escape': 'C',
                '*': '×',
                '/': '÷',
                '+': '+',
                '-': '-'
            };

            // Support numbers and dot
            if (/^[0-9.]$/.test(e.key)) {
                e.preventDefault();
                handleKeyPress(e.key);
            }
            // Support mapped keys
            else if (keyMap[e.key]) {
                e.preventDefault();
                handleKeyPress(keyMap[e.key]);
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [expr]); // expr dependency ensures closures resolve properly on evaluate

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full">
            {/* Robot Assistant on the LEFT */}
            <div className="flex-shrink-0 z-10 hidden sm:flex">
                <RobotAssistant state={robotState} message={robotMsg} />
            </div>

            <motion.div
                ref={displayRef}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full rounded-3xl p-6 shadow-2xl border backdrop-blur-xl relative transition-all duration-300 z-10 ${mode === 'basic' ? 'sm:max-w-md' : 'sm:max-w-xl'
                    }`}
                style={{
                    backgroundColor: 'rgba(var(--color-bg-panel), 0.85)',
                    borderColor: 'var(--color-border)'
                }}
            >
                {/* Mobile Robot (top right context) */}
                <div className="absolute -top-4 -right-2 sm:hidden scale-50 z-20 origin-top-right">
                    <RobotAssistant state={robotState} message={robotMsg} />
                </div>

                <div className="flex justify-between items-end mb-6">
                    <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl items-center w-full justify-between sm:justify-start gap-2">
                        {['basic', 'scientific', 'programmer'].map((m) => (
                            <button
                                key={m}
                                onClick={() => {
                                    setMode(m);
                                    handleClear();
                                    if (m === 'programmer') {
                                        setRobotState('nerd');
                                        setRobotMsg('Time to code!');
                                    }
                                }}
                                className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg capitalize transition-all flex-1 sm:flex-none ${mode === m
                                    ? 'shadow-md scale-105 bg-white dark:bg-black/40'
                                    : 'opacity-60 hover:opacity-100'
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 ml-4">
                        <button onClick={handleShare} className="p-2 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-main" title="Share via link">
                            <Share2 size={18} />
                        </button>
                        <button onClick={handleExportPNG} className="p-2 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-main border border-transparent shadow-sm" title="Export as Image (PNG)">
                            <Download size={18} />
                        </button>
                    </div>

                    <button
                        onClick={handleEquals}
                        className="hidden"
                        id="hidden-equals-btn"
                    />
                </div>

                <div
                    className="w-full flex flex-col items-end mb-6 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border min-h-[120px] justify-end overflow-hidden relative group"
                    style={{ borderColor: 'var(--color-border)' }}
                >
                    <div className="absolute top-3 left-3 flex gap-2">
                        <button
                            onClick={toggleVoiceInput}
                            className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50' : 'opacity-40 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 text-main'
                                }`}
                            title="Voice Input (Speech to Math)"
                        >
                            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                        </button>

                        <button
                            onClick={() => setIsImageModalOpen(true)}
                            className="p-2 rounded-full transition-all opacity-40 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 text-main"
                            title="Scan Image Equation"
                        >
                            <Camera size={16} />
                        </button>
                    </div>

                    <div className="text-right text-xl sm:text-2xl mb-1 opacity-70 break-all w-full font-mono tracking-wide relative">
                        <AnimatePresence>
                            {insightBadge && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute left-0 bottom-0 text-[10px] sm:text-xs uppercase font-bold px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 tracking-wider shadow-sm"
                                >
                                    {insightBadge}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {expr}
                    </div>

                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={result + 'res'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-right text-4xl sm:text-5xl font-extrabold tracking-tight break-all"
                            style={{ color: 'var(--color-primary)' }}
                        >
                            {result || '0'}
                        </motion.div>
                    </AnimatePresence>

                    {/* Equation Steps rendering */}
                    <AnimatePresence>
                        {equationSteps && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="w-full flex flex-col items-end gap-1 mt-4 pt-4 border-t border-black/10 dark:border-white/10 overflow-hidden"
                            >
                                <span className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Steps:</span>
                                {equationSteps.map((step, i) => (
                                    <div key={i} className="flex gap-3 justify-end items-center text-sm w-full">
                                        <span className="opacity-50 text-[10px] uppercase font-bold">{step.label}</span>
                                        <span className="font-mono" style={{ color: 'var(--color-primary)' }}>{step.text}</span>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <motion.div layout>
                    {mode === 'basic' && (
                        <BasicKeypad onKeyPress={handleKeyPress} />
                    )}
                    {mode === 'scientific' && (
                        <ScientificKeypad onKeyPress={handleKeyPress} />
                    )}
                    {mode === 'programmer' && (
                        <ProgrammerKeypad
                            onKeyPress={handleKeyPress}
                            base={base}
                            setBase={setBase}
                            conversions={conversions}
                        />
                    )}
                </motion.div>

                <Suspense fallback={null}>
                    <ImageSolverModal
                        isOpen={isImageModalOpen}
                        onClose={() => setIsImageModalOpen(false)}
                        onSolve={handleOcrSolve}
                        setRobotState={setRobotState}
                        setRobotMsg={setRobotMsg}
                    />
                </Suspense>
            </motion.div>
        </div>
    );
};

export default Calculator;