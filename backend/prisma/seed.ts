import { MasterType, PrismaClient, RoleCode } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Password@123';

const DEMO_USERS: Array<{
  name: string;
  loginId: string;
  roleCode: RoleCode;
}> = [
  {
    name: 'Administrator',
    loginId: 'Administrator',
    roleCode: RoleCode.Administrator,
  },
  {
    name: 'Data Entry Operator',
    loginId: 'Data Entry Operator',
    roleCode: RoleCode.DataEntryOperator,
  },
  { name: 'Engineer', loginId: 'Engineer', roleCode: RoleCode.Engineer },
  { name: 'Accounts', loginId: 'Accounts', roleCode: RoleCode.Accounts },
  { name: 'Viewer', loginId: 'Viewer', roleCode: RoleCode.Viewer },
];

const MASTER_SEEDS: Array<{ type: MasterType; names: string[] }> = [
  {
    type: MasterType.work_categories,
    names: [
      'Drain',
      'Bridge',
      'RE Wall',
      'Service Road',
      'PQC',
      'Safety Work',
    ],
  },
  {
    type: MasterType.document_types,
    names: [
      'Work Order',
      'Estimate',
      'Drawing',
      'Site Photo',
      'Correspondence',
      'Other',
    ],
  },
  {
    type: MasterType.deduction_heads,
    names: [
      'TDS',
      'GST TDS',
      'Security Deposit',
      'Labour Cess',
      'Royalty',
      'Retention',
    ],
  },
  {
    type: MasterType.expense_categories,
    names: ['Material', 'Labour', 'Machinery', 'Transport', 'Misc'],
  },
  {
    type: MasterType.client_department_formats,
    names: ['PWD', 'NHAI', 'Municipal', 'Private'],
  },
];

async function main() {
  const passwordHash = await argon2.hash(DEMO_PASSWORD, {
    type: argon2.argon2id,
  });

  for (const demo of DEMO_USERS) {
    await prisma.user.upsert({
      where: { loginId: demo.loginId },
      create: {
        name: demo.name,
        loginId: demo.loginId,
        passwordHash,
        roleCode: demo.roleCode,
        isActive: true,
      },
      update: {
        name: demo.name,
        passwordHash,
        roleCode: demo.roleCode,
        isActive: true,
      },
    });
  }

  for (const group of MASTER_SEEDS) {
    let order = 0;
    for (const name of group.names) {
      const existing = await prisma.masterOption.findFirst({
        where: {
          masterType: group.type,
          name: { equals: name, mode: 'insensitive' },
        },
      });
      if (!existing) {
        await prisma.masterOption.create({
          data: {
            masterType: group.type,
            name,
            sortOrder: order,
          },
        });
      }
      order += 1;
    }
  }

  await prisma.appSetting.upsert({
    where: { key: 'maintenance_mode' },
    create: { key: 'maintenance_mode', valueJson: false },
    update: { valueJson: false },
  });

  console.log(
    JSON.stringify({
      msg: 'cwms_seed_complete',
      demoUsers: DEMO_USERS.map((u) => u.loginId),
      masters: MASTER_SEEDS.map((g) => g.type),
    }),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
