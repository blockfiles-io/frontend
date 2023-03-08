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
  getUrl() {
    if (!this.file) {
      return "";
    }
    if (this.file.status != 2) {
      return "";
    }
    return "https://blockfiles.io/file/" + this.file.tokenId + "/" + encodeURIComponent(this.file.name);
  }
  getStatus() {
    if (!this.file) {
      return "";
    }
    if (this.file.status == 0) {
      return "Awaiting blockchain";
    }
    if (this.file.status == 1) {
      return "Awaiting storage";
    }
    if (this.file.status == 2) {
      return "File is live!";
    }

    return "";
  }
  getBlockchain() {

    if (!this.file) {
      return "";
    }
    if (this.file.blockchain == "arbGoerli") {
      return "Arbitrum (Goerli)";
    }
    return "";
  }
  getBlockchainLink() {
    if (!this.file) {
      return "";
    }
    if (this.file.blockchain == "arbGoerli") {
      return "https://goerli.arbiscan.io/tx/" + this.file.transactionTx;
    }
    return "";
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.cd.detectChanges();
    this.http.get<any>('/api/uploads/' + this.route.snapshot.params["code"]).subscribe(r => {
      this.file = r;
      this.loading = false;
      console.log("file: ", this.file);
      this.cd.detectChanges();
      if (this.file.status == 0) {
        this.http.get<any>('/api/uploads/validate/' + this.route.snapshot.params["code"]).subscribe(r => {
          this.load();
        });
      }
      else if (this.file.status == 1) {
        this.http.get<any>('/api/uploads/finalize/' + this.route.snapshot.params["code"]).subscribe(r => {
          this.load();
        });
      }
    });
  }
}
