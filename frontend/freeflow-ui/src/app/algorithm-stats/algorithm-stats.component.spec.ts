import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgorithmStatsComponent } from './algorithm-stats.component';

describe('AlgorithmStatsComponent', () => {
  let component: AlgorithmStatsComponent;
  let fixture: ComponentFixture<AlgorithmStatsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AlgorithmStatsComponent]
    });
    fixture = TestBed.createComponent(AlgorithmStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
