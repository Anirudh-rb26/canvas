"use client"

import React from 'react'
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { ChevronDown, Upload } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CodeInput = ({ activeCodeSnippet, setCodeSnippet, handleUpload, preset, setPreset }: { activeCodeSnippet: string | undefined, setCodeSnippet: React.Dispatch<React.SetStateAction<any>>, handleUpload: () => void, preset: string | undefined, setPreset: React.Dispatch<React.SetStateAction<any>> }) => {

    return (
        <motion.div
            initial={false}
            animate={{
                width: activeCodeSnippet ? "100%" : "75%",
                height: activeCodeSnippet ? "100%" : "16rem",
            }}
            transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
            className="relative w-full h-full"
        >
            <Textarea
                className="w-full h-full rounded-md resize-none pt-2 pl-2 pr-18 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-white"
                onChange={(e) => setCodeSnippet(e.target.value)}
                value={activeCodeSnippet || ""}
            />
            <Button
                className="bg-ring absolute bottom-6 right-6 rounded-xl shadow-md p-3 hover:bg-blue-600 transition-colors"
                onClick={handleUpload}
            >
                <Upload className="text-white w-5 h-5" />
            </Button>
            <div className='bg-ring absolute top-6 right-6 rounded-md shadow-md p-1 pl-2 hover:bg-blue-600 transition-colors'>
                <DropdownMenu>
                    <DropdownMenuTrigger className='flex flex-row gap-2'>
                        {preset}
                        <ChevronDown />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='mr-3 mt-2'>
                        <DropdownMenuItem onSelect={() => setPreset("JSX")}>JSX</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setPreset("TSX")}>TSX</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.div>
    )
}

export default CodeInput;