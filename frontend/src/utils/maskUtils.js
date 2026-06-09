export const maskUserName = (name) => {
    if (!name) return 'Seeker';
    const cleanName = name.trim();
    if (cleanName.length > 5) {
        return cleanName.substring(0, 5) + '*'.repeat(cleanName.length - 5);
    } else if (cleanName.length > 3) {
        return cleanName.substring(0, 3) + '*'.repeat(cleanName.length - 3);
    } else {
        return cleanName + '*'.repeat(3);
    }
};
