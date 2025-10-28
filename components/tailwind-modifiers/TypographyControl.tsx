"use client"

import { cn } from '@/lib/utils';
import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

const FONT_WEIGHTS = ["thin", "light", "normal", "medium", "semibold", "bold", "black"];
const FONT_SIZES = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"];
const TEXT_ALIGN = ["left", "center", "right", "justify", "start", "end"];
const TEXT_TRANSFORM = ["uppercase", "lowercase", "capitalize", "normal-case"];
const TEXT_DECORATION = ["none", "underline", "line-through"];

const OPTIONS = {
    fontWeight: FONT_WEIGHTS,
    fontSize: FONT_SIZES,
    textAlign: TEXT_ALIGN,
    textTransform: TEXT_TRANSFORM,
    textDecoration: TEXT_DECORATION,
}

interface TypographyControlProps {
    type: 'fontWeight' | 'fontSize' | 'textAlign' | 'textTransform' | 'textDecoration';
    className?: string;
    currentAttribute?: string | null;
}

const TypographyControl = ({ type, currentAttribute, className }: TypographyControlProps) => {
    const [selected, setSelected] = useState(currentAttribute || "none");

    return (
        <DropdownMenu >
            <DropdownMenuTrigger className={cn('rounded-md p-2 bg-input/30', className)}>
                <div className='flex flex-row items-center justify-between'>
                    {selected}
                    <ChevronDown />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-full'>
                {OPTIONS[type].map((option) => (
                    <DropdownMenuItem className='w-full' key={option} onClick={() => setSelected(option)} >{option}</DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default TypographyControl