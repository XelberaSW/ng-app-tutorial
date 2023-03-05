import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgAppTutorialStandaloneComponent } from './ng-app-tutorial-standalone.component';

describe('NgAppTutorialStandaloneComponent', () => {
  let component: NgAppTutorialStandaloneComponent;
  let fixture: ComponentFixture<NgAppTutorialStandaloneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NgAppTutorialStandaloneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgAppTutorialStandaloneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
