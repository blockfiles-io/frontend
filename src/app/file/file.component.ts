import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss']
})
export class FileComponent implements OnInit {
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
    this.http.get<any>('http://localhost:8080/v1/files/' + this.route.snapshot.params["code"]).subscribe(r => {
      this.file = r;
      this.cd.detectChanges();
    });
  }
}
