import DateType from './date.scalar';
import ImageScalarType from './image.scalar';
import { injectable } from 'inversify';
import { IScalarsResolver } from './scalars.interface';

@injectable()
export default class ScalarsResolver implements IScalarsResolver {
  private readonly Date;
  private readonly ImageScalar;

  constructor() {
    this.Date = DateType;
    this.ImageScalar = ImageScalarType
  }

  getAll() {
    return {
      Date: this.Date,
      ImageScalar: this.ImageScalar,
    }
  }
}
