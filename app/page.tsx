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

    // Handle originalComponent updates
    useEffect(() => {
        if (originalComponent) {
            setManipulatedComponent(originalComponent);
        }
    }, [originalComponent]);

    // Handle tab switching
    useEffect(() => {
        // When switching back to editor view
        if (sideBar === 'editor' && activeCodeSnippet) {
            // Reset component states to force re-selection from iframe
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
    }, [sideBar, activeCodeSnippet]);

    // Sync code when manipulatedComponent changes
    useEffect(() => {
        if (!manipulatedComponent.domPath || !activeCodeSnippet) return;
        if (isUpdatingCodeRef.current) return;

        const manipulatedString = JSON.stringify({
            domPath: manipulatedComponent.domPath,
            attributes: manipulatedComponent.attributes,
            classList: manipulatedComponent.classList,
            textContent: manipulatedComponent.textContent,
            innerHTML: manipulatedComponent.innerHTML
        });

        if (manipulatedString === lastManipulatedComponentRef.current) return;

        lastManipulatedComponentRef.current = manipulatedString;

        try {
            isUpdatingCodeRef.current = true;
            const updatedCode = updateCodeWithManipulation(
                activeCodeSnippet,
                manipulatedComponent,
                preset
            );

            if (updatedCode && updatedCode !== activeCodeSnippet) {
                // Update both code states together
                setActiveCodeSnippet(updatedCode);
                setCodeSnippet(updatedCode);
            }
        } catch (error) {
            console.error('Error syncing code:', error);
        } finally {
            isUpdatingCodeRef.current = false;
        }
    }, [manipulatedComponent, activeCodeSnippet, preset]);

    const handleUpload = () => {
        if (!codeSnippet) return;
        setActiveCodeSnippet(codeSnippet);
        // Reset refs when uploading new code
        lastManipulatedComponentRef.current = "";
        isUpdatingCodeRef.current = false;
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
                            <ToolBar setSideBar={setSideBar} setEditorActive={setEditorActive} />
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
            </div >
        </div >
    );
}