import { BadRequestException, Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

export type GstTypeCode = 'GstExtra' | 'GstIncluded';

export type GstCalcInput = {
  gstType: GstTypeCode;
  workPortionValue?: string | number | null;
  gstPercent?: string | number | null;
  totalWorkValue?: string | number | null;
};

export type GstCalcResult = {
  workPortionValue: Decimal;
  gstPercent: Decimal;
  gstAmount: Decimal;
  totalWorkValue: Decimal;
};

/** BR-FIN-04 / BR-FIN-05 / BR-FIN-06A — half-up to 2 dp */
@Injectable()
export class GstCalculatorService {
  calculate(input: GstCalcInput): GstCalcResult {
    const gstPercent = this.toDecimal(input.gstPercent ?? 0);
    if (gstPercent.lt(0) || gstPercent.gt(100)) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'GST_PERCENT_RANGE',
        detail: 'GST % must be between 0 and 100',
      });
    }

    if (input.gstType === 'GstExtra') {
      const portion = this.toDecimal(input.workPortionValue ?? 0);
      if (portion.lt(0)) {
        throw new BadRequestException({
          title: 'Bad Request',
          status: 400,
          code: 'NEGATIVE_VALUE',
          detail: 'Work Portion Value cannot be negative',
        });
      }
      const gstAmount = this.roundMoney(portion.mul(gstPercent).div(100));
      const total = this.roundMoney(portion.add(gstAmount));
      return {
        workPortionValue: this.roundMoney(portion),
        gstPercent,
        gstAmount,
        totalWorkValue: total,
      };
    }

    // GstIncluded — BR-FIN-05
    const total = this.toDecimal(input.totalWorkValue ?? 0);
    if (total.lt(0)) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'NEGATIVE_VALUE',
        detail: 'Total Work Value cannot be negative',
      });
    }
    if (gstPercent.eq(0)) {
      return {
        workPortionValue: this.roundMoney(total),
        gstPercent,
        gstAmount: new Decimal(0),
        totalWorkValue: this.roundMoney(total),
      };
    }
    const gstAmount = this.roundMoney(
      total.mul(gstPercent).div(gstPercent.add(100)),
    );
    const portion = this.roundMoney(total.sub(gstAmount));
    return {
      workPortionValue: portion,
      gstPercent,
      gstAmount,
      totalWorkValue: this.roundMoney(total),
    };
  }

  private toDecimal(value: string | number | Decimal): Decimal {
    return new Decimal(value);
  }

  /** Round half up to 2 decimal places */
  private roundMoney(value: Decimal): Decimal {
    return value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }
}
