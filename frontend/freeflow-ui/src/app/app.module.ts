import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GridComponent } from './grid/grid.component';
import { AlgorithmStatsComponent } from './algorithm-stats/algorithm-stats.component';
import { HelpOverlayComponent } from './help-overlay/help-overlay.component';

@NgModule({
  declarations: [
    AppComponent,
    GridComponent,
    AlgorithmStatsComponent,
    HelpOverlayComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
