import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
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
  constructor(private router: Router) {
    
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
