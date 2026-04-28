import bcrypt from "bcryptjs";

export const hashedPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    } catch (err) {
        console.error("Error hashing password:", err);
        throw err;
    }
};

export const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);    
    } catch (err) {
        console.error("Error comparing password:", err);
        throw err;
    }   
};