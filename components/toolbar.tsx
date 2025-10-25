import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'

interface ToolbarProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setSideBar: React.Dispatch<React.SetStateAction<any>>
    setEditorActive: React.Dispatch<React.SetStateAction<boolean>>
}

const ToolBar = ({ setSideBar, setEditorActive }: ToolbarProps) => {
    const [selected, setSelected] = useState("Version");

    return (
        <div className='w-full h-[10%] absolute p-2'>
            <div className='w-full h-full bg-background rounded-xl'>
                <div className='px-3 h-full flex items-center justify-between'>
                    <Tabs defaultValue='code'>
                        <TabsList>
                            <TabsTrigger
                                onClick={
                                    () => {
                                        setSideBar("code");
                                        setEditorActive(false);
                                    }}
                                value="code">
                                Code
                            </TabsTrigger>
                            <TabsTrigger
                                onClick={() => {
                                    console.log("Editor tab clicked");
                                    setSideBar("editor");
                                    setEditorActive(true)
                                }}
                                value="editor">
                                Editor
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className='py-2 px-4 bg-ring rounded-sm'>
                        <DropdownMenu>
                            <DropdownMenuTrigger className='flex flex-row gap-2'>
                                {selected}
                                <ChevronDown />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className='mr-3 mt-2'>
                                <DropdownMenuItem onSelect={() => setSelected("V1")}>V1</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setSelected("V2")}>V2</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setSelected("V3")}>V3</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setSelected("V4")}>V4</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default ToolBar