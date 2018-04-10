import { Container } from 'inversify';
import { TYPES } from './inversify.types';
import { IDatabaseService } from '../database/interfaces/database.interface';
import BoardService from '../graphql/boards/board.service';
import { DatabaseService } from '../database/database.service';
import { IBoardService } from '../graphql/boards/board.interface';
import { IPinService } from '../graphql/pins/pin.interface';
import PinService from '../graphql/pins/pin.service';
import { IUserService } from '../graphql/user/user.interface';
import UserService from '../graphql/user/user.service';

const rootContainer = new Container();
rootContainer.bind<IDatabaseService>(TYPES.DatabaseService).to(DatabaseService);
rootContainer.bind<IBoardService>(TYPES.BoardService).to(BoardService);
rootContainer.bind<IPinService>(TYPES.PinService).to(PinService);
rootContainer.bind<IUserService>(TYPES.UserService).to(UserService);

export { rootContainer };
