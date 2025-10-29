import Color from 'color';
import { formatHex } from 'culori';
import colors from 'tailwindcss/colors'
import { SketchPicker } from 'react-color'
import React, { useEffect, useState, useRef } from 'react'
import { pickerStyles } from '@/lib/pickerStyles';

/**
 * Converts OKLCH color format to hex
 */
const oklchToHex = (oklch: string): string => {
    return formatHex(oklch) ?? '#000000';
}

/**
 * Converts a Tailwind CSS color class to a hex code
 */
const tailwindClassToHex = (tailwindClass: string): string | null => {
    if (!tailwindClass) return null

    type ColorShades = {
        [key: string]: string
    }

    type TailwindColors = {
        [key: string]: ColorShades | string
    }

    const tailwindColors = colors as TailwindColors

    // Match standard color-shade pattern (e.g., 'bg-blue-500')
    const shadeMatch = tailwindClass.match(/(?:bg-|text-|border-|ring-|outline-)?(\w+)-(\d+)/)

    if (shadeMatch) {
        const [, colorName, shade] = shadeMatch
        const colorPalette = tailwindColors[colorName]

        if (colorPalette && typeof colorPalette === 'object' && shade in colorPalette) {
            const colorValue = colorPalette[shade]
            if (colorValue.startsWith('oklch(')) {
                return oklchToHex(colorValue)
            }
            return colorValue
        }
    }

    // Try single-value colors (e.g., 'bg-black', 'text-white')
    const singleMatch = tailwindClass.match(/(?:bg-|text-|border-|ring-|outline-)?(\w+)$/)

    if (singleMatch) {
        const [, colorName] = singleMatch
        const color = tailwindColors[colorName]

        if (typeof color === 'string') {
            if (color.startsWith('oklch(')) {
                return oklchToHex(color)
            }
            return color
        }
    }

    return null
}

const rgbaToHex = (r: number, g: number, b: number, a: number): string => {
    console.log('🎨 [ColorPicker] Converting RGBA values:', { r, g, b, a });
    const color = Color.rgb(r, g, b, a);
    const hexResult = color.hex();
    console.log('🎨 [ColorPicker] Converted to hex:', hexResult);
    return hexResult;
}

interface CustomColorPickerProps {
    color: string | null
    type: "text" | "background";
    updateStyle: (value: string) => void
}

const CustomColorPicker = ({ color, updateStyle, type }: CustomColorPickerProps) => {
    // Extract pure hex from Tailwind class or arbitrary syntax
    const getPureHex = (colorClass: string | null): string => {
        console.log('🎨 [ColorPicker] Getting pure hex from:', colorClass);
        // Check for arbitrary values like "text-[#155DFC]" or "bg-[#155DFC]"
        const arbitraryMatch = colorClass?.match(/\[(#[0-9A-Fa-f]{6})\]/);
        if (arbitraryMatch) {
            console.log('🎨 [ColorPicker] Found arbitrary color:', arbitraryMatch[1]);
            return arbitraryMatch[1];
        }

        // Try converting Tailwind class to hex
        const hexFromTailwind = colorClass ? tailwindClassToHex(colorClass) : null;
        if (hexFromTailwind) {
            return hexFromTailwind;
        }

        return '#000000'; // Default color
    };

    // SEPARATED VARIABLES:
    // originalColor = The input prop converted to hex (never modified by user interaction)
    // manipulatedColor = The color being actively edited by the user
    const [originalColor, setOriginalColor] = useState(getPureHex(color));
    const [manipulatedColor, setManipulatedColor] = useState(getPureHex(color));
    const previousColorPropRef = useRef(color);

    // Only update when the external prop changes (not when user edits)
    useEffect(() => {
        if (color !== previousColorPropRef.current) {
            const pureHex = getPureHex(color);

            // Update BOTH originalColor and manipulatedColor from external source
            setOriginalColor(pureHex);
            setManipulatedColor(pureHex);
            previousColorPropRef.current = color;
        }
    }, [color]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleColorChange = (colorResult: any) => {
        const { r, g, b, a } = colorResult.rgb;
        const hexCode = rgbaToHex(r, g, b, a);

        // Only update manipulatedColor (NOT originalColor)
        if (hexCode !== manipulatedColor) {
            setManipulatedColor(hexCode);
            const tailwindClass = `${type === 'text' ? 'text-' : 'bg-'}[${hexCode}]`;
            updateStyle(tailwindClass);
        }
    };

    return (
        <div className="rounded-md border bg-background p-2 shadow-sm">
            <SketchPicker
                // Use originalColor as the key to force re-mount on external changes
                key={originalColor}
                color={manipulatedColor}
                onChange={handleColorChange}
                onChangeComplete={handleColorChange}
            // styles={pickerStyles}
            />
        </div>
    )
}

export default CustomColorPicker
