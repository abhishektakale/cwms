import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class IdSequenceService {
  constructor(private readonly prisma: PrismaService) {}

  async nextCode(
    prefix: 'CWMS' | 'BILL' | 'DOC' | 'EXP',
    year = new Date().getFullYear(),
  ): Promise<string> {
    const key =
      prefix === 'CWMS'
        ? `work_code_${year}`
        : prefix === 'BILL'
          ? `bill_no_${year}`
          : prefix === 'DOC'
            ? `doc_no_${year}`
            : `exp_no_${year}`;
    const rows = await this.prisma.$queryRaw<{ next_value: number }[]>`
      INSERT INTO id_sequences (id, next_value)
      VALUES (${key}, 1)
      ON CONFLICT (id) DO UPDATE
      SET next_value = id_sequences.next_value + 1
      RETURNING next_value
    `;
    const n = rows[0]?.next_value ?? 1;
    return `${prefix}-${year}-${String(n).padStart(4, '0')}`;
  }
}
