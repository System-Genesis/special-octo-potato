export const trimLeadingZeros = (str: string) => {
    return parseInt(str, 10).toString();
};

export const padString = (str: string) => {
    
    if (!str.match(/^\d{5,9}$/)) return str;

    // The number is too short - add leading zeros
    const paddedStr = str.padStart(9, '0');
    return paddedStr;

};
