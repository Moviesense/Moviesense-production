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
      .optional()
      .refine((val) => !val || /^\d{6,15}$/.test(val), {
        message:
          "Phone number must be 6–15 digits with no spaces or special characters",
      }),
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
