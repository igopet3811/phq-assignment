import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from'@angular/material/icon';
import { MatTabsModule } from'@angular/material/tabs';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatFormFieldModule }from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TreeComponent } from './components/tree/tree.component';
import { WindowRef } from './services/window.service';
import { LoaderService } from './services/loader.service';

@NgModule({
  declarations: [
    AppComponent,
    TreeComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatTabsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [
    WindowRef,
    LoaderService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
