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
        <div>
            <div>Editor</div>
            {selectedComponent && (
                <pre>{JSON.stringify(selectedComponent, null, 2)}</pre>
            )}
        </div>
    )
}


export default editor