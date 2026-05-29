import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, Loader } from 'lucide-react';
import Tesseract from 'tesseract.js';

const ImageSolverModal = ({ isOpen, onClose, onSolve, setRobotState, setRobotMsg }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [extractedText, setExtractedText] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef(null);

    React.useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleClose = () => {
        setPreviewUrl(null);
        setExtractedText('');
        setErrorMsg('');
        setIsProcessing(false);
        onClose();
    };

    // FUTURE-READY OCR ABSTRACTION LAYER
    const performOCR = async (imageSource) => {
        let worker = null;
        try {
            // Using createWorker to strictly set whitelist and PSM parameters
            worker = await Tesseract.createWorker('eng', 1, {
                logger: m => console.log(m)
            });
            await worker.setParameters({
                tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+-*/=^().% ',
                tessedit_pageseg_mode: '6', // 6 = Assume a single uniform block of text
            });
            const result = await worker.recognize(imageSource);
            return {
                text: result.data.text,
                confidence: result.data.confidence
            };
        } catch (error) {
            console.error("OCR Engine Error:", error);
            throw error;
        } finally {
            if (worker) await worker.terminate();
        }
    };

    // IMAGE PREPROCESSING (Critical for Accuracy)
    const preprocessImage = (file) => {
        const objectUrl = URL.createObjectURL(file);
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Enforce minimum width 1000px without losing aspect ratio for clarity
                if (width < 1000) {
                    const ratio = 1000 / width;
                    width = 1000;
                    height = height * ratio;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const imageData = ctx.getImageData(0, 0, width, height);
                const data = imageData.data;

                // Grayscale, Contrast, Binarize (Sharpen text edges)
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    let avg = (r + g + b) / 3;

                    // Adaptive-like threshold: Dark pixels to stark black, light to pure white
                    avg = avg < 160 ? 0 : 255;

                    data[i] = avg;     // R
                    data[i + 1] = avg; // G
                    data[i + 2] = avg; // B
                }

                ctx.putImageData(imageData, 0, 0);
                URL.revokeObjectURL(objectUrl);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = (err) => {
                URL.revokeObjectURL(objectUrl);
                reject(err);
            };
            img.src = objectUrl;
        });
    };

    // MATH EXPRESSION NORMALIZATION & EXPONENT HANDLING
    const normalizeEquation = (rawText) => {
        let txt = rawText.trim();
        
        // Context-aware replacement (Avoid blind replacements)
        txt = txt.replace(/([0-9\s\+\-\*\/=]+|^)[Ss]([0-9\s\+\-\*\/=]+|$)/g, '$15$2');
        txt = txt.replace(/([0-9])[Oo]/g, '$10');
        txt = txt.replace(/[Oo]([0-9])/g, '0$1');

        // Common symbols
        txt = txt.replace(/l/g, '1');
        txt = txt.replace(/×/g, '*');
        txt = txt.replace(/÷/g, '/');
        txt = txt.replace(/−/g, '-');
        
        // Step 1: Fix symbols (% -> ^)
        txt = txt.replace(/%/g, '^'); 
        txt = txt.replace(/([a-zA-Z])([0-9]+)/g, '$1^$2'); // x2 -> x^2
        txt = txt.replace(/²/g, '^2');
        txt = txt.replace(/³/g, '^3');
        txt = txt.replace(/(\d+)\s+([2345])\b/g, '$1^$2'); // 5 2 -> 5^2

        // Step 1.5: Missing Exponent Recovery (Before removing spaces)
        // 1. `^` followed by spaces and a non-digit (e.g., "x^ - 17x" -> "x^2 - 17x")
        txt = txt.replace(/\^(\s+)(?!\d)/g, '^2$1');
        // 2. `^` followed directly by letters or operators (e.g., "x^+") -> "x^2+"
        txt = txt.replace(/\^([a-zA-Z\+\=\)])/g, '^2$1');
        // 3. `^-` (artefact) not followed by a digit (e.g., "x^- + 5" -> "x^2 + 5")
        txt = txt.replace(/\^\s*\-\s*(?!\d)/g, '^2 ');
        // 4. Trailing `^` or `^-` at the very end of the equation
        txt = txt.replace(/\^\s*[\-]*\s*$/g, '^2');

        // Strip all spaces for clean algorithmic processing
        txt = txt.replace(/\s+/g, '');

        // Step 2 & 3: Fix multiplication
        // Number + variable -> implicit (6*x -> 6x)
        txt = txt.replace(/(\d)\*+([a-zA-Z])/g, '$1$2');
        // Number + bracket -> explicit (2(x) -> 2*(x))
        txt = txt.replace(/(\d)\(/g, '$1*(');

        // Step 4: Clean final string & formatting
        // Add spaces around + - =
        txt = txt.replace(/([\+\-\=])/g, ' $1 ');
        
        // Ensure no spaces around * / ^
        txt = txt.replace(/\s*([\*\/\^])\s*/g, '$1');

        // Fix unary minus (at start, or after = or open bracket)
        txt = txt.replace(/^\s*\-\s+/g, '-');
        txt = txt.replace(/=\s*\-\s+/g, '= -');
        txt = txt.replace(/\(\s*\-\s+/g, '(-');

        return txt.trim();
    };

    const processImage = async (file) => {
        setPreviewUrl(URL.createObjectURL(file));
        setIsProcessing(true);
        setExtractedText('');
        setErrorMsg('');

        if (setRobotState) setRobotState('curious');
        if (setRobotMsg) setRobotMsg('Enhancing and reading image...');

        try {
            const enhancedDataUrl = await preprocessImage(file);
            const ocrResult = await performOCR(enhancedDataUrl);
            
            let text = normalizeEquation(ocrResult.text);

            if (!text) {
                throw new Error("No readable text found");
            }

            setExtractedText(text);

            // Validation Check & Confidence Scoring
            const invalidSymbols = /[^\d\w\s\+\-\*\/\^\(\)\.\=]/;
            const brokenFormat = /\+\+|\-\-[^\>]|\*\*|\/\/|\^\^/; // catch broken math formatting
            const needsVerification = ocrResult.confidence < 70 || invalidSymbols.test(text) || brokenFormat.test(text);

            if (needsVerification) {
                setErrorMsg("Please verify the detected equation");
                if (setRobotState) setRobotState('curious');
                if (setRobotMsg) setRobotMsg("This was hard to read. Is it correct?");
            } else {
                if (setRobotState) setRobotState('excited');
                if (setRobotMsg) setRobotMsg("Got it! Please confirm the equation.");
            }

        } catch (err) {
            console.error('OCR Error:', err);
            setErrorMsg("Couldn't read the equation. Please try another image.");
            if (setRobotState) setRobotState('confused');
            if (setRobotMsg) setRobotMsg("I couldn't read the equation. Try again?");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            processImage(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processImage(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const submitSolve = () => {
        if (!extractedText) return;
        onSolve(extractedText);
        handleClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                key="overlay"
                initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
                onClick={!isProcessing ? handleClose : undefined}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                    key="modal"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-md bg-panel p-6 rounded-3xl shadow-2xl border pointer-events-auto flex flex-col items-center relative"
                    style={{ backgroundColor: 'var(--color-bg-panel)', borderColor: 'var(--color-border)' }}
                >
                    <button
                        onClick={handleClose}
                        disabled={isProcessing}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>

                    <h2 className="text-xl font-bold mb-6 w-full text-center">Solve from Image</h2>

                    {!previewUrl ? (
                        <div
                            className="w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                            style={{ borderColor: 'var(--color-border)' }}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <Upload size={24} />
                            </div>
                            <p className="text-sm font-medium text-center px-4" style={{ color: 'var(--color-text-muted)' }}>
                                Click to upload or drag & drop<br />
                                <span className="text-xs opacity-70">JPG, PNG, JPEG</span>
                            </p>
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/jpg"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                        </div>
                    ) : (
                        <div className="w-full flex items-center justify-center mb-6">
                            <div className="relative w-full aspect-video rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-base)' }}>
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                {isProcessing && (
                                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                        <Loader className="animate-spin mb-2" size={32} />
                                        <p className="font-medium animate-pulse">Scanning equation...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {errorMsg && (
                        <div className="w-full p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center mb-4">
                            {errorMsg}
                        </div>
                    )}

                    {extractedText !== '' && !isProcessing && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="w-full flex flex-col gap-3"
                        >
                            <label className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Detected Equation:</label>
                            <input
                                type="text"
                                value={extractedText}
                                onChange={(e) => setExtractedText(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border outline-none font-mono text-lg bg-transparent focus:ring-2 ring-primary/50 transition-shadow"
                                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-main)' }}
                            />

                            <div className="flex gap-3 mt-2">
                                <button
                                    onClick={() => {
                                        setPreviewUrl(null);
                                        setExtractedText('');
                                    }}
                                    className="flex-1 py-2 rounded-xl text-sm font-bold border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-main)' }}
                                >
                                    Retry
                                </button>
                                <button
                                    onClick={submitSolve}
                                    className="flex-2 flex-grow py-2 rounded-xl text-sm font-bold bg-primary text-white hover:opacity-90 flex items-center justify-center gap-2 transition-opacity"
                                >
                                    <Check size={18} />
                                    Solve Equation
                                </button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

export default ImageSolverModal;
