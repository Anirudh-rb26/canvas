"use client"
import { ScrollArea } from './ui/scroll-area';
import LayoutControls from './editor-layouts/LayoutControls';
import TypographyControls from './editor-layouts/TypographyControls';
import ButtonStyleControls from './editor-layouts/ButtonStyleControls';
import { useEffect, useState } from 'react';

const typographyTags = ["H1", "H2", "H3", "H4", "H5", "H6", "P", "SPAN"];

interface EditorProps {
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

interface ParsedStyles {
    textColor: string;
    backgroundColor: string;
    borderColor: string;
    textSize: string;
    fontWeight: string;
    fontStyle: string;
    textAlign: string;
    textDecoration: string;
    lineHeight: string;
    letterSpacing: string;
    display: string;
    flexDirection: string;
    justifyContent: string;
    alignItems: string;
    gap: string;
    padding: string;
    margin: string;
    width: string;
    height: string;
    borderWidth: string;
    borderRadius: string;
    shadow: string;
    opacity: string;
    textTransform: string;
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

const Editor = ({ manipulatedComponent, setManipulatedComponent }: EditorProps) => {
    const [styles, setStyles] = useState<ParsedStyles>({
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

    useEffect(() => {
        if (manipulatedComponent) setStyles(parseClassList(manipulatedComponent.classList));
    }, [manipulatedComponent])

    const updateStyle = (key: string, value: string) => {
        console.log('Update style:', key, value);
        setStyles(prev => ({
            ...prev, [key]: value
        }));

        setManipulatedComponent(prev => {
            const newStyles = { ...styles, [key]: value };
            const newClassList = Object.values(newStyles).filter(cls =>
                cls &&
                !cls.includes('transparent') &&
                !cls.includes('none') &&
                cls !== 'p-0' &&
                cls !== 'm-0' &&
                cls !== 'gap-0' &&
                cls !== 'border-0'
            );
            const newClassString = newClassList.join(' ');

            return {
                ...prev,
                classList: newClassList,
                attributes: {
                    ...prev.attributes,
                    class: newClassString
                }
            };
        });
    }

    const getControlsForTag = (tagName: string) => {
        if (typographyTags.includes(tagName)) {
            return <TypographyControls
                textColor={styles.textColor}
                fontWeight={styles.fontWeight}
                fontSize={styles.textSize}
                textAlign={styles.textAlign}
                textTransform={styles.textTransform}
                textDecoration={styles.textDecoration}
                updateStyle={updateStyle}
            />;
        }

        if (tagName === "DIV") {
            return <LayoutControls
                padding={styles.padding}
                margin={styles.margin}
                backgroundColor={styles.backgroundColor}
                updateStyle={updateStyle}
            />;
        }

        if (tagName === "BUTTON") {
            return <ButtonStyleControls
                textColor={styles.textColor}
                fontWeight={styles.fontWeight}
                fontSize={styles.textSize}
                textAlign={styles.textAlign}
                textTransform={styles.textTransform}
                textDecoration={styles.textDecoration}
                padding={styles.padding}
                margin={styles.margin}
                backgroundColor={styles.backgroundColor}
                updateStyle={updateStyle}
            />;
        }
    };


    return (
        <div className='border border-gray-300 p-2 rounded-sm h-full w-full flex items-center justify-center'>
            {!manipulatedComponent && (
                <h1 className='text-gray-300'>Select A Component to Edit</h1>
            )}
            {manipulatedComponent && (
                <div className='h-full w-full bg-black flex flex-col'>
                    <ScrollArea className='h-full w-full'>
                        <div className='flex flex-col items-start gap-3 h-full w-full'>
                            <pre>{JSON.stringify(manipulatedComponent, null, 2)}</pre>
                            {getControlsForTag(manipulatedComponent.tagName.toUpperCase())}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    )
}

export default Editor;