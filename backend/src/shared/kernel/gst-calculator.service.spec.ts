import { GstCalculatorService } from './gst-calculator.service';

describe('GstCalculatorService', () => {
  const calc = new GstCalculatorService();

  it('Example A – GST Extra', () => {
    const r = calc.calculate({
      gstType: 'GstExtra',
      workPortionValue: '1000000',
      gstPercent: '18',
    });
    expect(r.gstAmount.toFixed(2)).toBe('180000.00');
    expect(r.totalWorkValue.toFixed(2)).toBe('1180000.00');
  });

  it('Example B – GST Included', () => {
    const r = calc.calculate({
      gstType: 'GstIncluded',
      totalWorkValue: '1180000',
      gstPercent: '18',
    });
    expect(r.gstAmount.toFixed(2)).toBe('180000.00');
    expect(r.workPortionValue.toFixed(2)).toBe('1000000.00');
  });
});
