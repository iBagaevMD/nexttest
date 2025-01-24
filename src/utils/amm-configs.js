import { devAmmConfig500_10, devAmmConfig2500, devAmmConfig10000 } from 'utils/amm-configs-dev';
import {
  prodAmmConfig100,
  prodAmmConfig500_1,
  prodAmmConfig500_10,
  prodAmmConfig2500,
  prodAmmConfig10000
} from 'utils/amm-configs-prod';
import { IS_DEV } from 'config';

// 0.01% with 1-spacing
const ammConfig100 = IS_DEV ? null : prodAmmConfig100;
// 0.05% with 1-spacing
const ammConfig500_1 = IS_DEV ? null : prodAmmConfig500_1;
// 0.05% with 10-spacing
const ammConfig500_10 = IS_DEV ? devAmmConfig500_10 : prodAmmConfig500_10;
// 0.25% with 60-spacing
const ammConfig2500 = IS_DEV ? devAmmConfig2500 : prodAmmConfig2500;
// 1% with 120-spacing
const ammConfig10000 = IS_DEV ? devAmmConfig10000 : prodAmmConfig10000;

export { ammConfig100, ammConfig500_1, ammConfig500_10, ammConfig2500, ammConfig10000 };
