import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";

interface SizeControlProps {
    inputValue: string;
    className?: string;
}

export default function SizeControl({ inputValue, className }: SizeControlProps) {
    const [value, setValue] = useState(inputValue || undefined);

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex gap-2">
                <Input
                    aria-label="Size Value"
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-24 rounded-md border p-2 bg-neutral-900 text-white"
                />
            </div>
        </div>
    );
}
