import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgAppTutorialComponent } from './ng-app-tutorial.component';

describe('NgAppTutorialComponent', () => {
  let component: NgAppTutorialComponent;
  let fixture: ComponentFixture<NgAppTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgAppTutorialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgAppTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
