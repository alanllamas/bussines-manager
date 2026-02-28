// LEGACY TYPES — carried over from a previous project.
// These types (Formality, Campus, TaxRegime, CreditCard, CustomerBillingInfo, etc.)
// are NOT used by the current business manager domain (tickets, invoices, clients, purchases).
// They remain here to avoid breaking any imports that may reference them.
// Do not add new types to this file — use src/types/index.ts for domain types (ADR-003).

export type Formality = {
  formalityNumber: string;
  name: string;
  description: string;
  cost: string;
  status: string;
  acronym: string;
};

export type Campus = {
  id: string;
  name: string;
};

export type LeaveType = {
  name: string;
  id: string;
};

export type VoluntaryResignation = {
  name: string;
  id: number;
};

export type PayloadFile = {
  fileName: string;
  fileBody: string;
  fileType: string;
};

export type TaxRegime = {
  regime: string;
  description: string;
  cfdiUsage: string;
  personTypeId: number;
  cfdiText: string;
};

export type CreditCard = {
  address_city: string;
  address_country: string;
  address_line1: string;
  address_line1_check: boolean;
  address_line2: string;
  address_state: string;
  address_zip: string;
  address_zip_check: boolean;
  brand: string;
  country: string;
  customer: string;
  cvc_check: string;
  dynamic_last4: string;
  exp_month: number;
  exp_year: number;
  fingerprint: string;
  funding: string;
  id: string;
  last4: string;
  metadata: {
    [key: string]: unknown;
  };
  name: string;
  object: string;
  tokenization_method: string;
  wallet: string;
};

export type CreateCreditCardTokenBody = {
  address_city: string;
  address_country: string;
  address_line1: string;
  address_line2: string;
  address_state: string;
  address_zip: string;
  cvc: string;
  exp_month: number;
  exp_year: number;
  name: string;
  number: string;
};

export type PaymentTransaction = {
  description: string;
  pay: boolean;
  transNumber: number;
  paymentDate: string;
  referenceSequence: null | string;
  total: string;
};

export type Surcharge = {
  concept: string;
  expirationDate: string;
  period: string;
  total: string;
  transaction: number;
};

export type Concept = {
  concept: string;
  credit: string;
  discount: string;
  expirationDate: string;
  period: string;
  status: number;
  subTotal: string;
  total: string;
  transaction: number;
  paymentDate: string;
  paymentTransactions: Array<PaymentTransaction>;
  surcharges?: Array<Surcharge>;
};

export type CustomerBillingInfo = {
  id: number;
  fullName: string;
  businessName: string;
  rfc: string;
  curp: string;
  email: string;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  cfdiUsage: string;
  personType: number;
  regime: string;
  default: boolean;
  isDefault: boolean;
  flagRegime: boolean;
};

export type SearchCustomerEmailInfo = {
  address: {
    city: string;
    country: string;
    line1: string;
    line2: string;
    postal_code: string;
    state: string;
  };
  balance: number;
  created: number;
  currency: boolean;
  default_source: string;
  delinquent: boolean;
  description: string;
  discount: Record<string, unknown>;
  email: string;
  id: string;
  invoice_prefix: string;
  invoice_settings: {
    custom_fields: Record<string, unknown>;
    default_payment_method: string;
    footer: string;
    rendering_options: string[];
  };
  livemode: boolean;
  metadata: Record<string, unknown>;
  name: string;
  next_invoice_sequence: number;
  object: string;
  phone: string;
  preferred_locales: [string];
  shipping: {
    address: {
      city: string;
      country: string;
      line1: string;
      line2: string;
      postal_code: string;
      state: string;
    };
    name: string;
    phone: string;
  };
  tax_exempt: string;
  test_clock: number;
};

export type NewsItem = {
  title: string;
  subtitle: string;
  image: string;
  link: string;
};

export type Summary = {
  accountStatusFile: string;
  address: string;
  courtDate: string;
  currentPeriod: string;
  discounts: string;
  endDayPeriod: string;
  startDayPeriod: string;
  totalAmountPayable: string;
  totalCharges: string;
  totalPayments: string;
  universityName: string;
};
