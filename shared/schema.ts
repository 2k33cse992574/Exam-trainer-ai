import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/chat";

// We can add more tables here if needed, but for now the chat model is sufficient.
