/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Button } from './ui/button';
import { addSnippet, fetchSnippet, getAllVersions } from '@/services/addSnippet';

interface ToolbarProps {
    setSideBar: React.Dispatch<React.SetStateAction<any>>
    setEditorActive: React.Dispatch<React.SetStateAction<boolean>>
    onApplyChanges: () => void;
    codeSnippetref: string;
    setCodeSnippet: React.Dispatch<React.SetStateAction<string | undefined>>;
    setActiveCodeSnippet: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const ToolBar = ({ setSideBar, setEditorActive, onApplyChanges, codeSnippetref, setCodeSnippet, setActiveCodeSnippet }: ToolbarProps) => {
    const [selected, setSelected] = useState<number>(1);
    const [availableVersions, setAvailableVersions] = useState<number[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const entityId = "1"; // You might want to make this dynamic

    // Load available versions on mount
    useEffect(() => {
        getAllVersions(entityId).then(versions => {
            setAvailableVersions(versions);
            if (versions.length > 0) {
                // Set the latest version as selected
                setSelected(versions[versions.length - 1]);
            }
        });
    }, []);

    // Fetch snippet when selected version changes
    useEffect(() => {
        if (!selected) return;

        setIsLoading(true);
        fetchSnippet(entityId, selected).then(newCode => {
            setIsLoading(false);
            if (newCode && newCode.snippet) {
                setCodeSnippet(newCode.snippet);
                setActiveCodeSnippet(newCode.snippet);
            }
        }).catch(err => {
            setIsLoading(false);
            console.error("Error loading version:", err);
        });
    }, [selected, setActiveCodeSnippet, setCodeSnippet]);

    const handleSaveChanges = async () => {
        setIsSaving(true);
        const result = await addSnippet(entityId, codeSnippetref);
        setIsSaving(false);

        if (result.success && result.version) {
            // Refresh available versions and select the new version
            const versions = await getAllVersions(entityId);
            setAvailableVersions(versions);
            setSelected(result.version);
        } else {
            console.error("Failed to save:", result.error);
            alert("Failed to save changes: " + result.error);
        }
    };

    return (
        <div className='w-full h-[10%] absolute p-2'>
            <div className='w-full h-full bg-background rounded-xl'>
                <div className='px-3 h-full flex items-center justify-between'>
                    <Tabs defaultValue='code'>
                        <TabsList>
                            <TabsTrigger
                                onClick={() => {
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
                        <Button
                            onClick={handleSaveChanges}
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                        <div className='py-2 px-4 bg-ring rounded-sm'>
                            <DropdownMenu>
                                <DropdownMenuTrigger className='flex flex-row gap-2' disabled={isLoading}>
                                    {isLoading ? "Loading..." : `version: ${selected}`}
                                    <ChevronDown />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className='mr-3 mt-2'>
                                    {availableVersions.map(version => (
                                        <DropdownMenuItem
                                            key={version}
                                            onSelect={() => setSelected(version)}
                                        >
                                            v{version}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ToolBar