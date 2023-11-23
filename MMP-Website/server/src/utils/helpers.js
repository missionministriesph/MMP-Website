import bcrypt from "bcrypt";

//Check for allowed users in a route
export const allowed = (access_code, allowed_list) => {
    if (allowed_list.includes(access_code)) {
        return true;
    } else {
        return false;
    }
};

//Exclude a field from an object
export const exclude = (object, keys) => {
    return Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)));
};

// Exclude a field from an array of objects
export const excludeFromArray = (array, keys) => {
    return array.map((object) => exclude(object, keys));
};

//Generate password hash
export const generatePasswordHash = (password) => {
    // Get random decryption key to Hash password
    const salt = bcrypt.genSaltSync();
    const passwordHash = bcrypt.hashSync(password, salt);

    return passwordHash;
};

//Returns an object of the last 2 segments of an id number
export const getLatestIDSegments = (list) => {
    const id_list = list.map((element) => {
        return parseInt(element.substring(5, 12).replace("-", ""));
    });

    let max = 0;
    for (const element of id_list) {
        if (element > max) {
            max = element;
        }
    }

    const segmentStr = max.toString().padStart(6, "0");
    return { second: segmentStr.slice(0, 3), third: segmentStr.slice(3) };
};

export const generateFinancePKSegments = (list) => {
    const pkList = list.map((element) => {
        return parseInt(element.replace("-", ""));
    });

    let max = 0;
    for (const element of pkList) {
        if (element > max) {
            max = element;
        }
    }

    const rawPK = max.toString().padStart(10, "0");

    return { first: rawPK.slice(0, 1), second: rawPK.slice(1) };
};

// Helper function to format an enum
export function formatEnum(val) {
    if (val == null) return "";
    return val
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}