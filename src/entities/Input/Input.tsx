import React from "react";
import style from "./style.module.scss";

type InputProps = {
    label: string;
    value: string | number;
    placeholder?: string;
    onChange: (value: string) => void;
};

const Input: React.FC<InputProps> = ({
    label,
    value,
    placeholder = "",
    onChange,
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className={style.input}>
            <label>{label}</label>
            <input
                type="text"
                value={value}
                placeholder={placeholder}
                onChange={handleChange}
            />
        </div>
    );
};

export default Input;
