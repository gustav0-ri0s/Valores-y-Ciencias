// components/ui/select-native.tsx
import * as React from "react";

type SelectNativeProps = React.SelectHTMLAttributes<HTMLSelectElement>;
type SelectContextValue = {
    value?: string;
    onValueChange?: (v: string) => void;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

export function Select({
    value,
    onValueChange,
    children,
    ...props
}: {
    value?: string;
    onValueChange?: (v: string) => void;
    children: React.ReactNode;
} & Omit<SelectNativeProps, "value" | "onChange">) {
    return (
        <SelectContext.Provider value={{ value, onValueChange }}>
            <div className="w-full">{children}</div>
        </SelectContext.Provider>
    );
}

export function SelectTrigger({
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            className={`w-full ${props.className ?? ""}`.trim()}
        >
            {children}
        </div>
    );
}

export function SelectValue({
    placeholder,
}: {
    placeholder?: string;
}) {
    const ctx = React.useContext(SelectContext);
    return (
        <span className="text-sm text-muted-foreground">
            {ctx?.value ? ctx.value : placeholder ?? "Seleccionar"}
        </span>
    );
}

export function SelectContent({
    children,
    value,
    onValueChange,
    ...props
}: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (v: string) => void;
} & SelectNativeProps) {
    const ctx = React.useContext(SelectContext);

    const finalValue = value ?? ctx?.value ?? "";
    const finalOnChange = onValueChange ?? ctx?.onValueChange;

    return (
        <select
            {...props}
            value={finalValue}
            onChange={(e) => finalOnChange?.(e.target.value)}
            className={`w-full rounded-md border px-3 py-2 text-sm ${props.className ?? ""}`.trim()}
        >
            {children}
        </select>
    );
}

export function SelectItem({
    value,
    children,
    ...props
}: React.OptionHTMLAttributes<HTMLOptionElement> & { value: string }) {
    return (
        <option {...props} value={value}>
            {children}
        </option>
    );
}
