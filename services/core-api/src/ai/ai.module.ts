import { Module } from '@nestjs/common';
import { AI_SERVICE } from './ai.interface';
import { GeminiAIService } from './gemini-ai.service';

@Module({
  providers: [
    {
      provide: AI_SERVICE,
      useClass: GeminiAIService,
    },
  ],
  exports: [AI_SERVICE],
})
export class AIModule {}
