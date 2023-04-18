import { ValidationError } from "yup";

export const formatYupError = (error : ValidationError) => {
    const errors: Array<{field: string; message: string;}> = [];
    error.inner.forEach((e: any) => {
        errors.push({
            field: e.path ? e.path: '',
            message: e.message
        });
    });
    return {errors: errors};
}