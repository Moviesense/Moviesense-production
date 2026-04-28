import * as z from "zod";

export const createPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    phoneCode: z
      .string()
      .min(1, "Country code is required")
      .regex(/^\+?\d{1,5}$/, "Invalid country code"),
    phoneNumber: z
      .string()
      .min(6, "Phone number is too short")
      .max(15, "Phone number is too long")
      .regex(/^\d+$/, "Phone number must contain digits only"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CreatePasswordFormValues = z.infer<typeof createPasswordSchema>;

export const couponSchema = z.object({
  code: z
    .string()
    .min(2, "Coupon code is too short")
    .max(40, "Coupon code is too long"),
});

export type CouponFormValues = z.infer<typeof couponSchema>;
