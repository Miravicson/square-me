import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  ClientsModule,
  ClientsModuleAsyncOptions,
} from '@nestjs/microservices';
import { ClientKeys, clientModules } from './module-config';

export interface MicroserviceClientModuleRegisterOptions {
  clients: ClientKeys[];
}

@Global()
@Module({
  controllers: [],
  providers: [],
  exports: [],
})
export class MicroserviceClientModule {
  static register({
    clients,
  }: MicroserviceClientModuleRegisterOptions): DynamicModule {
    const clientModuleConfigs: ClientsModuleAsyncOptions = [];
    let providers: Provider[] = [];
    clients.forEach((client) => {
      const clientOptions = clientModules[client];
      clientModuleConfigs.push(clientOptions.moduleConfig);
      providers = providers.concat(clientOptions.providers);
    });

    return {
      module: MicroserviceClientModule,
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ClientsModule.registerAsync(clientModuleConfigs),
      ],
      providers,
      exports: [ClientsModule.registerAsync(clientModuleConfigs), ...providers],
    };
  }
}
