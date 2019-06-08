import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  public trackings = [];

//https://maps.googleapis.com/maps/api/staticmap?center=40.714728,-73.998672&zoom=12&size=400x400&maptype=roadmap&key=AIzaSyAhzj5WPVa25tc_GRVW0gcYezutZFR2xYk

  constructor(private storage: Storage) {}

  ionViewDidLoad()  {
    this.loadTrackings();
  }

  ionViewDidEnter()  {
    this.loadTrackings();
  }

  /**
   * Lee todos los trackings almacenados en la base de datos
   * @return [description]
   */
  loadTrackings() {
    this.storage.get('trackings').then((trackings) => {
      this.trackings = trackings || [];
    });
    console.log(this.trackings);
  }
}
