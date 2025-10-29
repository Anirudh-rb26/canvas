import React from 'react'
import LayoutControls from './LayoutControls'
import TypographyControls from './TypographyControls'
import { ParsedStyles } from '@/lib/types';

interface ButtonStyleControlsProps {
    padding: string | null;
    margin: string | null;
    backgroundColor: string | null;

    textColor: string | null;
    fontWeight: string | null;
    fontSize: string | null;
    textAlign: string | null;
    textTransform: string | null;
    textDecoration: string | null;

    updateStyle: (key: keyof ParsedStyles, value: string) => void;
}

const ButtonStyleControls = ({
    textColor,
    fontWeight,
    fontSize,
    textAlign,
    textTransform,
    textDecoration,
    padding,
    margin,
    backgroundColor,
    updateStyle
}: ButtonStyleControlsProps) => {
    return (
        <div className='bg-background w-full rounded-md p-2'>
            <div className='w-full h-full'>
                <LayoutControls
                    padding={padding || "none"}
                    margin={margin || "none"}
                    backgroundColor={backgroundColor}
                    updateStyle={updateStyle}
                />
                <TypographyControls
                    color={textColor || "none"}
                    fontWeight={fontWeight || "none"}
                    fontSize={fontSize || "none"}
                    textAlign={textAlign || "none"}
                    textTransform={textTransform || "none"}
                    textDecoration={textDecoration || "none"}
                    updateStyle={updateStyle}
                />
            </div>
        </div>
    )
}

export default ButtonStyleControls