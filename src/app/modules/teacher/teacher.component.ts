import { Component } from '@angular/core';

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.css']
})
export class TeacherComponent {
  toggle:boolean=false;

  toggleview(event:any){
    this.toggle=event;

  }
}
