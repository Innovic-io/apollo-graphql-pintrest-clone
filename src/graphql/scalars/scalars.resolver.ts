import DateType from './date.scalar';
import ImageScalarType from './image.scalar';

const scalarResolverFunctions = {
  Date: DateType,
  ImageScalar: ImageScalarType,
};

export default scalarResolverFunctions;
