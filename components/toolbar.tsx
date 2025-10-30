import React, { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Button } from './ui/button';
import { addSnippet, fetchSnippet } from '@/services/addSnippet';

interface ToolbarProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setSideBar: React.Dispatch<React.SetStateAction<any>>
    setEditorActive: React.Dispatch<React.SetStateAction<boolean>>
    onApplyChanges: () => void;
    codeSnippetref: string;
}

const ToolBar = ({ setSideBar, setEditorActive, onApplyChanges, codeSnippetref }: ToolbarProps) => {
    const [selected, setSelected] = useState(1);


    useEffect(() => {
        console.log("Selected version:", selected);
        fetchSnippet("1", selected)
    }, [selected])

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
                                        onApplyChanges();
                                        setEditorActive(false);
                                    }}
                                value="code">
                                Code
                            </TabsTrigger>
                            <TabsTrigger
                                onClick={() => {
                                    setSideBar("editor");
                                    onApplyChanges();
                                    setEditorActive(true)
                                }}
                                value="editor">
                                Editor
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className='flex flex-row gap-3'>
                        <Button onClick={() => addSnippet("1", codeSnippetref)}>Save Changes</Button>
                        <div className='py-2 px-4 bg-ring rounded-sm'>
                            <DropdownMenu>
                                <DropdownMenuTrigger className='flex flex-row gap-2'>
                                    version: {selected}
                                    <ChevronDown />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className='mr-3 mt-2'>
                                    <DropdownMenuItem onSelect={() => setSelected(1)}>v1</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setSelected(2)}>v2</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setSelected(3)}>v3</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setSelected(4)}>v4</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default ToolBar