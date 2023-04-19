import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput";
import * as yup from "yup";
import { formatYupError } from "./formatYupError";

const emailPasswordSchema = yup.object().shape({
    email: yup.string().email(),
    password: yup.string().min(3).max(20)
})

const passwordSchema = yup.object().shape({
    password: yup.string().min(3).max(20)
})

export const validateRegister = async (options: UsernamePasswordInput) => {
    try {
        await emailPasswordSchema.validate({email: options.email, password: options.password}, { abortEarly: false })
      } catch (err) {
        const errors = await formatYupError(err);
        throw errors;
      }
}

export const validateChangePassword = async (password: String) => {
    try {
        await passwordSchema.validate({password}, { abortEarly: false })
      } catch (err) {
        const errors = await formatYupError(err);
        throw errors;
      }
}