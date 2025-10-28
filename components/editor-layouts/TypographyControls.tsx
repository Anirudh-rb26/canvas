import React from 'react'
import TypographyControl from '../tailwind-modifiers/TypographyControl'
import CustomColorPicker from '../tailwind-modifiers/ColorPicker'
import { Separator } from '../ui/separator'

interface TypographyControlsProps {
    textColor: string | null;
    fontWeight: string | null;
    fontSize: string | null;
    textAlign: string | null;
    textTransform: string | null;
    textDecoration: string | null;
    updateStyle: (key: string, value: string) => void;
}

const TypographyControls = ({
    textColor,
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
                <div className='flex flex-col gap-1 pb-2 h-[300px]'>
                    <h3 className='text-sm text-muted-foreground'>Text Color</h3>
                    <CustomColorPicker color={textColor} />
                </div>
                <Separator className='my-4' />
                <div className='flex flex-col gap-1 pb-2'>
                    <h3 className='text-sm text-muted-foreground'>Font Weights</h3>
                    <TypographyControl type='fontWeight' currentAttribute={fontWeight || "none"} />
                </div>
                <div className='flex flex-col gap-1 pb-2'>
                    <h3 className='text-sm text-muted-foreground'>Font Sizes</h3>
                    <TypographyControl type='fontSize' currentAttribute={fontSize || "none"} />
                </div>
                <div className='flex flex-col gap-1 pb-2'>
                    <h3 className='text-sm text-muted-foreground'>Text Align</h3>
                    <TypographyControl type='textAlign' currentAttribute={textAlign || "none"} />
                </div>
                <div className='flex flex-col gap-1 pb-2'>
                    <h3 className='text-sm text-muted-foreground'>Text Transform</h3>
                    <TypographyControl type='textTransform' currentAttribute={textTransform || "none"} />
                </div>
                <div className='flex flex-col gap-1 pb-2'>
                    <h3 className='text-sm text-muted-foreground'>Text Decoration</h3>
                    <TypographyControl type='textDecoration' currentAttribute={textDecoration || "none"} />
                </div>
            </div>
        </div>
    )
}

export default TypographyControls