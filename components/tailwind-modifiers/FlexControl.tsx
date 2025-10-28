"use client"

import React, { useEffect, useState } from 'react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuItem } from '../ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FlexOptions = {
    justify: [
        "start",
        "center",
        "end",
        "between",
        "around",
        "evenly",
    ],
    items: [
        "start",
        "center",
        "end",
        "stretch",
        "baseline",
    ],
};

interface FlexControlProps {
    type: "justify" | "items";
    currentAttribute?: string;
    className?: string;
}


const FlexControl = ({ type, currentAttribute, className }: FlexControlProps) => {
    const [selected, setSelected] = useState(currentAttribute ? currentAttribute : (type === "justify" ? "Main Axis" : "Cross Axis"));

    useEffect(() => {
        setSelected(currentAttribute || "none");
    }, [currentAttribute]);

    return (
        <DropdownMenu >
            <DropdownMenuTrigger className={cn('bg-background rounded-md p-2', className)}>
                <div className='flex flex-row items-center justify-between'>
                    {selected}
                    <ChevronDown />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-full'>
                <DropdownMenuLabel className='w-full'>Align {type === "justify" ? "Main" : "Cross"} Axis</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {FlexOptions[type].map((option) => (
                    <DropdownMenuItem className='w-full' key={option} onClick={() => setSelected(option)} >{option}</DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu >
    )
}

export default FlexControl