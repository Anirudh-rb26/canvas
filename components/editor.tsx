"use client"

import React, { JSX, useState } from 'react'
import { ScrollArea } from './ui/scroll-area';
import LayoutControls from './editor-layouts/LayoutControls';
import TypographyControls from './editor-layouts/TypographyControls';
import ButtonStyleControls from './editor-layouts/ButtonStyleControls';

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

interface ParsedStyles {
    textColor: string | null;
    backgroundColor: string | null;
    borderColor: string | null;
    textSize: string | null;
    fontWeight: string | null;
    fontStyle: string | null;
    textAlign: string | null;
    textDecoration: string | null;
    lineHeight: string | null;
    letterSpacing: string | null;
    display: string | null;
    flexDirection: string | null;
    justifyContent: string | null;
    alignItems: string | null;
    gap: string | null;
    padding: string | null;
    margin: string | null;
    width: string | null;
    height: string | null;
    borderWidth: string | null;
    borderRadius: string | null;
    shadow: string | null;
    opacity: string | null;
    textTransform: string | null;
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
        if (className.startsWith('text-') && !className.match(/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|left|center|right|justify)/)) {
            parsed.textColor = className;
        }
        else if (className.startsWith('bg-')) {
            parsed.backgroundColor = className;
        }
        else if (className.startsWith('border-') && !className.match(/^border-(\d|t-|b-|l-|r-|x-|y-)$/)) {
            parsed.borderColor = className;
        }
        else if (className.match(/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/)) {
            parsed.textSize = className;
        }
        else if (className.match(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)) {
            parsed.fontWeight = className;
        }
        else if (className.match(/^(italic|not-italic)$/)) {
            parsed.fontStyle = className;
        }
        else if (className.match(/^text-(left|center|right|justify)$/)) {
            parsed.textAlign = className;
        }
        else if (className.match(/^(underline|line-through|no-underline)$/)) {
            parsed.textDecoration = className;
        }
        else if (className.match(/^leading-/)) {
            parsed.lineHeight = className;
        }
        else if (className.match(/^tracking-/)) {
            parsed.letterSpacing = className;
        }
        else if (className.match(/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/)) {
            parsed.display = className;
        }
        else if (className.match(/^flex-(row|row-reverse|col|col-reverse)$/)) {
            parsed.flexDirection = className;
        }
        else if (className.match(/^justify-(start|end|center|between|around|evenly)$/)) {
            parsed.justifyContent = className;
        }
        else if (className.match(/^items-(start|end|center|baseline|stretch)$/)) {
            parsed.alignItems = className;
        }
        else if (className.match(/^gap-/)) {
            parsed.gap = className;
        }
        else if (className.match(/^p(x|y|t|b|l|r)?-/)) {
            parsed.padding = className;
        }
        else if (className.match(/^-?m(x|y|t|b|l|r)?-/)) {
            parsed.margin = className;
        }
        else if (className.match(/^w-/)) {
            parsed.width = className;
        }
        else if (className.match(/^h-/)) {
            parsed.height = className;
        }
        else if (className.match(/^border(-\d)?$/)) {
            parsed.borderWidth = className;
        }
        else if (className.match(/^rounded/)) {
            parsed.borderRadius = className;
        }
        else if (className.match(/^shadow/)) {
            parsed.shadow = className;
        }
        else if (className.match(/^opacity-/)) {
            parsed.opacity = className;
        }
        else if (className.match(/^(uppercase|lowercase|capitalize|normal-case)$/)) {
            parsed.textTransform = className;
        }
    });

    return parsed;
}

const Editor = ({ selectedComponent }: EditorProps) => {
    const parsedStyles = selectedComponent
        ? parseClassList(selectedComponent.classList)
        : null;

    const getControlsForTag = (tagName: string) => {
        const controlsMap: Record<string, JSX.Element> = {
            "H1": <TypographyControls
                textColor={parsedStyles!.textColor}
                fontWeight={parsedStyles!.fontWeight}
                fontSize={parsedStyles!.textSize}
                textAlign={parsedStyles!.textAlign}
                textTransform={null}
                textDecoration={parsedStyles!.textDecoration}
                updateStyle={updateStyle}
            />,
            "P": <TypographyControls
                textColor={parsedStyles!.textColor}
                fontWeight={parsedStyles!.fontWeight}
                fontSize={parsedStyles!.textSize}
                textAlign={parsedStyles!.textAlign}
                textTransform={null}
                textDecoration={parsedStyles!.textDecoration}
                updateStyle={updateStyle}
            />,
            "DIV": <LayoutControls
                padding={parsedStyles!.padding}
                margin={parsedStyles!.margin}
                backgroundColor={parsedStyles!.backgroundColor}
                updateStyle={updateStyle}
            />,
            "BUTTON": <ButtonStyleControls
                textColor={parsedStyles!.textColor}
                fontWeight={parsedStyles!.fontWeight}
                fontSize={parsedStyles!.textSize}
                textAlign={parsedStyles!.textAlign}
                textTransform={parsedStyles!.textTransform}
                textDecoration={parsedStyles!.textDecoration}
                padding={parsedStyles!.padding}
                margin={parsedStyles!.margin}
                backgroundColor={parsedStyles!.backgroundColor}
                updateStyle={updateStyle}
            />,
        };

        return controlsMap[tagName] || <div>Unknown Tagname: {tagName}</div>;
    };

    const [styles, setStyles] = useState({
        textColor: parsedStyles!.textColor,
        backgroundColor: parsedStyles!.backgroundColor,
        borderColor: parsedStyles!.borderColor,
        textSize: parsedStyles!.textSize,
        fontWeight: parsedStyles!.fontWeight,
        fontStyle: parsedStyles!.fontStyle,
        textAlign: parsedStyles!.textAlign,
        textDecoration: parsedStyles!.textDecoration,
        lineHeight: parsedStyles!.lineHeight,
        letterSpacing: parsedStyles!.letterSpacing,
        display: parsedStyles!.display,
        flexDirection: parsedStyles!.flexDirection,
        justifyContent: parsedStyles!.justifyContent,
        alignItems: parsedStyles!.alignItems,
        gap: parsedStyles!.gap,
        padding: parsedStyles!.padding,
        margin: parsedStyles!.margin,
        width: parsedStyles!.width,
        height: parsedStyles!.height,
        borderWidth: parsedStyles!.borderWidth,
        borderRadius: parsedStyles!.borderRadius,
        shadow: parsedStyles!.shadow,
        opacity: parsedStyles!.opacity,
        textTransform: parsedStyles!.textTransform,
    });

    const updateStyle = (key: string, value: string) => {
        setStyles(prev => ({ ...prev, [key]: value }));
    }

    return (
        <div className='border border-gray-300 p-2 rounded-sm h-full w-full flex items-center justify-center'>
            {!selectedComponent && (
                <h1 className='text-gray-300'>Select A Component to Edit</h1>
            )}
            {selectedComponent && (
                <div className='h-full w-full bg-black flex flex-col'>
                    <ScrollArea className='h-full w-full'>
                        <div className='flex flex-col items-start gap-3 h-full w-full'>
                            <pre>{JSON.stringify(parsedStyles, null, 2)}</pre>
                            {getControlsForTag(selectedComponent.tagName.toUpperCase())}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    )
}

export default Editor;