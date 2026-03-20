import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Field } from "@/components/ui/field"
import { SearchIcon } from "lucide-react"
import type { SyntheticEvent } from "react";

type SearchBarProps = {
    value: string;
    onChange(value: string): void;
    onSubmit(): void;
}

export default function SearchBar({ value, onChange, onSubmit }: SearchBarProps) {
    // HANDLES  
    const handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        onSubmit();
    }
    //    UI RENDER
    return (
        <form onSubmit={handleSubmit}>
            <Field className="max-w-sm">
                <InputGroup>
                    <InputGroupInput
                        id="inline-start-input"
                        placeholder="Search..."
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    <InputGroupAddon align="inline-start">
                        <InputGroupButton
                            type="submit"
                            disabled={value.trim().length === 0}>
                            <SearchIcon className="text-muted-foreground" />
                        </InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
            </Field>
        </form>
    );
}
