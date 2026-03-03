import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { SearchIcon } from "lucide-react"
import type { SyntheticEvent } from "react";

type SearchBarProps = {
    loading: boolean;
    value: string;
    onChange(value: string): void;
    onSubmit(): void;
}

export default function SearchBar({ loading, value, onChange, onSubmit }: SearchBarProps) {
    // HANDLES  
    const handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        onSubmit();
    }
    //    UI RENDER
    return (
        <form onSubmit={handleSubmit}>
            <Field className="max-w-sm">
                <FieldLabel htmlFor="inline-start-input">Input</FieldLabel>
                <InputGroup>
                    <InputGroupInput
                        id="inline-start-input"
                        placeholder="Search..."
                        value={value}
                        disabled={loading}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    <InputGroupAddon align="inline-start">
                        <InputGroupButton
                            type="submit"
                            disabled={loading || value.trim().length === 0}>
                            <SearchIcon className="text-muted-foreground" />
                        </InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
                <FieldDescription>Icon positioned at the start.</FieldDescription>
            </Field>
        </form>
    );
}
