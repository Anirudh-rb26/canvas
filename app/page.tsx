"use client";

import { useState } from "react";
import Editor from "@/components/editor";
import ToolBar from "@/components/toolbar";
import CodeInput from "@/components/code-input";
import LiveCanvas from "@/components/live-canvas";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent } from "@/components/ui/tabs";

export default function Home() {
    const [sideBar, setSideBar] = useState();
    const [preset, setPreset] = useState("JSX");
    const [codeSnippet, setCodeSnippet] = useState<string>();
    const [editorActive, setEditorActive] = useState<boolean>(false);
    const [activeCodeSnippet, setActiveCodeSnippet] = useState<string>();
    const [selectedComponent, setSelectedComponent] = useState<{
        domPath: string;
        tagName: string;
        attributes: Record<string, string>;
        innerHTML: string;
        textContent: string;
        classList: string[];
    }>();


    const handleUpload = () => {
        if (!codeSnippet) return;
        setActiveCodeSnippet(codeSnippet);
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
                                    setSelectedComponent={setSelectedComponent}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Textarea container */}
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
                            {/* <Editor something={ } /> */}
                            <Editor selectedComponent={selectedComponent} />
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div >
        </div >
    );
}

