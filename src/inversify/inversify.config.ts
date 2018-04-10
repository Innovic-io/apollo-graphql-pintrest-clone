import { Container } from 'inversify';
import { RESOLVER_TYPES, SERVICE_TYPES } from './inversify.types';
import { IDatabaseService } from '../database/interfaces/database.interface';
import BoardService from '../graphql/boards/board.service';
import { DatabaseService } from '../database/database.service';
import { IBoardResolver, IBoardService } from '../graphql/boards/board.interface';
import { IPinResolver, IPinService } from '../graphql/pins/pin.interface';
import PinService from '../graphql/pins/pin.service';
import { IUserResolver, IUserService } from '../graphql/user/user.interface';
import UserService from '../graphql/user/user.service';
import UserResolver from '../graphql/user/user.resolver';
import PinResolver from '../graphql/pins/pin.resolver';
import BoardResolver from '../graphql/boards/board.resolver';
import ScalarsResolver from '../graphql/scalars/scalars.resolver';
import { IScalarsResolver } from '../graphql/scalars/scalars.interface';

const rootContainer = new Container();
rootContainer.bind<IDatabaseService>(SERVICE_TYPES.DatabaseService).to(DatabaseService);
rootContainer.bind<IBoardService>(SERVICE_TYPES.BoardService).to(BoardService);
rootContainer.bind<IPinService>(SERVICE_TYPES.PinService).to(PinService);
rootContainer.bind<IUserService>(SERVICE_TYPES.UserService).to(UserService);

rootContainer.bind<IUserResolver>(RESOLVER_TYPES.UserResolver).to(UserResolver);
rootContainer.bind<IPinResolver>(RESOLVER_TYPES.PinResolver).to(PinResolver);
rootContainer.bind<IBoardResolver>(RESOLVER_TYPES.BoardResolver).to(BoardResolver);
rootContainer.bind<IScalarsResolver>(RESOLVER_TYPES.ScalarResolver).to(ScalarsResolver);

export { rootContainer };
