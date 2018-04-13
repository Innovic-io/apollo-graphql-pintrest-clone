import { overrideInjectable } from './helper.decorator';

export const Service = () => (target) => {
  overrideInjectable(target);
  return target;
};
