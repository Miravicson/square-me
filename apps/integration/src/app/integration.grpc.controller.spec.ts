import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationGrpcController } from './integration.grpc.controller';
import { IntegrationService } from './integration.service';

describe('IntegrationGrpcController', () => {
  let controller: IntegrationGrpcController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntegrationGrpcController],
      providers: [{ provide: IntegrationService, useValue: {} }],
    }).compile();

    controller = module.get<IntegrationGrpcController>(
      IntegrationGrpcController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
