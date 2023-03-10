import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { CommunicationService } from './communication.service';
declare const gtag: Function;
declare const logBadgeClick: Function;
declare const window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  public testnets = false;
  constructor(private router: Router, private com: CommunicationService) {
    this.testnets = this.com.testnetsEnabled();
  }
  enableTestnets() {
    this.com.enableTestnets();
  }
  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      let e: any = event;
      gtag('event', 'page_view', {
        page_path: e.urlAfterRedirects
      })
    })
  }
  ngAfterViewInit() {
    
  }
  click() {
      window.logBadgeClick();
  }
  title = 'blockfiles';

  
}
