import { Test, TestingModule } from '@nestjs/testing';
import { Demo } from './demo';

describe('Demo', () => {
  let provider: Demo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Demo],
    }).compile();

    provider = module.get<Demo>(Demo);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
