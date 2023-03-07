import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  public file: any;
  public loading = true;

  constructor(
    private http: HttpClient, 
    private cd: ChangeDetectorRef, 
    private route: ActivatedRoute
    ) {

  }

  ngOnInit() {
    this.loading = true;
    this.cd.detectChanges();
    this.http.get<any>('http://localhost:8080/v1/uploads/' + this.route.snapshot.params["code"]).subscribe(r => {
      this.file = r;
      this.cd.detectChanges();
    });
  }
}
