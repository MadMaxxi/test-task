import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { faker } from "@faker-js/faker";

export const company = (count: number) => {
    const companies = [];

    for (let i = 0; i < count; i++) {
        const id = i + 1;
        const companyName = faker.company.name();
        const employeeCount = 0;
        const address = faker.address.streetAddress();
        companies.push({ id, companyName, employeeCount, address });
    }

    return companies;
};

export const employee = (count: number, companies: Array<{ id: number }>) => {
    const employees = [];

    for (let i = 0; i < count; i++) {
        const id = i + 1;
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const position = faker.name.jobTitle();
        const companyId =
            companies[Math.floor(Math.random() * companies.length)].id;
        employees.push({ id, firstName, lastName, position, companyId });
    }

    updateEmployeeCounts(companies, employees);

    return employees;
};

const updateEmployeeCounts = (companies: any, employees: any) => {
    companies.forEach((company: any) => {
        const employeeCount = employees.filter(
            (employee: any) => employee.companyId === company.id
        ).length;
        company.employeeCount = employeeCount;
    });
};

const companies = company(500);
const employees = employee(500, companies);

const initialState = {
    companies,
    employees,
};

export const tableSlices = createSlice({
    name: "tables",
    initialState,
    reducers: {
        addCompany(
            state,
            action: PayloadAction<{ companyName: string; address: string }>
        ) {
            const { companyName, address } = action.payload;
            const newId = state.companies.length + 1;
            state.companies.push({
                id: newId,
                companyName,
                employeeCount: 0,
                address,
            });
        },
        updateCompany(
            state,
            action: PayloadAction<{ id: number; updatedCompany: any }>
        ) {
            const { id, updatedCompany } = action.payload;
            const companyIndex = state.companies.findIndex(
                (company) => company.id === id
            );
            state.companies[companyIndex] = {
                ...state.companies[companyIndex],
                ...updatedCompany,
            };
        },
        deleteCompany(state, action: PayloadAction<number>) {
            const companyId = action.payload;
            state.companies = state.companies.filter(
                (company) => company.id !== companyId
            );
            state.employees = state.employees.filter(
                (employee) => employee.companyId !== companyId
            );
        },
        addEmployee(
            state,
            action: PayloadAction<{
                firstName: string;
                lastName: string;
                position: string;
                companyId: number;
            }>
        ) {
            const { firstName, lastName, position, companyId } = action.payload;
            const newId = state.employees.length + 1;
            state.employees.push({
                id: newId,
                firstName,
                lastName,
                position,
                companyId,
            });
            const companyIndex = state.companies.findIndex(
                (company) => company.id === companyId
            );
            state.companies[companyIndex].employeeCount += 1;
        },
        updateEmployee(
            state,
            action: PayloadAction<{ id: number; updatedEmployee: any }>
        ) {
            const { id, updatedEmployee } = action.payload;
            const employeeIndex = state.employees.findIndex(
                (employee) => employee.id === id
            );
            state.employees[employeeIndex] = {
                ...state.employees[employeeIndex],
                ...updatedEmployee,
            };
        },
        deleteEmployee(state, action: PayloadAction<number>) {
            const employeeId = action.payload;
            const employeeIndex = state.employees.findIndex(
                (employee) => employee.id === employeeId
            );
            const employee = state.employees[employeeIndex];
            state.employees.splice(employeeIndex, 1);

            const companyIndex = state.companies.findIndex(
                (company) => company.id === employee.companyId
            );
            if (companyIndex !== -1) {
                state.companies[companyIndex].employeeCount -= 1;
            }
        },
    },
});

export const {
    addCompany,
    updateCompany,
    deleteCompany,
    addEmployee,
    updateEmployee,
    deleteEmployee,
} = tableSlices.actions;
export default tableSlices.reducer;
