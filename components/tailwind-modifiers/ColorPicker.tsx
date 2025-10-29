import colors from 'tailwindcss/colors'
import { formatHex } from 'culori';
import React, { useEffect, useState, useRef } from 'react'
import { ColorPicker, ColorPickerSelection, ColorPickerEyeDropper, ColorPickerHue, ColorPickerAlpha, ColorPickerOutput, ColorPickerFormat } from '../ui/shadcn-io/color-picker'
import Color from 'color';


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


const rgbaToHex = (rgba: [number, number, number, number]): string => {
    const [r, g, b, a] = rgba;
    const color = Color.rgb(r, g, b, a);
    return color.hex();
}


interface CustomColorPickerProps {
    color: string | null
    type: "text" | "background";
    updateStyle: (value: string) => void
}


const CustomColorPicker = ({ color, updateStyle, type }: CustomColorPickerProps) => {
    // Extract pure hex from Tailwind class or arbitrary syntax
    const getPureHex = (colorClass: string | null): string => {
        // Check for arbitrary values like "text-[#155DFC]" or "bg-[#155DFC]"
        const arbitraryMatch = colorClass?.match(/\[(#[0-9A-Fa-f]{6})\]/);
        if (arbitraryMatch) {
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
            console.log('🔵 [ColorPicker] External prop changed:', color, '→ Hex:', pureHex);

            // Update BOTH originalColor and manipulatedColor from external source
            setOriginalColor(pureHex);
            setManipulatedColor(pureHex);
            previousColorPropRef.current = color;
        }
    }, [color]);

    const handleColorChange = (rgba: [number, number, number, number]) => {
        console.log('🟢 [ColorPicker] User interaction, rgba:', rgba);

        const hexCode = rgbaToHex(rgba);

        // Only update manipulatedColor (NOT originalColor)
        if (hexCode !== manipulatedColor) {
            setManipulatedColor(hexCode);
            const tailwindClass = `${type === 'text' ? 'text-' : 'bg-'}[${hexCode}]`;
            console.log('🟢 [ColorPicker] Calling updateStyle with:', tailwindClass);
            updateStyle(tailwindClass);
        }
    };

    return (
        <ColorPicker
            className="max-w-sm rounded-md border bg-background p-4 shadow-sm"
            // Use originalColor as the key to force re-mount on external changes
            key={originalColor}
            defaultValue={originalColor}
            onChange={(value) => {
                if (Array.isArray(value) && value.length === 4) {
                    handleColorChange(value as [number, number, number, number]);
                }
            }}
        >
            <ColorPickerSelection />
            <div className="flex items-center gap-4">
                <ColorPickerEyeDropper />
                <div className="grid w-full gap-1">
                    <ColorPickerHue />
                    <ColorPickerAlpha />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <ColorPickerOutput />
                <ColorPickerFormat />
            </div>
        </ColorPicker>
    )
}

export default CustomColorPicker
