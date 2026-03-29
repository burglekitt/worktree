"use server";

import {
  createServerValidate,
  formOptions,
  ServerValidateError,
} from "@tanstack/react-form-nextjs";

const base = formOptions({
  defaultValues: { message: "" },
});

const serverValidate = createServerValidate({
  ...base,
  onServerValidate: ({ value }) => {
    if (!value.message || String(value.message).trim().length === 0) {
      return "Message is required";
    }
  },
});

export default async function chatAction(prev: unknown, formData: FormData) {
  try {
    const validated = await serverValidate(formData);
    // validated contains typed values; you can perform server-side
    // logging/persistence here if desired. For chat, we only validate.
    return;
  } catch (e) {
    if (e instanceof ServerValidateError) {
      return e.formState;
    }
    throw e;
  }
}
