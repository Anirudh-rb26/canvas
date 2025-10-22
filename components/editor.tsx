import React from 'react'

interface EditorProps {
    selectedComponent: {
        domPath: string;
        tagName: string;
        attributes: Record<string, string>;
        innerHTML: string;
        textContent: string;
        classList: string[];
    } | undefined;
}

const editor = ({ selectedComponent }: EditorProps) => {
    return (
        <div className='border border-gray-300 p-2 rounded-sm h-full w-full flex items-center justify-center'>
            {!selectedComponent && (
                <h1 className='text-gray-300'>Select A Component to Edit</h1>
            )}
            {selectedComponent && (
                <pre>{JSON.stringify(selectedComponent, null, 2)}</pre>
            )}
        </div>
    )
}


export default editor