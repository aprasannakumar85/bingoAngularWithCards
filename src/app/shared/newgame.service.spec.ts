import { TestBed } from '@angular/core/testing';

import { NewgameService } from './newgame.service';

describe('NewgameService', () => {
  let service: NewgameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewgameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
