"use client"

import * as Babel from '@babel/standalone'
import React, { useEffect, useState, useMemo } from 'react'
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
    const [Component, setComponent] = useState<React.ComponentType | null>(null);
    const [error, setError] = useState<string | null>(null);

    const extractComponentName = useMemo(() => {
        return (code: string): string => {
            const match = code.match(/^(?:const|let|var|function)\s+(\w+)/);
            return match ? match[1] : 'Sandbox';
        };
    }, []);

    useEffect(() => {
        try {
            const isComponentDefinition = /^(const|let|var|function)\s+\w+\s*=/.test(codeSnippet.trim());

            const sandboxCode = isComponentDefinition
                ? codeSnippet
                : `const Sandbox = () => (
                    <div>
                        ${codeSnippet}
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
                `${transformed.code} return ${isComponentDefinition ? extractComponentName(codeSnippet) : 'Sandbox'};`
            );

            const generatedComponent = componentFunction(React);

            // Store the component (React will handle state)
            setComponent(() => generatedComponent);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setComponent(null);
        }
    }, [codeSnippet, preset, extractComponentName]);

    return (
        <div className='w-full h-full items-center justify-center'>
            {error && (
                <div className='bg-red-500 border border-red-400 text-red-900 px-4 py-2 rounded mb-4'>
                    Error: {error}
                </div>
            )}
            {Component && (
                <div className='flex items-center justify-center w-full h-full rounded-md p-2 border border-gray-300'>
                    <LiveCanvasIframe
                        Component={Component}
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