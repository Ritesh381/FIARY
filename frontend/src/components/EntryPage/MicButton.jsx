import React, { useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import useSpeechToText from '../../hooks/useSpeechToText';

/**
 * Microphone button component with speech-to-text functionality
 * @param {Object} props
 * @param {string} props.value - Current text value
 * @param {Function} props.onChange - Callback when text changes
 * @param {string} props.lang - Language code (default: 'en-US')
 */
const MicButton = ({ value, onChange, lang = 'en-US' }) => {
    const {
        isListening,
        transcript,
        interimTranscript,
        error,
        isSupported,
        toggleListening,
        resetTranscript,
    } = useSpeechToText({ lang, continuous: true, interimResults: true });

    // Track the last finalized transcript to detect new speech
    const lastTranscriptRef = useRef('');
    // Flag to prevent overwriting user edits
    const isUserEditingRef = useRef(false);

    // When starting to listen, reset tracking
    useEffect(() => {
        if (isListening) {
            lastTranscriptRef.current = '';
            isUserEditingRef.current = false;
        }
    }, [isListening]);

    // Append only NEW finalized speech to the current value
    useEffect(() => {
        if (isListening && transcript && transcript !== lastTranscriptRef.current) {
            // Get the new part of the transcript
            const previousLength = lastTranscriptRef.current.length;
            const newSpeech = transcript.substring(previousLength).trim();

            if (newSpeech) {
                // Append new speech to current value (which may include user edits)
                const currentValue = value || '';
                const updatedValue = currentValue
                    ? `${currentValue} ${newSpeech}`.trim()
                    : newSpeech;

                onChange(updatedValue);
                lastTranscriptRef.current = transcript;
            }
        }
    }, [transcript, isListening, onChange]);

    // When stopping, just reset
    useEffect(() => {
        if (!isListening) {
            resetTranscript();
            lastTranscriptRef.current = '';
        }
    }, [isListening, resetTranscript]);

    // Don't render if speech recognition is not supported
    if (!isSupported) {
        return null;
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={toggleListening}
                className={`
          p-2 rounded-full transition-all duration-200
          ${isListening
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                        : 'bg-teal-500 hover:bg-teal-600'
                    }
          text-white shadow-lg hover:shadow-xl
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${isListening ? 'focus:ring-red-400' : 'focus:ring-teal-400'}
        `}
                title={isListening ? 'Click to stop recording' : 'Click to start recording'}
                aria-label={isListening ? 'Stop recording' : 'Start recording'}
            >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {/* Show "Listening..." indicator with interim preview */}
            {isListening && (
                <div className="absolute bottom-full right-0 mb-2 bg-green-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-10 max-w-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>Listening... Click to stop</span>
                    </div>
                    {interimTranscript && (
                        <div className="mt-1 pt-1 border-t border-green-400/30 text-green-100 italic truncate">
                            "{interimTranscript}..."
                        </div>
                    )}
                    <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-green-600"></div>
                </div>
            )}

            {/* Show error if any */}
            {error && !isListening && (
                <div className="absolute bottom-full right-0 mb-2 bg-red-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg max-w-xs z-10">
                    {error}
                    <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-red-600"></div>
                </div>
            )}
        </div>
    );
};

export default MicButton;
