import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { classroom } from 'src/app/data/classroom';
import { teacher } from 'src/app/data/teacher';
import { ClassroomService } from 'src/app/services/classroom.service';
import { HostmanagerService } from 'src/app/services/hostmanager.service';
import { SchaduleSessionService } from 'src/app/services/schadule.session.service';
import { TeacherService } from 'src/app/services/teacher.service';

@Component({
  selector: 'app-schaduleform',
  templateUrl: './schaduleform.component.html',
  styleUrls: ['./schaduleform.component.css','../../../../../styles/form.style.css']
})
export class SchaduleformComponent implements OnInit {
  @Input()data:any='';
  classrooms:classroom[]=[];
  teachers:teacher[]=[];
  schaduleitem:any;
  subject:string='';
  hostSubscriber:any
  schedule:FormGroup=new FormGroup({
    day:new FormControl('',[Validators.required]) ,
    classId:new FormControl('',[Validators.required]) ,
    sessionNo:new FormControl('',[Validators.required,Validators.pattern("[1-6]")]) ,
    teacherID:new FormControl('',[Validators.required]) 
  })
  constructor(private schaduleservice:SchaduleSessionService,private classroomservice:ClassroomService,private teacherservice:TeacherService,private hostman:HostmanagerService){}
  ngOnInit(): void {
    if(this.data){
      this.schedule.patchValue({
        day:this.data.session.scheduleDay,
        classId:this.data.classid+'',
        sessionNo:this.data.session.sessionNo,
        teacherID:this.data.session.teacherID
      });
    }
    let teacherSubscriber=this.teacherservice.getall().subscribe({
      next:res=>{
        this.teachers=res;
        if(this.data){
          this.setsubjectAndclass();
          this.subject=this.data.session.subjectName; 
        }
        teacherSubscriber.unsubscribe()
      }
    });
  }
  get daycontrol(){
    return this.schedule.controls['day']
  }
  get classcontrol(){
    return this.schedule.controls['classId']
  }
  get sessionNocontrol(){
    return this.schedule.controls['sessionNo']
  }
  get teachercontrol(){
    return this.schedule.controls['teacherID']
  }
  setsubjectAndclass(){
    let teacher=this.teachers.find(p=>p.id==this.teachercontrol.value);
    this.subject=teacher?.subjectName||'';
    let subjectid=teacher?.subjectId
    if(subjectid){
      this.classroomservice.getallbysubject(subjectid).subscribe({
        next:res=>{
          this.classrooms=res;
        }
      })
    }

  }
  close(){
    this.hostman.load({open:false,data:'',returndata:'',type:''});
  }
  addschedule(){
    if(this.schedule.valid){
      let teacher=this.teachers[this.teachers.findIndex(p=>p.id==this.schedule.value.teacherID)];
      if(this.data){
        let session={
          id: this.data.session.id,
          sessionNo: this.sessionNocontrol.value,
          scheduleID: this.data.session.scheduleID,
          teacherID: teacher.id,
          subjectName: teacher.subjectName,
          teacherName: teacher.fullName,
          scheduleDay: this.schedule.value.day
      }
      let schadule={
        id:  this.data.session.scheduleID,
        day: this.schedule.value.day,
        classId:+this.schedule.value.classId,
        classRoomName: this.classrooms[this.classrooms.findIndex(p=>p.id==this.schedule.value.classId)].name
      }
        this.schaduleservice.updateschadule(schadule).subscribe({
          next:res=>{
            this.schaduleservice.updatesession(session).subscribe({
              next:res=>{
                this.hostman.load({open:false,data:'',returndata:res,type:''})
              }
            })
          }
        })
      }
      else{
        let schadule={
          Day:this.schedule.value.day,
          classId:+this.schedule.value.classId,
          ClassRoom:this.classrooms[this.classrooms.findIndex(p=>p.id==this.schedule.value.classId)].name,
          Teacherid:this.schedule.value.teacherID,
          Teacher:teacher.fullName,
          Subject:teacher.subjectName,
          SessionNum:this.schedule.value.sessionNo,
          gradeyear:this.classrooms[this.classrooms.findIndex(p=>p.id==this.schedule.value.classId)].gradeYearName
        }
        this.schaduleitem=schadule;
      }
    }
  }
  validatedate($event:any){
    let today=new Date().toISOString();
    console.log(today)
    console.log($event.target.value)
    if($event.target.value>today){
      this.daycontrol.setErrors({
      ...this.daycontrol.errors,
      'notvalid':null
    })
    this.daycontrol.updateValueAndValidity(); 
  }
  else{
    this.daycontrol.setErrors({'notvalid':true})
  }
  }
}
