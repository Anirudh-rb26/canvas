"use client"

import * as Babel from '@babel/standalone'
import type { NodePath } from '@babel/traverse';
import React, { useEffect, useState } from 'react'
import LiveCanvasIframe from './live-canvas-iFrame';
import { JSXAttribute, JSXOpeningElement } from '@babel/types';

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
}

// Define the custom Babel plugin - V0 style
const addEditableAttributesPlugin = () => ({
    visitor: {
        JSXOpeningElement(path: NodePath<JSXOpeningElement>) {
            // Check if contenteditable already exists
            const hasContentEditable = path.node.attributes.find(
                (attr): attr is JSXAttribute =>
                    attr.type === 'JSXAttribute' &&
                    attr.name.type === 'JSXIdentifier' &&
                    attr.name.name === "contentEditable"
            );

            if (hasContentEditable) return; // Skip if already has it

            // Add contenteditable="false" (for browser behavior)
            path.node.attributes.push(
                Babel.packages.types.jsxAttribute(
                    Babel.packages.types.jsxIdentifier("contenteditable"),
                    Babel.packages.types.stringLiteral("false")
                )
            );

            // Add data-editable="true" (for tracking which elements can be edited)
            path.node.attributes.push(
                Babel.packages.types.jsxAttribute(
                    Babel.packages.types.jsxIdentifier("data-editable"),
                    Babel.packages.types.stringLiteral("true")
                )
            );
        },
    },
});

const LiveCanvas = ({ codeSnippet, preset, editorActive, setSelectedComponent }: LiveCanvasProps) => {
    const [Component, setComponent] = useState<React.ComponentType | null>(null);
    const [error, setError] = useState<string | null>(null);

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

            const transformed = Babel.transform(
                sandboxCode,
                {
                    presets: preset === "TSX" ? ['typescript', 'react'] : ['react'],
                    plugins: [addEditableAttributesPlugin],
                    filename: preset === "TSX" ? 'file.tsx' : 'file.jsx'
                }
            );

            if (!transformed.code) throw new Error('Transformation Failed');

            const componentFunction = new Function(
                'React',
                `${transformed.code} return ${isComponentDefinition ? extractComponentName(codeSnippet) : 'Sandbox'};`
            );

            const generatedComponent = componentFunction(React);

            setComponent(() => generatedComponent);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setComponent(null);
        }
    }, [codeSnippet, preset]);

    function extractComponentName(code: string): string {
        const match = code.match(/^(?:const|let|var|function)\s+(\w+)/);
        return match ? match[1] : 'Sandbox';
    }

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
                    />
                </div>
            )}
        </div>
    )
}

export default LiveCanvas
