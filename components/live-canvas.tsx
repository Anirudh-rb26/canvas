"use client"

import * as Babel from '@babel/standalone'
import React, { useEffect, useState } from 'react'
import LiveCanvasIframe from './live-canvas-iFrame';

const LiveCanvas = ({ codeSnippet, preset }: { codeSnippet: string, preset: string | undefined }) => {

    const [Component, setComponent] = useState<React.ComponentType | null>(null);
    const [error, setError] = useState<string | null>(null);

    // useEffect(() => {
    //     const twindId = 'twind-cdn';
    //     if (!document.getElementById(twindId)) {
    //         const script = document.createElement('script');
    //         script.id = twindId;
    //         script.src = 'https://cdn.jsdelivr.net/npm/twind@0.16.19/shim.min.js';
    //         document.head.appendChild(script);
    //     }
    // }, []);

    useEffect(() => {
        try {
            // Check if code already defines a component
            const isComponentDefinition = /^(const|let|var|function)\s+\w+\s*=/.test(codeSnippet.trim());

            const sandboxCode = isComponentDefinition
                ? codeSnippet  // User provided a component, use it directly
                : `const Sandbox = () => (
                    <div>
                        ${codeSnippet}
                    </div>
                );`; // User provided raw JSX, wrap it

            const transformed = Babel.transform(
                sandboxCode,
                {
                    presets: preset === "TSX" ? ['typescript', 'react'] : ['react'],
                    filename: preset === "TSX" ? 'file.tsx' : 'file.jsx'
                },
            );

            if (!transformed.code) throw new Error('Transformation Failed');

            // Execute the transformed code
            const componentFunction = new Function(
                'React',
                `${transformed.code} return ${isComponentDefinition ? extractComponentName(codeSnippet) : 'Sandbox'};
            `);

            const generatedComponent = componentFunction(React);

            setComponent(() => generatedComponent);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setComponent(null);
        }
    }, [codeSnippet, preset]);

    // Helper to extract component name from definition
    function extractComponentName(code: string): string {
        const match = code.match(/^(?:const|let|var|function)\s+(\w+)/);
        return match ? match[1] : 'Sandbox';
    }

    return (
        <div className='w-full h-full items-center justify-center p-2'>
            {error && (
                <div className='bg-red-500 border border-red-400 text-red-700 px-4 py-2 rounded mb-4'>
                    Error: {error}
                </div>
            )}
            {Component && (
                <div className='rounded p-4'>
                    <LiveCanvasIframe Component={Component} />
                </div>
            )}
        </div>
    )
}

export default LiveCanvas