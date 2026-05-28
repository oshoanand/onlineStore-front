"use client";

import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/services/http/api-client";

export interface CreateSupportTicketRequest {
  mobile: string;
  supportType: string;
  description: string;
  attachment?: File | null;
}

const createSupportTicket = async ({
  mobile,
  supportType,
  description,
  attachment,
}: CreateSupportTicketRequest) => {
  const formData = new FormData();
  formData.append("mobile", mobile);
  formData.append("supportType", supportType);
  formData.append("description", description);

  // Match the key exactly to `upload.single("attachment")` from the backend
  if (attachment) {
    formData.append("attachment", attachment);
  }

  return apiRequest({
    url: "/users/support/create/ticket", // Assuming apiRequest adds the base /api
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const useCreateSupportTicket = () => {
  return useMutation({
    mutationFn: createSupportTicket,
  });
};
