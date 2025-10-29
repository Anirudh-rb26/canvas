import React from 'react'
import SizeControl from '../tailwind-modifiers/Sizing'
import CustomColorPicker from '../tailwind-modifiers/ColorPicker'
import { ParsedStyles } from '@/lib/types';

interface LayoutControlprops {
    padding: string | null;
    margin: string | null;
    backgroundColor: string | null;
    updateStyle: (key: keyof ParsedStyles, value: string) => void;
}

const LayoutControls = ({
    padding,
    margin,
    backgroundColor,
    updateStyle
}: LayoutControlprops) => {
    return (
        <div className='bg-background w-full rounded-md p-2'>
            <div className='w-full h-full'>
                <h1 className='pb-3'>Spacing</h1>
                <div className='flex flex-col gap-1 pb-2'>
                    <h3 className='text-sm text-muted-foreground'>Padding</h3>
                    <SizeControl
                        inputValue={padding || "none"}
                        type='padding'
                        updateStyle={(value) => { updateStyle('padding', value) }}
                    />
                </div>
                <div className='flex flex-col gap-1 pb-2'>
                    <h3 className='text-sm text-muted-foreground'>Margin</h3>
                    <SizeControl
                        inputValue={margin || "none"}
                        type='margin'
                        updateStyle={(value) => { updateStyle('margin', value) }}
                    />
                </div>
                <div className='flex flex-col gap-1 pb-2 h-[300px]'>
                    <h3 className='text-sm text-muted-foreground'>Background Color</h3>
                    <CustomColorPicker
                        color={backgroundColor}
                        updateStyle={(value) => { updateStyle('backgroundColor', value) }}
                        type='background'
                    />
                </div>
            </div>
        </div>
    )
}

export default LayoutControls