import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './home/header/header.component';
import { GraphicsComponent } from './methods/graphics/graphics.component';
import { SimplexTwoFasesComponent } from './methods/simplex-two-fases/simplex-two-fases.component';
import { OptionsComponent } from './methods/options/options.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//material
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatRadioModule } from "@angular/material/radio";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatTabsModule } from "@angular/material/tabs";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBarModule } from "@angular/material/snack-bar";

//services
import { UtilsService } from "./services/utils.service";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    GraphicsComponent,
    SimplexTwoFasesComponent,
    OptionsComponent,
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatRadioModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  providers: [ UtilsService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
