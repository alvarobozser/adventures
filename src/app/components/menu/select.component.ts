import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent,IonButton, IonIcon} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { arrowBack, play, settings, trophy } from 'ionicons/icons';
import { NavController } from '@ionic/angular';


@Component({
  selector: 'app-select',
  standalone: true,
  imports: [IonContent,IonButton, IonIcon,CommonModule],
  styles: [`
    .game-menu {
    width: 100vw;
    height: 100vh;
    background: url('/assets/backmenu.webp') no-repeat center/cover;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: clamp(15px, 3vh, 30px);
    overflow: hidden;
    padding: clamp(10px, 2vw, 20px);
    box-sizing: border-box;
    }

@keyframes jumpInfinite {
 0%, 100% { transform: translateY(0); }
 50% { transform: translateY(-15px); }
}
.menu-button {
  width: clamp(200px, 30vw, 280px);
  height: clamp(50px, 8vh, 70px);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 12px;
  position: relative;
  overflow: hidden;
  transition: all 0.2s;
}

.menu-button::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  height: 50%;
  background: linear-gradient(rgba(255,255,255,0.2), transparent);
  border-radius: 8px 8px 0 0;
}

.menu-button ion-icon {
  font-size: clamp(20px, 3vw, 24px);
  margin-right: 10px;
  filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.3));
}

@media (orientation: landscape) and (max-height: 500px) {
 .menu-title {
   font-size: clamp(1.5rem, 4vh, 3rem);
 }
 
 .menu-button {
   height: clamp(40px, 12vh, 60px);
 }

}

.select{
    border: 5px solid black;
    border-radius: 20px;
}

.back-button {
  position: absolute;
  left: 10px; /* Puedes ajustar este valor */
  top: 10px;  /* Puedes ajustar este valor */
  z-index: 10; /* Para asegurarte de que esté sobre otros elementos */
}
  `],
  template: `
    <ion-content>
      <div class="game-menu">
        <ion-button (click)="goBack()" class="back-button">
        <ion-icon name="play" style="transform: scaleX(-1);"></ion-icon>
        </ion-button>
        <img src="/assets/ttile.webp" alt="" height="250px" width="250px">
        <img src="/assets/danteSelect.png" alt="" height="100px" width="100px" (click)="startGame()" class="select">
      </div>
    </ion-content>
  `
})
export class SelectComponent {
  constructor(private router: Router,private navCtrl: NavController) {
    addIcons({ play });
  }

  startGame() {
    this.router.navigate(['/game']);
  }

  goBack(){
    this.navCtrl.back();
  }

}