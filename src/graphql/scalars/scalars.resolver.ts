import { injectable } from 'inversify';

import DateType from './date.scalar';
import ImageScalarType from './image.scalar';
import { IResolver } from '../../common/common.constants';

@injectable()
export default class ScalarsResolver implements IResolver {
  private readonly Date;
  private readonly ImageScalar;

  constructor() {
    this.Date = DateType;
    this.ImageScalar = ImageScalarType;
  }

  getAll() {
    return {
      Date: this.Date,
      ImageScalar: this.ImageScalar,
    };
  }
}
