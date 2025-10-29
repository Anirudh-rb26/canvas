import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";

interface SizeControlProps {
    inputValue: string;
    className?: string;
    type: string;
    updateStyle: (value: string) => void;
}

export default function SizeControl({ inputValue, className, type, updateStyle }: SizeControlProps) {
    const [value, setValue] = useState(inputValue || "");

    useEffect(() => {
        const match = inputValue?.match(/(\d+)/);
        setValue(match ? match[1] : "");
    }, [inputValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);

        if (newValue) {
            let tailwindClass = "";

            if (type === "margin") {
                tailwindClass = `m-${newValue}`;
            } else if (type === "padding") {
                tailwindClass = `p-${newValue}`;
            }

            updateStyle(tailwindClass);
        }
    };

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex gap-2">
                <Input
                    aria-label="Size Value"
                    type="number"
                    value={value}
                    onChange={handleChange}
                    className="w-24 rounded-md border p-2 bg-neutral-900 text-white"
                />
            </div>
        </div>
    );
}
