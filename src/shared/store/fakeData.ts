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
        const id = i;
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
