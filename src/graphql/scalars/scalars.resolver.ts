import DateType from './date.scalar';
import ImageScalarType from './image.scalar';
import { IResolver } from '../../common/common.constants';
import { Scalar, ScalarItem } from '../../decorators/resolver.decorator';

@Scalar()
export default class ScalarsResolver implements IResolver {
  @ScalarItem(DateType) Date;
  @ScalarItem(ImageScalarType) ImageScalar;

  getAll() {}
}
