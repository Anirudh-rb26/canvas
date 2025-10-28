import React from 'react'
import { ColorPicker, ColorPickerSelection, ColorPickerEyeDropper, ColorPickerHue, ColorPickerAlpha, ColorPickerOutput, ColorPickerFormat } from '../ui/shadcn-io/color-picker'
import colors from 'tailwindcss/colors'

/**
 * Converts a Tailwind CSS color class (e.g., 'bg-blue-500', 'text-yellow-100') to a hex code
 * @param tailwindClass - The Tailwind color class (e.g., 'bg-blue-500', 'blue-500', etc.)
 * @returns Hex color code or null if not found
 */

const tailwindClassToHex = (tailwindClass: string): string | null => {
    if (!tailwindClass) return null

    const match = tailwindClass.match(/(?:bg-|text-|border-|ring-|outline-)?(\w+)-(\d+)/)

    if (!match) return null

    const [, colorName, shade] = match

    type ColorShades = {
        [key: string]: string
    }

    type TailwindColors = {
        [key: string]: ColorShades | string
    }

    const tailwindColors = colors as TailwindColors

    const colorPalette = tailwindColors[colorName]

    if (colorPalette && typeof colorPalette === 'object' && shade in colorPalette) {
        return colorPalette[shade]
    }

    return null
}

interface CustomColorPickerProps {
    color: string | null
}

const CustomColorPicker = ({ color }: CustomColorPickerProps) => {
    const hexColor = color ? tailwindClassToHex(color) : null
    const defaultValue = hexColor || color || '#000000'

    return (
        <ColorPicker
            className="max-w-sm rounded-md border bg-background p-4 shadow-sm"
            defaultValue={defaultValue}
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
