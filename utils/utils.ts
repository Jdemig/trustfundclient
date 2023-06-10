export const isValidDayOfTheMonth = ({month, day}: {month: number | string, day: number | string}) => {
    // create a date object with the month and day and an arbitrary year.
    // if the resulting date object has the correct month and day, then the
    // those values are valid.
    if (typeof month === "string") {
        month = parseInt(month);
    }
    if (typeof day === "string") {
        day = parseInt(day);
    }
    const date = new Date(2000, month - 1, day);
    return date.getFullYear() === 2000 && date.getMonth() === month - 1 && date.getDate() === day;
};

export const isValidYear = (year: number) => {
    return year >= (new Date()).getFullYear() && year <= 2100
};

export const isValidMonth = (month: number | string) => {
    if (typeof month === "string") {
        month = parseInt(month);
    }
    return month >= 1 && month <= 12;
};

export const validateDate = (day: number, month: number, year: number) => {
    if (!isValidDayOfTheMonth({month: month, day: day})) {
        return 'Invalid day';
    }
    if (!isValidYear(year)) {
        return 'Invalid year';
    }
    if (!isValidMonth(month)) {
        return 'Invalid month';
    }

    return '';
}
