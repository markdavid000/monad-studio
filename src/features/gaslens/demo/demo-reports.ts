import { z } from "zod";
import { gasReportSchema } from "../lib/schema";
import recorded from "./recorded-reports.json";

export const demoReports = z.record(z.string(), gasReportSchema).parse(recorded);
