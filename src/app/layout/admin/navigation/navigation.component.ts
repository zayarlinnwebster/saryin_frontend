import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NavigationItem } from 'src/app/models/navigation-item';
import { AuthService } from 'src/app/services/auth/auth.service';
import { NavigationService } from 'src/app/services/navigation/navigation.service';
import { ProfileComponent } from 'src/app/user/profile/profile.component';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
})
export class NavigationComponent {
  public navigations: NavigationItem[];

  constructor(
    public nav: NavigationService,
    private modalService: NgbModal,
    public authService: AuthService,
  ) {
    this.navigations = this.nav.getNavigationItems();
  }

  openProfile() {
    this.modalService.open(ProfileComponent, {
      backdrop: 'static',
      animation: true,
    })
  }
}
