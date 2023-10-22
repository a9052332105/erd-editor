import { MEMO_MIN_HEIGHT, MEMO_MIN_WIDTH } from '@/constants/layout';
import { Memo } from '@/internal-types';
import { getDefaultEntityMeta } from '@/utils';

export const createMemo = (value?: Partial<Memo>): Memo => ({
  id: '',
  value: '',
  ui: {
    x: 200,
    y: 100,
    zIndex: 2,
    width: MEMO_MIN_WIDTH,
    height: MEMO_MIN_HEIGHT,
    color: '',
  },
  meta: getDefaultEntityMeta(),
  ...value,
});
