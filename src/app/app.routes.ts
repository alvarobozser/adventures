import { Routes } from '@angular/router';
import { MenuComponent } from './components/menu.component';
import { SelectComponent } from './components/select.component';
import { GameComponent } from './components/game.component';

export const routes: Routes = [
  { path: '', component: MenuComponent },
  { path: 'select', component: SelectComponent },
  { path: 'game', component: GameComponent },
  { path: '**', redirectTo: '' }
];