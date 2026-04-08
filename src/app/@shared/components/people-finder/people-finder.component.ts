import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { from, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PeopleService } from '../../../@shared/services/people.service';

@Component({
  selector: 'app-people-finder',
  templateUrl: './people-finder.component.html',
  styleUrls: ['./people-finder.component.scss']
})
export class PeopleFinderComponent implements OnInit {
  public peopleInput$ = new Subject<string>();
  myGroup: FormGroup;
  myGroup2: FormGroup;
  fullNamme: any;
  users: any[] = [];
  allUsers: any[] = [];
  bufferSize = 50;
  numberOfItemsFromEndBeforeFetchingMore = 10;
  loading = false;
  selectedUserID: string[] = [];
  end: any;

  constructor(private peopleService: PeopleService) {}

  ngOnInit() {
    this.loadUsers();
    this.myGroup = new FormGroup({
      v_dar_objectid_reqfor: new FormControl()
    });
    this.myGroup2 = new FormGroup({
      v_dar_copy_access_profile_of: new FormControl()
    });
  }

  /* ----------  existing helper methods stay unchanged  ---------- */
  openSelect(select: NgSelectComponent) { select.open(); }
  closeSelect(select: NgSelectComponent) { select.close(); }
  selectUsersRange(from: number, to: number) {
    this.users = this.allUsers.slice(from, to);
  }
  selectFirstUser() { /* your logic */ }

  /* ----------  fixed loader  ---------- */
  private loadUsers() {
    // turn the Promise into an Observable, pass required argument
    from(this.peopleService.getUsers(''))   // '' or any default filter
      .pipe(delay(500))                     // now pipe works
      .subscribe(users => {                 // renamed albums → users
        this.allUsers = users;
        this.users = [...this.allUsers];
        this.selectFirstUser();
      });
  }

  /* ----------  infinite-scroll helpers  ---------- */
  onScrollToEnd() { this.fetchMore(); }

  onScroll({ end }: { end: number }) {
    if (this.loading || this.users.length >= this.allUsers.length) { return; }
    if (end + this.numberOfItemsFromEndBeforeFetchingMore >= this.users.length) {
      this.fetchMore();
    }
  }

  private fetchMore() {
    const len = this.users.length;
    const more = this.allUsers.slice(len, len + this.bufferSize);
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.users = [...this.users, ...more];
    }, 200);
  }
}