"use client"

import * as Babel from '@babel/standalone'
import React, { useCallback, useMemo, useState } from 'react'
import LiveCanvasIframe from './live-canvas-iFrame';

interface LiveCanvasProps {
    codeSnippet: string;
    preset: string | undefined;
    editorActive: boolean | undefined;
    setSelectedComponent: React.Dispatch<React.SetStateAction<{
        domPath: string;
        tagName: string;
        attributes: Record<string, string>;
        innerHTML: string;
        textContent: string;
        classList: string[];
    } | undefined>>;
    manipulatedComponent: {
        domPath: string;
        tagName: string;
        attributes: Record<string, string>;
        innerHTML: string;
        textContent: string;
        classList: string[];
    } | undefined;
}

const LiveCanvas = ({ codeSnippet, preset, editorActive, setSelectedComponent, manipulatedComponent }: LiveCanvasProps) => {
    const [error, setError] = useState<string | null>(null);

    const extractComponentName = useMemo(() => {
        return (code: string): string => {
            const match = code.match(/^(?:const|let|var|function)\s+(\w+)/);
            return match ? match[1] : 'Sandbox';
        };
    }, []);

    const generateComponent = useCallback((code: string) => {
        try {
            const isComponentDefinition = /^(const|let|var|function)\s+\w+\s*=/.test(code.trim());

            const sandboxCode = isComponentDefinition
                ? code
                : `const Sandbox = () => (
                    <div>
                        ${code}
                    </div>
                );`;

            // Transform with Babel
            const transformed = Babel.transform(
                sandboxCode,
                {
                    presets: preset === "TSX" ? ['typescript', 'react'] : ['react'],
                    filename: preset === "TSX" ? 'file.tsx' : 'file.jsx'
                }
            );

            if (!transformed.code) throw new Error('Transformation Failed');

            // Create the component function
            const componentFunction = new Function(
                'React',
                `${transformed.code} return ${isComponentDefinition ? extractComponentName(code) : 'Sandbox'};`
            );

            return componentFunction(React);
        } catch (err) {
            throw err;
        }
    }, [preset, extractComponentName]);

    // Memoize the component generation
    const memoizedComponent = useMemo(() => {
        try {
            const comp = generateComponent(codeSnippet);
            setError(null);
            return comp;
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            return null;
        }
    }, [codeSnippet, generateComponent]);

    return (
        <div className='w-full h-full items-center justify-center'>
            {error && (
                <div className='bg-red-500 border border-red-400 text-red-900 px-4 py-2 rounded mb-4'>
                    Error: {error}
                </div>
            )}
            {memoizedComponent && (
                <div className='flex items-center justify-center w-full h-full rounded-md p-2 border border-gray-300'>
                    <LiveCanvasIframe
                        Component={memoizedComponent}
                        editorActive={editorActive}
                        setSelectedComponent={setSelectedComponent}
                        manipulatedComponent={manipulatedComponent}
                    />
                </div>
            )}
        </div>
    )
}

export default LiveCanvas