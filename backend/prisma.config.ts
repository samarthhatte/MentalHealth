import path from "node:path";
import type { PrismaConfig } from "prisma";

export default {
  earlyAccess: true,
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  migrate: {
    async url() {
      const { parse } = await import("dotenv");
      const { default: fs } = await import("fs");
      const envConfig = parse(fs.readFileSync(path.join(__dirname, ".env")));
      return envConfig.DATABASE_URL;
    },
  },
} satisfies PrismaConfig;