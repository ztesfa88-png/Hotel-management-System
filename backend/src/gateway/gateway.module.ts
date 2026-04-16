import { Module } from '@nestjs/common';
import { HmsGateway } from './hms.gateway';

@Module({
  providers: [HmsGateway],
  exports: [HmsGateway],
})
export class GatewayModule {}
