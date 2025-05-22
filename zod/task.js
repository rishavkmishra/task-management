import * as z from "zod";
export const createTaksSchema = z.object({
    title: z.string().min(2).max(50),
    description: z.string().min(5).max(150),
 
});








export const registerSchema= z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().min(3, { message: 'Password must be at least 3 characters' }),
});




export const loginSchema = z.object({
    name: z.string(),
  password: z.string().min(8),
});


export const updatedSchema= z.object({
  name:z.string(),
  email:z.string().email(),
})

export const taskListReqeuest = z.object({
  limit: z.number().min(1).default(10),
  page: z.number().min(1).default(1),
  search: z.string().default(""),
})








