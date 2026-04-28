import api from "@/lib/axios";
import { SupportLinksResponse } from "@/types/support";

export const supportService = {
  getSupportLinks: async (): Promise<SupportLinksResponse> => {
    const res = await api.get<SupportLinksResponse>("/support/links");
    return res.data;
  },
};
