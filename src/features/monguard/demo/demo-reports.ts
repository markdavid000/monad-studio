import { z } from "zod";
import { scanReportSchema } from "../lib/schema";
import recorded from "./recorded-reports.json";

export const demoReports = z.record(z.string(), scanReportSchema).parse(recorded);
