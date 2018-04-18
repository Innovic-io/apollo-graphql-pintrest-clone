import { Container } from 'inversify';
import { RESOLVER_TYPES, SERVICE_TYPES } from './inversify.types';
import { IDatabaseService } from '../database/interfaces/database.interface';
import BoardService from '../graphql/boards/board.service';
import { DatabaseService } from '../database/database.service';
import { IBoardService } from '../graphql/boards/board.interface';
import { IPinService } from '../graphql/pins/pin.interface';
import PinService from '../graphql/pins/pin.service';
import { IUserService } from '../graphql/user/user.interface';
import UserService from '../graphql/user/user.service';
import UserResolver from '../graphql/user/user.resolver';
import PinResolver from '../graphql/pins/pin.resolver';
import BoardResolver from '../graphql/boards/board.resolver';
import ScalarsResolver from '../graphql/scalars/scalars.resolver';
import { IResolver } from '../common/common.constants';

const rootContainer = new Container();
rootContainer
  .bind<IDatabaseService>(SERVICE_TYPES.DatabaseService)
  .to(DatabaseService);
rootContainer.bind<IBoardService>(SERVICE_TYPES.BoardService).to(BoardService);
rootContainer.bind<IPinService>(SERVICE_TYPES.PinService).to(PinService);
rootContainer.bind<IUserService>(SERVICE_TYPES.UserService).to(UserService);

rootContainer.bind<IResolver>(RESOLVER_TYPES.UserResolver).to(UserResolver);
rootContainer.bind<IResolver>(RESOLVER_TYPES.PinResolver).to(PinResolver);
rootContainer.bind<IResolver>(RESOLVER_TYPES.BoardResolver).to(BoardResolver);
rootContainer
  .bind<IResolver>(RESOLVER_TYPES.ScalarResolver)
  .to(ScalarsResolver);

export { rootContainer };
