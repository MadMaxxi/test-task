import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { TCell, THead, TRow, Table } from "./shared/ui/Table/Table";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./shared/store/store";
import Modal from "./features/Modal/Modal";
import Input from "./entities/Input/Input";
import {
    addCompany,
    addEmployee,
    deleteCompany,
    deleteEmployee,
    updateCompany,
    updateEmployee,
} from "./shared/store/tablesSlice";

function App() {
    const dispatch = useDispatch();
    const [openModal, setOpenModal] = useState(false);
    const [currentCompany, setCurrentCompany] = useState<number>(0);
    const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [modalTarget, setModalTarget] = useState<
        "company" | "employee" | string
    >("company");
    const [modalType, setModalType] = useState<"add" | "edit">("add");
    const [companyForm, setCompanyForm] = useState({
        companyName: "",
        employeeCount: 0,
        address: "",
    });
    const [employeeForm, setEmployeeForm] = useState({
        firstName: "",
        lastName: "",
        position: "",
        companyId: 0,
    });
    const table = useSelector((state: RootState) => state.tables);

    // Добавление элементов (компаний/работников) в массив для последующего удаления
    const handleCheckboxChange = (id: number, type: "company" | "employee") => {
        switch (type) {
            case "company":
                if (selectedCompanies.includes(id)) {
                    setSelectedCompanies(
                        selectedCompanies.filter(
                            (selectedId) => selectedId !== id
                        )
                    );
                } else {
                    setSelectedCompanies([...selectedCompanies, id]);
                }
                break;
            case "employee":
                if (selectedEmployees.includes(id)) {
                    setSelectedEmployees(
                        selectedEmployees.filter(
                            (selectedId) => selectedId !== id
                        )
                    );
                } else {
                    setSelectedEmployees([...selectedEmployees, id]);
                }
                break;
        }
    };

    // Добавление/очистка всех элементов (компаний/работников) массива для последующего удаления
    const handleCheckAll = (type: "company" | "employee") => {
        switch (type) {
            case "company":
                if (selectedCompanies.length === table.companies.length) {
                    setSelectedCompanies([]);
                } else {
                    setSelectedCompanies(table.companies.map((c) => c.id));
                }
                break;
            case "employee":
                console.log(selectedEmployees);
                if (
                    selectedEmployees.length ===
                    table.employees.filter(
                        (t) => t.companyId === currentCompany
                    ).length
                ) {
                    setSelectedEmployees([]);
                } else {
                    setSelectedEmployees(
                        table.employees
                            .filter((t) => t.companyId === currentCompany)
                            .map((c) => c.id)
                    );
                }
                break;
        }
    };

    // Хук очистки выделенных работников при выборе дргуой компании
    useEffect(() => {
        setSelectedEmployees([]);
    }, [currentCompany]);

    // Хук для настройки текущего состояния модального окна (при клике на разные кнопки)
    useEffect(() => {
        if (modalType === "add" && modalTarget === "company") {
            setCompanyForm({
                companyName: "",
                employeeCount: 0,
                address: "",
            });
        }
        if (modalType === "edit" && modalTarget === "company") {
            const editableCompany =
                selectedCompanies.length === 1
                    ? table.companies.filter(
                          (t) => t.id === selectedCompanies[0]
                      )[0]
                    : table.companies.filter((t) => t.id === currentCompany)[0];
            setCompanyForm({
                companyName: editableCompany.companyName,
                employeeCount: editableCompany.employeeCount,
                address: editableCompany.address,
            });
        }
        if (modalType === "add" && modalTarget === "employee") {
            const companyId =
                selectedCompanies.length === 1
                    ? selectedCompanies[0]
                    : currentCompany;
            setEmployeeForm((prev) => ({
                ...prev,
                companyId: companyId,
            }));
        }
        if (modalType === "edit" && modalTarget === "employee") {
            const editableEmployeer = table.employees.filter(
                (t) => t.id === selectedEmployees[0]
            )[0];
            editableEmployeer &&
                setEmployeeForm({
                    firstName: editableEmployeer.firstName,
                    lastName: editableEmployeer.lastName,
                    position: editableEmployeer.position,
                    companyId: editableEmployeer.companyId,
                });
        }
    }, [openModal, modalType, modalTarget]);

    // Функция создания/редактирования компании или сотрудника в зависимости от состояния модального окна
    const submitForm = () => {
        if (modalType === "add" && modalTarget === "company") {
            if (companyForm.companyName && companyForm.address) {
                dispatch(addCompany(companyForm));
            }
        }
        if (modalType === "edit" && modalTarget === "company") {
            if (companyForm.companyName && companyForm.address) {
                dispatch(
                    updateCompany({
                        id:
                            selectedCompanies.length === 1
                                ? selectedCompanies[0]
                                : currentCompany,
                        updatedCompany: companyForm,
                    })
                );
            }
        }
        if (modalType === "add" && modalTarget === "employee") {
            if (
                employeeForm.firstName &&
                employeeForm.lastName &&
                employeeForm.position &&
                employeeForm.companyId !== 0
            ) {
                dispatch(addEmployee(employeeForm));
            }
        }
        if (modalType === "edit" && modalTarget === "employee") {
            if (
                employeeForm.firstName &&
                employeeForm.lastName &&
                employeeForm.position &&
                employeeForm.companyId !== 0
            ) {
                dispatch(
                    updateEmployee({
                        id: selectedEmployees[0],
                        updatedEmployee: employeeForm,
                    })
                );
            }
        }
        setOpenModal(false);
        setSelectedEmployees([]);
        setSelectedCompanies([]);
    };

    // Функции удаления компаний и сотрудников
    const handleDelete = (target: "company" | "employee") => {
        switch (target) {
            case "company":
                selectedCompanies.map((del) => dispatch(deleteCompany(del)));
                break;
            case "employee":
                selectedEmployees.map((del) => dispatch(deleteEmployee(del)));
                break;
        }
        setSelectedEmployees([]);
        setSelectedCompanies([]);
    };

    // Виртуализация для таблицы через useRef с помощью IntersectionObserver
    const tableRef = useRef(null);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting) {
                    setVisibleRange((prevVisibleRange) => ({
                        start: prevVisibleRange.start,
                        end: prevVisibleRange.end + 20, // увеличить на 20 строк
                    }));
                }
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 1.0,
            }
        );

        if (tableRef.current) {
            observer.observe(tableRef.current);
        }

        return () => {
            if (tableRef.current) {
                observer.unobserve(tableRef.current);
            }
        };
    }, []);
    return (
        <div className="app">
            {/* Компонент модального окна (контент меняется от состояния стэйтов) */}
            <Modal
                isOpen={openModal}
                onClose={() => {
                    setOpenModal((prev) => !prev);
                    setCompanyForm({
                        companyName: "",
                        employeeCount: 0,
                        address: "",
                    });
                }}
            >
                <div className="form">
                    <div>
                        {currentCompany && selectedCompanies.length <= 1 ? (
                            modalType !== "edit" ? (
                                <div className="form__select">
                                    <p>Добавить</p>
                                    <select
                                        value={modalTarget}
                                        onChange={(e) =>
                                            setModalTarget(e.target.value)
                                        }
                                    >
                                        <option value="company">
                                            Компанию
                                        </option>
                                        <option value="employee">
                                            Сотрудника
                                        </option>
                                    </select>
                                    {modalTarget === "employee" && (
                                        <p>
                                            для компании{" "}
                                            {
                                                table.companies.filter(
                                                    (c) =>
                                                        c.id === currentCompany
                                                )[0].companyName
                                            }
                                        </p>
                                    )}
                                </div>
                            ) : modalTarget === "company" ? (
                                <p>
                                    Редактирование организации{" "}
                                    {selectedCompanies.length === 1
                                        ? table.companies.filter(
                                              (c) =>
                                                  c.id === selectedCompanies[0]
                                          )[0].companyName
                                        : table.companies.filter(
                                              (c) => c.id === currentCompany
                                          )[0].companyName}
                                </p>
                            ) : (
                                <p>
                                    Редактирование пользователя
                                    {table.employees.filter(
                                        (c) => c.id === selectedEmployees[0]
                                    ).length > 0 &&
                                        ` ${
                                            table.employees.filter(
                                                (c) =>
                                                    c.id ===
                                                    selectedEmployees[0]
                                            )[0]?.firstName
                                        } ${
                                            table.employees.filter(
                                                (c) =>
                                                    c.id ===
                                                    selectedEmployees[0]
                                            )[0]?.lastName
                                        }`}
                                </p>
                            )
                        ) : (
                            <p>Добавление организации</p>
                        )}
                    </div>
                    {modalTarget === "company" && (
                        <div className="form__inputs">
                            <Input
                                label="Название компании"
                                placeholder="название компании..."
                                value={companyForm.companyName}
                                onChange={(value) => {
                                    setCompanyForm((prev) => ({
                                        ...prev,
                                        companyName: value,
                                    }));
                                }}
                            />
                            <Input
                                label="Адрес"
                                placeholder="адрес..."
                                value={companyForm.address}
                                onChange={(value) => {
                                    setCompanyForm((prev) => ({
                                        ...prev,
                                        address: value,
                                    }));
                                }}
                            />
                        </div>
                    )}
                    {modalTarget === "employee" && (
                        <div className="form__inputs">
                            <Input
                                label="Фамилия "
                                placeholder="фамилия..."
                                value={employeeForm.lastName}
                                onChange={(value) => {
                                    setEmployeeForm((prev) => ({
                                        ...prev,
                                        lastName: value,
                                    }));
                                }}
                            />
                            <Input
                                label="Имя"
                                placeholder="имя..."
                                value={employeeForm.firstName}
                                onChange={(value) => {
                                    setEmployeeForm((prev) => ({
                                        ...prev,
                                        firstName: value,
                                    }));
                                }}
                            />
                            <Input
                                label="Должность"
                                placeholder="должность..."
                                value={employeeForm.position}
                                onChange={(value) => {
                                    setEmployeeForm((prev) => ({
                                        ...prev,
                                        position: value,
                                    }));
                                }}
                            />
                        </div>
                    )}

                    <div className="form__buttons">
                        <button onClick={submitForm} className="button success">
                            {modalType === "add" ? "Добавить" : "Сохранить"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Кнопки Добавить/Редактировать/Удалить в зависимости от выделенных элементов */}
            <div className="app__controllers">
                <div className="app__controllers_company">
                    {currentCompany && selectedCompanies.length <= 1 ? "" : ""}
                    <button
                        onClick={() => {
                            setOpenModal(true);
                            setModalType("add");
                            setModalTarget("company");
                        }}
                        className="button success"
                    >
                        Добавить
                    </button>
                    {currentCompany && selectedCompanies.length <= 1 ? (
                        <button
                            onClick={() => {
                                setOpenModal(true);
                                setModalTarget("company");
                                setModalType("edit");
                            }}
                            className="button default"
                        >
                            Редактировать
                        </button>
                    ) : (
                        ""
                    )}
                    {selectedCompanies.length > 0 ? (
                        <button
                            onClick={() => handleDelete("company")}
                            className="button danger"
                        >
                            Удалить
                        </button>
                    ) : (
                        ""
                    )}
                </div>
                <div className="app__controllers_employees">
                    {selectedEmployees.length === 1 ? (
                        <button
                            onClick={() => {
                                setOpenModal(true);
                                setModalType("edit");
                                setModalTarget("employee");
                            }}
                            className="button default"
                        >
                            Редактировать
                        </button>
                    ) : (
                        ""
                    )}
                    {selectedEmployees.length > 0 ? (
                        <button
                            onClick={() => handleDelete("employee")}
                            className="button danger"
                        >
                            Удалить
                        </button>
                    ) : (
                        ""
                    )}
                </div>
            </div>

            {/* Таблица Компании */}
            <div className="app__company">
                <Table
                    height="500px"
                    rowStyle={{ width: "fit-content" }}
                    columnsWidth={[50, 250, 150, 200]}
                >
                    <THead>
                        <TCell>
                            <input
                                checked={
                                    selectedCompanies.length ===
                                    table.companies.length
                                }
                                type="checkbox"
                                onChange={() => handleCheckAll("company")}
                            />
                        </TCell>
                        <TCell className="table-align__left">
                            Название компании
                        </TCell>
                        <TCell className="table-align__center">
                            Кол-во сотрудников
                        </TCell>
                        <TCell className="table-align__left">Адрес</TCell>
                    </THead>
                    {table.companies.map((c, index) => {
                        if (
                            index < visibleRange.start ||
                            index >= visibleRange.end
                        ) {
                            return null;
                        }

                        return (
                            <TRow
                                className={
                                    c.id === currentCompany ||
                                    selectedCompanies.includes(c.id)
                                        ? "table-active"
                                        : ""
                                }
                                key={c.id}
                                onClick={() => setCurrentCompany(c.id)}
                            >
                                <TCell>
                                    <input
                                        checked={selectedCompanies.includes(
                                            c.id
                                        )}
                                        type="checkbox"
                                        onChange={() =>
                                            handleCheckboxChange(
                                                c.id,
                                                "company"
                                            )
                                        }
                                    />
                                </TCell>
                                <TCell className="table-align__left">
                                    {c.companyName}
                                </TCell>
                                <TCell>{c.employeeCount}</TCell>
                                <TCell className="table-align__left">
                                    {c.address}
                                </TCell>
                            </TRow>
                        );
                    })}
                    <div ref={tableRef} style={{ height: "0px" }}></div>
                </Table>
            </div>

            {/* Таблица Сотрудники */}
            <div className="app__employees">
                {currentCompany || currentCompany !== 0 ? (
                    <div className="table">
                        <Table
                            height="500px"
                            rowStyle={{ width: "fit-content" }}
                            columnsWidth={[50, 250, 150, 200]}
                        >
                            <THead>
                                <TCell>
                                    <input
                                        checked={
                                            selectedEmployees.length ===
                                            table.employees.filter(
                                                (t) =>
                                                    t.companyId ===
                                                    currentCompany
                                            ).length
                                        }
                                        type="checkbox"
                                        onChange={() =>
                                            handleCheckAll("employee")
                                        }
                                    />
                                </TCell>
                                <TCell>Фамилия</TCell>
                                <TCell>Имя</TCell>
                                <TCell>Должность</TCell>
                            </THead>
                            {table.employees
                                .filter((e) => e.companyId === currentCompany)
                                .map((c, index) => {
                                    if (
                                        index < visibleRange.start ||
                                        index >= visibleRange.end
                                    ) {
                                        return null;
                                    }
                                    return (
                                        <TRow
                                            className={
                                                selectedEmployees.includes(c.id)
                                                    ? "table-active"
                                                    : ""
                                            }
                                            key={c.id}
                                        >
                                            <TCell>
                                                <input
                                                    checked={selectedEmployees.includes(
                                                        c.id
                                                    )}
                                                    type="checkbox"
                                                    onChange={() =>
                                                        handleCheckboxChange(
                                                            c.id,
                                                            "employee"
                                                        )
                                                    }
                                                />
                                            </TCell>
                                            <TCell>{c.lastName}</TCell>
                                            <TCell>{c.firstName}</TCell>
                                            <TCell>{c.position}</TCell>
                                        </TRow>
                                    );
                                })}
                        </Table>
                    </div>
                ) : (
                    <div className="empty">
                        Выберите компанию, чтобы посмотреть работников
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
