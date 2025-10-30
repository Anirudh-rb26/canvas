"use client";

import { useEffect, useState, useRef } from "react";
import Editor from "@/components/editor";
import ToolBar from "@/components/toolbar";
import CodeInput from "@/components/code-input";
import LiveCanvas from "@/components/live-canvas";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import updateCodeWithManipulation from "@/lib/codeSnippetManipulation";

type ComponentType = {
    domPath: string;
    tagName: string;
    attributes: Record<string, string>;
    innerHTML: string;
    textContent: string;
    classList: string[];
};

export default function Home() {
    const [sideBar, setSideBar] = useState();
    const [preset, setPreset] = useState("JSX");
    const [codeSnippet, setCodeSnippet] = useState<string>();
    const [editorActive, setEditorActive] = useState<boolean>(false);
    const [activeCodeSnippet, setActiveCodeSnippet] = useState<string>();
    const [originalComponent, setOriginalComponent] = useState<ComponentType>();

    const [manipulatedComponent, setManipulatedComponent] = useState<ComponentType>({
        domPath: '',
        tagName: '',
        attributes: {},
        innerHTML: '',
        textContent: '',
        classList: []
    });

    // Track if we're currently updating to prevent loops
    const isUpdatingCodeRef = useRef(false);
    const lastManipulatedComponentRef = useRef<string>("");

    // NEW: Track the "display" code separately from the "active" code
    const displayCodeSnippetRef = useRef<string>("");

    // Handle originalComponent updates with batching
    useEffect(() => {
        if (originalComponent) {
            // When selecting a NEW component, apply previous changes first
            if (displayCodeSnippetRef.current && displayCodeSnippetRef.current !== activeCodeSnippet) {
                setActiveCodeSnippet(displayCodeSnippetRef.current);
            }

            Promise.resolve().then(() => {
                setManipulatedComponent(originalComponent);
            });
        }
    }, [originalComponent, activeCodeSnippet]);

    // Handle tab switching with batched updates
    useEffect(() => {
        if (sideBar === 'editor' && activeCodeSnippet) {
            // Apply code changes before switching to preserve styles
            if (displayCodeSnippetRef.current && displayCodeSnippetRef.current !== activeCodeSnippet) {
                setActiveCodeSnippet(displayCodeSnippetRef.current);
            }

            Promise.resolve().then(() => {
                setOriginalComponent(undefined);
                setManipulatedComponent({
                    domPath: '',
                    tagName: '',
                    attributes: {},
                    innerHTML: '',
                    textContent: '',
                    classList: []
                });
            });
        }
    }, [sideBar, activeCodeSnippet]);

    // Sync code when manipulatedComponent changes - BUT DON'T UPDATE activeCodeSnippet
    useEffect(() => {
        if (!manipulatedComponent.domPath || !activeCodeSnippet || isUpdatingCodeRef.current) return;

        const manipulatedString = JSON.stringify({
            domPath: manipulatedComponent.domPath,
            attributes: manipulatedComponent.attributes,
            classList: manipulatedComponent.classList,
            textContent: manipulatedComponent.textContent,
            innerHTML: manipulatedComponent.innerHTML
        });

        if (manipulatedString === lastManipulatedComponentRef.current) return;

        const updateCode = () => {
            try {
                isUpdatingCodeRef.current = true;
                lastManipulatedComponentRef.current = manipulatedString;

                const sourceCode = activeCodeSnippet;
                const updatedCode = updateCodeWithManipulation(
                    sourceCode,
                    manipulatedComponent,
                    preset
                );

                if (updatedCode && updatedCode !== sourceCode) {
                    // CHANGED: Only update codeSnippet (for display in editor), 
                    // NOT activeCodeSnippet (which triggers iframe re-render)
                    Promise.resolve().then(() => {
                        setCodeSnippet(updatedCode);
                        displayCodeSnippetRef.current = updatedCode;
                    });
                }
            } catch (error) {
                console.error('Error syncing code:', error);
            } finally {
                Promise.resolve().then(() => {
                    isUpdatingCodeRef.current = false;
                });
            }
        };

        updateCode();
    }, [manipulatedComponent, activeCodeSnippet, preset]);

    const handleUpload = () => {
        if (!codeSnippet) return;
        setActiveCodeSnippet(codeSnippet);
        displayCodeSnippetRef.current = codeSnippet;
        // Reset refs when uploading new code
        lastManipulatedComponentRef.current = "";
        isUpdatingCodeRef.current = false;
    };

    // NEW: Function to apply the display code to active code (when user manually wants to sync)
    const applyCodeChanges = () => {
        if (displayCodeSnippetRef.current) {
            setActiveCodeSnippet(displayCodeSnippetRef.current);
            setOriginalComponent(undefined);
            setManipulatedComponent({
                domPath: '',
                tagName: '',
                attributes: {},
                innerHTML: '',
                textContent: '',
                classList: []
            });
        }
    };

    return (
        <div className="w-screen h-screen flex flex-col overflow-hidden">
            {/* Toolbar always on top */}
            <div className="h-[10%] w-full overflow-hidden">
                <AnimatePresence>
                    {activeCodeSnippet && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
                        >
                            <ToolBar
                                setSideBar={setSideBar}
                                setEditorActive={setEditorActive}
                                onApplyChanges={applyCodeChanges}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Canvas */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                <AnimatePresence>
                    {activeCodeSnippet && (
                        <motion.div
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
                            className="absolute right-0 top-0 bottom-0 w-3/4 p-2"
                        >
                            <div className="w-full h-full">
                                <LiveCanvas
                                    codeSnippet={activeCodeSnippet}
                                    preset={preset}
                                    editorActive={editorActive}
                                    setSelectedComponent={setOriginalComponent}
                                    manipulatedComponent={manipulatedComponent}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={false}
                    animate={{
                        width: activeCodeSnippet ? "25%" : "50%",
                        height: activeCodeSnippet ? "100%" : "25%",
                        borderRadius: activeCodeSnippet ? "0px" : "24px",
                        x: activeCodeSnippet ? "-150%" : "0%",
                    }}
                    transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
                    className="flex flex-col gap-4 items-center justify-center p-2"
                >
                    {!activeCodeSnippet && (
                        <motion.h1
                            initial={false}
                            animate={{
                                fontSize: activeCodeSnippet ? "1.5rem" : "1.875rem",
                            }}
                            transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
                        >
                            Paste your React Snippet!
                        </motion.h1>
                    )}

                    <Tabs value={sideBar! || "code"} className="h-full w-full flex items-center justify-center">
                        <TabsContent value="code" className="w-full h-full flex justify-center">
                            <CodeInput
                                activeCodeSnippet={activeCodeSnippet}
                                codeSnippet={codeSnippet}
                                setCodeSnippet={setCodeSnippet}
                                handleUpload={handleUpload}
                                preset={preset}
                                setPreset={setPreset}
                            />
                        </TabsContent>
                        <TabsContent value="editor" className="w-full h-full">
                            <Editor
                                originalComponent={originalComponent}
                                manipulatedComponent={manipulatedComponent}
                                setManipulatedComponent={setManipulatedComponent}
                            />
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>
        </div>
    );
}