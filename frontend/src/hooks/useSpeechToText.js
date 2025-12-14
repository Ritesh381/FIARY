import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for speech-to-text functionality using Web Speech API
 * @param {Object} options - Configuration options
 * @param {string} options.lang - Language code (default: 'en-US')
 * @param {boolean} options.continuous - Enable continuous recognition (default: false)
 * @param {boolean} options.interimResults - Show interim results (default: true)
 * @returns {Object} Speech recognition state and controls
 */
const useSpeechToText = (options = {}) => {
    const {
        lang = 'en-US',
        continuous = false,
        interimResults = true,
    } = options;

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState(null);
    const [isSupported, setIsSupported] = useState(false);

    const recognitionRef = useRef(null);

    // Initialize speech recognition
    useEffect(() => {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setIsSupported(false);
            setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        setIsSupported(true);

        // Create recognition instance
        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;

        // Event handlers
        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimText = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcriptPiece = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcriptPiece + ' ';
                } else {
                    interimText += transcriptPiece;
                }
            }

            if (finalTranscript) {
                setTranscript((prev) => prev + finalTranscript);
            }

            setInterimTranscript(interimText);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);

            switch (event.error) {
                case 'no-speech':
                    setError('No speech detected. Please try again.');
                    break;
                case 'audio-capture':
                    setError('No microphone found. Please check your microphone.');
                    break;
                case 'not-allowed':
                    setError('Microphone access denied. Please allow microphone access in your browser settings.');
                    break;
                case 'network':
                    setError('Internet connection required. Chrome uses Google\'s cloud service for speech recognition.');
                    break;
                default:
                    setError(`Error: ${event.error}. Please try again.`);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            setInterimTranscript('');
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [lang, continuous, interimResults]);

    // Start listening
    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (err) {
                console.error('Error starting recognition:', err);
                setError('Failed to start speech recognition.');
            }
        }
    };

    // Stop listening
    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    // Toggle listening
    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    // Reset transcript
    const resetTranscript = () => {
        setTranscript('');
        setInterimTranscript('');
    };

    return {
        isListening,
        transcript,
        interimTranscript,
        error,
        isSupported,
        startListening,
        stopListening,
        toggleListening,
        resetTranscript,
    };
};

export default useSpeechToText;
