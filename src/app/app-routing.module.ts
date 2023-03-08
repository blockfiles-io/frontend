import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { FileComponent } from './file/file.component';
import { HomeComponent } from './home/home.component';
import { UploadComponent } from './upload/upload.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'file/:shortIndex/:id/:slug', component: FileComponent},
  { path: 'uploads/:shortIndex/:code', component: UploadComponent}
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
