import { overrideInjectable } from './helper.decorator';
import 'reflect-metadata';

export const Service = () => (target) => {
  overrideInjectable(target);
  return target;
};
