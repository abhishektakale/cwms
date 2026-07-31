export const MASTER_TYPE_API = [
  'work-categories',
  'document-types',
  'deduction-heads',
  'expense-categories',
  'client-department-formats',
] as const;

export type MasterTypeApi = (typeof MASTER_TYPE_API)[number];

export function toPrismaMasterType(api: string): MasterTypeApi {
  if (!(MASTER_TYPE_API as readonly string[]).includes(api)) {
    throw new Error(`Invalid master type: ${api}`);
  }
  return api as MasterTypeApi;
}

/** Map OpenAPI path segment to Prisma enum member name */
export function masterTypeToEnum(
  api: MasterTypeApi,
):
  | 'work_categories'
  | 'document_types'
  | 'deduction_heads'
  | 'expense_categories'
  | 'client_department_formats' {
  const map = {
    'work-categories': 'work_categories',
    'document-types': 'document_types',
    'deduction-heads': 'deduction_heads',
    'expense-categories': 'expense_categories',
    'client-department-formats': 'client_department_formats',
  } as const;
  return map[api];
}

export function masterTypeToApi(
  prisma:
    | 'work_categories'
    | 'document_types'
    | 'deduction_heads'
    | 'expense_categories'
    | 'client_department_formats',
): MasterTypeApi {
  const map = {
    work_categories: 'work-categories',
    document_types: 'document-types',
    deduction_heads: 'deduction-heads',
    expense_categories: 'expense-categories',
    client_department_formats: 'client-department-formats',
  } as const;
  return map[prisma];
}
