import React from 'react'
import TypographyControl from '../tailwind-modifiers/TypographyControl'
import CustomColorPicker from '../tailwind-modifiers/ColorPicker'
import { Separator } from '../ui/separator'
import { ParsedStyles } from '@/lib/types';

interface TypographyControlsProps {
    color: string | null;
    fontWeight: string | null;
    fontSize: string | null;
    textAlign: string | null;
    textTransform: string | null;
    textDecoration: string | null;
    updateStyle: (key: keyof ParsedStyles, value: string) => void;
}

const TypographyControls = ({
    color,
    fontWeight,
    fontSize,
    textAlign,
    textTransform,
    textDecoration,
    updateStyle
}: TypographyControlsProps) => {
    return (
        <div className='bg-background w-full rounded-md p-2'>
            <div className='w-full h-full'>
                <h1 className='pb-3'>Typography</h1>
                <div className='flex flex-col gap-1 pb-2 h-[400px]'>
                    <h3 className='text-sm text-muted-foreground'>Text Color</h3>
                    <CustomColorPicker
                        color={color}
                        updateStyle={(value) => { updateStyle('textColor', value) }}
                        type='text'
                    />
                </div>
                <Separator className='my-4' />
                <div className='flex flex-col gap-1 pb-2'>
                    <h3 className='text-sm text-muted-foreground'>Font Weights</h3>
                    <TypographyControl
                        type='fontWeight'
                        currentAttribute={fontWeight || "none"}
                        updateStyle={(value) => { updateStyle('fontWeight', value) }}
                    />
                </div>
                <div className='flex flex-col gap-1 pb-2'>
                    <h3 className='text-sm text-muted-foreground'>Font Sizes</h3>
                    <TypographyControl
                        type='fontSize'
                        currentAttribute={fontSize || "none"}
                        updateStyle={(value) => { updateStyle('textSize', value) }}
                    />
                </div>
                <div className='flex flex-col gap-1 pb-2'>
                    <h3 className='text-sm text-muted-foreground'>Text Align</h3>
                    <TypographyControl
                        type='textAlign'
                        currentAttribute={textAlign || "none"}
                        updateStyle={(value) => { updateStyle('textAlign', value) }}
                    />
                </div>
                <div className='flex flex-col gap-1 pb-2'>
                    <h3 className='text-sm text-muted-foreground'>Text Transform</h3>
                    <TypographyControl
                        type='textTransform'
                        currentAttribute={textTransform || "none"}
                        updateStyle={(value) => { updateStyle('textTransform', value) }}
                    />
                </div>
                <div className='flex flex-col gap-1 pb-2'>
                    <h3 className='text-sm text-muted-foreground'>Text Decoration</h3>
                    <TypographyControl
                        type='textDecoration'
                        currentAttribute={textDecoration || "none"}
                        updateStyle={(value) => { updateStyle('textDecoration', value) }}
                    />
                </div>
            </div>
        </div>
    )
}

export default TypographyControls