"use client"
import { ScrollArea } from './ui/scroll-area';
import LayoutControls from './editor-layouts/LayoutControls';
import TypographyControls from './editor-layouts/TypographyControls';
import ButtonStyleControls from './editor-layouts/ButtonStyleControls';
import { useEffect, useState } from 'react';
import { ParsedStyles } from '@/lib/types';
import { useManipulatedComponent } from '@/lib/manageManipulatedStyles';

const typographyTags = ["H1", "H2", "H3", "H4", "H5", "H6", "P", "SPAN"];

interface EditorProps {
    originalComponent: {
        domPath: string;
        tagName: string;
        attributes: Record<string, string>;
        innerHTML: string;
        textContent: string;
        classList: string[];
    } | undefined;
    manipulatedComponent: {
        domPath: string;
        tagName: string;
        attributes: Record<string, string>;
        innerHTML: string;
        textContent: string;
        classList: string[];
    } | undefined;
    setManipulatedComponent: React.Dispatch<React.SetStateAction<{
        domPath: string;
        tagName: string;
        attributes: Record<string, string>;
        innerHTML: string;
        textContent: string;
        classList: string[];
    }>>;
}

function parseClassList(classList: string[]): ParsedStyles {
    const parsed: ParsedStyles = {
        textColor: 'text-black',
        backgroundColor: 'bg-transparent',
        borderColor: 'border-gray-200',
        textSize: 'text-base',
        fontWeight: 'font-normal',
        fontStyle: 'not-italic',
        textAlign: 'text-left',
        textDecoration: 'no-underline',
        lineHeight: 'leading-normal',
        letterSpacing: 'tracking-normal',
        display: 'block',
        flexDirection: 'flex-row',
        justifyContent: 'justify-start',
        alignItems: 'items-stretch',
        gap: 'gap-0',
        padding: 'p-0',
        margin: 'm-0',
        width: 'w-auto',
        height: 'h-auto',
        borderWidth: 'border-0',
        borderRadius: 'rounded-none',
        shadow: 'shadow-none',
        opacity: 'opacity-100',
        textTransform: 'normal-case',
    };

    classList.forEach(className => {
        // Text colors (exclude size/alignment classes)
        if (className.startsWith('text-') &&
            !className.match(/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|left|center|right|justify|start|end)$/)) {
            parsed.textColor = className;
        }
        // Background colors
        else if (className.startsWith('bg-')) {
            parsed.backgroundColor = className;
        }
        // Border colors (exclude border width/side classes)
        else if (className.startsWith('border-') &&
            !className.match(/^border(-[0-9]+)?$/) &&
            !className.match(/^border-[txbylr](-[0-9]+)?$/)) {
            parsed.borderColor = className;
        }
        // Text sizes
        else if (className.match(/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/)) {
            parsed.textSize = className;
        }
        // Font weight
        else if (className.match(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)) {
            parsed.fontWeight = className;
        }
        // Font style
        else if (className.match(/^(italic|not-italic)$/)) {
            parsed.fontStyle = className;
        }
        // Text alignment
        else if (className.match(/^text-(left|center|right|justify)$/)) {
            parsed.textAlign = className;
        }
        // Text decoration
        else if (className.match(/^(underline|line-through|no-underline)$/)) {
            parsed.textDecoration = className;
        }
        // Line height
        else if (className.match(/^leading-/)) {
            parsed.lineHeight = className;
        }
        // Letter spacing
        else if (className.match(/^tracking-/)) {
            parsed.letterSpacing = className;
        }
        // Display
        else if (className.match(/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/)) {
            parsed.display = className;
        }
        // Flex direction
        else if (className.match(/^flex-(row|row-reverse|col|col-reverse)$/)) {
            parsed.flexDirection = className;
        }
        // Justify content
        else if (className.match(/^justify-(start|end|center|between|around|evenly)$/)) {
            parsed.justifyContent = className;
        }
        // Align items
        else if (className.match(/^items-(start|end|center|baseline|stretch)$/)) {
            parsed.alignItems = className;
        }
        // Gap
        else if (className.match(/^gap-/)) {
            parsed.gap = className;
        }
        // Padding (keep the last padding class found)
        else if (className.match(/^p[txbylr]?-/)) {
            parsed.padding = className;
        }
        // Margin (keep the last margin class found)
        else if (className.match(/^-?m[txbylr]?-/)) {
            parsed.margin = className;
        }
        // Width
        else if (className.match(/^w-/)) {
            parsed.width = className;
        }
        // Height
        else if (className.match(/^h-/)) {
            parsed.height = className;
        }
        // Border width
        else if (className.match(/^border(-[0-9]+)?$/)) {
            parsed.borderWidth = className;
        }
        // Border radius
        else if (className.match(/^rounded/)) {
            parsed.borderRadius = className;
        }
        // Shadow
        else if (className.match(/^shadow/)) {
            parsed.shadow = className;
        }
        // Opacity
        else if (className.match(/^opacity-/)) {
            parsed.opacity = className;
        }
        // Text transform
        else if (className.match(/^(uppercase|lowercase|capitalize|normal-case)$/)) {
            parsed.textTransform = className;
        }
    });

    return parsed;
}

const Editor = ({ originalComponent, manipulatedComponent, setManipulatedComponent }: EditorProps) => {
    // ✅ USE THE HOOK - This replaces all manipulatedStyles logic, useEffects, and updateStyle
    const { manipulatedStyles, updateStyle } = useManipulatedComponent(
        originalComponent,
        manipulatedComponent,
        setManipulatedComponent
    );

    // Parse ORIGINAL component styles (source of truth for controls to display)
    const [originalStyles, setOriginalStyles] = useState<ParsedStyles>({
        textColor: 'text-black',
        backgroundColor: 'bg-transparent',
        borderColor: 'border-gray-200',
        textSize: 'text-base',
        fontWeight: 'font-normal',
        fontStyle: 'not-italic',
        textAlign: 'text-left',
        textDecoration: 'no-underline',
        lineHeight: 'leading-normal',
        letterSpacing: 'tracking-normal',
        display: 'block',
        flexDirection: 'flex-row',
        justifyContent: 'justify-start',
        alignItems: 'items-stretch',
        gap: 'gap-0',
        padding: 'p-0',
        margin: 'm-0',
        width: 'w-auto',
        height: 'h-auto',
        borderWidth: 'border-0',
        borderRadius: 'rounded-none',
        shadow: 'shadow-none',
        opacity: 'opacity-100',
        textTransform: 'normal-case',
    });

    // When originalComponent changes (new selection), parse and store its styles
    useEffect(() => {
        if (originalComponent) {
            const parsed = parseClassList(originalComponent.classList);
            setOriginalStyles(parsed);
        }
    }, [originalComponent]);

    const getControlsForTag = (tagName: string) => {
        if (typographyTags.includes(tagName)) {
            return <TypographyControls
                color={originalStyles.textColor}
                fontWeight={originalStyles.fontWeight}
                fontSize={originalStyles.textSize}
                textAlign={originalStyles.textAlign}
                textTransform={originalStyles.textTransform}
                textDecoration={originalStyles.textDecoration}
                updateStyle={updateStyle}
            />;
        }

        if (tagName === "DIV") {
            return <LayoutControls
                padding={originalStyles.padding}
                margin={originalStyles.margin}
                backgroundColor={originalStyles.backgroundColor}
                updateStyle={updateStyle}
            />;
        }

        if (tagName === "BUTTON") {
            return <ButtonStyleControls
                textColor={originalStyles.textColor}
                fontWeight={originalStyles.fontWeight}
                fontSize={originalStyles.textSize}
                textAlign={originalStyles.textAlign}
                textTransform={originalStyles.textTransform}
                textDecoration={originalStyles.textDecoration}
                padding={originalStyles.padding}
                margin={originalStyles.margin}
                backgroundColor={originalStyles.backgroundColor}
                updateStyle={updateStyle}
            />;
        }
    };


    return (
        <div className='border border-gray-300 p-2 rounded-sm h-full w-full flex items-center justify-center'>
            {!originalComponent && (
                <h1 className='text-gray-300'>Select A Component to Edit</h1>
            )}
            {originalComponent && (
                <div className='h-full w-full bg-black flex flex-col'>
                    <ScrollArea className='h-full w-full'>
                        <div className='flex flex-col items-start gap-3 h-full w-full'>
                            {/* <p className='text-red-500'>Original Component</p> */}
                            {/* <pre>{JSON.stringify(originalComponent, null, 2)}</pre> */}
                            {/* <p className='text-red-500'>Manipulated Component</p> */}
                            {/* <pre>{JSON.stringify(manipulatedComponent, null, 2)}</pre> */}
                            {/* <p className='text-yellow-500'>Original textColor: {originalStyles.textColor}</p>
                            <p className='text-green-500'>Manipulated textColor: {manipulatedStyles.textColor}</p> */}
                            {getControlsForTag(originalComponent.tagName.toUpperCase())}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    )
}

export default Editor;
