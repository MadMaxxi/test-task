import React, { ReactNode } from "react";
import style from "./style.module.scss";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: () => void;
    children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    const modalStyle: React.CSSProperties = {
        display: isOpen ? "block" : "none",
    };
    return (
        <>
            {isOpen && (
                <div
                    className={style.modal}
                    style={modalStyle}
                    onClick={onClose}
                >
                    <div
                        className={style.modal__form}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={style.buttons}>
                            <button onClick={onClose} className="button">
                                <img src="../src/assets/close.png" />
                            </button>
                        </div>
                        <div className={style.form}>{children}</div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Modal;
