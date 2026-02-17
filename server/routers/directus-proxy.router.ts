import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc.js";

const DIRECTUS_URL = "http://47.99.205.136:8055";

/**
 * Directus Proxy Router
 * 代理前端请求到 Directus API，避免 CORS 和 HTTPS 混合内容问题
 */
export const directusProxyRouter = router({
  /**
   * 获取 Webinars 列表
   */
  getWebinars: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(100),
        offset: z.number().optional().default(0),
        status: z.string().optional(),
        fields: z.string().optional(),
        sort: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const params = new URLSearchParams();
      params.append("limit", input.limit.toString());
      if (input.offset) params.append("offset", input.offset.toString());
      if (input.status) params.append("filter[status][_eq]", input.status);
      if (input.fields) params.append("fields", input.fields);
      if (input.sort) params.append("sort", input.sort);

      const url = `${DIRECTUS_URL}/items/webinars?${params.toString()}`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Directus API error: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error: any) {
        console.error("Directus proxy error:", error);
        throw new Error(`Failed to fetch webinars: ${error.message}`);
      }
    }),

  /**
   * 获取单个 Webinar 详情
   */
  getWebinarById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const url = `${DIRECTUS_URL}/items/webinars/${input.id}`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Directus API error: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error: any) {
        console.error("Directus proxy error:", error);
        throw new Error(`Failed to fetch webinar: ${error.message}`);
      }
    }),

  /**
   * 获取 Factories 列表
   */
  getFactories: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(100),
        offset: z.number().optional().default(0),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const params = new URLSearchParams();
      params.append("limit", input.limit.toString());
      if (input.offset) params.append("offset", input.offset.toString());
      if (input.search) params.append("search", input.search);

      const url = `${DIRECTUS_URL}/items/factories?${params.toString()}`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Directus API error: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error: any) {
        console.error("Directus proxy error:", error);
        throw new Error(`Failed to fetch factories: ${error.message}`);
      }
    }),

  /**
   * 获取单个 Factory 详情
   */
  getFactoryById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const url = `${DIRECTUS_URL}/items/factories/${input.id}`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Directus API error: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error: any) {
        console.error("Directus proxy error:", error);
        throw new Error(`Failed to fetch factory: ${error.message}`);
      }
    }),
});
