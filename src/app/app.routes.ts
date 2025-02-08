import { Routes } from '@angular/router';
import { MenuComponent } from './components/menu/menu.component';
import { GameComponent } from './components/game/game.scene';
import { SelectComponent } from './components/menu/select.component';

export const routes: Routes = [
  { path: '', component: MenuComponent },
  { path: 'select', component: SelectComponent },
  { path: 'game', component: GameComponent },
  { path: '**', redirectTo: '' }
];