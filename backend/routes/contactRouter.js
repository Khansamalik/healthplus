import express from "express";
import { sendEmail } from "../Controllers/contactController.js";

const contactRoutes = express.Router();

contactRoutes.post("/send-email", sendEmail);

export default contactRoutes;
