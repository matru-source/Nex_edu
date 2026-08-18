/**
 * Generates a password based on user name + special symbols + numeric
 * Format: {name}{specialSymbols}{numeric}
 * Example: JohnDoe@#$1234
 */
export function generatePasswordFromName(name: string): string {
    // Remove spaces and convert to camelCase-like format
    const namePart = name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('')
        .replace(/[^a-zA-Z]/g, ''); // Remove any non-alphabetic characters

    // Special symbols
    const specialSymbols = '@#$!';

    // Generate random 4-digit number
    const numericPart = Math.floor(1000 + Math.random() * 9000).toString();

    return `${namePart}${specialSymbols}${numericPart}`;
}
