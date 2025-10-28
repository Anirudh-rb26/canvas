import colors from 'tailwindcss/colors'
import { formatHex } from 'culori';
import React, { useEffect, useState } from 'react'
import { ColorPicker, ColorPickerSelection, ColorPickerEyeDropper, ColorPickerHue, ColorPickerAlpha, ColorPickerOutput, ColorPickerFormat } from '../ui/shadcn-io/color-picker'

/**
 * Converts OKLCH color format to hex
 * @param oklch - OKLCH color string (e.g., 'oklch(62.3% 0.214 259.815)')
 * @returns Hex color code
 */
const oklchToHex = (oklch: string): string => {
    return formatHex(oklch) ?? '#000000';
}

/**
 * Converts a Tailwind CSS color class (e.g., 'bg-blue-500', 'text-yellow-100') to a hex code
 * @param tailwindClass - The Tailwind color class (e.g., 'bg-blue-500', 'blue-500', etc.)
 * @returns Hex color code or null if not found
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

    // First, try to match standard color-shade pattern (e.g., 'bg-blue-500')
    const shadeMatch = tailwindClass.match(/(?:bg-|text-|border-|ring-|outline-)?(\w+)-(\d+)/)

    if (shadeMatch) {
        const [, colorName, shade] = shadeMatch
        const colorPalette = tailwindColors[colorName]

        if (colorPalette && typeof colorPalette === 'object' && shade in colorPalette) {
            const colorValue = colorPalette[shade]
            // Check if it's OKLCH format and convert to hex
            if (colorValue.startsWith('oklch(')) {
                return oklchToHex(colorValue)
            }
            return colorValue
        }
    }

    // If no shade match, try single-value colors (e.g., 'bg-black', 'text-white')
    const singleMatch = tailwindClass.match(/(?:bg-|text-|border-|ring-|outline-)?(\w+)$/)

    if (singleMatch) {
        const [, colorName] = singleMatch
        const color = tailwindColors[colorName]

        // Check if it's a direct string value (like 'black', 'white', 'transparent')
        if (typeof color === 'string') {
            if (color.startsWith('oklch(')) {
                return oklchToHex(color)
            }
            return color
        }
    }

    return null
}

interface CustomColorPickerProps {
    color: string | null
}

const CustomColorPicker = ({ color }: CustomColorPickerProps) => {
    // Convert Tailwind class to hex if needed
    const hexColor = color ? tailwindClassToHex(color) : null
    const initialColor = hexColor || color || '#000000'

    const [colorValue, setColorValue] = useState(initialColor);

    useEffect(() => {
        const newHex = hexColor || color || '#000000';
        setColorValue(newHex)
    }, [hexColor, color]);

    return (
        <ColorPicker
            className="max-w-sm rounded-md border bg-background p-4 shadow-sm"
            defaultValue={colorValue}
        // onChange={(newcoc)}
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
