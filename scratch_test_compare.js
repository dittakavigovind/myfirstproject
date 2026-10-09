const compareVersions = (v1, v2) => {
    const p1 = v1.split('.').map(str => parseInt(str, 10));
    const p2 = v2.split('.').map(str => parseInt(str, 10));
    console.log("p1:", p1);
    console.log("p2:", p2);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
        const num1 = isNaN(p1[i]) ? 0 : p1[i];
        const num2 = isNaN(p2[i]) ? 0 : p2[i];
        if (num1 > num2) return 1;
        if (num1 < num2) return -1;
    }
    return 0;
};

console.log(compareVersions("1.2.1", "1.2.1"));
console.log(compareVersions("1.2.1 (Build 4)", "1.2.1"));
console.log(compareVersions("1.2.1-beta", "1.2.1"));
