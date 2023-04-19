import React, { createContext, useContext, HTMLAttributes } from "react";
import styles from "./style.module.scss";

interface TableContextType {
    columnsWidth: (number | string)[];
    rowStyle: React.CSSProperties;
}
interface TableProps extends HTMLAttributes<HTMLDivElement> {
    columnsWidth: (number | string)[];
    height?: string;
    children: React.ReactNode;
    rowStyle?: React.CSSProperties;
    className?: string;
}
interface TRowProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    style?: React.CSSProperties;
    head?: boolean;
    className?: string;
}
interface THeadProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    style?: React.CSSProperties;
    head?: boolean;
    className?: string;
}
interface TCellProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

const TableContext = createContext<TableContextType>({
    columnsWidth: [],
    rowStyle: {},
});

export const Table: React.FC<TableProps> = ({
    columnsWidth,
    height = "100%",
    children,
    style,
    rowStyle = { width: "100%" },
    className,
    ...props
}) => {
    return (
        <TableContext.Provider value={{ columnsWidth, rowStyle }}>
            <div
                className={`${styles.table} ${className}`}
                style={{ height, ...style }}
                {...props}
                role="grid"
            >
                {children}
            </div>
        </TableContext.Provider>
    );
};

export const THead: React.FC<THeadProps> = ({
    children,
    style,
    head,
    className,
    ...props
}) => {
    const { columnsWidth, rowStyle } = useContext(TableContext);

    const getColumns = (): string => {
        let string = columnsWidth.map((key) => {
            if (typeof key === "string") return key;
            return `${key}px`;
        });

        return string.join(" ");
    };

    const styleRow = {
        gridTemplateColumns: getColumns(),
        ...rowStyle,
        ...style,
    };
    const classNames = `${className} ${styles.table__row} ${styles.table__head} table__row__columns`;

    return (
        <div role="row" className={classNames} style={styleRow} {...props}>
            {React.Children.map(children, (child: any, index) => {
                return React.cloneElement(child, {
                    role: "columnheader",
                    "aria-label": "columnheader",
                    "aria-colindex": index + 1,
                });
            })}
        </div>
    );
};

export const TRow: React.FC<TRowProps> = ({
    children,
    style,
    head,
    className,
    ...props
}) => {
    const { columnsWidth, rowStyle } = useContext(TableContext);

    const getColumns = (): string => {
        let string = columnsWidth.map((key) => {
            if (typeof key === "string") return key;
            return `${key}px`;
        });

        return string.join(" ");
    };

    return (
        <div
            className={[
                className,
                styles.table__row,
                "table__row__columns",
            ].join(" ")}
            style={{ gridTemplateColumns: getColumns(), ...rowStyle, ...style }}
            {...props}
            role="row"
        >
            {children}
        </div>
    );
};

export const TCell: React.FC<TCellProps> = React.memo(
    ({ children, className, ...props }) => {
        return (
            <div
                role="gridcell"
                className={[className, styles.table__cell].join(" ")}
                {...props}
            >
                {children}
            </div>
        );
    }
);
