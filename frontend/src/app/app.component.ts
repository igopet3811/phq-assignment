import { Component, OnInit } from '@angular/core';

import { ApiService } from './services/api.service';
import { LoaderService } from './services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  public data: any;
  public showLoader: boolean;

  constructor(
    private apiService: ApiService,
    private loaderService: LoaderService,
  ) { }

  ngOnInit() {
    this.showLoader = true;
    this.apiService.getTreeData().subscribe(
      success => {
        this.data = success;
        this.showLoader = false;
      },
      err => {
        console.log(err);
        this.showLoader = false;
      }
    )

    this.loaderService.status.subscribe((value: boolean) => {
      this.showLoader = value;
    })
  }
}
