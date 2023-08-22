import { UserProvider } from 'src/common/enums/user-provider.enum';

export type Payload = {
  id: number;
  provider: UserProvider;
};

