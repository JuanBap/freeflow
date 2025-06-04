import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GridComponent } from './grid/grid.component';
import { AlgorithmStatsComponent } from './algorithm-stats/algorithm-stats.component';

const routes: Routes = [
  { path: '', component: GridComponent },
  { path: 'stats', component: AlgorithmStatsComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
