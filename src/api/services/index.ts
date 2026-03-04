// Barrel export for all service functions.
// Services contain pure business logic extracted from SWR hooks (ADR-005).
// Currently only invoiceService is exposed here; add future services alongside.
export { generateResume } from './invoiceService'
export type { Resume, Totals, ResumeData } from './invoiceService'
