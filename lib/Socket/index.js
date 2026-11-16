import { DEFAULT_CONNECTION_CONFIG } from '../Defaults/index.js';
import { makeCommunitiesSocket } from './communities.js';
import { makeUsernameSocket } from './username.js';
import { makeGraphQLSocket } from './graphql.js';
import { makeRegistrationSocket } from './registration.js';
import { makeManagedAccountSocket } from './managed-account.js';
import { makeInteropSocket } from './interop.js';
import { makeAIGroupsSocket } from './aigroups.js';
// export the last socket layer
const makeWASocket = (config) => {
    const newConfig = {
        ...DEFAULT_CONNECTION_CONFIG,
        ...config
    };
    const sock = makeAIGroupsSocket(makeCommunitiesSocket(newConfig));
    const usernameSocket = makeUsernameSocket(sock);
    const interopSocket = makeInteropSocket(usernameSocket);
    const registrationSocket = makeRegistrationSocket(interopSocket);
    const managedAccountSocket = makeManagedAccountSocket(registrationSocket);
    return makeGraphQLSocket(managedAccountSocket, config);
};
export default makeWASocket;
//# sourceMappingURL=index.js.map