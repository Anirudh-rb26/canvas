import React from 'react'
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { Upload } from 'lucide-react';
import { Textarea } from './ui/textarea';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CodeInput = ({ activeCodeSnippet, setCodeSnippet, handleUpload }: { activeCodeSnippet: string | undefined, setCodeSnippet: React.Dispatch<React.SetStateAction<any>>, handleUpload: () => void }) => {
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
                className="w-full h-full rounded-3xl resize-none pt-2 pl-2 pr-18 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                onChange={(e) => setCodeSnippet(e.target.value)} />
            <Button
                className="bg-blue-500 absolute bottom-6 right-6 rounded-xl shadow-md p-3 hover:bg-blue-600 transition-colors"
                onClick={handleUpload}
            >
                <Upload className="text-white w-5 h-5" />
            </Button>
        </motion.div>
    )
}

export default CodeInput;