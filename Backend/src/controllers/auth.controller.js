import {} from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js"; // 👈 Naya Zod Import
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_complaint_key_2026";
// -----------------------------------------------------
// REGISTER USER CONTROLLER
// -----------------------------------------------------
export const registerUser = async (req, res) => {
    try {
        // 🛡️ Bouncer Check: Kya data sahi format mein hai?
        const validation = registerSchema.safeParse(req.body);
        if (!validation.success) {
            // Agar data galat hai, toh yahi se error return kar do
            return res.status(400).json({
                success: false,
                message: "Invalid input data",
                errors: validation.error.format(), // Ye exact batayega ki email galat hai ya password
            });
        }
        // Ab hum directly req.body use karne ke bajaye, safe validated data use karenge
        const { email, name, password } = validation.data;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res
                .status(400)
                .json({ success: false, message: "Email is already registered." });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        });
        res
            .status(201)
            .json({ success: true, message: "User registered successfully!" });
    }
    catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
// -----------------------------------------------------
// LOGIN USER CONTROLLER
// -----------------------------------------------------
export const loginUser = async (req, res) => {
    try {
        // 🛡️ Bouncer Check
        const validation = loginSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid input data",
                errors: validation.error.format(),
            });
        }
        const { email, password } = validation.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid email or password." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid email or password." });
        }
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: { id: user.id, name: user.name, email: user.email },
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
//# sourceMappingURL=auth.controller.js.map